import os
from gtts import gTTS
from pathlib import Path
from playsound import playsound
import random
import string

def speak(text: str, lang: str) -> None:
    random_filename = ''.join(random.choices(string.ascii_letters + string.digits, k=16)) +".mp3"

    tts = gTTS(text=text, lang=lang)
    tts.save(random_filename)
    playsound(random_filename)
    try:
        os.remove(random_filename)
    except:
        pass

def save_speech(text: str, lang: str, path: str):
    tts = gTTS(text=text, lang=lang)
    tts.save(path)

def speak_from_file(fp: Path):
    playsound(fp)