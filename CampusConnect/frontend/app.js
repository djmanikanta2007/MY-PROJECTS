// ============================================================
// CAMPUSCONNECT AI — App Logic (Upgraded, Bug-Fixed)
// ============================================================

// DOM References
const statusPill     = document.getElementById('status-pill');
const statusDot      = document.getElementById('status-dot');
const statusText     = document.getElementById('status-text');
const chatMessages   = document.getElementById('chat-messages');
const orbContainer   = document.getElementById('orb-container');
const orbIcon        = document.getElementById('orb-icon');
const aiStatusLabel  = document.getElementById('ai-status-label');
const aiStatusSub    = document.getElementById('ai-status-sub');
const micBtn         = document.getElementById('mic-btn');
const micIcon        = document.getElementById('mic-icon');
const infoToggleBtn  = document.getElementById('info-toggle-btn');
const infoModal      = document.getElementById('info-modal');
const modalCloseBtn  = document.getElementById('modal-close-btn');
const chipsContainer = document.getElementById('chips-container');

// n8n Webhook URL — this sends text-based browser queries
const N8N_WEBHOOK_URL = 'https://veraa.app.n8n.cloud/webhook/twilio-voice';

// ============================================================
// STATE MANAGEMENT
// ============================================================
let aiState = 'idle'; // idle | listening | thinking | speaking

const STATE_CONFIG = {
    idle:      { label: 'READY',       sub: 'Press the microphone to ask a question',   orbIcon: 'record_voice_over', statusLabel: 'System Online', micIcon: 'mic'  },
    listening: { label: 'LISTENING',   sub: 'Speak clearly into your microphone...',     orbIcon: 'mic',               statusLabel: 'Listening...',   micIcon: 'stop' },
    thinking:  { label: 'PROCESSING',  sub: 'Analyzing your question...',                orbIcon: 'psychology',        statusLabel: 'Processing...',  micIcon: 'mic'  },
    speaking:  { label: 'RESPONDING',  sub: 'Click mic again when speech ends...',       orbIcon: 'volume_up',         statusLabel: 'Speaking...',    micIcon: 'mic'  },
};

function setAiState(newState) {
    aiState = newState;
    const cfg = STATE_CONFIG[newState];

    // Update orb
    orbContainer.className = `orb-container ${newState !== 'idle' ? newState : ''}`;
    orbIcon.textContent = cfg.orbIcon;

    // Update labels
    aiStatusLabel.textContent    = cfg.label;
    aiStatusLabel.className      = `ai-status-label ${newState !== 'idle' ? newState : ''}`;
    aiStatusSub.textContent      = cfg.sub;

    // Update header status pill
    statusText.textContent       = cfg.statusLabel;
    statusPill.className         = `status-pill ${newState !== 'idle' ? newState : ''}`;
    statusDot.className          = `status-dot ${newState !== 'idle' ? newState : ''}`;

    // Update mic button
    micIcon.textContent          = cfg.micIcon;
    micBtn.className             = `mic-btn ${newState === 'listening' ? 'listening' : ''}`;
}

// ============================================================
// SPEECH RECOGNITION — BUG FIXED (proper error handling)
// ============================================================

// Bug Fix 1: Safely check for SpeechRecognition support before calling new
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognitionAPI) {
    recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
} else {
    // Gracefully disable mic button if browser doesn't support it
    micBtn.disabled = true;
    aiStatusSub.textContent = '⚠️ Your browser does not support voice input. Try Chrome or Edge.';
}

// ============================================================
// SPEECH SYNTHESIS — BUG FIXED (correct voice selection)
// ============================================================
const synth = window.speechSynthesis;
let voices = [];

// Pre-load voices when they are available
if (synth) {
    const loadVoices = () => { voices = synth.getVoices(); };
    synth.onvoiceschanged = loadVoices;
    loadVoices(); // Also call immediately for browsers that load them synchronously
}

function speakText(text) {
    if (!synth) return;
    if (synth.speaking) synth.cancel();

    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.rate = 1.0;
    utterThis.pitch = 1.05;

    // Bug Fix 2: Proper voice selection — search by language, not by incorrect "Female" keyword
    const preferredVoice = voices.find(v =>
        v.lang.startsWith('en') && (
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Karen') ||
            v.name.includes('Moira') ||
            v.name.includes('Zira')
        )
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) utterThis.voice = preferredVoice;

    utterThis.onstart = () => setAiState('speaking');
    utterThis.onend   = () => setAiState('idle');
    utterThis.onerror = () => setAiState('idle');

    synth.speak(utterThis);
}

// ============================================================
// CHAT UI HELPERS
// ============================================================

