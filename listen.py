import time
import speech_recognition as sr
import logging

log =logging.getLogger(__name__)
log_format = '[%(asctime)s] [%(levelname)s] - %(message)s'
logging.basicConfig(level=logging.INFO, format=log_format)

if __name__ == "__main__":
    r = sr.Recognizer()
    m = sr.Microphone(sample_rate=8000)

    log.log(logging.INFO, msg="Starting listening with microphone...")
    try:
        with m as source:
            r.adjust_for_ambient_noise(source)
            log.log(logging.INFO, msg="Started recording")
            phrase = r.listen(source=source, timeout=5, phrase_time_limit=20)
            transcription = r.recognize_whisper(phrase, model="large", language="polish")

    except sr.WaitTimeoutError:
        log.log(level=logging.ERROR, msg=f"Recording timed out.")
    except sr.UnknownValueError:
        log.log(logging.ERROR, msg="Failed to recognise speech.")
    except sr.RequestError as e:
        log.log(logging.ERROR, msg="Could not request results from Whisper model {0}.".format(e))

    print("Transcription: ", transcription)
    log.log(logging.INFO, msg="Stopping service...")
