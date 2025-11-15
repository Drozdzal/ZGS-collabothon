from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from typing import Dict, Any, List
import os

# Import all tools
from .image_to_text import extract_text_from_image
from .scheduled_payment_tool import parse_bill_text, format_payment_message
from .converter_tool import extract_transfer_info


class PaymentProcessingAgent:
    """
    AI Agent that processes payment information using appropriate tools.

    Available tools:
    1. extract_text_from_image - Extracts text from bill/check images
    2. parse_bill_text - Parses bill text to extract payment details
    3. format_payment_message - Formats payment info into final JSON message
    4. extract_transfer_info - Extracts transfer info from natural language text
    """

    def __init__(self, api_key: str = None):
        """
        Initialize the Payment Processing Agent.

        Args:
            api_key: OpenAI API key (optional, uses OPENAI_API_KEY env var if not provided)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

        if not self.api_key:
            raise ValueError("OpenAI API key must be provided or set in OPENAI_API_KEY environment variable")

        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            api_key=self.api_key
        )

        # Register all available tools
        self.tools = [
            extract_text_from_image,
            parse_bill_text,
            format_payment_message,
            extract_transfer_info
        ]

        # Bind tools to the LLM
        self.llm_with_tools = self.llm.bind_tools(self.tools)

        # System prompt
        self.system_prompt = """You are a payment processing assistant. Your job is to help users extract and process payment information from images or text.

Available tools and their purposes:

1. **extract_text_from_image** - Use FIRST when user provides an image path to a bill/check/invoice
   - Input: image_path (path to image file)
   - Output: JSON with raw_text extracted from the image

2. **parse_bill_text** - Use AFTER extracting text from bills/invoices
   - Input: raw_text (text from a bill/invoice)
   - Output: JSON with structured payment info (receiver, address, title, amount, bank_account, schedule)

3. **format_payment_message** - Use LAST to create final payment message
   - Input: payment_data (JSON string with payment info)
   - Output: Final formatted JSON payment message with metadata

4. **extract_transfer_info** - Use when user describes a transfer in natural language (not from bill)
   - Input: text (natural language description of transfer)
   - Output: JSON with transfer details (receiver, address, title, amount, bank_account)

COMMON WORKFLOWS:

Workflow A - Process bill/invoice image:
1. extract_text_from_image(image_path) → get raw_text
2. parse_bill_text(raw_text) → get payment_data
3. format_payment_message(payment_data) → get final message

Workflow B - Process transfer description text:
1. extract_transfer_info(text) → get transfer data
2. format_payment_message(transfer_data) → get final message

