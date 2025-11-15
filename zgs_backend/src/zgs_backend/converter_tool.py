from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from pydantic import BaseModel, Field
from typing import Optional
import json


# Define the Pydantic schema for structured output
class TransferInfo(BaseModel):
    """Schema for bank transfer information"""
    receiver: str = Field(description="Name of the person receiving the transfer")
    address: str = Field(description="Address of the receiver")
    title: str = Field(description="Title/description of the transfer")
    amount: float = Field(description="Amount to transfer in PLN")
    bank_account: str = Field(description="Bank account number")


@tool
def extract_transfer_info(text: str) -> str:
    """
    Extract structured transfer information from Polish text.
    Use this tool when you need to extract transfer details from natural language text
    that describes a bank transfer (receiver, address, title, amount, account number).

    Args:
        text: Input text containing transfer information in Polish or English

    Returns:
        JSON string with transfer information (receiver, address, title, amount, bank_account)
    """
    # Initialize the LLM with structured output
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
    )

    # Create structured output LLM
    structured_llm = llm.with_structured_output(TransferInfo)

    # Create prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert at extracting bank transfer information from Polish text. "
                   "Extract the receiver name, address, transfer title, amount, and bank account number."),
        ("human", "{text}")
    ])

    # Create the chain
    chain = prompt | structured_llm

    # Execute and return result
    result = chain.invoke({"text": text})

    # Return as JSON string for agent compatibility
    return result.model_dump_json()


# Example usage
if __name__ == "__main__":
    transfer_text = """Mateusz Kryl chce przelac 1000 zł na konto Damiana Hujcika 
    konto o numerze 1124151 Adres Damiana to wałbrzych 15 
    tytuł przelewu powinien byc mister griddy winna"""

    try:
        # When using as a tool
        result_json = extract_transfer_info.invoke({"text": transfer_text})
        result = json.loads(result_json)

        print("Extracted Transfer Information:")
        print(f"Receiver: {result['receiver']}")
        print(f"Address: {result['address']}")
        print(f"Title: {result['title']}")
        print(f"Amount: {result['amount']} PLN")
        print(f"Bank Account: {result['bank_account']}")

        # JSON Output
        print("\nJSON Output:")
        print(result_json)

    except Exception as e:
        print(f"Error: {e}")