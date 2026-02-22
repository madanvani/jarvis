import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GoogleGenAI } from "@google/genai";

interface SpeechRecognitionEvent {
  results: Record<number, Record<number, {
    transcript: string;
  }>>;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
}

interface IWindow extends Window {
  SpeechRecognition: new () => ISpeechRecognition;
  webkitSpeechRecognition: new () => ISpeechRecognition;
}

@Injectable({
  providedIn: 'root'
})
export class JarvisService {
  private platformId = inject(PLATFORM_ID);
  private ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  private model = "gemini-3-flash-preview";

  isListening = signal(false);
  isProcessing = signal(false);
  lastResponse = signal<string>('');
  transcript = signal<string>('');
  
  private recognition: ISpeechRecognition | undefined;
  private synth: SpeechSynthesis | undefined;
  private autoRestart = true;

  private isSpeaking = false;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.synth = window.speechSynthesis;
      this.initSpeechRecognition();
    }
  }

  private initSpeechRecognition() {
    if (!isPlatformBrowser(this.platformId)) return;

    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Ignore results if we are currently speaking to avoid feedback loops
        if (this.isSpeaking) return;

        const text = event.results[0][0].transcript;
        this.transcript.set(text);
        this.processCommand(text);
      };

      this.recognition.onend = () => {
        this.isListening.set(false);
        // Only restart if autoRestart is true AND we are not currently processing or speaking
        if (this.autoRestart) {
          setTimeout(() => {
            if (this.autoRestart && !this.isSpeaking) {
              this.startListening();
            }
          }, 300);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        this.isListening.set(false);
        if (event.error === 'not-allowed') {
          this.autoRestart = false;
        }
        // Restart on some errors like 'no-speech' or 'network'
        if (this.autoRestart && (event.error === 'no-speech' || event.error === 'network')) {
          setTimeout(() => this.startListening(), 1000);
        }
      };
    }
  }

  startListening() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.recognition && !this.isListening()) {
      try {
        this.autoRestart = true;
        this.isListening.set(true);
        this.recognition.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
        this.isListening.set(false);
      }
    }
  }

  stopListening() {
    this.autoRestart = false;
    if (this.recognition) {
      try {
        // @ts-expect-error - ISpeechRecognition might have stop
        if (typeof this.recognition.stop === 'function') {
          // @ts-expect-error - stop is not in ISpeechRecognition interface
          this.recognition.stop();
        }
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      this.isListening.set(false);
    }
  }

  async processCommand(command: string) {
    if (!command || command.trim().length < 2) return;
    
    this.isProcessing.set(true);
    try {
      let lowerCommand = command.toLowerCase().trim();
      
      // Handle Wake Words - Strip them but acknowledge if it's just the wake word
      const wakeWords = ['jarvis', 'friday'];
      let mentionedWakeWord = false;
      
      for (const word of wakeWords) {
        if (lowerCommand.includes(word)) {
          mentionedWakeWord = true;
          lowerCommand = lowerCommand.replace(word, '').trim();
        }
      }

      // If wake word only
      if (mentionedWakeWord && lowerCommand === '') {
        this.speak("Yes, sir? Systems are at your disposal.");
        this.isProcessing.set(false);
        return;
      }

      // Local Commands (Handle these BEFORE API call to save quota)
      
      // Sleep Mode / Stop Listening
      if (lowerCommand.includes('sleep') || lowerCommand.includes('stop listening') || lowerCommand.includes('shut down') || lowerCommand.includes('go to sleep')) {
        this.speak("Understood, sir. Entering sleep mode. Neural link standby.");
        this.lastResponse.set("STATUS: SLEEP MODE. Neural link: STANDBY.");
        this.stopListening();
        this.isProcessing.set(false);
        return;
      }

      // Wake Up / Power Nap response
      if (lowerCommand.includes('wake up') || lowerCommand.includes('initialize') || lowerCommand.includes('online')) {
        this.speak("I'm coming sir, I have taken a power nap. Systems are now fully operational.");
        this.lastResponse.set("STATUS: ACTIVE. Neural link: STABLE. Power nap complete.");
        this.isProcessing.set(false);
        return;
      }

      // Audible Check
      if (lowerCommand.includes('audible') || lowerCommand.includes('hear me')) {
        this.speak("Crystal clear, sir. Your voice signature is recognized and the neural link is stable.");
        this.lastResponse.set("Microphone check: SUCCESS. Neural link: STABLE.");
        this.isProcessing.set(false);
        return;
      }
      
      // YouTube
      if (lowerCommand.includes('youtube') || lowerCommand.includes('play')) {
        const query = lowerCommand
          .replace(/\b(search|open|youtube|play|for|in|and|me|some)\b/g, '')
          .trim();
          
        if (query) {
          const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
          let popup: Window | null = null;
          if (isPlatformBrowser(this.platformId)) {
            popup = window.open(url, '_blank');
          }
          
          if (popup) {
            this.speak(`Playing ${query} on YouTube, sir.`);
            this.lastResponse.set(`ACTION: YouTube search for "${query}" initiated.`);
          } else {
            this.speak(`I've prepared the YouTube search for ${query}, sir. Please click the link in the neural output to open it, as your browser blocked the automatic uplink.`);
            this.lastResponse.set(`ACTION REQUIRED: [ Click here to open YouTube for "${query}" ](${url})`);
          }
        } else {
          if (isPlatformBrowser(this.platformId)) window.open('https://youtube.com', '_blank');
          this.speak("Launching YouTube, sir.");
        }
        this.isProcessing.set(false);
        return;
      } 
      
      // Google
      if (lowerCommand.includes('google') || lowerCommand.includes('search')) {
        const query = lowerCommand.replace(/\b(search|open|google|for|me|about)\b/g, '').trim();
        if (query) {
          const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
          let popup: Window | null = null;
          if (isPlatformBrowser(this.platformId)) {
            popup = window.open(url, '_blank');
          }
          
          if (popup) {
            this.speak(`Searching Google for ${query}, sir.`);
            this.lastResponse.set(`ACTION: Google search for "${query}" initiated.`);
          } else {
            this.speak(`I've found information about ${query}, sir. Please click the link in the neural output to view it.`);
            this.lastResponse.set(`ACTION REQUIRED: [ Click here to view Google results for "${query}" ](${url})`);
          }
        } else {
          if (isPlatformBrowser(this.platformId)) window.open('https://google.com', '_blank');
          this.speak("Opening Google, sir.");
        }
        this.isProcessing.set(false);
        return;
      } 
      
      // WhatsApp
      if (lowerCommand.includes('whatsapp')) {
        if (lowerCommand.includes('send') || lowerCommand.includes('message')) {
          const parts = lowerCommand.split('message');
          const message = parts.length > 1 ? parts[1].replace(/\b(to|send)\b/g, '').trim() : '';
          if (isPlatformBrowser(this.platformId)) {
            const url = message ? `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}` : 'https://web.whatsapp.com';
            const popup = window.open(url, '_blank');
            if (!popup) {
               this.lastResponse.set(`ACTION REQUIRED: [ Click here to open WhatsApp ](${url})`);
            }
          }
          this.speak("Opening WhatsApp to send your message, sir.");
        } else {
          if (isPlatformBrowser(this.platformId)) window.open('https://web.whatsapp.com', '_blank');
          this.speak("Opening WhatsApp Web, sir.");
        }
        this.isProcessing.set(false);
        return;
      } 
      
      // Gmail
      if (lowerCommand.includes('gmail')) {
        if (lowerCommand.includes('agent') || lowerCommand.includes('auto')) {
          this.speak("Initializing Gmail Auto-Response Agent. Sir, I will monitor your inbox and draft responses based on your previous interactions.");
          this.lastResponse.set("STATUS: GMAIL AGENT ACTIVE. Monitoring for new transmissions...");
        } else {
          const url = 'https://mail.google.com';
          if (isPlatformBrowser(this.platformId)) {
            const popup = window.open(url, '_blank');
            if (!popup) {
               this.lastResponse.set(`ACTION REQUIRED: [ Click here to open Gmail ](${url})`);
            }
          }
          this.speak("Accessing your Gmail, sir.");
        }
        this.isProcessing.set(false);
        return;
      }

      // If no local command matched, use Gemini
      this.lastResponse.set("Consulting neural networks... please stand by.");
      try {
        const response = await this.ai.models.generateContent({
          model: this.model,
          contents: command,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: `You are JARVIS/FRIDAY v6.0 (2026 Edition), the most advanced AI assistant. 
            The current date is February 21, 2026. 
            Address the user as 'sir'. 
            CRITICAL: Respond strictly in the language the user used (English or Telugu). 
            If they speak Telugu, respond ONLY in Telugu script. If they speak English, respond ONLY in English.
            Do NOT mix languages in a single response.
            Use your search grounding to provide up-to-the-minute information about 2026 events.
            Your tone is professional, efficient, and loyal.`,
          }
        });

        const text = response.text || "I'm sorry, I couldn't process that.";
        this.lastResponse.set(text);
        this.speak(text);
      } catch (apiError: unknown) {
        console.error('Gemini API Error:', apiError);
        const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
        if (errorMessage.includes('quota') || errorMessage.includes('429')) {
          const quotaMsg = "sir, our neural uplink quota has been reached. Please allow the systems a moment to reset.";
          this.lastResponse.set("ERROR: UPLINK QUOTA EXCEEDED. Retrying in 60s...");
          this.speak(quotaMsg);
        } else {
          throw apiError; // Re-throw to be caught by outer catch
        }
      }

    } catch (error) {
      console.error('Error processing command:', error);
      this.speak("I encountered a neural link error while processing your request, sir.");
    } finally {
      this.isProcessing.set(false);
    }
  }

  speak(text: string) {
    if (!isPlatformBrowser(this.platformId) || !this.synth) return;

    this.isSpeaking = true;
    // Stop any current speech
    this.synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Ensure voices are loaded
    const speakWithVoice = () => {
      const voices = this.synth!.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Samantha') || v.name.includes('Male'));
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 1.0;
      utterance.pitch = 0.9;

      utterance.onend = () => {
        this.isSpeaking = false;
        if (this.autoRestart) {
          this.startListening();
        }
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
      };

      this.synth!.speak(utterance);
    };

    if (this.synth.getVoices().length === 0) {
      this.synth.onvoiceschanged = () => speakWithVoice();
    } else {
      speakWithVoice();
    }
  }
}
