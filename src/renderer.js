const robotContainer = document.getElementById('robot-container');
const robot = document.getElementById('robot');
const chatUI = document.getElementById('chat-ui');
const closeChatBtn = document.getElementById('close-chat');

const settingsUI = document.getElementById('settings-ui');
const openSettingsBtn = document.getElementById('open-settings');
const closeSettingsBtn = document.getElementById('close-settings');
const saveSettingsBtn = document.getElementById('save-settings');

const chatInput = document.getElementById('chat-input');
const sendMsgBtn = document.getElementById('send-msg');
const chatMessages = document.getElementById('chat-messages');
const thinkingIndicator = document.getElementById('thinking-indicator');
const robotImg = document.getElementById('robot-img');
const flexWrapper = document.getElementById('flex-wrapper');
const rocketFires = document.querySelectorAll('.rocket-fire');

let isChatOpen = false;
let isSettingsOpen = false;

// Coordinates logic
let posX = 100;
let posY = 100;

// Configs
let openclawUrl = localStorage.getItem('openclawUrl') || 'http://localhost:8000/v1/chat/completions';
let openclawKey = localStorage.getItem('openclawKey') || '';
let currentAvatar = localStorage.getItem('currentAvatar') || './assets/rocket.png';

let customFireConfigs = JSON.parse(localStorage.getItem('customFireConfigs')) || {};

const getAvatarConfig = (avatarPath) => {
    const defaults = {
        './assets/rocket.png': { x: 50, y: 25, angle: 0, autoRotate: true, baseAngle: 0, color: 'linear-gradient(to bottom, #ffcc00, #ff3300, transparent)' },
        './assets/astronaut.png': { x: 30, y: 30, angle: 20, autoRotate: false, baseAngle: 0, color: 'linear-gradient(to bottom, #66d9ff, #0055ff, transparent)' }
    };
    
    const base = defaults[avatarPath] || { x: 50, y: 25, angle: 0, autoRotate: true, baseAngle: 0, color: 'linear-gradient(to bottom, #ffcc00, #ff3300, transparent)' };
    const custom = customFireConfigs[avatarPath] || {};
    return { ...base, ...custom };
};

const applyAvatarConfig = (avatarPath) => {
    const config = getAvatarConfig(avatarPath);
    
    rocketFires.forEach(fire => {
        fire.style.display = 'block';
        fire.style.setProperty('--fire-left', `${config.x}%`);
        fire.style.setProperty('--fire-bottom-idle', `${config.y}px`);
        fire.style.setProperty('--fire-bottom-flying', `${config.y - 40}px`);
        fire.style.setProperty('--fire-transform', `translateX(-50%) rotate(${config.angle}deg)`);
        fire.style.setProperty('--fire-color', config.color);
    });
    
    // Update UI Sliders
    const fireX = document.getElementById('fire-x');
    const fireY = document.getElementById('fire-y');
    const fireAngle = document.getElementById('fire-angle');
    const autoRotateEl = document.getElementById('auto-rotate');
    const baseAngleEl = document.getElementById('base-angle');
    
    if (fireX) fireX.value = config.x;
    if (fireY) fireY.value = config.y;
    if (fireAngle) fireAngle.value = config.angle;
    if (autoRotateEl) autoRotateEl.checked = config.autoRotate !== false;
    if (baseAngleEl) baseAngleEl.value = config.baseAngle || 0;
    
    const valX = document.getElementById('val-x');
    const valY = document.getElementById('val-y');
    const valAngle = document.getElementById('val-angle');
    const valBaseAngle = document.getElementById('val-base-angle');
    const anglePreviewArrow = document.getElementById('angle-preview-arrow');
    const anglePreviewImg = document.getElementById('angle-preview-img');
    
    if (valX) valX.textContent = `${config.x}%`;
    if (valY) valY.textContent = `${config.y}px`;
    if (valAngle) valAngle.textContent = `${config.angle}°`;
    if (valBaseAngle) valBaseAngle.textContent = `${config.baseAngle || 0}°`;
    if (anglePreviewArrow) anglePreviewArrow.style.transform = `rotate(${config.baseAngle || 0}deg)`;
    if (anglePreviewImg) anglePreviewImg.src = avatarPath;
};

