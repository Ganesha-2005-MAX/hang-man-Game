# 🎮 Hangman Game - Ultimate Gamified Experience

A high-fidelity, feature-rich Hangman game built with a focus on premium aesthetics, deep gamification, and a smooth user experience. This project features a sophisticated 7-view dashboard, real-time global leaderboards, and an extensive achievement system.

## ✨ Features

- 🏆 **Advanced Gamification**: Earn 25+ unique badges across 5 categories. Track your score and climb the ranks from Rookie to Master.
- 📊 **7-View Navigation Hub**:
  - **Dashboard**: Quick stats and level progress tracking.
  - **Achievements**: High-fidelity badge gallery with 3D-style icons.
  - **Leaderboard**: Real-time global rankings synced with Firestore.
  - **History**: Detailed log of your last 10 games with difficulty filtering.
  - **Multiplayer**: Local "Pass & Play" mode to battle friends.
  - **Settings**: Persistent cloud-synced game preferences (Sounds, Hints, Privacy).
  - **Help**: Comprehensive game guide and scoring breakdown.
- 🔐 **Secure Authentication**: Google and Email/Password login via Firebase.
- 🎨 **Premium UI/UX**: Sleek glassmorphism design using modern CSS, Radix UI, and smooth Framer-like animations.
- 🧠 **Anti-Repeat System**: Smart word selection logic that prevents seeing the same word twice in any 10-game session.
- 🚀 **Performant Architecture**: Built with TanStack Start for ultra-fast, type-safe navigation.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TanStack Start](https://tanstack.com/start)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Auth)
- **Styling**: Modern CSS (OKLCH color space), [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🎮 How to Play

1. **Pick a Difficulty**: Easy (6 lives), Medium (6 lives), or Hard (4 lives).
2. **Guess Letters**: Use the on-screen keyboard or your physical keyboard.
3. **Earn Points**: Get +10 for Easy, +20 for Medium, and +40 for Hard wins.
4. **Unlock Badges**: Complete challenges like winning 10 easy games or reaching 1,000 points!

---

Built with ❤️ by the Hangman Team
