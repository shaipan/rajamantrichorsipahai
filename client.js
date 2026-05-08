// ====== FIREBASE SETUP ======
firebase.initializeApp({
    apiKey: "AIzaSyAjPFEGLXsIogfy1ubZWwXeb-wAykRAV6Q",
    authDomain: "raja-mantri-game-4769c.firebaseapp.com",
    databaseURL: "https://raja-mantri-game-4769c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "raja-mantri-game-4769c",
    storageBucket: "raja-mantri-game-4769c.firebasestorage.app",
    messagingSenderId: "441832957136",
    appId: "1:441832957136:web:af53392315b7fa34a82ad5"
});

const db = firebase.database();

// ====== SOUND SYSTEM ======
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let soundEnabled = true;

function getAudioCtx() {
    if (!audioCtx) audioCtx = new AudioCtx();
    return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.3) {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {}
}

function playClick() { playTone(800, 0.08, 'sine', 0.2); }
function playReveal() {
    playTone(523, 0.12, 'sine', 0.3);
    setTimeout(() => playTone(659, 0.12, 'sine', 0.3), 80);
    setTimeout(() => playTone(784, 0.25, 'sine', 0.3), 160);
}
function playRajaFanfare() {
    [523, 659, 784, 1047].forEach((n, i) => setTimeout(() => playTone(n, 0.25, 'triangle', 0.3), i * 130));
}
function playCorrect() {
    [523, 659, 784, 1047].forEach((n, i) => setTimeout(() => playTone(n, 0.2, 'sine', 0.3), i * 130));
}
function playWrong() {
    playTone(400, 0.3, 'sawtooth', 0.2);
    setTimeout(() => playTone(300, 0.4, 'sawtooth', 0.2), 180);
}
function playWin() {
    [523, 587, 659, 784, 880, 1047, 1175, 1319].forEach((n, i) =>
        setTimeout(() => playTone(n, 0.25, 'triangle', 0.25), i * 100));
}
function playDrumRoll() {
    for (let i = 0; i < 8; i++)
        setTimeout(() => playTone(150 + Math.random() * 50, 0.06, 'square', 0.12), i * 50);
}
function playJoin() {
    playTone(600, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(900, 0.15, 'sine', 0.2), 100);
}

const soundToggle = document.getElementById('sound-toggle');
soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '\u{1F50A}' : '\u{1F507}';
    soundToggle.classList.toggle('muted', !soundEnabled);
    playClick();
});

// ====== CONFETTI ======
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiRunning = false;

function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfetti);
resizeConfetti();

function createConfetti(count = 80) {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ff8c00', '#a855f7', '#ec4899'];
    for (let i = 0; i < count; i++) {
        confettiPieces.push({
            x: Math.random() * confettiCanvas.width,
            y: -20 - Math.random() * 200,
            w: 7 + Math.random() * 7, h: 5 + Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4,
            rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 10
        });
    }
    if (!confettiRunning) animateConfetti();
}

function animateConfetti() {
    confettiRunning = true;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces = confettiPieces.filter(p => p.y < confettiCanvas.height + 20);
    if (confettiPieces.length === 0) { confettiRunning = false; return; }
    confettiPieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.rotation += p.rotSpeed;
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confettiCtx.restore();
    });
    requestAnimationFrame(animateConfetti);
}

// ====== PARTICLES ======
(function createParticles() {
    const container = document.getElementById('particles');
    const colors = [
        '#ffd700', '#ff6b6b', '#4ecdc4', '#a855f7', '#ec4899',
        '#6366f1', '#14b8a6', '#f97316', '#8b5cf6', '#06b6d4'
    ];
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        const size = (2 + Math.random() * 4) + 'px';
        p.style.width = size;
        p.style.height = size;
        const color = colors[Math.floor(Math.random() * colors.length)];
        p.style.background = color;
        p.style.color = color;
        p.style.animationDuration = (10 + Math.random() * 20) + 's';
        p.style.animationDelay = Math.random() * 15 + 's';
        container.appendChild(p);
    }
})();

// ====== GAME STATE ======
let roomCode = '';
let myIndex = -1;
let myName = '';
let isHost = false;
let roomRef = null;
let lastPhase = '';
let lastRevealCount = 0;

// ====== SESSION PERSISTENCE ======
function saveSession() {
    localStorage.setItem('rmcs_session', JSON.stringify({
        roomCode, myIndex, myName, isHost
    }));
}

function clearSession() {
    localStorage.removeItem('rmcs_session');
}

