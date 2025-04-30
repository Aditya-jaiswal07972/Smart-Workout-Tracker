import streamlit as st
import cv2
import mediapipe as mp
import numpy as np
import time
import json
import requests

# ============ Utility Functions ============

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return 360 - angle if angle > 180 else angle

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

# ============ Streamlit UI ============

st.title("🏋️ Fitness Tracker")

# Fetch username from query params or prompt user
username_query = st.query_params.get_all("id")
username = username_query[0] if username_query else None
name_query = st.query_params.get_all("name")
name = name_query[0] if name_query else None

if not username:  # If no username in query, ask user to input it
    username = st.text_input("Enter your username")

selected = st.multiselect(
    "Choose exercises:",
    ['Leg Squats', 'Biceps Curls', 'Neck Rotations', 'Push-ups', 'Lunges', 'Side Planks'],
    default=["Leg Squats"]
)

start = st.button("Start Session")

# ============ Tracking Logic ============

if start and username and selected:
    st.warning("Press 'Q' in the webcam window to stop session.")
    cap = cv2.VideoCapture(0)

    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils

    leg_counter = ExerciseCounter()
    bicep_left = ExerciseCounter()
    bicep_right = ExerciseCounter()
    neck_counter = NeckRotationCounter()

    start_time = time.time()

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.flip(frame, 1)
            h, w, _ = frame.shape
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image)

            if results.pose_landmarks:
                lm = results.pose_landmarks.landmark

                # Leg Squats
                if 'Leg Squats' in selected:
                    hip = [lm[mp_pose.PoseLandmark.LEFT_HIP.value].x, lm[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                    knee = [lm[mp_pose.PoseLandmark.LEFT_KNEE.value].x, lm[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                    ankle = [lm[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, lm[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                    angle = calculate_angle(hip, knee, ankle)
                    leg_counter.update(angle, 160, 90)
                    cv2.putText(frame, f'Leg: {int(angle)}', tuple(np.multiply(knee, [w, h]).astype(int)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

                # Biceps Curls
                if 'Biceps Curls' in selected:
                    # Left
                    shoulder = [lm[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, lm[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                    elbow = [lm[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, lm[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                    wrist = [lm[mp_pose.PoseLandmark.LEFT_WRIST.value].x, lm[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                    angle_left = calculate_angle(shoulder, elbow, wrist)
                    bicep_left.update(angle_left, 160, 40)

                    # Right
                    shoulder_r = [lm[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x, lm[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                    elbow_r = [lm[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x, lm[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                    wrist_r = [lm[mp_pose.PoseLandmark.RIGHT_WRIST.value].x, lm[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
                    angle_right = calculate_angle(shoulder_r, elbow_r, wrist_r)
                    bicep_right.update(angle_right, 160, 40)

                # Neck
                if 'Neck Rotations' in selected:
                    nose_x = lm[mp_pose.PoseLandmark.NOSE.value].x
                    left_ear_x = lm[mp_pose.PoseLandmark.LEFT_EAR.value].x
                    right_ear_x = lm[mp_pose.PoseLandmark.RIGHT_EAR.value].x
                    neck_counter.update(left_ear_x, right_ear_x, nose_x)

                mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            # Overlay counter
            cv2.rectangle(frame, (0, 0), (300, 130), (0, 0, 0), -1)
            y = 25
            if 'Leg Squats' in selected:
                cv2.putText(frame, f'Leg Squats: {leg_counter.counter}', (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                y += 25
            if 'Biceps Curls' in selected:
                cv2.putText(frame, f'Biceps L: {bicep_left.counter}', (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                y += 25
                cv2.putText(frame, f'Biceps R: {bicep_right.counter}', (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                y += 25
            if 'Neck Rotations' in selected:
                cv2.putText(frame, f'Neck: {neck_counter.counter}', (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 255, 0), 2)

            cv2.imshow("Tracking - Press Q to Quit", frame)

            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

        # Summary
        duration = int(time.time() - start_time)
        minutes, seconds = divmod(duration, 60)
        session_duration = f"{minutes} min {seconds} sec"

        summary = {"Session Duration": session_duration}
        if 'Leg Squats' in selected:
            summary["Leg Squats"] = leg_counter.counter
        if 'Biceps Curls' in selected:
            summary["Biceps Left"] = bicep_left.counter
            summary["Biceps Right"] = bicep_right.counter
        if 'Neck Rotations' in selected:
            summary["Neck Rotations"] = neck_counter.counter

        st.subheader("📊 Session Summary")
        st.json(summary)
        st.markdown(f'<a href="http://localhost:8000/dashboard/{username}?name={name}" target="_self" style="text-decoration: none; font-size: 18px;">🔗 View Your Dashboard</a>',unsafe_allow_html=True)
        # st.markdown(f'<a href="http://localhost:8000/dashboard/{username}?name={name}" target="_self" style="text-decoration: none; font-size: 18px;">🔗 View Your Dashboard</a>', unsafe_allow_html=True)

        # Show back to main page only if the username came from query param (i.e., MERN app user)
        if {name} != 'None':
            st.markdown('<a href="http://localhost:3000/pages/profile" target="_self" style="text-decoration: none; font-size: 18px;">🏠 Back to Main Page</a>', unsafe_allow_html=True)


        # Optionally post to backend
        try:
            res = requests.post("http://127.0.0.1:8000/start_session", json={
                "username": username,
                "summary": summary
            })
            if res.ok:
                st.success("✅ Data saved to backend.")
            else:
                st.warning(f"⚠️ Could not save data to backend. Status code: {res.status_code}")
                try:
                    error_data = res.json()
                    st.error(f"Backend error: {error_data}")
                except json.JSONDecodeError:
                    st.error("Backend error details not available.")
        except requests.exceptions.ConnectionError:
            st.warning("⚠️ Backend not reachable. Please ensure the backend server is running.")
        except requests.exceptions.RequestException as e:
            st.error(f"An error occurred while connecting to the backend: {e}")

else:
    if start:
        st.warning("Please fill in all fields before starting.")