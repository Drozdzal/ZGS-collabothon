from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langchain_core.tools import tool
from pydantic import BaseModel, Field
import base64
import json


# Define the Pydantic schema for raw text output
class RawTextOutput(BaseModel):
    """Schema for raw text extracted from image"""
    raw_text: str = Field(description="All text extracted from the document")


def encode_image(image_path: str) -> str:
    """
    Encode image to base64 string.

    Args:
        image_path: Path to the image file

    Returns:
        Base64 encoded string
    """
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


@tool
def extract_text_from_image(image_path: str) -> str:
    """
    Extract all text from payment-related images (checks, bills, invoices, receipts).
    Use this tool when you need to read text from an image file containing payment documents.

    Args:
        image_path: Path to the image file (jpg, png, etc.)

    Returns:
        JSON string with raw_text field containing all extracted text from the image
    """
    # Initialize the LLM with vision capabilities
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
    )

    # Create structured output LLM
    structured_llm = llm.with_structured_output(RawTextOutput)

    # Encode the image
    base64_image = encode_image(image_path)

    # Create message with image
    message = HumanMessage(
        content=[
            {
                "type": "text",
                "text": """Extract ALL text from this payment-related document (check, bill, invoice, receipt, or any paper that needs to be paid).

Focus on extracting every piece of text visible including:
- Payee/company names
- Account numbers
- Amounts and totals
- Dates (due dates, issue dates)
- Reference numbers (bill numbers, invoice numbers)
- Customer IDs
- Addresses
- Payment titles/descriptions
- All labels and field names
- Any other text visible

Return ALL text exactly as it appears in the document. Don't summarize, don't skip anything - extract everything."""
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}"
                }
            }
        ]
    )

    # Execute and return result
    result = structured_llm.invoke([message])

    # Return as JSON string for agent compatibility
    return result.model_dump_json()


# Example usage
if __name__ == "__main__":
    # Path to your local image
    image_path = r"C:\MasterThesis\ZGS-collabothon\zgs_backend\src\zgs_backend\rachuneczek.png"

    try:
        # Extract text from image using the tool
        result_json = extract_text_from_image.invoke({"image_path": image_path})
        result = json.loads(result_json)

        print("=" * 50)
        print("EXTRACTED TEXT FROM IMAGE")
        print("=" * 50)
        print(result['raw_text'])

        # JSON Output
        print("\n" + "=" * 50)
        print("JSON OUTPUT")
        print("=" * 50)
        print(result_json)

    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
        print("Please provide the correct path to your image file.")
    except Exception as e:
        print(f"Error: {e}")