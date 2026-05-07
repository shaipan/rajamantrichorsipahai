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
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#a855f7', '#ec4899'];
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.width = p.style.height = (3 + Math.random() * 6) + 'px';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDuration = (8 + Math.random() * 12) + 's';
        p.style.animationDelay = Math.random() * 10 + 's';
        container.appendChild(p);
    }
})();

// ====== PEER-TO-PEER NETWORKING ======
const ROOM_PREFIX = 'rmcs-game-';
let peer = null;
let connections = []; // Host: array of connections to guests
let hostConn = null;  // Guest: connection to host
let isHost = false;
let myIndex = -1;
let myName = '';
let myRole = null;
let players = [];
let roomCode = '';
let currentRound = 0;
let totalRounds = 5;

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

// ====== HOST LOGIC ======
let gameState = {};

function hostBroadcast(msg) {
    const data = JSON.stringify(msg);
    connections.forEach(conn => {
        if (conn && conn.open) conn.send(data);
    });
    // Also deliver to self (host)
    handleGameMessage(msg);
}

function hostSendTo(playerIndex, msg) {
    if (playerIndex === 0) {
        handleGameMessage(msg);
    } else {
        const conn = connections[playerIndex - 1];
        if (conn && conn.open) conn.send(JSON.stringify(msg));
    }
}

function hostStartRound() {
    gameState.currentRound++;
    gameState.roles = shuffle([0, 1, 2, 3]);
    gameState.revealedCount = 0;
    gameState.phase = 'reveal';
    gameState.currentRevealIndex = 0;

    hostBroadcast({
        type: 'round-start',
        round: gameState.currentRound,
        totalRounds: gameState.totalRounds,
        players: gameState.players
    });

    // Send each player their private role
    const roleNames = ['Raja', 'Mantri', 'Sipahi', 'Chor'];
    const rolePoints = [1000, 800, 600, 0];
    for (let i = 0; i < 4; i++) {
        const ri = gameState.roles[i];
        hostSendTo(i, {
            type: 'your-role',
            role: ri,
            roleName: roleNames[ri],
            points: rolePoints[ri]
        });
    }

    hostPromptReveal();
}

function hostPromptReveal() {
    const idx = gameState.currentRevealIndex;
    hostBroadcast({
        type: 'reveal-turn',
        playerIndex: idx,
        playerName: gameState.players[idx]
    });
}

function hostHandleRevealDone(fromIndex) {
    if (fromIndex !== gameState.currentRevealIndex) return;
    gameState.currentRevealIndex++;
    gameState.revealedCount++;

    if (gameState.revealedCount >= 4) {
        // Announce Raja
        const rajaIdx = gameState.roles.indexOf(0);
        gameState.phase = 'guess';
        hostBroadcast({
            type: 'raja-announce',
            rajaIndex: rajaIdx,
            rajaName: gameState.players[rajaIdx]
        });

        // Prompt Mantri
        setTimeout(() => {
            const mantriIdx = gameState.roles.indexOf(1);
            const suspects = gameState.players
                .map((name, i) => ({ name, index: i }))
                .filter(p => p.index !== rajaIdx && p.index !== mantriIdx);

            hostBroadcast({
                type: 'mantri-guess',
                mantriIndex: mantriIdx,
                mantriName: gameState.players[mantriIdx],
                suspects
            });
        }, 2500);
    } else {
        hostPromptReveal();
    }
}

function hostHandleGuess(fromIndex, guessIndex) {
    const mantriIdx = gameState.roles.indexOf(1);
    if (fromIndex !== mantriIdx) return;

    const chorIdx = gameState.roles.indexOf(3);
    const correct = guessIndex === chorIdx;
    const pointValues = [1000, 800, 600, 0];

    let roundPoints = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
        roundPoints[i] = pointValues[gameState.roles[i]];
    }
    if (!correct) {
        roundPoints[mantriIdx] = 0;
        roundPoints[chorIdx] = 800;
    }
    for (let i = 0; i < 4; i++) {
        gameState.scores[i] += roundPoints[i];
    }

    const roleNames = ['Raja', 'Mantri', 'Sipahi', 'Chor'];
    hostBroadcast({
        type: 'round-result',
        correct,
        guessedIndex: guessIndex,
        guessedName: gameState.players[guessIndex],
        chorIndex: chorIdx,
        chorName: gameState.players[chorIdx],
        roles: gameState.players.map((name, i) => ({
            name,
            role: roleNames[gameState.roles[i]],
            roleIndex: gameState.roles[i],
            roundPoints: roundPoints[i],
            totalScore: gameState.scores[i]
        })),
        currentRound: gameState.currentRound,
        totalRounds: gameState.totalRounds
    });

    gameState.phase = 'result';

    if (gameState.currentRound >= gameState.totalRounds) {
        setTimeout(() => {
            const standings = gameState.players
                .map((name, i) => ({ name, score: gameState.scores[i] }))
                .sort((a, b) => b.score - a.score);
            hostBroadcast({ type: 'game-over', standings });
            gameState.phase = 'ended';
        }, 1000);
    }
}