function tryReconnect() {
    const saved = localStorage.getItem('rmcs_session');
    if (!saved) return false;

    try {
        const session = JSON.parse(saved);
        if (!session.roomCode || session.myIndex < 0) return false;

        // Check if room still exists
        const ref = db.ref('rooms/' + session.roomCode);
        ref.once('value').then((snap) => {
            const data = snap.val();
            if (!data || !data.players || !data.players[session.myIndex]) {
                clearSession();
                return;
            }
            // Room exists and our slot is there - rejoin!
            roomCode = session.roomCode;
            myIndex = session.myIndex;
            myName = session.myName;
            isHost = session.isHost;
            roomRef = ref;

            listenToRoom();
            if (isHost) {
                hostListenRevealDone();
                hostListenGuess();
            }
        }).catch(() => {
            clearSession();
        });

        return true;
    } catch (e) {
        clearSession();
        return false;
    }
}

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showHomeError(msg) {
    const el = document.getElementById('home-error');
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
}

// ====== CONNECTION STATUS ======
const connInfo = firebase.database().ref('.info/connected');
connInfo.on('value', (snap) => {
    const el = document.getElementById('connection-status');
    if (snap.val() === true) {
        el.textContent = '\u{1F7E2} Online';
        el.className = 'connection-status connected';
    } else {
        el.textContent = '\u{1F534} Offline';
        el.className = 'connection-status disconnected';
    }
});

// ====== CLEANUP OLD ROOMS ======
function cleanupOldRooms() {
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    db.ref('rooms').orderByChild('timestamp').endAt(twoHoursAgo).once('value').then((snap) => {
        const updates = {};
        snap.forEach((child) => {
            updates[child.key] = null;
        });
        if (Object.keys(updates).length > 0) {
            db.ref('rooms').update(updates);
        }
    });
}

// ====== CREATE ROOM ======
function createRoom() {
    cleanupOldRooms();
    roomCode = generateRoomCode();
    roomRef = db.ref('rooms/' + roomCode);

    roomRef.set({
        host: myName,
        players: [myName],
        scores: [0, 0, 0, 0],
        totalRounds: parseInt(document.getElementById('total-rounds').value) || 5,
        currentRound: 0,
        phase: 'lobby',
        roles: [0, 1, 2, 3],
        currentRevealIndex: 0,
        revealedCount: 0,
        guessResult: null,
        standings: null,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        myIndex = 0;
        isHost = true;
        document.getElementById('display-code').textContent = roomCode;
        showScreen('lobby-screen');
        playClick();
        listenToRoom();
        saveSession();
    }).catch(() => {
        showScreen('home-screen');
        showHomeError('Failed to create room. Try again.');
    });
}

// ====== JOIN ROOM ======
function joinRoom(code) {
    roomCode = code.toUpperCase();
    roomRef = db.ref('rooms/' + roomCode);

    roomRef.once('value').then((snap) => {
        const data = snap.val();
        if (!data) {
            showScreen('home-screen');
            showHomeError('Room not found! Check the code.');
            return;
        }

        const players = data.players || [];

        // Check if this player is already in the room (rejoin)
        const existingIndex = players.indexOf(myName);
        if (existingIndex !== -1) {
            // Rejoin! Restore their position
            myIndex = existingIndex;
            isHost = (existingIndex === 0);
            document.getElementById('display-code').textContent = roomCode;
            listenToRoom();
            saveSession();
            playJoin();
            if (isHost) {
                hostListenRevealDone();
                hostListenGuess();
            }
            return;
        }

        // New player trying to join
        if (data.phase !== 'lobby') {
            showScreen('home-screen');
            showHomeError('Game in progress! Use the same name to rejoin.');
            return;
        }
        if (players.length >= 4) {
            showScreen('home-screen');
            showHomeError('Room is full!');
            return;
        }

        myIndex = players.length;
        isHost = false;
        players.push(myName);

        roomRef.child('players').set(players).then(() => {
            document.getElementById('display-code').textContent = roomCode;
            showScreen('lobby-screen');
            playJoin();
            listenToRoom();
            saveSession();
        });
    }).catch(() => {
        showScreen('home-screen');
        showHomeError('Connection error. Try again.');
    });
}

// ====== LISTEN TO ROOM CHANGES ======
function listenToRoom() {
    roomRef.on('value', (snap) => {
        const data = snap.val();
        if (!data) {
            showScreen('home-screen');
            showHomeError('Room was closed!');
            hideChatWidget();
            hideReactionBar();
            return;
        }
        handleRoomUpdate(data);
    });
    initChat();
    initReactions();
}

