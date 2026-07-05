const statusText = document.getElementById('ai-status');
const interactionHint = document.getElementById('interaction-hint');
const transcriptContainer = document.getElementById('chat-transcript');
const referenceContent = document.getElementById('reference-content');

// ⚠️ REPLACE THIS WITH YOUR n8n WEBHOOK URL 
const N8N_WEBHOOK_URL = 'https://veraa.app.n8n.cloud/webhook/twilio-voice';

// --- AI STATE MANAGEMENT ---
let aiState = 'idle'; // idle, listening, thinking, speaking

function setAiState(state, message) {
    aiState = state;
    if (message) {
        statusText.innerText = message;
    }
}

// --- SPEECH RECOGNITION & SYNTHESIS ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

const synth = window.speechSynthesis;
window.speechSynthesis.onvoiceschanged = () => synth.getVoices();

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
    transcriptContainer.appendChild(msgDiv);
    transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
}

function updateReferences(referencesText) {
    if (!referencesText) return;
    if (referenceContent.querySelector('.empty-state')) {
        referenceContent.innerHTML = '';
    }
    const refCard = document.createElement('div');
    refCard.className = 'reference-card';
    refCard.innerHTML = `
        <h3><span class="material-icons">data_object</span> Source Matrix</h3>
        <p>${referencesText}</p>
    `;
    referenceContent.insertBefore(refCard, referenceContent.firstChild);
}

// Click anywhere on canvas to start
document.addEventListener('click', (e) => {
    // Ignore clicks on drawers
    if (e.target.closest('.drawer')) return;
    
    if (aiState === 'idle') {
        try {
            interactionHint.style.opacity = '0';
            recognition.start();
            setAiState('listening', 'LISTENING...');
        } catch (err) {
            console.error(err);
        }
    }
});

recognition.onresult = async (event) => {
    const userText = event.results[0][0].transcript;
    addMessage(userText, 'user');
    setAiState('thinking', 'PROCESSING...');

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ SpeechResult: userText })
        });

        const responseText = await response.text();
        let data;
        let aiText = "Connection lost.";
        let reference = null;

        try {
            data = JSON.parse(responseText);
            if (data.answer) {
                aiText = data.answer;
                reference = data.reference;
            } else if (data.message && data.message.content) {
                aiText = data.message.content; 
            } else if (typeof data === 'string') {
                 aiText = data;
            } else {
                 aiText = JSON.stringify(data);
            }
        } catch (e) {
            console.warn("n8n did not return JSON");
            if (responseText.includes('<Say')) {
                const match = responseText.match(/<Say[^>]*>([\s\S]*?)<\/Say>/);
                aiText = match ? match[1] : "Update n8n to JSON format.";
            }
        }

        addMessage(aiText, 'ai');
        if (reference) updateReferences(reference);
        speakText(aiText);

    } catch (error) {
        setAiState('idle', 'SYSTEM ERROR');
        addMessage("n8n connection failed.", 'ai');
    }
};

recognition.onerror = () => {
    setAiState('idle', 'AWAKEN SYSTEM');
    interactionHint.style.opacity = '1';
};

function speakText(text) {
    if (synth.speaking) synth.cancel();
    const utterThis = new SpeechSynthesisUtterance(text);
    
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
    if (preferredVoice) utterThis.voice = preferredVoice;

    utterThis.onstart = () => {
        setAiState('speaking', 'TRANSMITTING...');
        interactionHint.style.opacity = '1';
    };
    utterThis.onend = () => {
        setAiState('idle', 'AWAKEN SYSTEM');
        interactionHint.style.opacity = '1';
    };
    utterThis.onerror = () => {
        setAiState('idle', 'AWAKEN SYSTEM');
        interactionHint.style.opacity = '1';
    };

    synth.speak(utterThis);
}

// --- HTML5 CANVAS PARTICLE ENGINE ---

const canvas = document.getElementById('swarm-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
const mouse = { x: -1000, y: -1000 };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 2 + 0.5;
        this.color = Math.random() > 0.5 ? '#06b6d4' : '#8b5cf6';
    }

    update() {
        const centerX = width / 2;
        const centerY = height / 2;

        if (aiState === 'idle') {
            // Float around, slight repel from mouse
            this.x += Math.cos(this.angle) * (this.speed * 0.2);
            this.y += Math.sin(this.angle) * (this.speed * 0.2);
            
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
                this.x -= dx / 20;
                this.y -= dy / 20;
            }
            
            // Wrap edges
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;

        } else if (aiState === 'listening') {
            // Swirl into a vortex at center
            let dx = centerX - this.x;
            let dy = centerY - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 50) {
                this.x += dx * 0.05 + Math.cos(this.angle) * 5;
                this.y += dy * 0.05 + Math.sin(this.angle) * 5;
            } else {
                this.angle += 0.1;
                this.x = centerX + Math.cos(this.angle) * 50;
                this.y = centerY + Math.sin(this.angle) * 50;
            }
            this.color = '#06b6d4'; // Cyan listening

        } else if (aiState === 'thinking') {
            // Tight fast purple vortex
            let dx = centerX - this.x;
            let dy = centerY - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 30) {
                this.x += dx * 0.1;
                this.y += dy * 0.1;
            }
            this.angle += 0.2;
            this.x += Math.cos(this.angle) * 10;
            this.y += Math.sin(this.angle) * 10;
            this.color = '#ec4899'; // Pink thinking

        } else if (aiState === 'speaking') {
            // Pulse outward and drift back (like a sound wave)
            let dx = this.x - centerX;
            let dy = this.y - centerY;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            // Pulse effect simulated by moving outward slightly then drifting
            let pulseForce = Math.sin(Date.now() / 200) * 5;
            
            this.x += (dx / dist) * pulseForce + (Math.random() - 0.5) * 2;
            this.y += (dy / dist) * pulseForce + (Math.random() - 0.5) * 2;
            
            // Gently pull back if too far
            if (dist > 300) {
                this.x -= dx * 0.01;
                this.y -= dy * 0.01;
            }
            
            this.color = Math.random() > 0.5 ? '#8b5cf6' : '#10b981'; // Purple/Green speaking
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        // Add glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
}

// Init particles
for (let i = 0; i < 400; i++) {
    particles.push(new Particle());
}

// Animation Loop
function animate() {
    // Semi-transparent black to create trailing effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animate);
}

animate();