function hostHandleMessage(fromIndex, msg) {
    switch (msg.type) {
        case 'reveal-done':
            hostHandleRevealDone(fromIndex);
            break;
        case 'guess':
            hostHandleGuess(fromIndex, msg.guessIndex);
            break;
        case 'next-round':
            if (fromIndex === 0 && gameState.phase === 'result') hostStartRound();
            break;
        case 'play-again':
            if (fromIndex === 0) {
                gameState.scores = [0, 0, 0, 0];
                gameState.currentRound = 0;
                gameState.phase = 'playing';
                hostBroadcast({ type: 'game-restart' });
                hostStartRound();
            }
            break;
    }
}

// ====== GAME MESSAGE HANDLER (runs on all clients) ======
function handleGameMessage(msg) {
    switch (msg.type) {
        case 'lobby-update':
            players = msg.players;
            updateLobby(msg.players);
            break;

        case 'round-start':
            currentRound = msg.round;
            totalRounds = msg.totalRounds;
            players = msg.players;
            myRole = null;
            showScreen('waiting-screen');
            document.getElementById('waiting-title').textContent = 'Round ' + msg.round + '!';
            document.getElementById('waiting-message').textContent = 'Roles are being revealed...';
            playDrumRoll();
            break;

        case 'your-role':
            myRole = msg;
            break;

        case 'reveal-turn':
            if (msg.playerIndex === myIndex) {
                showRevealUI();
            } else {
                showScreen('waiting-screen');
                document.getElementById('waiting-title').textContent = 'Wait...';
                document.getElementById('waiting-message').textContent =
                    msg.playerName + ' is viewing their role';
            }
            break;

        case 'raja-announce':
            showRajaUI(msg.rajaName);
            break;

        case 'mantri-guess':
            if (msg.mantriIndex === myIndex) {
                showGuessUI(msg.suspects);
            } else {
                showScreen('waiting-screen');
                document.getElementById('waiting-title').textContent = '\u{1F50D} Investigation!';
                document.getElementById('waiting-message').textContent =
                    msg.mantriName + ' (Mantri) is finding the Chor...';
            }
            break;

        case 'round-result':
            showResultUI(msg);
            break;

        case 'game-over':
            setTimeout(() => showFinalUI(msg.standings), 1500);
            break;

        case 'game-restart':
            playDrumRoll();
            break;

        case 'player-disconnected':
            showScreen('home-screen');
            showHomeError(msg.playerName + ' disconnected! Game ended.');
            break;
    }
}

// ====== UI FUNCTIONS ======
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

function showRevealUI() {
    showScreen('reveal-screen');
    document.getElementById('round-number').textContent = currentRound + '/' + totalRounds;
    document.getElementById('role-card').classList.add('hidden');
    document.getElementById('reveal-btn').classList.remove('hidden');
    document.getElementById('reveal-done-btn').classList.add('hidden');
    playDrumRoll();
}

function showRajaUI(rajaName) {
    document.getElementById('raja-name').textContent = rajaName;
    showScreen('raja-screen');
    playRajaFanfare();
    createConfetti(40);
    document.getElementById('raja-waiting').textContent = 'Mantri will now find the Chor...';
}