function handleRoomUpdate(data) {
    const players = data.players || [];
    const phase = data.phase;

    // Update host status in case of reconnect
    if (myIndex === 0) isHost = true;

    // Always keep my role updated
    if (data.roles && myIndex >= 0) {
        const roleNames = ['Raja', 'Mantri', 'Sipahi', 'Chor'];
        const rolePoints = [1000, 800, 600, 0];
        const myRoleIndex = data.roles[myIndex];
        if (myRoleIndex !== undefined) {
            window._myRole = {
                role: myRoleIndex,
                roleName: roleNames[myRoleIndex],
                points: rolePoints[myRoleIndex]
            };
        }
    }

    // Show/hide reaction bar (visible during gameplay, not lobby/home)
    if (phase === 'lobby' || !phase) {
        hideReactionBar();
    } else {
        showReactionBar();
    }

    // Clear timer if we leave the guess phase
    if (phase !== 'mantri-guess') {
        clearMantriTimer();
        if (waitingTimerInterval) { clearInterval(waitingTimerInterval); waitingTimerInterval = null; }
    }

    switch (phase) {
        case 'lobby':
            updateLobby(players);
            showScreen('lobby-screen');
            document.getElementById('display-code').textContent = roomCode;
            break;

        case 'reveal':
            handleRevealPhase(data);
            break;

        case 'raja-announce':
            handleRajaPhase(data);
            break;

        case 'mantri-guess':
            handleGuessPhase(data);
            break;

        case 'result':
            handleResultPhase(data);
            break;

        case 'game-over':
            handleGameOver(data);
            break;
    }

    lastPhase = phase;
}

// ====== LOBBY ======
function updateLobby(playerNames) {
    const list = document.getElementById('player-list');
    const icons = ['\u{1F451}', '\u{1F9D4}', '\u{1F46E}', '\u{1F412}'];
    let html = '';
    for (let i = 0; i < 4; i++) {
        if (i < playerNames.length) {
            const isMe = i === myIndex;
            html += '<div class="player-slot filled ' + (isMe ? 'you' : '') + '">' +
                '<div class="slot-icon">' + icons[i] + '</div>' +
                '<div class="slot-name">' + playerNames[i] + '</div>' +
                '<div class="slot-label">' + (isMe ? '(You)' : '') + (i === 0 ? ' \u{2B50} Host' : '') + '</div>' +
            '</div>';
        } else {
            html += '<div class="player-slot empty">' +
                '<div class="slot-icon">\u{2753}</div>' +
                '<div class="slot-name">Waiting...</div>' +
                '<div class="slot-label">Empty</div>' +
            '</div>';
        }
    }
    list.innerHTML = html;

    const status = document.getElementById('lobby-status');
    const startBtn = document.getElementById('start-game-btn');
    if (playerNames.length === 4) {
        status.textContent = '\u{2705} All players joined!';
        if (isHost) startBtn.classList.remove('hidden');
    } else {
        status.textContent = 'Waiting for players... (' + playerNames.length + '/4)';
        startBtn.classList.add('hidden');
    }
}

// ====== REVEAL PHASE ======
function handleRevealPhase(data) {
    const currentRevealIndex = data.currentRevealIndex || 0;
    const round = data.currentRound;

    if (lastPhase !== 'reveal') {
        playDrumRoll();
    }

    if (currentRevealIndex === myIndex) {
        showScreen('reveal-screen');
        document.getElementById('round-number').textContent = round + '/' + data.totalRounds;
        document.getElementById('role-card').classList.add('hidden');
        document.getElementById('reveal-btn').classList.remove('hidden');
        document.getElementById('reveal-done-btn').classList.add('hidden');
    } else {
        showScreen('waiting-screen');
        document.getElementById('waiting-title').textContent = 'Round ' + round + '!';
        const revealPlayer = (data.players || [])[currentRevealIndex] || '';
        document.getElementById('waiting-message').textContent = revealPlayer + ' is viewing their role...';
    }
}

// ====== RAJA ANNOUNCE ======
function handleRajaPhase(data) {
    if (lastPhase !== 'raja-announce') {
        const roles = data.roles || [];
        const rajaIdx = roles.indexOf(0);
        const rajaName = (data.players || [])[rajaIdx];
        document.getElementById('raja-name').textContent = rajaName;
        showScreen('raja-screen');
        playRajaFanfare();
        createConfetti(40);
        document.getElementById('raja-waiting').textContent = 'Mantri will now find the Chor...';
    }
}

