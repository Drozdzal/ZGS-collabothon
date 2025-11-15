from gtts import gTTS
import os
from playsound import playsound

def speak_polish(text, remove=True):
    print("working...")
    tts = gTTS(text=text, lang='pl', timeout=10)
    tts.save("audio_tmp.mp3")
    playsound("audio_tmp.mp3")
    if remove:
        os.remove("audio_tmp.mp3")

# Example usage
speak_polish("Wystawiam zlecenie cylkiczne dla: Maciej Ziaja, IBAN PL 1 0 1 1 2 1 3 7 6 9, o wysokości 300 dolarów ugandyjskich")