// Handle slider updates
const updateCustomConfig = () => {
    const x = parseInt(document.getElementById('fire-x').value);
    const y = parseInt(document.getElementById('fire-y').value);
    const angle = parseInt(document.getElementById('fire-angle').value);
    const autoRotate = document.getElementById('auto-rotate').checked;
    const baseAngle = parseInt(document.getElementById('base-angle').value);
    
    document.getElementById('val-x').textContent = `${x}%`;
    document.getElementById('val-y').textContent = `${y}px`;
    document.getElementById('val-angle').textContent = `${angle}°`;
    document.getElementById('val-base-angle').textContent = `${baseAngle}°`;
    
    const anglePreviewArrow = document.getElementById('angle-preview-arrow');
    if (anglePreviewArrow) anglePreviewArrow.style.transform = `rotate(${baseAngle}deg)`;
    
    // Quick preview update directly to CSS
    rocketFires.forEach(fire => {
        fire.style.setProperty('--fire-left', `${x}%`);
        fire.style.setProperty('--fire-bottom-idle', `${y}px`);
        fire.style.setProperty('--fire-bottom-flying', `${y - 40}px`);
        fire.style.setProperty('--fire-transform', `translateX(-50%) rotate(${angle}deg)`);
    });
    
    // Save
    customFireConfigs[currentAvatar] = { x, y, angle, autoRotate, baseAngle };
    localStorage.setItem('customFireConfigs', JSON.stringify(customFireConfigs));
};

document.getElementById('fire-x').addEventListener('input', updateCustomConfig);
document.getElementById('fire-y').addEventListener('input', updateCustomConfig);
document.getElementById('fire-angle').addEventListener('input', updateCustomConfig);
document.getElementById('auto-rotate').addEventListener('change', updateCustomConfig);
document.getElementById('base-angle').addEventListener('input', updateCustomConfig);

// Initialize
document.getElementById('api-url').value = openclawUrl;
document.getElementById('api-key').value = openclawKey;
robotImg.src = currentAvatar;
applyAvatarConfig(currentAvatar);

// Highlight selected avatar
document.querySelectorAll('.avatar-select').forEach(btn => {
  if (btn.dataset.src === currentAvatar) btn.classList.add('border-blue-500');
  
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.avatar-select').forEach(b => b.classList.remove('border-blue-500'));
    e.currentTarget.classList.add('border-blue-500');
    currentAvatar = e.currentTarget.dataset.src;
  });
});

// Settings Logic
openSettingsBtn.addEventListener('click', () => {
  if (isSettingsOpen) return;
  settingsUI.classList.remove('hidden');
  
  const chatRect = chatUI.getBoundingClientRect();
  let setX = chatRect.left - 340;
  if (setX < 20) setX = chatRect.right + 20;
  let setY = chatRect.top;
  
  settingsUI.style.left = `${setX}px`;
  settingsUI.style.top = `${setY}px`;

  setTimeout(() => {
    settingsUI.classList.remove('opacity-0');
    settingsUI.classList.add('opacity-100');
  }, 10);
  isSettingsOpen = true;
});

const closeSettings = () => {
  settingsUI.classList.remove('opacity-100');
  settingsUI.classList.add('opacity-0');
  setTimeout(() => {
    settingsUI.classList.add('hidden');
    isSettingsOpen = false;
  }, 300);
};

closeSettingsBtn.addEventListener('click', closeSettings);

saveSettingsBtn.addEventListener('click', () => {
  openclawUrl = document.getElementById('api-url').value;
  openclawKey = document.getElementById('api-key').value;
  
  localStorage.setItem('openclawUrl', openclawUrl);
  localStorage.setItem('openclawKey', openclawKey);
  localStorage.setItem('currentAvatar', currentAvatar);
  
  robotImg.src = currentAvatar;
  applyAvatarConfig(currentAvatar);
  closeSettings();
});