// ====== MANTRI GUESS ======
function handleGuessPhase(data) {
    const roles = data.roles || [];
    const mantriIdx = roles.indexOf(1);
    const rajaIdx = roles.indexOf(0);
    const players = data.players || [];

    // Timer: sync from Firebase timerStart field
    const timerStart = data.timerStart || Date.now();

    if (mantriIdx === myIndex) {
        const suspects = players
            .map((name, i) => ({ name, index: i }))
            .filter(p => p.index !== rajaIdx && p.index !== mantriIdx);

        const container = document.getElementById('suspect-buttons');
        container.innerHTML = '';
        suspects.forEach(suspect => {
            const btn = document.createElement('button');
            btn.className = 'suspect-btn';
            btn.textContent = '\u{1F914} ' + suspect.name;
            btn.addEventListener('click', () => {
                playClick();
                clearMantriTimer();
                // Mantri submits guess - host processes
                roomRef.child('guess').set(suspect.index);
            });
            container.appendChild(btn);
        });
        showScreen('guess-screen');

        // Start the local timer (Mantri sees countdown)
        if (lastPhase !== 'mantri-guess') {
            startMantriTimer(timerStart);
        }
    } else {
        showScreen('waiting-screen');
        document.getElementById('waiting-title').textContent = '\u{1F50D} Investigation!';

        // Show timer countdown for waiting players too
        const elapsed = (Date.now() - timerStart) / 1000;
        const remaining = Math.max(0, TIMER_DURATION - elapsed);
        document.getElementById('waiting-message').textContent =
            players[mantriIdx] + ' (Mantri) is finding the Chor... (' + Math.ceil(remaining) + 's left)';

        // Update waiting message with countdown
        if (lastPhase !== 'mantri-guess') {
            startWaitingTimerDisplay(timerStart, players[mantriIdx]);
        }
    }
}

let waitingTimerInterval = null;
function startWaitingTimerDisplay(startTime, mantriName) {
    if (waitingTimerInterval) clearInterval(waitingTimerInterval);
    waitingTimerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(0, TIMER_DURATION - elapsed);
        const msg = document.getElementById('waiting-message');
        if (msg && document.getElementById('waiting-screen').classList.contains('active')) {
            msg.textContent = mantriName + ' (Mantri) is finding the Chor... (' + Math.ceil(remaining) + 's left)';
        }
        if (remaining <= 0) {
            clearInterval(waitingTimerInterval);
            waitingTimerInterval = null;
        }
    }, 500);
}

// ====== RESULT ======
function handleResultPhase(data) {
    if (lastPhase === 'result') return;

    const result = data.guessResult;
    if (!result) return;

    if (result.correct) { playCorrect(); createConfetti(60); }
    else { playWrong(); }

    document.getElementById('result-title').textContent =
        result.correct ? '\u{2705} Mantri was RIGHT!' : '\u{274C} Mantri was WRONG!';
    document.getElementById('result-title').style.color = result.correct ? '#4caf50' : '#f44336';
    document.getElementById('result-emoji').textContent = result.correct ? '\u{1F389}' : '\u{1F625}';

    const icons = ['\u{1F451}', '\u{1F9D4}', '\u{1F46E}', '\u{1F412}'];
    const details = document.getElementById('result-details');
    const roleData = result.roles || [];
    details.innerHTML = roleData.map(r =>
        '<div class="role-reveal"><span>' + icons[r.roleIndex] + ' ' + r.name +
        '</span><span><strong>' + r.role + '</strong> (+' + r.roundPoints + ')</span></div>'
    ).join('');

    if (!result.correct) {
        details.innerHTML += '<div class="role-reveal" style="background:rgba(244,67,54,0.1);margin-top:8px;">' +
            '<span>\u{1F6A8} Guessed: <strong>' + result.guessedName + '</strong></span>' +
            '<span>Chor: <strong>' + result.chorName + '</strong></span></div>';
    }

    const scores = data.scores || [];
    const players = data.players || [];
    const roundPoints = result.roundPoints || [];

    document.getElementById('round-scores').innerHTML =
        '<h3>\u{1F4CA} Scoreboard (Round ' + data.currentRound + '/' + data.totalRounds + ')</h3>' +
        '<table class="score-table"><tr><th>Player</th><th>Round</th><th>Total</th></tr>' +
        players.map((name, i) =>
            '<tr><td>' + name + '</td><td class="points-added">+' + (roundPoints[i] || 0) +
            '</td><td class="score-highlight">' + (scores[i] || 0) + '</td></tr>'
        ).join('') + '</table>';

    const nextBtn = document.getElementById('next-round-btn');
    const waitMsg = document.getElementById('result-wait');
    if (isHost) {
        nextBtn.classList.remove('hidden');
        waitMsg.classList.add('hidden');
        nextBtn.textContent = data.currentRound >= data.totalRounds ? '\u{1F3C6} See Results!' : '\u{1F3B2} Next Round!';
    } else {
        nextBtn.classList.add('hidden');
        waitMsg.classList.remove('hidden');
        waitMsg.textContent = 'Waiting for host...';
    }
    showScreen('result-screen');
}

