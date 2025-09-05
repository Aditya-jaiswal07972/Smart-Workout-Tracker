# 🏋️‍♂️ Smart Workout Tracker

> *Because counting reps in your head is so 2010.*

Smart Workout Tracker is your personal digital gym buddy 💪. It combines a sleek **React frontend**, a powerful **Node.js/Express backend**, and some AI magic with **OpenCV + MediaPipe** for pose tracking. Add in **real-time analytics with Streamlit** and **secure user authentication (JWT)**, and you’ve got the perfect recipe for interactive workout management.

---

## ✨ Features

* 🎨 **Beautiful React UI** – Manage your workouts with ease.
* ⚡ **Express API** – Fast & reliable backend for all your workout data.
* 🔒 **Authentication** – Secure login/signup using JWT (no sneaky rep stealers).
* 📊 **Real-Time Analytics** – Streamlit dashboards that update as you sweat.
* 🧘 **Pose Tracking** – OpenCV + MediaPipe keep an eye on your form (like a personal trainer, minus the yelling).
* 🗄️ **MongoDB Database** – Stores your users data safely.

---

## 🗂️ Project Structure

```
smart-workout-tracker/
├── backend/        # Node.js + Express + JWT Auth
├── frontend/       # React app (UI)
├── fitness-tracker-api/      # Real-time analytics dashboard
├── .babelrc
└── README.md
```

---

## 🛠️ Tech Stack

* **Frontend:** React
* **Backend:** Node.js / Express
* **Database:** MongoDB
* **Auth:** JWT (JSON Web Tokens)
* **Analytics:** Streamlit
* **Pose Tracking:** OpenCV + MediaPipe

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Aditya-jaiswal07972/smart-workout-tracker.git
cd smart-workout-tracker
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```
MONGODB_URI=your-mongodb-uri
JWT_SECRET=supersecretkey
PORT=5000
```

Run the server:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

### 4. Launch Streamlit Dashboard

Make sure Python + Streamlit are installed:

```bash
streamlit run app.py
```

---

## 🎮 How It Works

1. **Sign Up / Log In** – Securely authenticate with JWT.
2. **Track Workouts** –  exercises, reps, and sets count.
3. **Pose Tracking** – Turn on your webcam and let OpenCV + MediaPipe guide your form.
4. **View Analytics** – Streamlit for real-time charts of your progress.

---

## 👨‍💻 Author

Built with ❤️ by [Aditya Jaiswal](https://github.com/Aditya-jaiswal07972)

