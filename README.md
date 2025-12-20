# <img src="frontend/public/favicon.png" width="32" height="32" alt="co-Interview Logo"> co-Interview

**Your AI-powered companion for technical interviews.**

![License: GPL-3.0](https://img.shields.io/badge/License-GPL_v3-blue.svg)

## About

A real-time AI assistant that provides contextual help during video calls, interviews, presentations, and meetings using screen capture and audio analysis.

This application operates in **BYOK (Bring Your Own Key) Mode**, allowing you to use your own Google Gemini API key securely.

> [!IMPORTANT]
> **use latest MacOS and Windows version, older versions have limited support**

> [!NOTE]
> **During testing it wont answer if you ask something, you need to simulate interviewer asking question, which it will answer**

## Features

*   **Live AI Assistance**: Real-time help powered by Google Gemini 
*   **Screen & Audio Capture**: Analyzes what you see and hear for contextual responses
*   **Multiple Profiles**: Interview, Sales Call, Business Meeting, Presentation, Negotiation
*   **Transparent Overlay**: Always-on-top window that can be positioned anywhere
*   **Click-through Mode**: Make window transparent to clicks when needed
*   **Cross-platform**: Works on macOS, Windows, and Linux (kinda, dont use, just for testing rn)

## Setup

1.  **Get a Gemini API Key**: Visit [Google AI Studio](https://aistudio.google.com/)
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run the App**:
    ```bash
    npm start
    ```

## Usage

1.  Enter your Gemini API key in the main window
2.  Choose your profile and language in settings
3.  Click "Start Session" to begin
4.  Position the window using keyboard shortcuts
5.  The AI will provide real-time assistance based on your screen and what interview asks

## Keyboard Shortcuts

*   **Window Movement**: `Ctrl/Cmd` + `Arrow Keys` - Move window
*   **Click-through**: `Ctrl/Cmd` + `M` - Toggle mouse events
*   **Close/Back**: `Ctrl/Cmd` + `\` - Close window or go back
*   **Send Message**: `Enter` - Send text to AI

## Audio Capture

*   **macOS**: SystemAudioDump for system audio
*   **Windows**: Loopback audio capture
*   **Linux**: Microphone input

## Requirements

*   Electron-compatible OS (macOS, Windows, Linux)
*   Gemini API key
*   Screen recording permissions
*   Microphone/audio permissions

## Project Structure

```
co-Interview/
├── frontend/                 # React Web Dashboard
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   └── pages/            # Application pages
├── co-interview-electron/    # Electron Desktop Application
│   ├── src/                  # Main and Renderer processes
└── README.md                 # Project Documentation
```

## License

This project is licensed under the GPL-3.0 License.
