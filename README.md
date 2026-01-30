<div align="center">
  
# 🍩 Glaze

### Your Intelligent Financial Companion

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Expo-54.0-000020?style=for-the-badge&logo=expo&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Firebase-12.8-FFCA28?style=for-the-badge&logo=firebase&logoColor=black"/>
  <img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
  <img src="https://img.shields.io/badge/Zustand-State-7C3AED?style=for-the-badge&logo=react&logoColor=white"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey?style=flat-square"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square"/>
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square"/>
</p>

<p align="center">
  <b>AI-powered personal finance tracker with smart expense tracking, multi-wallet management, and beautiful glassmorphism UI</b>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-license">License</a>
</p>

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **Glaze AI Assistant** | Chat with your finance data! Powered by **Google Gemini** with casual Indonesian responses |
| 💸 **Smart Expense Tracking** | Record transactions with categories, notes, and dates effortlessly |
| 💳 **Multi-Wallet Management** | Track balances across Bank, E-Wallet, and Cash accounts |
| 📊 **Interactive Analytics** | Visualize spending habits with beautiful charts and insights |
| 🎨 **Premium Glassmorphism UI** | Modern aesthetic with blur effects, gradients & smooth animations |
| ☁️ **Cloud Sync** | Real-time data sync with Firebase Firestore |
| 🔐 **Secure Authentication** | Firebase Auth with email/password login |
| ✨ **Smooth Animations** | 60fps animations powered by Moti & Reanimated |
| 📳 **Haptic Feedback** | Tactile feedback on all interactions |
| 🌙 **Dark Theme** | Beautiful dark mode with premium purple accents |

---

## 🛠 Tech Stack

### Core

| Technology | Version | Description |
|------------|---------|-------------|
| ![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat-square&logo=react&logoColor=black) | 0.81.5 | Cross-platform mobile framework |
| ![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white) | 54.0.32 | Development platform & tooling |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | 5.9.2 | Type-safe JavaScript |

### Backend & AI

| Technology | Version | Description |
|------------|---------|-------------|
| ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black) | 12.8.0 | Auth & Firestore Database |
| ![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white) | 0.24.1 | AI-powered chat assistant |

### UI & Libraries

| Technology | Version | Description |
|------------|---------|-------------|
| ![Zustand](https://img.shields.io/badge/Zustand-7C3AED?style=flat-square&logo=react&logoColor=white) | 5.0.10 | State management |
| ![Moti](https://img.shields.io/badge/Moti-A855F7?style=flat-square&logo=framer&logoColor=white) | 0.30.0 | Declarative animations |
| ![Reanimated](https://img.shields.io/badge/Reanimated-4A90D9?style=flat-square&logo=react&logoColor=white) | 4.1.1 | High-performance animations |
| ![NativeWind](https://img.shields.io/badge/NativeWind-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white) | 2.0.11 | TailwindCSS for React Native |

### Additional Libraries

| Library | Purpose |
|---------|---------|
| `expo-linear-gradient` | Gradient backgrounds |
| `expo-blur` | Glassmorphism effects |
| `expo-haptics` | Haptic feedback |
| `expo-router` | File-based routing |
| `@expo-google-fonts/plus-jakarta-sans` | Custom typography |
| `@shopify/flash-list` | High-performance lists |
| `react-native-gesture-handler` | Touch interactions |

---

## 📦 Installation

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Expo Go app on your phone
- Firebase account
- Google AI Studio account (for Gemini API)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/KittodGG/glaze.git
cd glaze

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start development server
npx expo start
```

### Environment Variables

Create a `.env` file with the following:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Email/Password Authentication**
3. Create **Firestore Database**
4. Copy config values to `.env` file

### Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Add to `.env` as `EXPO_PUBLIC_GEMINI_API_KEY`

---

## 📱 Screenshots

<p align="center">
  <i>Screenshots coming soon...</i>
</p>

| Home & Balances | AI Chat Assistant | Analytics |
|:---:|:---:|:---:|
| Track wallets & transactions | Chat with Glaze AI | Visualize spending |

---

## 📁 Project Structure

```
glaze/
├── app/                      # Expo Router screens
│   ├── (tabs)/               # Tab navigation screens
│   │   ├── index.tsx         # Home screen
│   │   ├── analytics.tsx     # Analytics & charts
│   │   ├── chat.tsx          # AI chat assistant
│   │   ├── profile.tsx       # User profile
│   │   └── explore.tsx       # Explore features
│   ├── modal.tsx             # Global modal
│   └── _layout.tsx           # Root layout
├── components/               # Reusable components
│   ├── home/                 # Dashboard widgets
│   ├── ui/                   # UI components
│   │   ├── GlassCard.tsx     # Glassmorphism card
│   │   ├── GlassView.tsx     # Blur view wrapper
│   │   ├── PremiumBackground.tsx
│   │   ├── Toast.tsx         # Toast notifications
│   │   ├── CustomAlert.tsx   # Alert dialogs
│   │   └── bottom-sheet.tsx  # Bottom sheet modal
│   ├── charts/               # Chart components
│   ├── MagicInputSheet.tsx   # AI input sheet
│   ├── WalletManagerSheet.tsx
│   └── TransactionSheet.tsx
├── services/                 # API & backend services
│   ├── firebase.ts           # Firebase configuration
│   ├── gemini.ts             # Gemini AI service
│   ├── transactionService.ts # Transaction CRUD
│   ├── walletService.ts      # Wallet management
│   └── insightService.ts     # AI insights
├── store/                    # Zustand state stores
├── hooks/                    # Custom React hooks
├── context/                  # React Context providers
├── theme/                    # Design tokens & colors
├── constants/                # App constants
└── utils/                    # Helper functions
```

---

## 🎨 Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0A0A0F` | Primary dark background |
| Card | `rgba(30, 30, 50, 0.95)` | Glassmorphism cards |
| Primary | `#A855F7` | Primary accent (purple) |
| Secondary | `#7C3AED` | Secondary accent |
| Text | `#FFFFFF` | Primary text |
| Text Muted | `rgba(255,255,255,0.6)` | Secondary text |

### Typography

- **Font Family**: Plus Jakarta Sans (400, 500, 600, 700)
- **Sizes**: 12px - 32px scale

---

## 🚀 Scripts

```bash
# Development
npx expo start              # Start dev server
npx expo start --ios        # iOS simulator
npx expo start --android    # Android emulator

# Linting
npm run lint                # Run ESLint

# Type checking
npx tsc --noEmit

# Build
npx eas build --platform android
npx eas build --platform ios
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for AI-powered chat functionality
- [Firebase](https://firebase.google.com/) for backend services
- [Expo](https://expo.dev/) for amazing development tools
- [Moti](https://moti.fyi/) for beautiful animations
- [Zustand](https://github.com/pmndrs/zustand) for state management

---

<div align="center">
  
Made with 💜 in Indonesia

**[⬆ back to top](#-glaze)**

</div>
