import os
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from tensorflow.keras.models import load_model

# === Configuration ===
DATA_PATH = 'data'
SEQUENCE_LENGTH = 30
FEATURE_SIZE = 225
CONFIDENCE_THRESHOLD = 0.7
NORMALIZE = True
MODEL_PATH = "models/sign_model.keras"

GESTURES = sorted(os.listdir(DATA_PATH))
NUM_CLASSES = len(GESTURES)

label_map = {gesture: idx for idx, gesture in enumerate(GESTURES)}
reverse_map = {v: k for k, v in label_map.items()}

try:
    model = load_model(MODEL_PATH)
    print(f"✅ Model loaded with {NUM_CLASSES} classes.")
except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LandmarkSequence(BaseModel):
    sequence: List[List[float]]  # (30, 225)

def normalize_landmarks(coords):
    coords = coords.reshape(1, -1, 3)
    coords -= coords[:, 0:1, :]
    return coords.reshape(-1)

def normalize_sequence(seq):
    coords = np.array(seq).reshape(SEQUENCE_LENGTH, 75, 3)
    coords -= coords[:, 0:1, :]
    return coords.reshape(SEQUENCE_LENGTH, FEATURE_SIZE)

@app.post("/predict")
async def predict(input_data: LandmarkSequence):
    sequence = input_data.sequence

    if len(sequence) != SEQUENCE_LENGTH:
        raise HTTPException(status_code=400, detail="Invalid number of frames (must be 30).")

    for i, frame in enumerate(sequence):
        if len(frame) != FEATURE_SIZE:
            raise HTTPException(status_code=400, detail=f"Frame {i+1} must have 225 features.")

    input_tensor = np.array(sequence).astype(np.float32)

    reshaped = input_tensor.reshape(SEQUENCE_LENGTH, 75, 3)
    left = reshaped[:, :21, :]
    right = reshaped[:, 21:42, :]
    pose = reshaped[:, 42:, :]

    has_left = np.sum(np.abs(left)) > 0
    has_right = np.sum(np.abs(right)) > 0
    has_pose = np.sum(np.abs(pose)) > 0

    if not (has_left or has_right):
        print("❌ Skipping: Both hands missing.")
        raise HTTPException(status_code=422, detail="Both hands missing, skipping prediction.")

    if not has_pose:
        print("❌ Skipping: Pose data missing.")
        raise HTTPException(status_code=422, detail="Pose data missing, skipping prediction.")

    if NORMALIZE:
        input_tensor = normalize_sequence(input_tensor)

    input_tensor = input_tensor[np.newaxis, ..., np.newaxis]  # (1, 30, 225, 1)

    try:
        prediction = model.predict(input_tensor, verbose=0)[0]
        pred_index = int(np.argmax(prediction))
        confidence = float(prediction[pred_index])
        label = reverse_map[pred_index]

        if confidence >= CONFIDENCE_THRESHOLD:
            print(f"✅ Prediction: {label} ({confidence:.2f})")
            return {"word": label, "confidence": confidence}
        else:
            print(f"⚠️ Low confidence prediction: {label} ({confidence:.2f})")
            return {"word": "Detecting...", "confidence": confidence}
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
