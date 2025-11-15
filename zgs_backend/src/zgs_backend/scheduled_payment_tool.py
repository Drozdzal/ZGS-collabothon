from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import json


# Define the Pydantic schema for payment information
class PaymentInfo(BaseModel):
    """Schema for parsed bill payment information"""
    receiver: str = Field(description="Name of the payee/company to receive payment")
    address: Optional[str] = Field(description="Address of the receiver")
    title: str = Field(description="Payment title/reference to use for transfer")
    amount: float = Field(description="Amount to pay")
    bank_account: str = Field(description="Bank account number for payment")
    schedule: str = Field(description="When to send payment in ISO format (YYYY-MM-DD) or 'immediate'")


@tool
def parse_bill_text(raw_text: str) -> str:
    """
    Parse bill text and extract payment information with scheduling.
    Use this tool when you have raw text from a bill/invoice and need to extract
    structured payment details (receiver, address, title, amount, bank account, schedule).

    Args:
        raw_text: Raw text extracted from bill/invoice image

    Returns:
        JSON string with payment information
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

    # Return as JSON string for agent compatibility
    return result.model_dump_json()


@tool
def format_payment_message(payment_data: str) -> str:
    """
    Format payment information into a final structured JSON message ready for transfer.
    Use this tool when you have payment info and need to create the final payment message
    with additional metadata (status, timestamp, currency).

    Args:
        payment_data: JSON string with payment information

    Returns:
        Formatted JSON payment message with all details and metadata
    """
    # Parse the input payment data
    payment_dict = json.loads(payment_data)

    # Create structured payment message
    payment_message = {
        "payment_request": {
            "receiver": payment_dict.get("receiver"),
            "address": payment_dict.get("address"),
            "title": payment_dict.get("title"),
            "amount": payment_dict.get("amount"),
            "currency": "PLN",
            "bank_account": payment_dict.get("bank_account"),
            "schedule": payment_dict.get("schedule"),
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
    }

    return json.dumps(payment_message, indent=2, ensure_ascii=False)


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
            # Parse bill text using the tool
            result_json = parse_bill_text.invoke({"raw_text": bill_text})
            result = json.loads(result_json)
        except Exception as e:
            print(str(e))
            raise (e)

        print("=" * 50)
        print("EXTRACTED PAYMENT INFORMATION")
        print("=" * 50)
        print(f"Receiver: {result['receiver']}")
        print(f"Address: {result['address']}")
        print(f"Title: {result['title']}")
        print(f"Amount: {result['amount']} PLN")
        print(f"Bank Account: {result['bank_account']}")
        print(f"Schedule: {result['schedule']}")

        # Convert to JSON
        print("\n" + "=" * 50)
        print("JSON OUTPUT")
        print("=" * 50)
        print(result_json)

        # Format payment message using the tool
        print("\n" + "=" * 50)
        print("PAYMENT MESSAGE")
        print("=" * 50)
        payment_message = format_payment_message.invoke({"payment_data": result_json})
        print(payment_message)