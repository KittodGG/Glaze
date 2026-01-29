# Glaze 🍩

**Your Intelligent Financial Companion.**

Glaze is a modern, AI-powered personal finance tracker built with React Native and Expo. It helps you track expenses, manage wallets, and gain insights into your spending habits through a natural conversation with Glaze AI.

![Glaze App Banner](https://via.placeholder.com/1200x600?text=Glaze+App+Preview)

## ✨ Key Features

- **🤖 Glaze AI Assistant**: Chat with your finance data! Powered by **Google Gemini**, Glaze AI helps you analyze spending, gives saving tips, and answers questions about your financial health in casual Indonesian.
- **💸 Smart Expense Tracking**: Easily record transactions with categories, notes, and dates.
- **💳 Multi-Wallet Management**: Track balances across different accounts (Bank, E-Wallet, Cash).
- **🎨 Beautiful UI/UX**: Built with a premium aesthetic, featuring smooth animations (Moti), glassmorphism effects, and a clean dark/light mode adaptable design.
- **☁️ Cloud Sync**: Data is securely synced using **Firebase**, so you never lose your records.
- **📊 Interactive Charts**: Visualizing your spending habits (Coming Soon).

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: React Native StyleSheet, Moti (Animations), Expo Linear Gradient
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend / DB**: [Firebase](https://firebase.google.com/) (Firestore, Auth)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- Expo Go app on your phone (or a simulator)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/glaze.git
   cd glaze
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your keys (see `.env.example`):
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_key
   ...
   ```

4. **Run the app**
   ```bash
   npx expo start
   ```

## 📱 Screenshots

| Home & Balances | AI Chat Assistant | Add Transaction |
|:---:|:---:|:---:|
| ![Home](https://via.placeholder.com/300x600?text=Home) | ![Chat](https://via.placeholder.com/300x600?text=Chat) | ![Add](https://via.placeholder.com/300x600?text=Add+Transaction) |

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help make Glaze better.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with 💜 in Indonesia.
