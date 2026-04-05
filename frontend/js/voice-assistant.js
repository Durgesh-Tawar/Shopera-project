/**
 * SOPERA - Voice Assistant System
 * Handles Voice Commands in English and Hindi
 * Features 'Hello Shopy' Wake Word for hands-free operation
 */

class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isListening = false;
        this.isManualClick = false; // To differentiate between mic click and background listening
        this.micBtn = document.getElementById('micIcon');
        this.searchBar = document.getElementById('searchBar');
        this.wakeWords = ['hello shopee', 'hello shoppee', 'hello shopy', 'hey shopy', 'hey shopee', 'hello shopping', 'hello sophia'];
        
        // Command mappings (English and Hindi variations)
        this.commands = {
            'mood.html': [
                'mood', 'moods', 'mood section', 'moods section'
            ],
            'reels.html': [
                'reel', 'reels', 'reels section', 'reel section', 'shorts', 'video', 'real', 'real section', 'reels dikhao'
            ],
            'spin.html': [
                'spin', 'spin section', 'wheel', 'spin to win', 'spin and win', 'ghumao', 'spin dikhao', 'charkhi'
            ],
            'cart.html': [
                'cart', 'bag', 'my cart', 'my bag', 'shopping'
            ],
            'wishlist.html': [
                'wishlist', 'favorite', 'favourites', 'wish list', 'favorites'
            ],
            'orders.html': [
                'order', 'orders', 'history', 'status'
            ],
            'index.html': [
                'home', 'homepage', 'wapas', 'main page', 'start'
            ],
            'index.html?category=women': [
                'women', 'womens', 'female', 'ladies', 'girl', 'girls', 'aurat', 'auraton', 'mahila'
            ],
            'index.html?category=kids': [
                'kid', 'kids', 'child', 'children', 'bacho', 'bachon', 'infant', 'chhote'
            ],
            'index.html?category=men': [
                'men', 'mens', 'male', 'gents', 'boy', 'boys', 'aadmi', 'purush', 'man'
            ]
        };

        this.init();
    }

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported');
            if (this.micBtn) this.micBtn.title = "Voice search not supported in this browser";
            return;
        }

        this.recognition = new SpeechRecognition();
        
        // Continuous listening for the wake word
        this.recognition.continuous = true; 
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-IN'; // Indian English handles Hinglish nicely

        this.setupEventListeners();
        this.createPopup();
        
        // Start continuous background listening immediately
        this.startBackgroundListening();
    }

    startBackgroundListening() {
        try {
            this.isManualClick = false;
            this.recognition.start();
        } catch (e) {
            // Usually happens if it's already started
            console.warn("Recognition already started", e);
        }
    }

    createPopup() {
        if (document.getElementById('voiceAssistantPopup')) return;
        
        const popupHTML = `
            <div id="voiceAssistantPopup" class="voice-assistant-popup hidden">
                <div class="mic-wave">🎙️</div>
                <div class="voice-info">
                    <div class="transcript-text" id="voiceTranscript">Listening...</div>
                    <div class="action-text" id="voiceAction"></div>
                </div>
            </div>
            
            <div id="wakeWordIndicator" style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.7); color: white; padding: 10px 20px; border-radius: 30px; font-size: 12px; z-index: 9998; backdrop-filter: blur(5px); opacity: 0.7; pointer-events: none; transition: all 0.3s ease;">
                <span style="display:inline-block; width:8px; height:8px; background:#4CAF50; border-radius:50%; margin-right:8px; animation: wavePulse 2s infinite;"></span>
                Say "Hello Shopy"
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        this.popup = document.getElementById('voiceAssistantPopup');
        this.transcriptEl = document.getElementById('voiceTranscript');
        this.actionEl = document.getElementById('voiceAction');
        this.wakeIndicator = document.getElementById('wakeWordIndicator');
    }

    setupEventListeners() {
        if (this.micBtn) {
            this.micBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Manual click overrides background listening
                this.isManualClick = true;
                this.isListening = true;
                this.micBtn.classList.add('listening');
                this.showPopup("Listening...");
                
                try {
                    this.recognition.stop();
                    setTimeout(() => { this.recognition.start(); }, 100);
                } catch(e) { /* ignored */ }
            });
        }

        this.recognition.onstart = () => {
            if (this.isManualClick) {
                this.isListening = true;
                if (this.micBtn) this.micBtn.classList.add('listening');
                this.showPopup("Listening...");
                if (this.wakeIndicator) this.wakeIndicator.style.display = 'none';
            } else {
                // Background listening started
                if (this.wakeIndicator) this.wakeIndicator.style.display = 'block';
            }
        };

        this.recognition.onresult = (event) => {
            // Get the latest result only (since continuous=true, results pile up)
            const latestResultIdx = event.results.length - 1;
            let transcript = event.results[latestResultIdx][0].transcript.toLowerCase().trim();
            
            // If manual click, process the command directly
            if (this.isManualClick) {
                this.handleCommand(transcript);
                this.isManualClick = false; // Reset after handling
            } else {
                // Background mode - look for wake word
                let triggered = false;
                for (const word of this.wakeWords) {
                    if (transcript.includes(word)) {
                        triggered = true;
                        // Extract the actual command by removing the wake word part
                        let commandPart = transcript.split(word)[1].trim(); 
                        
                        if (commandPart.length > 0) {
                            // Wake word + command spoken together: "Hello Shopy open reels"
                            this.isManualClick = true; // Act as if they clicked
                            this.showPopup("Listening...", "Wake Word Detected!");
                            setTimeout(() => this.handleCommand(commandPart), 300);
                        } else {
                            // Just the wake word: "Hello Shopy"
                            this.showPopup("Hello!", "I'm listening...");
                            this.speak("Yes?");
                            this.isManualClick = true; // Wait for next result as direct command
                        }
                        break;
                    }
                }
            }
        };

        this.recognition.onerror = (event) => {
            if (this.isManualClick) {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'no-speech') {
                    this.showPopup("No speech detected", "Please try again");
                }
                this.isManualClick = false;
            }
            
            if (this.micBtn) this.micBtn.classList.remove('listening');
            
            // Allow auto-restart unless it's a hard error
            if (event.error !== 'not-allowed') {
                setTimeout(() => this.startBackgroundListening(), 1000);
            } else {
                if (this.wakeIndicator) this.wakeIndicator.style.display = 'none';
            }
        };

        this.recognition.onend = () => {
            if (this.isManualClick) {
                this.isListening = false;
                if (this.micBtn) this.micBtn.classList.remove('listening');
                setTimeout(() => this.hidePopup(), 2000);
                this.isManualClick = false;
            }
            
            // Always try to restart background listening to keep "Hello Shopy" alive
            setTimeout(() => this.startBackgroundListening(), 1000);
        };
    }

    handleCommand(transcript) {
        // Remove trailing dot if browser added it
        let cleanTranscript = transcript.replace(/\.$/, '').trim().toLowerCase();
        
        // Safety check if transcript is empty
        if (!cleanTranscript) {
             this.hidePopup();
             return;
        }
        
        this.transcriptEl.textContent = `"${cleanTranscript}"`;
        
        let foundUrl = null;
        let actionMessage = "";
        let commandKeyLabel = "";

        // Search for a matching command
        for (const [url, keywords] of Object.entries(this.commands)) {
            for (const kw of keywords) {
                const regex = new RegExp(`\\b${kw}\\b`, 'i');
                if (regex.test(cleanTranscript)) {
                    foundUrl = url;
                    commandKeyLabel = kw.charAt(0).toUpperCase() + kw.slice(1);
                    actionMessage = `Opening ${commandKeyLabel}...`;
                    break;
                }
            }
            if (foundUrl) break;
        }

        // Action override for specific pages to fix grammar
        if (foundUrl === 'reels.html') actionMessage = 'Opening Reels...';
        if (foundUrl === 'spin.html') actionMessage = 'Opening Spin & Win...';
        if (foundUrl === 'mood.html') actionMessage = 'Opening Mood Shop...';

        // Show transcript in search bar visually
        if (this.searchBar && document.getElementById('searchBar')) {
            const searchBarElem = document.getElementById('searchBar');
            searchBarElem.value = cleanTranscript;
            searchBarElem.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (foundUrl) {
            this.actionEl.textContent = actionMessage;
            
            // Hide the listening popup immediately
            setTimeout(() => this.hidePopup(), 400);

            // Navigate after speaking
            this.speak(actionMessage, () => {
                window.location.href = foundUrl;
            });
        } else {
            // Fallback to Search
            this.actionEl.textContent = `Searching...`;
            
            // Hide popup gracefully since we are just showing dropdown or navigating
            setTimeout(() => this.hidePopup(), 600);

            this.speak(`Searching for ${cleanTranscript}`, () => {
                if (typeof handleSmartSearch === 'function') {
                    handleSmartSearch(cleanTranscript);
                } else if (typeof performSearch === 'function') {
                    performSearch(cleanTranscript, false);
                } else {
                    window.location.href = `index.html?search=${encodeURIComponent(cleanTranscript)}`;
                }
            });
        }
        
        // Ensure manual click mode is reset and background styling applied if applicable
        this.isManualClick = false;
        if (this.micBtn) this.micBtn.classList.remove('listening');
        if (this.wakeIndicator && this.recognition.continuous) {
            this.wakeIndicator.style.display = 'block';
        }
    }

    speak(text, onComplete) {
        let isDone = false;
        const fallbackTimeout = setTimeout(() => {
            if (!isDone && onComplete) {
                isDone = true;
                onComplete();
            }
        }, 3000); 

        if (!this.synth) {
            if (!isDone && onComplete) {
                isDone = true;
                clearTimeout(fallbackTimeout);
                onComplete();
            }
            return;
        }

        // Fix for Chrome bug where speech queue gets stuck
        this.synth.cancel();

        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance.lang = 'hi-IN'; // Force Hindi/Indian accent support
        this.currentUtterance.rate = 1.0;
        this.currentUtterance.pitch = 1.0;
        
        const voices = this.synth.getVoices();
        if (voices.length > 0) {
            const preferredVoice = voices.find(v => v.lang === 'hi-IN') || 
                                 voices.find(v => v.lang.includes('IN') && (v.name.includes('Female') || v.name.includes('Google'))) || 
                                 voices[0];
            this.currentUtterance.voice = preferredVoice;
        }
        
        this.currentUtterance.onend = () => {
            if (!isDone && onComplete) {
                isDone = true;
                clearTimeout(fallbackTimeout);
                onComplete();
            }
        };

        this.currentUtterance.onerror = (e) => {
            console.warn("Speech Synthesis Error:", e);
            if (!isDone && onComplete) {
                isDone = true;
                clearTimeout(fallbackTimeout);
                onComplete();
            }
        };

        // Resume if paused (fixes Windows/Chrome stutter issues)
        if (this.synth.paused) {
             this.synth.resume();
        }

        this.synth.speak(this.currentUtterance);
    }

    showPopup(transcript, action = "") {
        if (this.popup) {
            this.popup.classList.remove('hidden', 'fade-out');
            this.transcriptEl.textContent = transcript;
            this.actionEl.textContent = action;
        }
    }

    hidePopup() {
        if (this.popup) {
            this.popup.classList.add('fade-out');
            setTimeout(() => {
                this.popup.classList.add('hidden');
            }, 500);
        }
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.soperaAssistant = new VoiceAssistant();
    });
} else {
    // DOM is already loaded 
    window.soperaAssistant = new VoiceAssistant();
}
