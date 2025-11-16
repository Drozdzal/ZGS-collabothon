# VAB - Voice Assisted Banking
TEAM : ZGS

This project is a **full ATM simulator** with a modern UI, voice assistance, document payment scan, contact book and support for standard transfers, instant payments, mini statements and standing orders.  
It is based on the original Figma design (`Banking ATM UI Design`) and extends it with a Python backend and AI‑powered voice features.

---

## Features

### Core ATM flows

- **Card & PIN login** – simulated card insert and PIN entry (demo PIN: `1234`).
- **Main menu** – large, high‑contrast tiles:
  - Withdrawal
  - Balance Inquiry
  - Transfer
  - Mini Statement
  - Standing Orders
  - Contacts
  - Document Scan
  - Exit
- **Transfers**
  - Standard transfer and instant payment.
  - Quick amount buttons.
  - Contact book integration.
- **Standing orders**
  - Configure recurring payments (weekly / bi‑weekly / monthly / quarterly).
  - Uses the same contact book for recipients.
- **Mini statement**
  - Shows up to the last 10 transactions (withdrawals, transfers, instant payments, standing orders).
- **Contacts**
  - Saved recipients with names and account numbers.

### Voice assistance

All voice functionality is optional but fully wired end‑to‑end:

- **Greeting & help**
  - After successful PIN entry the ATM greets the user and invites voice commands.
- **Global “Speak command” button**
  - Visible on every screen, starts listening for a new command.
- **Speech‑to‑text (ASR)**
  - Frontend records microphone audio and POSTs it to the Python backend.
  - Backend uses **OpenAI speech‑to‑text** (`gpt-4o-transcribe`) to return a transcript.
- **Intent understanding**
  - Frontend sends the transcript to `/api/voice/interpret`.
  - Backend uses **OpenAI chat** to return a structured command:
    - `intent`: `transfer`, `standing_order`, `show_balance`, `show_mini_statement`, `show_standing_orders`, `confirm`, `exit`, `unknown`
    - `amount`
    - `recipient_name`
    - `frequency` (for standing orders)
- **Command handling examples**
  - “I want to make a 50 dollar transfer to my landlord”
    - Backend returns `intent=transfer, amount=50, recipient_name=landlord`.
    - Frontend navigates to **Transfer** and prefills amount + IBAN from the contact book.
  - “I confirm”
    - If a pending voice transfer exists, frontend executes it and shows a receipt.
  - “Show my balance” / “Show my mini statement”
    - Frontend navigates to the appropriate screen.
- **Text‑to‑speech (TTS) on backend**
  - Frontend sends text to `/api/voice/speak`.
  - Backend uses `gTTS + playsound` to speak via the ATM machine’s speakers.

### Document payment scan

- **Document Scan** tile simulates scanning a paper bill:
  - Frontend calls `/api/payment/scan` on Python backend.
  - Backend returns mocked payment data (recipient, IBAN, amount, reference, payment type).
  - Frontend fills the payment form and lets the user confirm.

---

## Project structure

```text
Banking ATM UI Design/
├─ src/                    # React frontend (ATM UI, now removed in this branch)
├─ voice_transcriber_app/  # Python backend + voice and payment scan
│  ├─ payment_scan_server.py  # FastAPI app: scan + voice ASR + intent + TTS
│  ├─ voice_to_text.py        # Standalone CLI demo for OpenAI transcription
│  └─ requirements.txt        # Python dependencies
├─ build/                 # Production build output (Vite)
├─ package.json           # Frontend dependencies & scripts
├─ vite.config.ts         # Vite config
└─ README.md              # This file
```

> Note: in this workspace the original `src/` React source has been removed to keep only the compiled build and backend. The build in `build/` reflects the last working version of the UI.

---

## Running the Python backend

1. Create and activate a virtual environment (recommended):

   ```bash
   cd "voice_transcriber_app"
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Set your OpenAI API key (required for ASR + intent extraction):

   ```bash
   export OPENAI_API_KEY="your_api_key_here"   # PowerShell: $env:OPENAI_API_KEY="..."
   ```

4. Run the FastAPI server:

   ```bash
   python payment_scan_server.py
   ```

   This starts the backend on `http://localhost:8001` with endpoints:

   - `POST /api/payment/scan` – document payment scanning (mocked).
   - `POST /api/voice/asr` – speech‑to‑text via OpenAI.
   - `POST /api/voice/interpret` – intent + entities via OpenAI.
   - `POST /api/voice/speak` – backend TTS using gTTS + playsound.

---

## Running the frontend (if you restore `src/`)

If you keep or restore the React source under `src/`, you can run the UI with:

```bash
npm install
npm run dev      # starts Vite dev server, typically on http://localhost:5173
```

Make sure the backend is running on `http://localhost:8001` or adjust:

- `VITE_PAYMENT_SCAN_API_BASE_URL`
- `VITE_VOICE_API_BASE_URL`

in a `.env` file to match your backend URL.

---

## Accessibility & design notes

- Large, high‑contrast buttons and typography tuned for ATM distance and lighting.
- Clear, concise copy and guided flows (e.g. “Enter your PIN”, “Speak command”).
- Voice assistance is designed to support visually impaired and low‑literacy users:
  - Hands‑free navigation via intents (balance, statement, transfer, standing orders).
  - Voice confirmation (“I confirm”) on prepared transactions.
- All sensitive actions (PIN, transfers) are still fully usable via touch only.

---

## Disclaimer

- This project is a **demo / prototype**, not production banking software.
- API keys and secrets in this workspace must be treated as **test only** and rotated before any real use.
- Real ATM deployments require strong security, PCI compliance, hardened hardware and extensive auditing that are **beyond the scope** of this repository.