// Gateway Command Logic
const handleGatewayCmd = async (action) => {
    const statusEl = document.getElementById('cmd-status');
    statusEl.textContent = `Executing: openclaw gateway ${action}...`;
    statusEl.classList.remove('hidden', 'text-red-400', 'text-green-400');
    statusEl.classList.add('text-white/50');
    
    try {
        const res = await window.electronAPI.runOpenclawCmd(action);
        if (res.success) {
            statusEl.textContent = `Success: ${action} command completed`;
            statusEl.classList.remove('text-white/50');
            statusEl.classList.add('text-green-400');
        } else {
            statusEl.textContent = `Error: ${res.error}`;
            statusEl.classList.remove('text-white/50');
            statusEl.classList.add('text-red-400');
        }
    } catch (e) {
        statusEl.textContent = `Error: IPC failed`;
        statusEl.classList.remove('text-white/50');
        statusEl.classList.add('text-red-400');
    }
};

document.getElementById('cmd-start').addEventListener('click', () => handleGatewayCmd('start'));
document.getElementById('cmd-restart').addEventListener('click', () => handleGatewayCmd('restart'));
document.getElementById('cmd-stop').addEventListener('click', () => handleGatewayCmd('stop'));

// Handle mouse events for click-through
const interactiveElements = [robot, chatUI, settingsUI];

// Settings Tab Logic
document.querySelectorAll('.settings-tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Reset tabs
    document.querySelectorAll('.settings-tab-btn').forEach(b => {
      b.classList.remove('text-white', 'border-blue-500');
      b.classList.add('text-white/50', 'border-transparent');
    });
    // Active tab
    e.target.classList.remove('text-white/50', 'border-transparent');
    e.target.classList.add('text-white', 'border-blue-500');
    
    // Hide contents
    document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(e.target.dataset.tab).classList.remove('hidden');
  });
});

interactiveElements.forEach(el => {
  el.addEventListener('mouseenter', () => {
    window.electronAPI.setIgnoreMouseEvents(false);
  });
  el.addEventListener('mouseleave', () => {
    window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
  });
});

const updateChatPosition = () => {
    if (!isChatOpen) return;
    const robotWidth = robotContainer.offsetWidth;
    const chatWidth = 350;
    const chatHeight = 450;
    
    let chatX = posX + robotWidth + 20; 
    let chatY = posY - 50;
    
    if (chatX + chatWidth > window.innerWidth) chatX = posX - chatWidth - 20;
    if (chatX < 20) chatX = 20;
    if (chatY + chatHeight > window.innerHeight) chatY = window.innerHeight - chatHeight - 20;
    if (chatY < 20) chatY = 20;

    chatUI.style.left = `${chatX}px`;
    chatUI.style.top = `${chatY}px`;
    
    if (isSettingsOpen) {
        let setX = chatX - 340;
        if (setX < 20) setX = chatX + chatWidth + 20;
        settingsUI.style.left = `${setX}px`;
        settingsUI.style.top = `${chatY}px`;
    }
};

// Toggle Chat UI
robot.addEventListener('click', () => {
  if (isChatOpen) return;
  
  chatUI.classList.remove('hidden');
  updateChatPosition();
  
  setTimeout(() => {
    chatUI.classList.remove('opacity-0');
    chatUI.classList.add('opacity-100');
  }, 10);
  
  isChatOpen = true;
  isRoaming = false;
  window.electronAPI.setIgnoreMouseEvents(false);
});

closeChatBtn.addEventListener('click', () => {
  chatUI.classList.remove('opacity-100');
  chatUI.classList.add('opacity-0');
  if (isSettingsOpen) closeSettings();
  
  setTimeout(() => {
    chatUI.classList.add('hidden');
    isChatOpen = false;
    window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    
    // Resume roaming after closing chat
    setTimeout(() => {
        if (!isDragging && !isChatOpen) {
            pickNewTarget();
            isRoaming = true;
        }
    }, 2000);
  }, 300);
});

