# AI Interview Prep Tool

An AI-powered mock interview platform that helps you practice for technical interviews. Pick a role, answer questions out loud or by typing, and get AI-driven feedback on both your content and your speaking pace — with difficulty that adapts based on how well you're answering.

## Features

- **Role-based question generation** — Select a job role (e.g. Full Stack Developer) and company/difficulty tags; questions are generated dynamically via the Grok API instead of pulled from a static bank.
- **Adaptive difficulty** — Question difficulty increases or decreases based on the quality of your previous answers, so the session adjusts to your actual skill level in real time.
- **Voice practice (Web Speech API)** — Answer by speaking instead of typing. The app transcribes your response and tracks your speaking pace.
- **AI scoring & feedback** — Answers are evaluated by Grok for content quality, with a breakdown of what to improve.
- **Session results & progress tracking** — After a session, see your overall score, speaking pace feedback, and specific areas to work on. Past sessions are stored so you can track improvement over time.
- **Authentication** — Sign in/sign up handled via Firebase Auth.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| AI | Grok API (xAI) |
| Auth | Firebase |
| Deployment | AWS Amplify (frontend) + AWS EC2 (backend) |

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   React     │────▶│  Node/Express API  │────▶│  MongoDB    │
│  (Amplify)  │◀────│      (EC2)         │◀────│   Atlas     │
└─────────────┘      └──────────────────┘      └─────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │  Grok API │
                      └─────────────┘
```

- The React frontend is hosted on **AWS Amplify**, which handles build/deploy and CDN distribution.
- The Express backend runs on an **EC2 instance**, exposing REST endpoints for question generation, answer scoring, and session management.
- **MongoDB Atlas** stores user sessions, questions, answers, and scores.
- **Firebase Auth** handles sign-up/sign-in and issues tokens the backend verifies on protected routes.
- The **Grok API** is called server-side to generate role-specific questions and to score submitted answers.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A MongoDB Atlas connection string
- An xAI Grok API key
- A Firebase project (for auth)

### Setup

1. Clone the repo
   ```bash
   git clone https://github.com/thanu-shree-13/interview-prep-tool.git
   cd interview-prep-tool
   ```

2. Configure the backend
   ```bash
   cd backend
   ```
   Create a `.env` file with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   GROK_API_KEY=your_grok_api_key
   ```
   Then run:
   ```bash
   npm install
   npm run dev
   ```

3. Configure and run the frontend
   ```bash
   cd frontend
   npm install
   npm start
   ```

The app should now be running locally, with the frontend calling the backend API.

## Screenshots

### Sign In
![Sign in screen](screenshots/01_signin.png)

### Role & Difficulty Selection
Select a role, company, and difficulty — or type a custom role. Difficulty auto-adjusts based on performance during the session.
![Role and difficulty selection](screenshots/02_role_selection.png)

### Practice — Voice or Typed Answers
Answer by speaking or typing directly.
![Question with voice recording](screenshots/03_question_voice.png)
![Question with typed answer](screenshots/05_question_typed_answer.png)

### Speech Coach Analysis
Real-time feedback on speaking pace, filler words, and stutters.
![Speech coach analysis](screenshots/04_speech_coach_analysis.png)

### AI Scoring & Feedback
![AI score and feedback](screenshots/06_ai_score_feedback.png)

### Detailed Results
Per-question breakdown with strong points, missed points, and a generated model answer.
![Detailed results](screenshots/07_results_detailed_feedback.png)

### Progress Dashboard
Tracks average score, weak topics, and performance by role over time.
![Progress dashboard](screenshots/08_progress_dashboard.png)