// ====== GAME OVER ======
function handleGameOver(data) {
    if (lastPhase === 'game-over') return;

    playWin();
    createConfetti(120);

    const standings = data.standings || [];
    const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}', '\u{1F3C5}'];

    document.getElementById('winner-announce').innerHTML =
        '<span class="trophy">\u{1F3C6}</span>' +
        '<p class="winner-name">' + standings[0].name + ' Wins!</p>' +
        '<p class="winner-score">Score: ' + standings[0].score + ' points</p>';

    document.getElementById('final-scores').innerHTML =
        '<h3>Final Standings</h3>' +
        standings.map((p, i) =>
            '<div class="final-player ' + (i === 0 ? 'winner' : '') + '">' +
            '<span class="final-rank">' + medals[i] + '</span>' +
            '<span class="final-name">' + p.name + '</span>' +
            '<span class="final-score">' + p.score + '</span></div>'
        ).join('');

    document.getElementById('play-again-btn').classList.toggle('hidden', !isHost);
    showScreen('final-screen');
    setTimeout(() => createConfetti(60), 800);

    // Clear session so refresh goes to home
    clearSession();

    // Auto-delete room after 5 minutes if no one plays again
    if (isHost) {
        setTimeout(() => {
            roomRef && roomRef.once('value').then((snap) => {
                const data = snap.val();
                if (data && data.phase === 'game-over') {
                    roomRef.remove();
                }
            });
        }, 5 * 60 * 1000);
    }
}

// ====== HOST: START ROUND ======
function hostStartRound() {
    roomRef.once('value').then((snap) => {
        const data = snap.val();
        const round = (data.currentRound || 0) + 1;
        const roles = shuffle([0, 1, 2, 3]);

        roomRef.update({
            currentRound: round,
            roles: roles,
            phase: 'reveal',
            currentRevealIndex: 0,
            revealedCount: 0,
            guess: null,
            guessResult: null,
            standings: null
        });
    });
}

// ====== HOST: LISTEN FOR REVEAL DONE ======
function hostListenRevealDone() {
    roomRef.child('revealedCount').on('value', (snap) => {
        if (!isHost) return;
        const count = snap.val() || 0;
        if (count >= 4) {
            // All revealed, move to raja announce then guess
            roomRef.update({ phase: 'raja-announce' });
            setTimeout(() => {
                roomRef.update({
                    phase: 'mantri-guess',
                    timerStart: Date.now()
                });
            }, 2500);
        }
    });
}

// ====== HOST: LISTEN FOR GUESS ======
function hostListenGuess() {
    roomRef.child('guess').on('value', (snap) => {
        if (!isHost) return;
        const guessIndex = snap.val();
        if (guessIndex === null || guessIndex === undefined) return;

        roomRef.once('value').then((roomSnap) => {
            const data = roomSnap.val();
            if (data.phase !== 'mantri-guess') return;

            const roles = data.roles || [];
            const players = data.players || [];
            const scores = data.scores || [0, 0, 0, 0];

            const chorIdx = roles.indexOf(3);
            const mantriIdx = roles.indexOf(1);
            const correct = guessIndex === chorIdx;

            const pointValues = [1000, 800, 600, 0];
            let roundPoints = [0, 0, 0, 0];
            for (let i = 0; i < 4; i++) {
                roundPoints[i] = pointValues[roles[i]];
            }
            if (!correct) {
                roundPoints[mantriIdx] = 0;
                roundPoints[chorIdx] = 800;
            }

            const newScores = scores.map((s, i) => s + roundPoints[i]);

            const roleNames = ['Raja', 'Mantri', 'Sipahi', 'Chor'];
            const guessResult = {
                correct,
                guessedIndex: guessIndex,
                guessedName: players[guessIndex],
                chorIndex: chorIdx,
                chorName: players[chorIdx],
                roundPoints,
                roles: players.map((name, i) => ({
                    name,
                    role: roleNames[roles[i]],
                    roleIndex: roles[i],
                    roundPoints: roundPoints[i],
                    totalScore: newScores[i]
                }))
            };

            roomRef.update({
                scores: newScores,
                guessResult,
                phase: 'result',
                guess: null
            });

            // Check game over
            if (data.currentRound >= data.totalRounds) {
                setTimeout(() => {
                    const standings = players
                        .map((name, i) => ({ name, score: newScores[i] }))
                        .sort((a, b) => b.score - a.score);
                    roomRef.update({ phase: 'game-over', standings });
                }, 1500);
            }
        });
    });
}

// ====== EVENT LISTENERS ======
document.getElementById('create-btn').addEventListener('click', () => {
    myName = document.getElementById('player-name').value.trim();
    if (!myName) {
        document.getElementById('player-name').focus();
        document.querySelector('.home-actions .input-group').classList.add('shake');
        setTimeout(() => document.querySelector('.home-actions .input-group').classList.remove('shake'), 600);
        return;
    }
    playClick();
    showScreen('settings-screen');
});

