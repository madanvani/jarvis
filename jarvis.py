import os
import time
import webbrowser
import speech_recognition as sr
import pyttsx3
import google.generativeai as genai
import customtkinter as ctk
from threading import Thread

# --- CONFIGURATION ---
# Replace with your actual Gemini API Key
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"

genai.configure(apiKey=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# Initialize Text-to-Speech
engine = pyttsx3.init()
voices = engine.getProperty('voices')
# Try to set a more "Jarvis-like" voice (usually index 0 or 1 depending on system)
engine.setProperty('voice', voices[0].id) 
engine.setProperty('rate', 170)

def speak(text):
    print(f"JARVIS: {text}")
    engine.say(text)
    engine.runAndWait()

class JarvisHUD(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("J.A.R.V.I.S HUD v6.0 (2026)")
        self.geometry("450x650")
        self.attributes("-topmost", True)
        self.attributes("-alpha", 0.95) # Transparency
        ctk.set_appearance_mode("dark")
        
        # UI Elements
        self.label_status = ctk.CTkLabel(self, text="S.H.I.E.L.D OS v6.0 // ONLINE", font=("Courier", 12), text_color="#f97316")
        self.label_status.pack(pady=10)

        self.arc_reactor = ctk.CTkFrame(self, width=220, height=220, corner_radius=110, border_width=8, border_color="#f97316")
        self.arc_reactor.pack(pady=20)
        
        self.core_label = ctk.CTkLabel(self.arc_reactor, text="F.R.I.D.A.Y\n2026", font=("Courier", 22, "bold"), text_color="#f97316")
        self.core_label.place(relx=0.5, rely=0.5, anchor="center")

        self.transcript_box = ctk.CTkTextbox(self, width=400, height=80, font=("Courier", 12))
        self.transcript_box.pack(pady=10)

        self.response_box = ctk.CTkTextbox(self, width=400, height=180, font=("Courier", 12), text_color="#fbbf24")
        self.response_box.pack(pady=10)

        # Start listening thread
        self.is_listening = True
        Thread(target=self.listen_loop, daemon=True).start()

    def update_transcript(self, text):
        self.transcript_box.delete("1.0", "end")
        self.transcript_box.insert("1.0", f">> {text}")

    def update_response(self, text):
        self.response_box.delete("1.0", "end")
        self.response_box.insert("1.0", text)

    def listen_loop(self):
        r = sr.Recognizer()
        with sr.Microphone() as source:
            speak("Systems initialized. Welcome to 2026, Madan. Neural link established.")
            while self.is_listening:
                try:
                    self.label_status.configure(text="LISTENING...", text_color="#f97316")
                    audio = r.listen(source, timeout=5, phrase_time_limit=10)
                    self.label_status.configure(text="PROCESSING...", text_color="#ef4444")
                    
                    command = r.recognize_google(audio)
                    self.update_transcript(command)
                    self.process_command(command)
                    
                except sr.WaitTimeoutError:
                    continue
                except Exception as e:
                    print(f"Error: {e}")
                    self.label_status.configure(text="AWAITING COMMAND", text_color="#f97316")

    def process_command(self, command):
        cmd = command.lower()
        
        if "youtube" in cmd:
            query = cmd.replace("search", "").replace("open", "").replace("youtube", "").replace("for", "").strip()
            if query:
                speak(f"Searching YouTube for {query}, Madan.")
                webbrowser.open(f"https://www.youtube.com/results?search_query={query}")
            else:
                speak("Opening YouTube, Madan.")
                webbrowser.open("https://www.youtube.com")
        
        elif "google" in cmd:
            query = cmd.replace("search", "").replace("open", "").replace("google", "").replace("for", "").strip()
            if query:
                speak(f"Searching Google for {query}, Madan.")
                webbrowser.open(f"https://www.google.com/search?q={query}")
            else:
                speak("Opening Google, Madan.")
                webbrowser.open("https://www.google.com")

        elif "whatsapp" in cmd:
            speak("Opening WhatsApp Web, Madan.")
            webbrowser.open("https://web.whatsapp.com")

        elif "gmail" in cmd:
            speak("Accessing your Gmail, Madan.")
            webbrowser.open("https://mail.google.com")

        else:
            # Gemini AI Response with 2026 context
            try:
                prompt = f"""
                User: {command}
                Context: You are JARVIS/FRIDAY v6.0 (2026 Edition). 
                Current Date: February 21, 2026.
                User Name: Madan.
                Instructions: Respond strictly in the language used (English or Telugu). 
                Use your knowledge of 2026 events. Keep it concise, loyal, and efficient.
                """
                response = model.generate_content(prompt)
                reply = response.text
                self.update_response(reply)
                speak(reply)
            except Exception as e:
                speak("I encountered a neural link error, Madan.")

if __name__ == "__main__":
    app = JarvisHUD()
    app.mainloop()
