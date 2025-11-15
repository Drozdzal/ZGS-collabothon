import os
import sys
import tempfile
from contextlib import contextmanager
import sounddevice as sd
import soundfile as sf
from openai import OpenAI

import dotenv
dotenv.load_dotenv()

SAMPLE_RATE = 16_000  # 16 kHz is sufficient for speech and works well with OpenAI models
CHANNELS = 1
DEFAULT_RECORD_SECONDS = 8


@contextmanager
def temporary_wav_file():
    """Context manager that yields a temporary WAV file path and cleans it up afterwards."""
    fd, path = tempfile.mkstemp(suffix=".wav")
    os.close(fd)  # We will reopen it via soundfile
    try:
        yield path
    finally:
        try:
            os.remove(path)
        except OSError:
            pass


def record_audio(duration: int) -> bytes:
    """
    Record audio from the default microphone for the given duration (in seconds).

    Returns the path to a temporary WAV file containing the recording.
    """
    print(f"\nRecording for {duration} seconds... Speak now.")
    try:
        recording = sd.rec(
            int(duration * SAMPLE_RATE),
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype="float32",
        )
        print(recording)
        sd.wait()  # Wait until recording is finished
    except Exception as e:
        print(f"Error while recording audio: {e}")
        return None

    with temporary_wav_file() as wav_path:
        try:
            sf.write(wav_path, recording, SAMPLE_RATE)
        except Exception as e:
            print(f"Error while saving WAV file: {e}")
            return None

        # Read back the file contents as bytes to send to OpenAI
        try:
            with open(wav_path, "rb") as f:
                audio_bytes = f.read()
        except Exception as e:
            print(f"Error while reading WAV file: {e}")
            return None

        print(audio_bytes)
    return audio_bytes


def create_openai_client() -> OpenAI:
    """
    Create an OpenAI client using the OPENAI_API_KEY environment variable.
    """
    api_key = os.getenv("WHISPER_API")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable is not set.")
        print("Please set it, e.g.:")
        print("  export OPENAI_API_KEY='your_api_key_here'")
        sys.exit(1)

    return OpenAI(api_key=api_key)


def transcribe_audio(client: OpenAI, audio_bytes: bytes) -> str:
    """
    Send the recorded audio bytes to OpenAI for transcription and return the text.
    """
    if audio_bytes is None:
        return ""

    try:
        # Use the latest speech-to-text model; adjust if needed in the future.
        transcription = client.audio.transcriptions.create(
            model="gpt-4o-transcribe",
            file=("audio.wav", audio_bytes),
        )
        # The response object from the OpenAI Python SDK exposes the text field.
        return transcription.text.strip()
    except Exception as e:
        print(f"Error during transcription: {e}")
        return ""


def main():
    print("=== Voice to Text (OpenAI) ===")
    print("This app records from your default microphone and transcribes speech to text.")
    print("Controls:")
    print("  - Press Enter to record a short clip.")
    print("  - Type 'q' and press Enter to quit.")

    # Allow overriding the default recording duration via an environment variable.
    duration_env = os.getenv("VOICE_RECORD_SECONDS")
    if duration_env:
        try:
            duration = int(duration_env)
        except ValueError:
            print(
                f"Invalid VOICE_RECORD_SECONDS='{duration_env}', "
                f"falling back to default {DEFAULT_RECORD_SECONDS} seconds."
            )
            duration = DEFAULT_RECORD_SECONDS
    else:
        duration = DEFAULT_RECORD_SECONDS

    client = create_openai_client()

    while True:
        user_input = input("\nPress Enter to record, or type 'q' then Enter to quit: ").strip().lower()
        if user_input == "q":
            print("Exiting. Goodbye.")
            break

        audio_bytes = record_audio(duration)
        if audio_bytes is None:
            continue

        print("Transcribing...")
        text = transcribe_audio(client, audio_bytes)

        if text:
            print("\n--- Transcription ---")
            print(text)
            print("---------------------")
        else:
            print("No transcription available (empty response or error).")


if __name__ == "__main__":
    main()


