# JARVIS / FRIDAY HUD Assistant (2026 Edition)

An advanced, voice-controlled HUD interface built with Angular, inspired by the S.H.I.E.L.D. OS and Iron Man's digital assistants.

## Features

- **Voice Command Processing**: Integrated with Google Gemini API for intelligent responses and search grounding.
- **Local Command Execution**: Instant handling for YouTube, Google, WhatsApp, and Gmail commands.
- **Futuristic HUD UI**: Built with Tailwind CSS and Motion (vanilla JS) for smooth, high-tech animations.
- **Real-time Monitoring**: Simulated system stats (CPU, RAM, GPU) and live clock/weather data.
- **Zoneless Angular**: Optimized performance using Angular's latest zoneless architecture and Signals.

## Getting Started

### Prerequisites

- Node.js (v20+)
- Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

### Development

Run the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Voice Commands

- "Hey Jarvis, open YouTube and play [song name]"
- "Friday, search Google for [query]"
- "Send a WhatsApp message to [contact] saying [message]"
- "Go to sleep" / "Wake up"
- "Is there any cricket match today?" (Powered by Gemini Search)

## License

MIT
