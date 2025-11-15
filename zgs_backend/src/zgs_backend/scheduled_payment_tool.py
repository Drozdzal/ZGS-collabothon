from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Define the Pydantic schema for payment information
class PaymentInfo(BaseModel):
    """Schema for parsed bill payment information"""
    receiver: str = Field(description="Name of the payee/company to receive payment")
    address: Optional[str] = Field(description="Address of the receiver")
    title: str = Field(description="Payment title/reference to use for transfer")
    amount: float = Field(description="Amount to pay")
    bank_account: str = Field(description="Bank account number for payment")
    schedule: str = Field(description="When to send payment in ISO format (YYYY-MM-DD) or 'immediate'")


def parse_bill_text(raw_text: str) -> PaymentInfo:
    """
    Parse bill text and extract payment information with scheduling.

    Args:
        raw_text: Raw text extracted from bill/invoice image
        api_key: OpenAI API key

    Returns:
        PaymentInfo object with extracted payment details
    """
    # Initialize the LLM
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
    )

    # Create structured output LLM
    structured_llm = llm.with_structured_output(PaymentInfo)

    # Create prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert at parsing bill and invoice text to extract payment information.

Extract the following information:
1. Receiver: The company or person who should receive the payment
2. Address: The address of the receiver (if available)
3. Title: The payment reference/title that should be used (often includes bill number or customer ID)
4. Amount: The total amount to pay (numeric value only, no currency symbols)
5. Bank Account: The bank account number where payment should be sent
6. Schedule: When the payment should be sent
   - If there's a due date, use that date in YYYY-MM-DD format
   - If the bill says "pay immediately" or similar, use "immediate"
   - If no due date is specified, use "immediate"

Be precise and extract exact values from the text."""),
        ("human", "Parse this bill text and extract payment information:\n\n{text}")
    ])

    # Create the chain
    chain = prompt | structured_llm

    # Execute and return result
    result = chain.invoke({"text": raw_text})
    return result

# Additional helper function to format payment message
def format_payment_message(payment_info: PaymentInfo) -> dict:
    """
    Format payment info into a structured JSON message.

    Args:
        payment_info: PaymentInfo object

    Returns:
        Dictionary with formatted payment message
    """
    return {
        "payment_request": {
            "receiver": payment_info.receiver,
            "address": payment_info.address,
            "title": payment_info.title,
            "amount": payment_info.amount,
            "currency": "PLN",
            "bank_account": payment_info.bank_account,
            "schedule": payment_info.schedule,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
    }

# Example usage
if __name__ == "__main__":
    example_internet_bill = """
    NETCOM INTERNET
    NetCom Sp. z o.o.
    Aleje Jerozolimskie 100
    02-001 Warszawa

    FAKTURA VAT Nr: 2025/01/5678
    Data wystawienia: 05.01.2025
    Termin płatności: NATYCHMIAST

    Nabywca: Anna Nowak
    Numer klienta: NK-445566

    Usługa: Internet światłowodowy 500 Mb/s
    Okres rozliczeniowy: Styczeń 2025

    Do zapłaty: 89.99 PLN

    Dane do przelewu:
    Numer konta: 45 1090 1014 0000 0712 1981 2874
    Tytuł przelewu: FV 2025/01/5678 NK-445566
    Odbiorca: NetCom Sp. z o.o.
    """

    test_cases = [
        ("Internet Bill", example_internet_bill),
    ]

    print("=" * 70)
    print("TESTING BILL PARSER WITH MULTIPLE EXAMPLES")
    print("=" * 70)

    for test_name, bill_text in test_cases:
        print(f"\n{'=' * 70}")
        print(f"TEST: {test_name}")
        print(f"{'=' * 70}")

        try:
            result = parse_bill_text(bill_text)
        except Exception as e:
            print(str(e))
            raise(e)

        print("=" * 50)
        print("EXTRACTED PAYMENT INFORMATION")
        print("=" * 50)
        print(f"Receiver: {result.receiver}")
        print(f"Address: {result.address}")
        print(f"Title: {result.title}")
        print(f"Amount: {result.amount} PLN")
        print(f"Bank Account: {result.bank_account}")
        print(f"Schedule: {result.schedule}")

        # Convert to JSON
        print("\n" + "=" * 50)
        print("JSON OUTPUT")
        print("=" * 50)
        print(result.model_dump_json(indent=2))

        # Example JSON message format
        print("\n" + "=" * 50)
        print("PAYMENT MESSAGE")
        print("=" * 50)
        payment_message = format_payment_message(result)
        import json

        print(json.dumps(payment_message, indent=2, ensure_ascii=False))





