from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field
import base64


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


def extract_text_from_image(image_path: str) -> RawTextOutput:
    """
    Extract all text from payment-related images (checks, bills, invoices).

    Args:
        image_path: Path to the image file
        api_key: OpenAI API key

    Returns:
        RawTextOutput object with extracted text
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
    return result


# Example usage
if __name__ == "__main__":


    # Path to your local image
    image_path = r"C:\MasterThesis\ZGS-collabothon\zgs_backend\src\zgs_backend\rachuneczek.png"

    try:
        # Extract text from image
        result = extract_text_from_image(image_path)

        print("=" * 50)
        print("EXTRACTED TEXT FROM IMAGE")
        print("=" * 50)
        print(result.raw_text)

        # Convert to JSON
        print("\n" + "=" * 50)
        print("JSON OUTPUT")
        print("=" * 50)
        print(result.model_dump_json(indent=2))

    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
        print("Please provide the correct path to your image file.")
    except Exception as e:
        print(f"Error: {e}")