// Chat Logic
const addMessage = (text, isUser = false) => {
  const wrapper = document.createElement('div');
  wrapper.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
  
  const bubble = document.createElement('div');
  bubble.className = `text-sm px-4 py-2 rounded-2xl max-w-[85%] leading-relaxed ${
    isUser 
    ? 'bg-blue-600 text-white rounded-tr-sm shadow-[0_0_10px_rgba(37,99,235,0.5)]' 
    : 'glass bg-white/10 text-white rounded-tl-sm'
  }`;
  bubble.textContent = text;
  
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const handleSend = async () => {
  const text = chatInput.value.trim();
  if (!text) return;
  
  addMessage(text, true);
  chatInput.value = '';
  thinkingIndicator.classList.remove('hidden');
  
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (openclawKey) headers['Authorization'] = `Bearer ${openclawKey}`;
    
    const res = await fetch(openclawUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: "openclaw",
        messages: [{ role: "user", content: text }]
      })
    });
    
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || data.response || "I didn't understand that.";
    
    thinkingIndicator.classList.add('hidden');
    addMessage(reply, false);
    
  } catch (error) {
    thinkingIndicator.classList.add('hidden');
    addMessage(`Error connecting to Openclaw: ${error.message}`, false);
  }
};

sendMsgBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});


// Dragging & Roaming Logic
let isDragging = false;
let initialX;
let initialY;

// Roaming state
let isRoaming = false;
let currentTilt = 0; 
let currentScaleX = 1;
let targetX = 100;
let targetY = 100;
let vx = 0;
let vy = 0;
let physicsTime = 0; 

robot.addEventListener('mousedown', dragStart);
window.addEventListener('mouseup', dragEnd);
window.addEventListener('mousemove', drag);

function dragStart(e) {
  if (e.target === robot || robot.contains(e.target)) {
    initialX = e.clientX - posX;
    initialY = e.clientY - posY;
    isDragging = true;
    isRoaming = false;
    robot.classList.remove('animate-bounce');
  }
}

function dragEnd(e) {
  if (isDragging) {
    isDragging = false;
    robot.classList.add('animate-bounce');
    
    setTimeout(() => {
        if (!isDragging && !isChatOpen) {
            pickNewTarget();
            isRoaming = true;
        }
    }, 5000);
  }
}

function drag(e) {
  if (isDragging) {
    e.preventDefault();
    posX = e.clientX - initialX;
    posY = e.clientY - initialY;

    const robotWidth = robotContainer.offsetWidth;
    const robotHeight = robotContainer.offsetHeight;

    if (posX < 0) posX = 0;
    if (posY < 0) posY = 0;
    if (posX + robotWidth > window.innerWidth) posX = window.innerWidth - robotWidth;
    if (posY + robotHeight > window.innerHeight) posY = window.innerHeight - robotHeight;

    robotContainer.style.left = `${posX}px`;
    robotContainer.style.top = `${posY}px`;
    
    if (isChatOpen) {
        updateChatPosition();
    }
  }
}

const getCorners = () => {
    const pad = 80;
    const w = window.innerWidth - robotContainer.offsetWidth - pad;
    const h = window.innerHeight - robotContainer.offsetHeight - pad;
    return [
        { x: pad, y: pad }, 
        { x: w, y: pad }, 
        { x: pad, y: h }, 
        { x: w, y: h } 
    ];
};

