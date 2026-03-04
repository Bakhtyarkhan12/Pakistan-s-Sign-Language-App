# SignSpeakly

SignSpeakly is our Final Year Project for BS Information Technology at Quaid-i-Azam University, Islamabad (2021–2025). We built it because communication between deaf and hearing people is still a real problem, and we wanted to do something about it.

The app uses your webcam to recognize Pakistan Sign Language (PSL) gestures in real time and converts them into text and speech. It also has a learning section where you can study PSL through videos and test yourself with quizzes.

**Bakhtiyar Saeed** — 04162113041  
**Adnan Abbas** — 04162113007  
Supervised by **Dr. Madiha Haider Syed** and **Dr. Tahreem**

---

# What it does

- Recognizes PSL gestures live through your webcam and translates them to text and speech
- Has interactive lessons and quizzes for learning PSL
- Keeps track of your progress using Firebase
- Login and signup with Firebase Authentication
- FastAPI backend handles the communication between the frontend and the ML model

---

# Tech used

The frontend is built with React and Vite, styled with TailwindCSS. For gesture tracking we used MediaPipe (hands and pose). The ML model is an LSTM network trained with TensorFlow/Keras. The backend is FastAPI. User data and progress is stored in Firebase Firestore.

---

## Project structure

```
SignSpeakly/
├── src/               # All React frontend code
├── signbackend/       # FastAPI backend (main.py has the /predict endpoint and also put the model files here)
├── public/            # Static files
├── reports/           # Training reports
├── Model Training/    # Model training files
├── data/              # Put the downloaded dataset here and inside the signbackend folder
├── real_time.py       # Run this if you want webcam prediction without the web app
├── requirements.txt   # Python packages
└── package.json       # Node packages
```

---

## Before you run anything

The model file and dataset are too large for GitHub so you need to download them separately and place them in the right folders.

| What | Link | Where to put it |
|---|---|---|
| sign_model.keras | [https://huggingface.co/Bakhtyar12/Pakistani-SignLanguage-Model]| `models/sign_model.keras` |
| PSL Dataset | [https://huggingface.co/datasets/Bakhtyar12/Pakistani-Sign-Language] | `data/` |

The backend will throw an error if these are missing so make sure you do this first.

You also need a `.env` file in the root folder with your Firebase config:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Running the app

There are two things you need to run at the same time — the frontend and the backend. Open two terminal windows.

### Terminal 1 — Frontend

```bash
npm install
npm start
```

This starts the React app at `http://localhost:5173`

### Terminal 2 — Backend

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
cd signbackend
uvicorn main:app --reload --host 127.0.0.1 --port 5000
```

This starts the FastAPI server at `http://127.0.0.1:5000`. The frontend is already configured to send prediction requests here through `vite.config.js`.

You can also check `http://127.0.0.1:5000/docs` to see and test the API directly in the browser.

### Just want to test gesture recognition without the web app?

```bash
python real_time.py
```

This opens a webcam window, shows you the prediction live on screen, and you press ESC to close it.

---

# How the prediction API works
The frontend captures 30 frames of hand and pose landmarks from MediaPipe and sends them to the backend. Each frame has 225 values (63 for left hand, 63 for right hand, 99 for pose). The model then predicts which gesture it is.

**POST** `/predict`
Request:
```json
{
  "sequence": [[225 values], [225 values], ...]
}

Response:
```json
{
  "word": "Hello",
  "confidence": 0.94
}

If confidence is below 0.7 it returns `"Detecting..."` instead.

## Things we want to add later

We only trained on PSL for now. Eventually we want to support other sign languages like ASL and BSL, build a mobile version, and improve the model to handle full sentences instead of individual signs. Also you can take help of the database in a more better way. The model is trained with a higher accuracy however due to less technologies available at the time, it can somehow give wrong predictions when connected to front for some words only. 

---

© 2025 Bakhtiyar Saeed & Adnan Abbas — Quaid-i-Azam University, Islamabad