IMPORTANT:
- Always use tools in the correct order
- Pass the output from one tool as input to the next
- Don't skip steps in the workflow
- When you have the final formatted message, present it to the user
"""

    def process_request(self, user_input: str, verbose: bool = True) -> Dict[str, Any]:
        """
        Process user request and use appropriate tools to complete the task.

        Args:
            user_input: User's request
            verbose: Print execution details (default: True)

        Returns:
            Dictionary with processing results and execution history
        """
        messages = [
            SystemMessage(content=self.system_prompt),
            HumanMessage(content=user_input)
        ]

        execution_history = []
        max_iterations = 15
        iteration = 0

        if verbose:
            print("\n" + "=" * 70)
            print("🤖 PAYMENT PROCESSING AGENT STARTED")
            print("=" * 70)
            print(f"User Request: {user_input}")

        while iteration < max_iterations:
            iteration += 1

            if verbose:
                print(f"\n{'─' * 70}")
                print(f"Iteration {iteration}")
                print(f"{'─' * 70}")

            # Get AI response
            response = self.llm_with_tools.invoke(messages)
            messages.append(response)

            # Check if AI wants to use tools
            if not response.tool_calls:
                # No more tools to call, return final answer
                if verbose:
                    print("\n✅ Agent finished processing")
                    print(f"\n{'=' * 70}")
                    print("FINAL RESPONSE")
                    print(f"{'=' * 70}")
                    print(response.content)

                return {
                    "success": True,
                    "final_answer": response.content,
                    "execution_history": execution_history,
                    "iterations": iteration
                }

            # Execute each tool call
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]
                tool_id = tool_call["id"]

                if verbose:
                    print(f"\n🔧 Executing: {tool_name}")
                    print(f"   Arguments: {tool_args}")

                # Find and execute the tool
                tool_result = None
                for tool in self.tools:
                    if tool.name == tool_name:
                        try:
                            tool_result = tool.invoke(tool_args)

                            if verbose:
                                print(f"   ✓ Success")
                                # Print abbreviated result
                                result_preview = str(tool_result)[:200]
                                if len(str(tool_result)) > 200:
                                    result_preview += "..."
                                print(f"   Result preview: {result_preview}")

                            # Log execution
                            execution_history.append({
                                "tool": tool_name,
                                "args": tool_args,
                                "result": tool_result,
                                "iteration": iteration
                            })

                        except Exception as e:
                            tool_result = f"Error: {str(e)}"
                            if verbose:
                                print(f"   ✗ Failed: {e}")
                        break

                # Add tool result to messages
                messages.append(ToolMessage(
                    content=str(tool_result),
                    tool_call_id=tool_id
                ))

        return {
            "success": False,
            "error": "Max iterations reached",
            "execution_history": execution_history,
            "iterations": iteration
        }

    def get_tools_info(self) -> List[Dict[str, str]]:
        """Get information about available tools."""
        return [
            {
                "name": tool.name,
                "description": tool.description
            }
            for tool in self.tools
        ]


# Example usage
if __name__ == "__main__":
    # Initialize agent
    agent = PaymentProcessingAgent()

    print("\n" + "=" * 70)
    print("AVAILABLE TOOLS")
    print("=" * 70)
    for tool_info in agent.get_tools_info():
        print(f"\n• {tool_info['name']}")
        print(f"  {tool_info['description']}")

    # Example 1: Process bill image
    print("\n\n" + "=" * 70)
    print("EXAMPLE 1: Extract payment info from bill image")
    print("=" * 70)

    result1 = agent.process_request(
        r"Extract payment information from the bill image at 'C:\Users\Mateusz\Desktop\ZGS-collabothon\zgs_backend\src\zgs_backend\rachuneczek.png' and give me the formatted payment details"
    )

    if result1['success']:
        print("\n" + "=" * 70)
        print("EXECUTION SUMMARY")
        print("=" * 70)
        print(f"✓ Success: {result1['success']}")
        print(f"✓ Iterations: {result1['iterations']}")
        print(f"✓ Tools used: {len(result1['execution_history'])}")
        for i, step in enumerate(result1['execution_history'], 1):
            print(f"  {i}. {step['tool']}")

    # Example 2: Process natural language transfer description
    # print("\n\n" + "=" * 70)
    # print("EXAMPLE 2: Extract transfer info from text description")
    # print("=" * 70)
    #
    # result2 = agent.process_request(
    #     "Mateusz Kryl chce przelac 1000 zł na konto Damiana Hujcika, "
    #     "konto o numerze 1124151, adres Damiana to Wałbrzych 15, "
    #     "tytuł przelewu: mister griddy winna. Daj mi sformatowaną wiadomość płatności."
    # )
    #
    # if result2['success']:
    #     print("\n" + "=" * 70)
    #     print("EXECUTION SUMMARY")
    #     print("=" * 70)
    #     print(f"✓ Success: {result2['success']}")
    #     print(f"✓ Iterations: {result2['iterations']}")
    #     print(f"✓ Tools used: {len(result2['execution_history'])}")
    #     for i, step in enumerate(result2['execution_history'], 1):
    #         print(f"  {i}. {step['tool']}")