document.getElementById('create-confirm-btn').addEventListener('click', () => {
    playClick();
    createRoom();
    hostListenRevealDone();
    hostListenGuess();
});

document.getElementById('join-btn').addEventListener('click', () => {
    myName = document.getElementById('player-name').value.trim();
    const code = document.getElementById('room-code').value.trim().toUpperCase();
    if (!myName) {
        document.getElementById('player-name').focus();
        return;
    }
    if (!code || code.length < 4) {
        document.getElementById('room-code').focus();
        return;
    }
    playClick();
    joinRoom(code);
});

document.getElementById('start-game-btn').addEventListener('click', () => {
    if (!isHost) return;
    playClick();
    hostStartRound();
});

document.getElementById('reveal-btn').addEventListener('click', () => {
    if (!window._myRole) return;
    playReveal();
    const icons = ['\u{1F451}', '\u{1F9D4}', '\u{1F46E}', '\u{1F412}'];
    document.getElementById('role-icon').textContent = icons[window._myRole.role];
    document.getElementById('role-name').textContent = window._myRole.roleName;
    document.getElementById('role-points').textContent = window._myRole.points + ' points';
    document.getElementById('role-card').classList.remove('hidden');
    document.getElementById('reveal-btn').classList.add('hidden');
    document.getElementById('reveal-done-btn').classList.remove('hidden');
});

document.getElementById('reveal-done-btn').addEventListener('click', () => {
    playClick();
    // Increment revealedCount and move to next player
    roomRef.transaction((data) => {
        if (data) {
            data.revealedCount = (data.revealedCount || 0) + 1;
            data.currentRevealIndex = (data.currentRevealIndex || 0) + 1;
        }
        return data;
    });
    showScreen('waiting-screen');
    document.getElementById('waiting-title').textContent = 'Done!';
    document.getElementById('waiting-message').textContent = 'Waiting for others...';
});

document.getElementById('next-round-btn').addEventListener('click', () => {
    if (!isHost) return;
    playClick();
    roomRef.once('value').then((snap) => {
        const data = snap.val();
        if (data.currentRound >= data.totalRounds) {
            const players = data.players || [];
            const scores = data.scores || [];
            const standings = players
                .map((name, i) => ({ name, score: scores[i] }))
                .sort((a, b) => b.score - a.score);
            roomRef.update({ phase: 'game-over', standings });
        } else {
            hostStartRound();
        }
    });
});

document.getElementById('play-again-btn').addEventListener('click', () => {
    if (!isHost) return;
    playClick();
    roomRef.update({
        scores: [0, 0, 0, 0],
        currentRound: 0,
        phase: 'lobby',
        roles: [0, 1, 2, 3],
        currentRevealIndex: 0,
        revealedCount: 0,
        guess: null,
        guessResult: null,
        standings: null
    });
    lastPhase = '';
});

// ====== DELETE ROOM (host only, after game ends) ======
function deleteRoom() {
    if (roomRef) {
        roomRef.remove();
    }
    clearSession();
    roomRef = null;
    chatRef = null;
    chatListenerAttached = false;
    reactionsRef = null;
    reactionsListenerAttached = false;
    lastPhase = '';
    hideChatWidget();
    hideReactionBar();
    clearMantriTimer();
    if (waitingTimerInterval) { clearInterval(waitingTimerInterval); waitingTimerInterval = null; }
    showScreen('home-screen');
}

document.getElementById('player-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('create-btn').click();
});

document.getElementById('room-code').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('join-btn').click();
});

// ====== CHAT SYSTEM ======
let chatOpen = false;
let unreadCount = 0;
let chatRef = null;
let chatListenerAttached = false;

function showChatWidget() {
    document.getElementById('chat-widget').classList.remove('hidden');
}

function hideChatWidget() {
    document.getElementById('chat-widget').classList.add('hidden');
}

function initChat() {
    if (!roomRef || chatListenerAttached) return;
    chatRef = roomRef.child('chat');
    chatListenerAttached = true;

    // Listen for new messages
    chatRef.orderByChild('time').limitToLast(50).on('child_added', (snap) => {
        const msg = snap.val();
        if (!msg) return;
        appendChatMessage(msg);

        if (!chatOpen && msg.name !== myName) {
            unreadCount++;
            updateChatBadge();
            playTone(1000, 0.05, 'sine', 0.15);
        }
    });

    showChatWidget();
}