function addMessage(text, sender) {
    // Remove any typing indicator first
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = `avatar ${sender === 'ai' ? 'ai-avatar' : 'user-avatar'}`;
    if (sender === 'ai') {
        avatarDiv.innerHTML = '<span class="material-icons-round">smart_toy</span>';
    } else {
        avatarDiv.textContent = '👤';
    }

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'bubble';
    bubbleDiv.textContent = text;

    msgDiv.appendChild(avatarDiv);
    msgDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'message ai typing-indicator';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
        <div class="avatar ai-avatar"><span class="material-icons-round">smart_toy</span></div>
        <div class="bubble">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ============================================================
// API CALL TO n8n
// ============================================================

async function askQuestion(userText) {
    addMessage(userText, 'user');
    setAiState('thinking');
    showTypingIndicator();

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ SpeechResult: userText })
        });

        const responseText = await response.text();
        let aiText = 'I could not connect to the knowledge base. Please check the n8n workflow.';

        try {
            const data = JSON.parse(responseText);
            if (data.answer)                         aiText = data.answer;
            else if (data.message?.content)          aiText = data.message.content;
            else if (typeof data === 'string')       aiText = data;
            else                                     aiText = JSON.stringify(data);
        } catch {
            // n8n returned TwiML XML (phone call format)
            if (responseText.includes('<Say')) {
                const match = responseText.match(/<Say[^>]*>([\s\S]*?)<\/Say>/);
                aiText = match ? match[1].trim() : 'Received a phone-format response. Please update n8n to return JSON.';
            } else {
                aiText = responseText.trim() || 'Empty response from server.';
            }
        }

        addMessage(aiText, 'ai');
        speakText(aiText);

    } catch (error) {
        console.error('Fetch error:', error);
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
        addMessage('⚠️ Could not reach the n8n server. Check your internet connection or webhook URL.', 'ai');
        setAiState('idle');
    }
}

// ============================================================
// MICROPHONE BUTTON
// ============================================================

micBtn.addEventListener('click', () => {
    if (!recognition) return;

    if (aiState === 'listening') {
        recognition.stop();
        setAiState('idle');
        return;
    }

    if (aiState !== 'idle') return;

    try {
        recognition.start();
        setAiState('listening');
    } catch (err) {
        console.error('Recognition start error:', err);
        setAiState('idle');
    }
});

if (recognition) {
    recognition.onresult = (event) => {
        const userText = event.results[0][0].transcript;
        setAiState('thinking');
        askQuestion(userText);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
        setAiState('idle');

        if (event.error === 'not-allowed') {
            addMessage('⚠️ Microphone access was denied. Please allow microphone access in your browser settings and try again.', 'ai');
        } else if (event.error === 'no-speech') {
            addMessage("I didn't hear anything. Please try again.", 'ai');
        }
    };

    recognition.onend = () => {
        if (aiState === 'listening') setAiState('idle');
    };
}

// ============================================================
// QUICK QUESTION CHIPS
// ============================================================

chipsContainer.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        if (aiState !== 'idle') return;
        const question = chip.dataset.question;
        if (question) askQuestion(question);
    });
});

// ============================================================
// INFO MODAL
// ============================================================

infoToggleBtn.addEventListener('click', () => {
    infoModal.classList.add('visible');
});

modalCloseBtn.addEventListener('click', () => {
    infoModal.classList.remove('visible');
});

infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) infoModal.classList.remove('visible');
});

// ============================================================
// HTML5 CANVAS PARTICLE ENGINE — BUG FIXED (division by zero)
// ============================================================

const canvas = document.getElementById('swarm-canvas');
const ctx    = canvas.getContext('2d');
let width, height;
let particles = [];
const mouse = { x: -9999, y: -9999 };

function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

class Particle {
    constructor() { this.reset(); }

    reset() {
        this.x       = Math.random() * width;
        this.y       = Math.random() * height;
        this.size    = Math.random() * 1.8 + 0.5;
        this.angle   = Math.random() * Math.PI * 2;
        this.speed   = Math.random() * 0.4 + 0.1;
        this.color   = Math.random() > 0.5 ? '#06b6d4' : '#8b5cf6';
        this.opacity = Math.random() * 0.6 + 0.2;
    }

    update() {
        const centerX = width  / 2;
        const centerY = height / 2;

        if (aiState === 'idle') {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120 && dist > 0) {
                this.x -= (dx / dist) * 2;
                this.y -= (dy / dist) * 2;
            }

            if (this.x < 0)      this.x = width;
            if (this.x > width)  this.x = 0;
            if (this.y < 0)      this.y = height;
            if (this.y > height) this.y = 0;

        } else if (aiState === 'listening') {
            const dx = centerX - this.x;
            const dy = centerY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            this.x += dist > 60 ? dx * 0.04 + Math.cos(this.angle) * 3 : Math.cos(this.angle += 0.08) * 60;
            this.y += dist > 60 ? dy * 0.04 + Math.sin(this.angle) * 3 : Math.sin(this.angle)           * 60;
            this.color = '#06b6d4';

        } else if (aiState === 'thinking') {
            const dx = centerX - this.x;
            const dy = centerY - this.y;
            this.x += dx * 0.07;
            this.y += dy * 0.07;
            this.angle += 0.15;
            this.x += Math.cos(this.angle) * 6;
            this.y += Math.sin(this.angle) * 6;
            this.color = '#ec4899';

        } else if (aiState === 'speaking') {
            const dx   = this.x - centerX;
            const dy   = this.y - centerY;
            // Bug Fix: Guard against division by zero when dist === 0
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                const pulse = Math.sin(Date.now() / 180) * 4;
                this.x += (dx / dist) * pulse + (Math.random() - 0.5) * 1.5;
                this.y += (dy / dist) * pulse + (Math.random() - 0.5) * 1.5;
                if (dist > 280) {
                    this.x -= dx * 0.015;
                    this.y -= dy * 0.015;
                }
            }
            this.color = Math.random() > 0.5 ? '#8b5cf6' : '#10b981';
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = this.color;
        ctx.fillStyle   = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Init particles
for (let i = 0; i < 350; i++) particles.push(new Particle());

// Animation loop
function animate() {
    ctx.fillStyle = 'rgba(5, 8, 16, 0.2)';
    ctx.fillRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
}

animate();