function showGuessUI(suspects) {
    const container = document.getElementById('suspect-buttons');
    container.innerHTML = '';
    suspects.forEach(suspect => {
        const btn = document.createElement('button');
        btn.className = 'suspect-btn';
        btn.textContent = '\u{1F914} ' + suspect.name;
        btn.addEventListener('click', () => {
            playClick();
            sendToHost({ type: 'guess', guessIndex: suspect.index });
            showScreen('waiting-screen');
            document.getElementById('waiting-title').textContent = '\u{1F3B2} Revealing...';
            document.getElementById('waiting-message').textContent = 'Let\'s see if you were right!';
        });
        container.appendChild(btn);
    });
    showScreen('guess-screen');
}

function showResultUI(msg) {
    if (msg.correct) { playCorrect(); createConfetti(60); }
    else { playWrong(); }

    document.getElementById('result-title').textContent =
        msg.correct ? '\u{2705} Mantri was RIGHT!' : '\u{274C} Mantri was WRONG!';
    document.getElementById('result-title').style.color = msg.correct ? '#4caf50' : '#f44336';
    document.getElementById('result-emoji').textContent = msg.correct ? '\u{1F389}' : '\u{1F625}';

    const icons = ['\u{1F451}', '\u{1F9D4}', '\u{1F46E}', '\u{1F412}'];
    const details = document.getElementById('result-details');
    details.innerHTML = msg.roles.map(r =>
        '<div class="role-reveal"><span>' + icons[r.roleIndex] + ' ' + r.name +
        '</span><span><strong>' + r.role + '</strong> (+' + r.roundPoints + ')</span></div>'
    ).join('');

    if (!msg.correct) {
        details.innerHTML += '<div class="role-reveal" style="background:rgba(244,67,54,0.1);margin-top:8px;">' +
            '<span>\u{1F6A8} Guessed: <strong>' + msg.guessedName + '</strong></span>' +
            '<span>Chor: <strong>' + msg.chorName + '</strong></span></div>';
    }

    document.getElementById('round-scores').innerHTML =
        '<h3>\u{1F4CA} Scoreboard (Round ' + msg.currentRound + '/' + msg.totalRounds + ')</h3>' +
        '<table class="score-table"><tr><th>Player</th><th>Round</th><th>Total</th></tr>' +
        msg.roles.map(r =>
            '<tr><td>' + r.name + '</td><td class="points-added">+' + r.roundPoints +
            '</td><td class="score-highlight">' + r.totalScore + '</td></tr>'
        ).join('') + '</table>';

    const nextBtn = document.getElementById('next-round-btn');
    const waitMsg = document.getElementById('result-wait');
    if (isHost) {
        nextBtn.classList.remove('hidden');
        waitMsg.classList.add('hidden');
        nextBtn.textContent = msg.currentRound >= msg.totalRounds ? '\u{1F3C6} See Results!' : '\u{1F3B2} Next Round!';
    } else {
        nextBtn.classList.add('hidden');
        waitMsg.classList.remove('hidden');
        waitMsg.textContent = 'Waiting for host...';
    }
    showScreen('result-screen');
}

function showFinalUI(standings) {
    playWin();
    createConfetti(120);
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
}

function sendToHost(msg) {
    if (isHost) {
        hostHandleMessage(0, msg);
    } else if (hostConn && hostConn.open) {
        hostConn.send(JSON.stringify(msg));
    }
}

// ====== PEER SETUP ======
function createRoom() {
    roomCode = generateRoomCode();
    const peerId = ROOM_PREFIX + roomCode;

    showScreen('connecting-screen');

    peer = new Peer(peerId);

    peer.on('open', () => {
        isHost = true;
        myIndex = 0;
        gameState = {
            players: [myName],
            scores: [0],
            roles: [],
            currentRound: 0,
            totalRounds: parseInt(document.getElementById('total-rounds').value) || 5,
            phase: 'lobby',
            revealedCount: 0,
            currentRevealIndex: 0
        };
        connections = [];

        document.getElementById('display-code').textContent = roomCode;
        showScreen('lobby-screen');
        updateLobby(gameState.players);
        updateConnectionStatus(true);
        playClick();
    });

    peer.on('connection', (conn) => {
        conn.on('open', () => {
            if (gameState.players.length >= 4) {
                conn.send(JSON.stringify({ type: 'error', message: 'Room is full!' }));
                conn.close();
                return;
            }
            if (gameState.phase !== 'lobby') {
                conn.send(JSON.stringify({ type: 'error', message: 'Game in progress!' }));
                conn.close();
                return;
            }

            const playerIdx = gameState.players.length;
            connections.push(conn);
            gameState.players.push(conn.metadata.name);
            gameState.scores.push(0);

            conn.send(JSON.stringify({ type: 'joined', playerIndex: playerIdx }));

            // Broadcast lobby update
            hostBroadcast({ type: 'lobby-update', players: gameState.players });

            playJoin();

            conn.on('data', (data) => {
                const msg = JSON.parse(data);
                hostHandleMessage(playerIdx, msg);
            });

            conn.on('close', () => {
                if (gameState.phase !== 'lobby') {
                    hostBroadcast({
                        type: 'player-disconnected',
                        playerName: gameState.players[playerIdx]
                    });
                }
            });
        });
    });

    peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
            showScreen('home-screen');
            showHomeError('Room code taken! Try again.');
        } else {
            console.error('Peer error:', err);
            showScreen('home-screen');
            showHomeError('Connection error. Try again.');
        }
    });
}