const pickNewTarget = () => {
    if (Math.random() > 0.2) {
        // 80% chance to go to a corner
        const corners = getCorners();
        const corner = corners[Math.floor(Math.random() * corners.length)];
        targetX = corner.x + (Math.random() * 100 - 50);
        targetY = corner.y + (Math.random() * 100 - 50);
    } else {
        // 20% chance to roam randomly
        targetX = Math.random() * (window.innerWidth - robotContainer.offsetWidth);
        targetY = Math.random() * (window.innerHeight - robotContainer.offsetHeight);
    }
    
    if (targetX < 0) targetX = 0;
    if (targetY < 0) targetY = 0;
    if (targetX > window.innerWidth - robotContainer.offsetWidth) targetX = window.innerWidth - robotContainer.offsetWidth;
    if (targetY > window.innerHeight - robotContainer.offsetHeight) targetY = window.innerHeight - robotContainer.offsetHeight;
};

const updateLoop = () => {
    if (!isDragging && !isChatOpen && isRoaming) {
        physicsTime += 0.05;
        const dx = targetX - posX;
        const dy = targetY - posY;
        const dist = Math.hypot(dx, dy);

        // Physics acceleration
        let ax = dx * 0.001;
        let ay = dy * 0.001;
        
        // Add organic curving (swoop)
        if (dist > 50) {
            const perpX = -dy / dist;
            const perpY = dx / dist;
            ax += perpX * Math.sin(physicsTime) * 0.3;
            ay += perpY * Math.sin(physicsTime) * 0.3;
        }

        vx += ax;
        vy += ay;
        
        // Friction
        vx *= 0.95;
        vy *= 0.95;

        posX += vx;
        posY += vy;
        
        robotContainer.style.left = `${posX}px`;
        robotContainer.style.top = `${posY}px`;

        const speedHypot = Math.hypot(vx, vy);
        const config = getAvatarConfig(currentAvatar);

        // Rotation Logic
        if (config.autoRotate && speedHypot > 0.5) {
            let pathAngle = Math.atan2(vy, vx) * (180 / Math.PI);
            let targetRotation = pathAngle - (config.baseAngle || 0);
            
            // Normalize angle difference for smooth shortest-path lerping
            let diff = targetRotation - currentTilt;
            while (diff < -180) diff += 360;
            while (diff > 180) diff -= 360;
            
            currentTilt += diff * 0.1;
            currentScaleX = 1; 
            flexWrapper.style.transform = `rotate(${currentTilt}deg)`;
        } else {
            // Standard lean & flip
            if (vx > 1) {
                currentScaleX = 1;
            } else if (vx < -1) {
                currentScaleX = -1;
            }
            const targetTilt = Math.max(-25, Math.min(25, vx * 3));
            currentTilt += (targetTilt - currentTilt) * 0.1;
            flexWrapper.style.transform = `scaleX(${currentScaleX}) rotate(${currentTilt * currentScaleX}deg)`;
        }

        if (dist > 50 || speedHypot > 1) {
            robotContainer.classList.add('is-flying');
            robot.classList.remove('animate-bounce');
        } else {
            robotContainer.classList.remove('is-flying');
        }

        if (dist < 10 && speedHypot < 1) {
            isRoaming = false;
            robotContainer.classList.remove('is-flying');
            robot.classList.add('animate-bounce');
            
            setTimeout(() => {
                if (!isDragging && !isChatOpen) {
                    pickNewTarget();
                    isRoaming = true;
                }
            }, 3000 + Math.random() * 4000); 
        }
    } else {
        // Return to upright when idle
        let diff = 0 - currentTilt;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;
        currentTilt += diff * 0.1;
        
        const config = getAvatarConfig(currentAvatar);
        if (config.autoRotate) {
            flexWrapper.style.transform = `rotate(${currentTilt}deg)`;
        } else {
            flexWrapper.style.transform = `scaleX(${currentScaleX}) rotate(${currentTilt * currentScaleX}deg)`;
        }
        
        robotContainer.classList.remove('is-flying');
    }
    
    requestAnimationFrame(updateLoop);
};

// Start roaming initially
setTimeout(() => {
    pickNewTarget();
    isRoaming = true;
    requestAnimationFrame(updateLoop);
}, 2000);
