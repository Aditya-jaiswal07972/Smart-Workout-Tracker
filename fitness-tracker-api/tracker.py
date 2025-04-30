import cv2
import mediapipe as mp
import numpy as np
import time
import json
import os

from typing import List

# Load MediaPipe Pose
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

# Angle calculation
def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return 360 - angle if angle > 180.0 else angle

class ExerciseCounter:
    def __init__(self):
        self.counter = 0
        self.stage = None

    def update(self, angle, up_thresh, down_thresh):
        if angle > up_thresh:
            self.stage = "down"
        if angle < down_thresh and self.stage == "down":
            self.stage = "up"
            self.counter += 1

class NeckRotationCounter:
    def __init__(self):
        self.counter = 0
        self.prev_side = None

    def update(self, left_ear_x, right_ear_x, nose_x):
        if nose_x < left_ear_x - 0.02:
            current = "left"
        elif nose_x > right_ear_x + 0.02:
            current = "right"
        else:
            current = "center"

        if current != self.prev_side and current in ["left", "right"] and self.prev_side in ["left", "right"]:
            self.counter += 1
        self.prev_side = current

def track_exercises(username: str, selected_exercises: List[str]) -> dict:
    leg_counter = ExerciseCounter()
    neck_counter = NeckRotationCounter()

    cap = cv2.VideoCapture(0)
    start_time = time.time()

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image)

            if results.pose_landmarks:
                lm = results.pose_landmarks.landmark

                if 'Leg Squats' in selected_exercises:
                    hip = [lm[mp_pose.PoseLandmark.LEFT_HIP.value].x, lm[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                    knee = [lm[mp_pose.PoseLandmark.LEFT_KNEE.value].x, lm[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                    ankle = [lm[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, lm[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                    angle = calculate_angle(hip, knee, ankle)
                    leg_counter.update(angle, 160, 90)

                if 'Neck Rotations' in selected_exercises:
                    nose = lm[mp_pose.PoseLandmark.NOSE.value].x
                    left_ear = lm[mp_pose.PoseLandmark.LEFT_EAR.value].x
                    right_ear = lm[mp_pose.PoseLandmark.RIGHT_EAR.value].x
                    neck_counter.update(left_ear, right_ear, nose)

            cv2.imshow('Tracking', frame)
            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()

    # Time calculation
    duration = int(time.time() - start_time)
    minutes, seconds = divmod(duration, 60)
    duration_str = f"{minutes} min {seconds} sec"

    summary = {
        "Session Duration": duration_str,
    }

    if 'Leg Squats' in selected_exercises:
        summary["Leg Squats"] = leg_counter.counter
    if 'Neck Rotations' in selected_exercises:
        summary["Neck Rotations"] = neck_counter.counter

    # Save to JSON
    save_to_json(username, summary)

    return summary

def save_to_json(username, summary):
    file_path = "exercise_data.json"
    
    # Load existing data
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            data = json.load(f)
    else:
        data = {}

    # Append the new session data
    data.setdefault(username, []).append(summary)

    # Save data back to the JSON file
    with open(file_path, "w") as f:
        json.dump(data, f, indent=4)