function joinRoom(code) {
    const peerId = ROOM_PREFIX + code;
    showScreen('connecting-screen');

    peer = new Peer();

    peer.on('open', () => {
        hostConn = peer.connect(peerId, { metadata: { name: myName } });

        hostConn.on('open', () => {
            updateConnectionStatus(true);
        });

        hostConn.on('data', (data) => {
            const msg = JSON.parse(data);

            if (msg.type === 'joined') {
                myIndex = msg.playerIndex;
                isHost = false;
                roomCode = code;
                document.getElementById('display-code').textContent = code;
                showScreen('lobby-screen');
                playJoin();
            } else if (msg.type === 'error') {
                showScreen('home-screen');
                showHomeError(msg.message);
            } else {
                handleGameMessage(msg);
            }
        });

        hostConn.on('close', () => {
            updateConnectionStatus(false);
            showScreen('home-screen');
            showHomeError('Disconnected from host!');
        });

        hostConn.on('error', () => {
            showScreen('home-screen');
            showHomeError('Could not connect to room!');
        });

        // Timeout if no response
        setTimeout(() => {
            if (myIndex === -1) {
                showScreen('home-screen');
                showHomeError('Room not found! Check the code.');
                if (peer) peer.destroy();
            }
        }, 8000);
    });

    peer.on('error', (err) => {
        console.error('Peer error:', err);
        showScreen('home-screen');
        showHomeError('Connection error. Check code & try again.');
    });
}

function updateConnectionStatus(connected) {
    const el = document.getElementById('connection-status');
    if (connected) {
        el.textContent = '\u{1F7E2} Online';
        el.className = 'connection-status connected';
    } else {
        el.textContent = '\u{1F534} Offline';
        el.className = 'connection-status disconnected';
    }
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
    if (gameState.players.length !== 4) {
        showHomeError('Need exactly 4 players!');
        return;
    }
    playClick();
    gameState.phase = 'playing';
    hostStartRound();
});

document.getElementById('reveal-btn').addEventListener('click', () => {
    if (!myRole) return;
    playReveal();
    const icons = ['\u{1F451}', '\u{1F9D4}', '\u{1F46E}', '\u{1F412}'];
    document.getElementById('role-icon').textContent = icons[myRole.role];
    document.getElementById('role-name').textContent = myRole.roleName;
    document.getElementById('role-points').textContent = myRole.points + ' points';
    document.getElementById('role-card').classList.remove('hidden');
    document.getElementById('reveal-btn').classList.add('hidden');
    document.getElementById('reveal-done-btn').classList.remove('hidden');
});

document.getElementById('reveal-done-btn').addEventListener('click', () => {
    playClick();
    sendToHost({ type: 'reveal-done' });
    showScreen('waiting-screen');
    document.getElementById('waiting-title').textContent = 'Done!';
    document.getElementById('waiting-message').textContent = 'Waiting for others...';
});

document.getElementById('next-round-btn').addEventListener('click', () => {
    playClick();
    sendToHost({ type: 'next-round' });
});

document.getElementById('play-again-btn').addEventListener('click', () => {
    playClick();
    sendToHost({ type: 'play-again' });
});

document.getElementById('player-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('create-btn').click();
});

document.getElementById('room-code').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('join-btn').click();
});
