import os
import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import load_model
from collections import deque
import time

# === 1. Configuration ===
DATA_PATH = 'data'
SEQUENCE_LENGTH = 30
FEATURE_SIZE = 225  # 63 left + 63 right + 99 pose
CONFIDENCE_THRESHOLD = 0.7
NORMALIZE = True

# === 2. Gestures ===
GESTURES = sorted(os.listdir(DATA_PATH))
NUM_CLASSES = len(GESTURES)
label_map = {gesture: idx for idx, gesture in enumerate(GESTURES)}
print("🎯 Label map:", label_map)

# === 3. Load model ===
model = load_model("models/sign_model.keras")
print(f"✅ Loaded model with gestures: {GESTURES}")

# === 4. Setup MediaPipe and Webcam ===
mp_hands = mp.solutions.hands
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2,
                       min_detection_confidence=0.7, min_tracking_confidence=0.7)
pose = mp_pose.Pose(static_image_mode=False, model_complexity=0,
                    min_detection_confidence=0.7, min_tracking_confidence=0.7)

cap = cv2.VideoCapture(0, cv2.CAP_MSMF)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
cap.set(cv2.CAP_PROP_FPS, 30)
time.sleep(1)

print("📷 Starting webcam... Show hand to begin prediction. Press ESC to quit.")
buffer = deque(maxlen=SEQUENCE_LENGTH)

def normalize_landmarks(coords):
    coords = coords.reshape(1, -1, 3)
    coords -= coords[:, 0:1, :]
    return coords.reshape(-1)

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    hand_result = hands.process(rgb)
    pose_result = pose.process(rgb)

    coords_all = []
    left_hand = np.zeros(63)
    right_hand = np.zeros(63)

    # === Proceed only if at least one hand is detected ===
    if hand_result.multi_hand_landmarks and hand_result.multi_handedness:
        for idx, handedness in enumerate(hand_result.multi_handedness):
            label = handedness.classification[0].label
            landmarks = hand_result.multi_hand_landmarks[idx]
            coords = np.array([[lm.x, lm.y, lm.z] for lm in landmarks.landmark])

            coords = normalize_landmarks(coords) if NORMALIZE else coords.flatten()

            if label == 'Left':
                left_hand = coords
            elif label == 'Right':
                right_hand = coords

            # === Styled hand drawing ===
            mp_drawing.draw_landmarks(
                frame,
                landmarks,
                mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style()
            )

        coords_all.extend([left_hand, right_hand])

        # === Pose landmarks ===
        if pose_result.pose_landmarks:
            pose_coords = np.array([[lm.x, lm.y, lm.z] for lm in pose_result.pose_landmarks.landmark[:33]])
            pose_coords = normalize_landmarks(pose_coords) if NORMALIZE else pose_coords.flatten()
            coords_all.append(pose_coords)

            # === Styled pose drawing ===
            mp_drawing.draw_landmarks(
                frame,
                pose_result.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp_drawing_styles.get_default_pose_landmarks_style()
            )
        else:
            coords_all.append(np.zeros(99))

        combined = np.concatenate(coords_all)
        if combined.shape == (FEATURE_SIZE,):
            buffer.append(combined)

        # === Predict only when buffer is full ===
        if len(buffer) == SEQUENCE_LENGTH:
            input_seq = np.array(buffer)[np.newaxis, ..., np.newaxis]
            prediction = model.predict(input_seq, verbose=0)[0]
            pred_index = np.argmax(prediction)
            confidence = prediction[pred_index]

            if confidence >= CONFIDENCE_THRESHOLD:
                label = GESTURES[pred_index]
                cv2.putText(frame, f"{label.upper()} ({confidence:.2f})", (10, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)
            else:
                cv2.putText(frame, "Detecting...", (10, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 255), 2)
    else:
        buffer.clear()
        cv2.putText(frame, "✋ Show hand to start prediction...", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)

    cv2.imshow("✋ Real-Time Sign Prediction", frame)

    if cv2.waitKey(1) & 0xFF == 27:  # ESC
        break

cap.release()
cv2.destroyAllWindows()
print("🛑 Webcam closed.")
