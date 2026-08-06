let canvas, ctx;
let mouseX = 0, mouseY = 0;
let lerpX = 0, lerpY = 0; 


const NUM_STARS = window.innerWidth <= 768 ? 250 : 350; 
let stars = [];
const maxDepth = 1000;
const speed = 1.8; 


let audioCtx = null;
let volumeNode = null; 
let delayNode = null;       
let delayFeedback = null;   
let gristleLFO = null;     
let gristleGain = null;    
let gristleShaper = null;  
let airFilter = null;      
let airNodes = [];         
let isAudioInitialized = false;
let isMuted = false;
let isTextVisible = true;

function initStars() {
    stars = [];
    for (let i = 0; i < NUM_STARS; i++) {
        stars.push({
            x: (Math.random() - 0.5) * 4500,
            y: (Math.random() - 0.5) * 4500,
            z: Math.random() * maxDepth,
            shimmerOffset: Math.random() * Math.PI * 2
        });
    }
}

function handleMove(clientX, clientY) {
    if (!canvas) return;
    mouseX = (clientX - window.innerWidth / 2) * 0.15;
    mouseY = (clientY - window.innerHeight / 2) * 0.15;
}

window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: true });
function init() {
    canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const audioBtn = document.getElementById('audio-start-btn');
    if (audioBtn) {

        audioBtn.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            toggleAudioState();
        }, { passive: false });
        
        audioBtn.addEventListener('click', (e) => {
            toggleAudioState();
        });
    }


    window.addEventListener('touchstart', (e) => {
        if (!e.target.closest('#overlay-text')) {
            toggleTextVisibility();
        }
    }, { passive: true });

    window.addEventListener('click', (e) => {
        if (!e.target.closest('#overlay-text')) {
            toggleTextVisibility();
        }
    });

    animate();
    startTerminalScript();
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}
function animate() {
    requestAnimationFrame(animate);
    if (!ctx || !canvas) return;

    lerpX += (mouseX - lerpX) * 0.04;
    lerpY += (mouseY - lerpY) * 0.04;

    ctx.fillStyle = '#0c1013';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.004;

    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        star.z -= speed;

        if (star.z <= 0) {
            star.x = (Math.random() - 0.5) * 4500;
            star.y = (Math.random() - 0.5) * 4500;
            star.z = maxDepth;
            continue;
        }

        const k = 150 / star.z;
        const screenX = star.x * k + centerX + lerpX;
        const screenY = star.y * k + centerY + lerpY;

        if (screenX < -600 || screenX >= canvas.width + 600 || screenY < -600 || screenY >= canvas.height + 600) {
            star.z = maxDepth;
            continue;
        }

        const baseBrightness = (1 - star.z / maxDepth);
        const shimmer = 0.6 + Math.sin(time + star.shimmerOffset) * 0.4;
        const finalBrightness = Math.min(1, Math.max(0.1, baseBrightness * shimmer));
        const colorVal = Math.floor(finalBrightness * 255);


        const isMobile = window.innerWidth <= 768;
        const size = (1 - star.z / maxDepth) * (isMobile ? 3.5 : 2.5) + (isMobile ? 1.0 : 0.5);

        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${colorVal}, ${colorVal}, ${colorVal})`;
        ctx.fill();
    }
}

function startTerminalScript() {
    const linesContainer = document.getElementById('terminal-lines');
    if (!linesContainer) return;

    const overlay = document.getElementById('overlay-text');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('visible');
    }

    const lines = [
        "CONNECTION ESTABLISHED // 25-03",
        "Reading encrypted channel data...",
        "Hi. I'm glad this paper letter\ncrossed the ocean and is now in your hands.",
        "It's amazing how two similar universes\nfrom opposite sides of the Earth could touch in this vast network.",
        "In moments like these, distance completely loses its meaning.",
        "Thank you for this time, for our conversations, and for every movie we watched together.",
        "It was truly valuable.\nThis page will remain here in the digital space.",
        "A warm reminder that our trajectories\nonce crossed on the same path.",
        "Same Path."
    ];


    linesContainer.innerHTML = ""; 
    let currentLineIdx = 0;

    function printLine() {
        if (currentLineIdx >= lines.length) {
            const linkElement = document.createElement('div');
            linkElement.style.marginTop = "20px";
            linkElement.style.fontSize = "11px";
            linkElement.style.fontWeight = "bold";
            linkElement.style.letterSpacing = "1.5px";
            linkElement.innerHTML = ``;
            linesContainer.appendChild(linkElement);
            return;
        }

        const lineData = lines[currentLineIdx];
        const lineElement = document.createElement('div');
        
        if (currentLineIdx === 0) {
            lineElement.style.fontWeight = "bold";
            lineElement.style.marginBottom = "15px";
            lineElement.style.borderBottom = "1px solid rgba(255,255,255,0.2)";
            lineElement.style.paddingBottom = "5px";
        } else {
            lineElement.style.fontSize = "12px";
            lineElement.style.marginTop = "8px";
            lineElement.style.color = "rgba(255,255,255,0.8)";
            lineElement.style.whiteSpace = "pre-line"; 
        }

        linesContainer.appendChild(lineElement);
        
        let charIdx = 0;
        function typeChar() {
            if (charIdx < lineData.length) {
                lineElement.innerHTML += lineData[charIdx];
                charIdx++;
                setTimeout(typeChar, 35); 
            } else {
                currentLineIdx++;
                setTimeout(printLine, 1200); 
            }
        }
        typeChar();
    }

    setTimeout(printLine, 1500);
}

function toggleTextVisibility() {
    const overlay = document.getElementById('overlay-text');
    if (!overlay) return;

    if (isTextVisible) {
        overlay.classList.remove('visible');
        overlay.classList.add('hidden');
        isTextVisible = false;
    } else {
        overlay.classList.remove('hidden');
        overlay.classList.add('visible');
        isTextVisible = true;
    }
}

function makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 0;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
}
function toggleAudioState() {
    const audioBtn = document.getElementById('audio-start-btn');
    
    if (!isAudioInitialized) {
        initGenerativeAudio();
        if (audioBtn) {
            audioBtn.innerHTML = "DISCONNECT AUDIO";
            audioBtn.classList.remove('muted');
        }
        return;
    }

    if (audioCtx) {
        if (isMuted) {
            audioCtx.resume().then(() => {
                isMuted = false;
                if (audioBtn) {
                    audioBtn.innerHTML = "DISCONNECT AUDIO";
                    audioBtn.classList.remove('muted');
                }
            });
        } else {
            audioCtx.suspend().then(() => {
                isMuted = true;
                if (audioBtn) {
                    audioBtn.innerHTML = "CONNECT AUDIO";
                    audioBtn.classList.add('muted');
                }
            });
        }
    }
}

function initGenerativeAudio() {
    if (isAudioInitialized) return;
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        
        volumeNode = audioCtx.createGain();
        volumeNode.gain.setValueAtTime(0, audioCtx.currentTime);
        volumeNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 4.0); 
        volumeNode.connect(audioCtx.destination);

        const bassFilter = audioCtx.createBiquadFilter();
        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(90, audioCtx.currentTime); 
        bassFilter.connect(volumeNode);

        airFilter = audioCtx.createBiquadFilter();
        airFilter.type = 'bandpass';
        airFilter.frequency.setValueAtTime(1400, audioCtx.currentTime);
        airFilter.Q.setValueAtTime(0.8, audioCtx.currentTime);

        gristleGain = audioCtx.createGain();
        gristleGain.gain.setValueAtTime(1.0, audioCtx.currentTime);

        gristleLFO = audioCtx.createOscillator();
        gristleLFO.type = 'square'; 
        gristleLFO.frequency.setValueAtTime(1.5, audioCtx.currentTime); 

        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(0.5, audioCtx.currentTime); 

        gristleLFO.connect(lfoGain);
        lfoGain.connect(gristleGain.gain); 
        gristleLFO.start(0);

        gristleShaper = audioCtx.createWaveShaper();
        gristleShaper.curve = makeDistortionCurve(10); 
        gristleShaper.oversample = '4x';

        delayNode = audioCtx.createDelay(2.0); 
        delayNode.delayTime.setValueAtTime(0.6, audioCtx.currentTime); 

        delayFeedback = audioCtx.createGain();
        delayFeedback.gain.setValueAtTime(0.45, audioCtx.currentTime); 

        airFilter.connect(gristleGain);
        gristleGain.connect(gristleShaper);
        gristleShaper.connect(delayNode);
        delayNode.connect(delayFeedback);
        delayFeedback.connect(delayNode);

        gristleShaper.connect(volumeNode);
        delayNode.connect(volumeNode);

        const vSlider = document.getElementById('volume-slider');
        if (vSlider) {
            vSlider.addEventListener('input', (e) => {
                if (!volumeNode || isMuted) return;
                const val = parseFloat(e.target.value) / 100;
                volumeNode.gain.setTargetAtTime(val * 0.25, audioCtx.currentTime, 0.03);
            });
        }

        const rSlider = document.getElementById('reverb-slider');
        if (rSlider) {
            rSlider.addEventListener('input', (e) => {
                if (!delayFeedback) return;
                const val = parseFloat(e.target.value) / 100; 
                delayFeedback.gain.setTargetAtTime(val, audioCtx.currentTime, 0.03);
            });
        }

        const dSlider = document.getElementById('delay-slider');
        if (dSlider) {
            dSlider.addEventListener('input', (e) => {
                if (!delayNode) return;
                const val = parseFloat(e.target.value) / 100; 
                delayNode.delayTime.setTargetAtTime(val, audioCtx.currentTime, 0.08);
            });
        }

        const gSlider = document.getElementById('gristle-slider');
        if (gSlider) {
            gSlider.addEventListener('input', (e) => {
                if (!gristleLFO || !gristleShaper) return;
                const normVal = parseFloat(e.target.value) / 100;
                gristleLFO.frequency.setTargetAtTime(0.2 + (normVal * normVal * 34.8), audioCtx.currentTime, 0.04);
                gristleShaper.curve = makeDistortionCurve(normVal * 180);
            });
        }

        const sSlider = document.getElementById('shift-slider');
        if (sSlider) {
            sSlider.addEventListener('input', (e) => {
                if (!airFilter || airNodes.length === 0) return;
                const normVal = parseFloat(e.target.value) / 100;
                airFilter.frequency.setTargetAtTime(400 + (normVal * 2800), audioCtx.currentTime, 0.05);
                const pitchFactor = 0.4 + (normVal * 1.6);
                const baseFreqs = [440.00, 523.25, 659.25, 880.00];
                airNodes.forEach((osc, idx) => {
                    if (osc) osc.frequency.setTargetAtTime(baseFreqs[idx] * pitchFactor, audioCtx.currentTime, 0.08);
                });
            });
        }

        function createBassTone(freq, volume) {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = 'sine'; 
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(volume * 0.05, audioCtx.currentTime); 
            osc.connect(gainNode);
            gainNode.connect(bassFilter);
            osc.start(0);
        }

        function createAirSpaceNode(freq, speedFactor) {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            
            osc.connect(gainNode);
            gainNode.connect(airFilter);
            osc.start(0);
            
            airNodes.push(osc); 

            function flow() {
                if (!audioCtx) return;
                const nextTime = audioCtx.currentTime + 6 + Math.random() * 5;
                const targetVol = 0.015 + Math.random() * 0.035; 
                gainNode.gain.linearRampToValueAtTime(targetVol, nextTime);
                
                setTimeout(() => {
                    if (!audioCtx) return;
                    gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 4);
                    setTimeout(flow, 4500 * speedFactor);
                }, 5000);
            }
            flow();
        }

        createBassTone(55.0, 0.2);
        createBassTone(82.4, 0.15);
        createAirSpaceNode(440.00, 1.0);  
        createAirSpaceNode(523.25, 1.2);  
        createAirSpaceNode(659.25, 0.8);  
        createAirSpaceNode(880.00, 1.4);  

        function breathe() {
            if (audioCtx && airFilter) {
                const sSliderCheck = document.getElementById('shift-slider');
                if (sSliderCheck && parseFloat(sSliderCheck.value) === 50) {
                    airFilter.frequency.exponentialRampToValueAtTime(1100 + Math.random() * 600, audioCtx.currentTime + 5);
                }
                setTimeout(breathe, 8000);
            }
        }
        breathe();

        isAudioInitialized = true;
        audioCtx.resume(); 
    } catch (e) {
        console.error(e);
    }
}

init();