function appendChatMessage(msg) {
    const container = document.getElementById('chat-messages');
    const isMine = msg.name === myName;
    const div = document.createElement('div');
    div.className = 'chat-msg' + (isMine ? ' mine' : '');
    div.innerHTML = '<div class="chat-msg-name">' + msg.name + '</div>' +
        '<div class="chat-msg-text">' + escapeHtml(msg.text) + '</div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !chatRef) return;

    chatRef.push({
        name: myName,
        text: text,
        time: firebase.database.ServerValue.TIMESTAMP
    });

    input.value = '';
}

function updateChatBadge() {
    const badge = document.getElementById('chat-badge');
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Chat toggle
document.getElementById('chat-toggle').addEventListener('click', () => {
    chatOpen = !chatOpen;
    document.getElementById('chat-panel').classList.toggle('hidden', !chatOpen);
    if (chatOpen) {
        unreadCount = 0;
        updateChatBadge();
        document.getElementById('chat-input').focus();
    }
});

document.getElementById('chat-close').addEventListener('click', () => {
    chatOpen = false;
    document.getElementById('chat-panel').classList.add('hidden');
});

document.getElementById('chat-send').addEventListener('click', sendChatMessage);

document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});

// ====== BROWSE OPEN ROOMS ======
function loadOpenRooms() {
    const listEl = document.getElementById('rooms-list');
    listEl.innerHTML = '<p class="hint">Looking for rooms...</p>';

    db.ref('rooms').orderByChild('phase').equalTo('lobby').once('value').then((snap) => {
        const rooms = [];
        snap.forEach((child) => {
            const data = child.val();
            const players = data.players || [];
            if (players.length < 4) {
                rooms.push({
                    code: child.key,
                    host: data.host || players[0] || '???',
                    playerCount: players.length,
                    players: players
                });
            }
        });

        if (rooms.length === 0) {
            listEl.innerHTML = '<p class="no-rooms">No open rooms. Create one!</p>';
            return;
        }

        listEl.innerHTML = rooms.map(r =>
            '<div class="room-item" data-code="' + r.code + '">' +
                '<div class="room-item-info">' +
                    '<div class="room-item-host">\u{1F451} ' + r.host + '\'s Room</div>' +
                    '<div class="room-item-players">' + r.playerCount + '/4 players • ' + r.players.join(', ') + '</div>' +
                '</div>' +
                '<button class="room-item-join">Join</button>' +
            '</div>'
        ).join('');

        // Add click handlers
        listEl.querySelectorAll('.room-item').forEach(item => {
            item.addEventListener('click', () => {
                const code = item.getAttribute('data-code');
                myName = document.getElementById('player-name').value.trim();
                if (!myName) {
                    document.getElementById('player-name').focus();
                    document.querySelector('.home-actions .input-group').classList.add('shake');
                    setTimeout(() => document.querySelector('.home-actions .input-group').classList.remove('shake'), 600);
                    return;
                }
                playClick();
                joinRoom(code);
            });
        });
    }).catch(() => {
        listEl.innerHTML = '<p class="no-rooms">Could not load rooms</p>';
    });
}

// Load rooms on page load and refresh button
loadOpenRooms();
document.getElementById('refresh-rooms-btn').addEventListener('click', () => {
    playClick();
    loadOpenRooms();
});

