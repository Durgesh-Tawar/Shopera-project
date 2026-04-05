/**
 * SOPERA - Voice Assistant System (Simplified & Stable)
 * Optimized for Mobile Smoothness
 */

class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isStarted = false; 
        this.isManual = false; 
        this.isAssistant = false; 
        // Improved mobile detection
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (window.innerWidth <= 1024);
        console.log("SOPERA: Assistant Initialized. Mobile Mode:", this.isMobile);
        
        this.micBtn = document.getElementById('micIcon');
        this.searchBar = document.getElementById('searchBar');
        
        this.wakeWords = ['hello shopy', 'hello shopee', 'hey shopy', 'ok shopy', 'hi shopy', 'namaste shopy'];
        
        this.commands = {
            'mood.html': ['mood', 'feel', 'vibes'],
            'reels.html': ['reel', 'video', 'dikhao', 'shorts'],
            'spin.html': ['spin', 'game', 'win', 'charkhi', 'ghumao'],
            'cart.html': ['cart', 'bag', 'checkout', 'tokri'],
            'wishlist.html': ['wishlist', 'favorite', 'heart', 'pasand'],
            'orders.html': ['order', 'history', 'status'],
            'index.html': ['home', 'main', 'start', 'shuru'],
            'index.html?category=women': ['women', 'female', 'girl', 'ladies', 'aurat'],
            'index.html?category=kids': ['kid', 'child', 'bacho', 'bachon'],
            'index.html?category=men': ['men', 'male', 'boy', 'aadmi', 'gents']
        };

        this.init();
    }

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = !this.isMobile;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-IN';

        this.createUI();
        this.bindEvents();
        
        // Background listening: ONLY on Desktop
        if (!this.isMobile) {
            console.log("SOPERA: Starting background mode (Desktop)");
            this.start(false); 
        } else {
            console.log("SOPERA: Background mode disabled (Mobile)");
        }
    }

    start(isManual = false) {
        if (this.isStarted) return;
        this.isManual = isManual;
        try {
            this.recognition.start();
        } catch (e) {
            console.warn("Start failed:", e);
        }
    }

    createUI() {
        if (document.getElementById('voiceAssistantPopup')) return;
        const html = `
            <div id="voiceAssistantPopup" class="voice-assistant-popup hidden">
                <div class="mic-wave">🎙️</div>
                <div class="voice-info">
                    <div class="transcript-text" id="voiceTranscript">Listening...</div>
                    <div class="action-text" id="voiceAction"></div>
                </div>
            </div>
            <!-- Floating Assistant Button for Mobile -->
            <button id="assistantFab" class="assistant-fab">
                <div class="fab-icon">🤖</div>
            </button>
            <div id="wakeIndicator" style="position: fixed; bottom: 80px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 30px; font-size: 11px; z-index: 9999; backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <div style="width:10px; height:10px; background:#4CAF50; border-radius:50%; margin-right:10px; box-shadow: 0 0 8px #4CAF50;"></div>
                <span id="wakeStatus">"Hello Shopy"</span>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this.popup = document.getElementById('voiceAssistantPopup');
        this.transcriptEl = document.getElementById('voiceTranscript');
        this.actionEl = document.getElementById('voiceAction');
        this.wakeIndicator = document.getElementById('wakeIndicator');
        this.assistantFab = document.getElementById('assistantFab');
        
        if (this.assistantFab) {
            this.assistantFab.onclick = (e) => {
                e.preventDefault();
                this.isAssistant = true;
                this.start(true);
            };
        }
    }

    bindEvents() {
        if (this.micBtn) {
            this.micBtn.onclick = (e) => {
                e.preventDefault();
                this.isAssistant = false;
                this.start(true);
            };
        }

        this.recognition.onstart = () => {
            this.isStarted = true;
            if (this.isManual) {
                this.popup.classList.remove('hidden');
                if (this.micBtn) this.micBtn.classList.add('listening');
            }
            // Only show wake indicator on Desktop or if background listening is allowed
            if (this.wakeIndicator) {
                this.wakeIndicator.style.display = (this.isMobile && !this.isManual) ? 'none' : 'flex';
            }
        };

        this.recognition.onresult = (event) => {
            let final = '';
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const text = event.results[i][0].transcript.toLowerCase();
                if (event.results[i].isFinal) final += text;
                else interim += text;
            }

            const txt = (final || interim).trim();
            if (!txt) return;

            if (this.isManual) {
                this.transcriptEl.textContent = txt;
                this.actionEl.textContent = this.isAssistant ? "Navigating..." : "Searching...";
                if (this.searchBar && !this.isAssistant) {
                    this.searchBar.value = txt;
                    this.searchBar.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }

            if (final) {
                if (this.isManual) {
                    this.process(final, this.isAssistant);
                } else {
                    // Check wake words
                    if (this.wakeWords.some(w => final.includes(w))) {
                        const cmd = final.split('shopy')[1]?.trim();
                        if (cmd) {
                            this.isAssistant = true;
                            this.process(cmd, true);
                        } else {
                            this.isManual = true;
                            this.isAssistant = true;
                            this.showPopup("Yes?", "How can I help?");
                            this.speak("Yes?");
                        }
                    }
                }
            }
        };

        this.recognition.onerror = () => { 
            this.isStarted = false; 
            if (this.micBtn) this.micBtn.classList.remove('listening');
        };

        this.recognition.onend = () => {
            this.isStarted = false;
            if (this.isManual) {
                setTimeout(() => this.popup.classList.add('hidden'), 2000);
            }
            // Auto-restart delay (Slower on mobile for battery, faster on desktop)
            // DISABLED background restart on Mobile to stop the annoyance
            if (!this.isMobile) {
                const restartDelay = 5000;
                setTimeout(() => this.start(false), restartDelay);
            }
        };
    }

    process(text, isAssistant) {
        if (!text) return;
        this.isManual = true; 
        this.popup.classList.remove('hidden');

        if (!isAssistant) {
            // Search redirect
            setTimeout(() => {
                window.location.href = `index.html?search=${encodeURIComponent(text)}`;
            }, 1000);
            return;
        }

        // assistant command
        let url = null;
        for (const [u, keywords] of Object.entries(this.commands)) {
            if (keywords.some(k => text.includes(k))) {
                url = u;
                break;
            }
        }

        if (url) {
            this.transcriptEl.textContent = text;
            this.actionEl.textContent = "Opening...";
            this.speak("Opening...", () => { window.location.href = url; });
            setTimeout(() => { window.location.href = url; }, 2000);
        } else {
            this.speak(`Searching ${text}...`, () => {
                window.location.href = `index.html?search=${encodeURIComponent(text)}`;
            });
            setTimeout(() => { window.location.href = `index.html?search=${encodeURIComponent(text)}`; }, 2500);
        }
        this.isAssistant = false;
    }

    speak(t, onDone) {
        if (!this.synth) return onDone?.();
        this.synth.cancel();
        const u = new SpeechSynthesisUtterance(t);
        u.lang = 'hi-IN';
        u.onend = () => onDone?.();
        this.synth.speak(u);
        setTimeout(() => { if (onDone) onDone(); onDone = null; }, 3000);
    }

    showPopup(t, a) {
        this.popup.classList.remove('hidden');
        this.transcriptEl.textContent = t;
        this.actionEl.textContent = a;
    }
}

// Init
window.addEventListener('load', () => {
    window.soperaAssistant = new VoiceAssistant();
});
