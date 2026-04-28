# React Native Hyperlocal Chat App

A modern, full-featured React Native application built with Expo and Firebase. It combines real-time direct messaging, a location-based "hyperlocal" community feed, and an infinite-scrolling localized news feed.

## 🌟 Features

*   **Real-time Direct Messaging:** Fast, real-time 1-on-1 chats powered by Firebase Firestore `onSnapshot` listeners. Includes custom chat bubbles and a seamless keyboard-avoiding UI.
*   **Hyperlocal "Your City" Feed:** A Reddit-style community board filtered by your city. Features post creation, upvoting/downvoting (with strict 1-vote-per-user enforcement), and deep threaded replies.
*   **Localized Infinite News Feed:** A TikTok-style full-screen vertical scrolling feed of top news headlines tailored to your selected city, integrated with the NewsAPI.
*   **Gesture-Based Navigation:** A fluid, swipeable horizontal tab navigation system (built with `@react-navigation/material-top-tabs`) positioned at the bottom of the screen.
*   **Secure Authentication:** Email and password authentication with a strict requirement for Firebase Email Link Verification before granting access.
*   **Serverless Architecture:** Fully powered by Firebase (Auth & Firestore) without the need for a traditional backend server.
*   **Base64 Image Uploads:** Profile picture uploads bypass Firebase Storage entirely, compressing and encoding images to Base64 strings to save directly into Firestore text fields.

## 🛠️ Technology Stack

*   **Frontend Framework:** [React Native](https://reactnative.dev/) via [Expo](https://expo.dev/) (SDK 54)
*   **Backend / Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore) & [Firebase Auth](https://firebase.google.com/docs/auth)
*   **Navigation:** [React Navigation v7](https://reactnavigation.org/)
*   **Location Services:** `expo-location`
*   **Typography & Icons:** `@expo-google-fonts/inter`, `@expo-google-fonts/playfair-display`, `@expo/vector-icons`
*   **News API:** [NewsAPI.org](https://newsapi.org/)

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn
*   Expo CLI (`npm install -g expo-cli`)
*   A Firebase Project
*   A NewsAPI Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/chatapp-firebase.git
    cd chatapp-firebase
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your Firebase configuration and NewsAPI key:
    ```env
    EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
    
    EXPO_PUBLIC_NEWS_API_KEY=your_news_api_key
    ```

4.  **Firebase Firestore Setup:**
    Ensure your Firestore rules allow for the necessary reads and writes. You will need the following collections:
    *   `users`
    *   `chats`
    *   `messages` (subcollection of `chats`)
    *   `hyperlocalPosts`
    *   `hyperlocalReplies`

    *Note: You may need to create composite indexes in Firebase Console for sorting posts and replies by upvotes/timestamps.*

5.  **Run the app:**
    ```bash
    npx expo start
    ```
    Use the Expo Go app on your physical device, or press `a` for Android Emulator / `i` for iOS Simulator.

## 📱 Screenshots

*(Add screenshots of your UI here: Login Screen, Chat List, Chat Room, City Feed, News Feed, Profile)*

## 📝 License

This project is licensed under the ISC License.