// ====== MOBILE KEYBOARD HANDLING ======
const chatInput = document.getElementById('chat-input');
chatInput.addEventListener('focus', () => {
    setTimeout(() => {
        chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
});

// Prevent body scroll when chat is open on mobile
document.getElementById('chat-panel').addEventListener('touchmove', (e) => {
    e.stopPropagation();
}, { passive: true });

// ====== TIMER SYSTEM (15s for Mantri) ======
let timerInterval = null;
let timerStartTime = null;
const TIMER_DURATION = 15; // seconds

function playTick() {
    playTone(1200, 0.05, 'square', 0.15);
}

function startMantriTimer(firebaseStartTime) {
    clearMantriTimer();
    timerStartTime = firebaseStartTime || Date.now();

    const timerBar = document.getElementById('timer-bar-fill');
    const timerText = document.getElementById('timer-text');
    const timerContainer = document.getElementById('timer-container');
    if (timerContainer) timerContainer.style.display = '';

    timerInterval = setInterval(() => {
        const elapsed = (Date.now() - timerStartTime) / 1000;
        const remaining = Math.max(0, TIMER_DURATION - elapsed);
        const percent = (remaining / TIMER_DURATION) * 100;

        timerBar.style.width = percent + '%';
        timerText.textContent = Math.ceil(remaining) + 's';

        // Color classes
        timerBar.classList.remove('warning', 'danger');
        timerText.classList.remove('warning', 'danger');
        if (remaining <= 5) {
            timerBar.classList.add('danger');
            timerText.classList.add('danger');
            // Tick sound in last 5 seconds
            if (remaining > 0 && Math.ceil(remaining) !== Math.ceil(remaining + 0.05)) {
                // Only tick once per second
            }
        } else if (remaining <= 8) {
            timerBar.classList.add('warning');
            timerText.classList.add('warning');
        }

        // Tick in last 5 seconds (once per second boundary)
        if (remaining <= 5 && remaining > 0) {
            const prevRemaining = remaining + 0.1;
            if (Math.ceil(remaining) < Math.ceil(prevRemaining)) {
                playTick();
            }
        }

        if (remaining <= 0) {
            clearMantriTimer();
            // If I am the Mantri, auto-pick random suspect
            autoPickSuspect();
        }
    }, 100);
}

function clearMantriTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function autoPickSuspect() {
    // Only auto-pick if we're on the guess screen and are the Mantri
    const guessScreen = document.getElementById('guess-screen');
    if (!guessScreen.classList.contains('active')) return;

    const buttons = document.querySelectorAll('.suspect-btn');
    if (buttons.length > 0) {
        const randomBtn = buttons[Math.floor(Math.random() * buttons.length)];
        randomBtn.click();
    }
}

// ====== QUICK REACTIONS ======
let reactionsRef = null;
let reactionsListenerAttached = false;

function showReactionBar() {
    document.getElementById('reaction-bar').classList.remove('hidden');
}

function hideReactionBar() {
    document.getElementById('reaction-bar').classList.add('hidden');
}

function initReactions() {
    if (!roomRef || reactionsListenerAttached) return;
    reactionsRef = roomRef.child('reactions');
    reactionsListenerAttached = true;

    // Listen for new reactions
    reactionsRef.limitToLast(1).on('child_added', (snap) => {
        const reaction = snap.val();
        if (!reaction) return;
        displayReaction(reaction.emoji, reaction.name);
        // Remove old reactions to prevent buildup
        snap.ref.remove();
    });
}

function sendReaction(emoji) {
    if (!reactionsRef || !myName) return;
    reactionsRef.push({
        emoji: emoji,
        name: myName,
        time: firebase.database.ServerValue.TIMESTAMP
    });
}

function displayReaction(emoji, senderName) {
    const container = document.getElementById('reaction-display');
    const el = document.createElement('div');
    el.className = 'reaction-float';
    // Random horizontal position
    el.style.left = (15 + Math.random() * 70) + '%';
    el.style.bottom = '10%';
    el.innerHTML = '<span class="reaction-emoji">' + emoji + '</span>' +
        '<span class="reaction-sender">' + escapeHtml(senderName) + '</span>';
    container.appendChild(el);

    // Remove after animation
    setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
    }, 2600);
}

// Attach reaction button listeners
document.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const emoji = btn.getAttribute('data-emoji');
        sendReaction(emoji);
        playTone(600, 0.06, 'sine', 0.15);
        // Quick scale animation feedback
        btn.style.transform = 'scale(1.4)';
        setTimeout(() => btn.style.transform = '', 200);
    });
});

// ====== INVITE LINK SYSTEM ======
function getInviteLink() {
    const baseUrl = window.location.href.split('?')[0];
    return baseUrl + '?room=' + roomCode;
}

function checkInviteLink() {
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('room');
    if (inviteCode) {
        document.getElementById('room-code').value = inviteCode.toUpperCase();
        document.getElementById('invite-message').classList.remove('hidden');
        // Focus on name field
        setTimeout(() => document.getElementById('player-name').focus(), 300);
    }
}

document.getElementById('copy-invite-btn').addEventListener('click', () => {
    const link = getInviteLink();
    navigator.clipboard.writeText(link).then(() => {
        const msg = document.getElementById('invite-copied-msg');
        msg.classList.remove('hidden');
        msg.textContent = 'Link copied!';
        playClick();
        setTimeout(() => msg.classList.add('hidden'), 2500);
    }).catch(() => {
        // Fallback: select and copy
        const textarea = document.createElement('textarea');
        textarea.value = getInviteLink();
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        const msg = document.getElementById('invite-copied-msg');
        msg.classList.remove('hidden');
        msg.textContent = 'Link copied!';
        playClick();
        setTimeout(() => msg.classList.add('hidden'), 2500);
    });
});

document.getElementById('share-invite-btn').addEventListener('click', () => {
    const link = getInviteLink();
    if (navigator.share) {
        navigator.share({
            title: 'Join my Raja Mantri Chor Sipahi game!',
            text: 'Join room ' + roomCode + ' to play!',
            url: link
        }).catch(() => {});
    } else {
        // Fallback to copy
        document.getElementById('copy-invite-btn').click();
    }
});

// Check invite link on page load
checkInviteLink();

// ====== AUTO-RECONNECT ON PAGE LOAD ======
tryReconnect();
