// ── QUIZ D'INTRO — Sélection de DA ──
(function () {

    const THEMES = {
        espace:   { label: '⭐ Espace',          css: '',                   js: 'script-espace.js'   },
        japon:    { label: '🌿 Jardin Japonais',  css: 'theme-japon.css',    js: 'script-japon.js'    },
        tokyo:    { label: '🤖 Cyber-Tokyo',      css: 'theme-tokyo.css',    js: 'script-tokyo.js'    },
        medieval: { label: '⚔️ Médiéval',         css: 'theme-medieval.css', js: 'script-medieval.js' },
        abyssal:  { label: '🌊 Abyssal',          css: 'theme-abyssal.css',  js: 'script-abyssal.js'  },
        game:     { label: '🎮 Jeu Vidéo',        css: 'theme-game.css',     js: 'script-game.js'     },
    };

    const QUESTIONS = [
        {
            q: 'Il est minuit. Vous êtes seul. Qu\'est-ce qui vous attire ?',
            answers: [
                { text: 'Regarder les étoiles depuis un toit',         scores: { espace: 3, japon: 1 } },
                { text: 'Marcher dans une forêt silencieuse',           scores: { japon: 3, medieval: 1 } },
                { text: 'Explorer une ville qui ne dort jamais',        scores: { tokyo: 3, espace: 1 } },
                { text: 'Lire une vieille carte aux chandelles',        scores: { medieval: 3, japon: 1 } },
            ]
        },
        {
            q: 'Vous devez résoudre un problème complexe. Votre approche ?',
            answers: [
                { text: 'Calculer, modéliser, itérer — méthode pure',  scores: { espace: 3, tokyo: 1 } },
                { text: 'Méditer, laisser la solution émerger',         scores: { japon: 3, medieval: 1 } },
                { text: 'Tout hacker jusqu\'à ce que ça marche',       scores: { tokyo: 3, espace: 1 } },
                { text: 'Chercher dans les archives, les anciens',      scores: { medieval: 3, japon: 1 } },
            ]
        },
        {
            q: 'Votre esthétique idéale ?',
            answers: [
                { text: 'Minimalisme cosmique — violet, or, infini',   scores: { espace: 3 } },
                { text: 'Zen — encre noire, pierre, bambou, silence',  scores: { japon: 3 } },
                { text: 'Néons dans le brouillard — kanji, néon, pluie', scores: { tokyo: 3 } },
                { text: 'Pierre taillée, parchemin, feu de forge',     scores: { medieval: 3 } },
            ]
        },
        {
            q: 'Dernière question — votre rapport au temps ?',
            answers: [
                { text: 'Le futur m\'obsède — je veux le construire',  scores: { espace: 3, tokyo: 1 } },
                { text: 'L\'instant présent est tout ce qui compte',   scores: { japon: 3 } },
                { text: 'Le présent ultra-rapide, tout va trop vite',  scores: { tokyo: 3, espace: 1 } },
                { text: 'Le passé porte des secrets qu\'on a oubliés', scores: { medieval: 3, japon: 1 } },
            ]
        },
    ];

    // ── Check si déjà joué ──
    const saved = sessionStorage.getItem('lf_theme');
    if (saved && THEMES[saved]) { applyTheme(saved, false); return; }

    // ══════════════════════════════════════
    //  ÉTAT INTERNE
    // ══════════════════════════════════════
    let currentQ          = 0;
    const scores          = { espace: 0, japon: 0, tokyo: 0, medieval: 0 };
    let konamiGamePending = false; // flag posé si konami tapé pendant le quiz

    // ── Build overlay ──
    const overlay = document.createElement('div');
    overlay.id = 'quiz-overlay';
    overlay.innerHTML = `
        <div id="quiz-box">
            <div id="quiz-progress"><div id="quiz-progress-bar"></div></div>
            <div id="quiz-counter">01 / 04</div>
            <div id="quiz-question"></div>
            <div id="quiz-answers"></div>
            <div id="quiz-skip">Passer le quiz →</div>
        </div>
        <canvas id="quiz-bg"></canvas>
    `;
    document.body.appendChild(overlay);

    // ── Konami : listener UNIQUEMENT pendant que l'overlay est ouvert ──
    // Ne change rien immédiatement — pose juste un flag interne.
    // La DA Jeu Vidéo n'est révélée qu'à la fin du quiz, dans finish().
    const KONAMI_SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let konamiIdx = 0;

    function onKonamiKey(e) {
        konamiIdx = (e.key === KONAMI_SEQ[konamiIdx])
            ? konamiIdx + 1
            : (e.key === KONAMI_SEQ[0] ? 1 : 0);

        if (konamiIdx < KONAMI_SEQ.length) return;
        konamiIdx = 0;
        if (konamiGamePending) return; // déjà activé

        konamiGamePending = true;

        // Feedback pixel subtil sur la progress bar (sans spoiler)
        const bar = overlay.querySelector('#quiz-progress-bar');
        if (bar) {
            const orig = bar.style.background;
            bar.style.transition = 'background 0.15s';
            bar.style.background = 'linear-gradient(90deg,#a855f7,#f59e0b,#ef4444)';
            setTimeout(() => { bar.style.background = orig; }, 500);
        }
    }

    document.addEventListener('keydown', onKonamiKey);

    // ── Init ──
    initQuizBg();
    renderQuestion();

    overlay.querySelector('#quiz-skip').addEventListener('click', () => {
        applyTheme('espace', true);
        closeOverlay();
    });

    // ══════════════════════════════════════
    //  QUIZ LOGIC
    // ══════════════════════════════════════

    function renderQuestion() {
        const q   = QUESTIONS[currentQ];
        const qEl = overlay.querySelector('#quiz-question');
        const aEl = overlay.querySelector('#quiz-answers');
        const cEl = overlay.querySelector('#quiz-counter');
        const pEl = overlay.querySelector('#quiz-progress-bar');

        cEl.textContent = String(currentQ + 1).padStart(2, '0') + ' / 0' + QUESTIONS.length;
        pEl.style.width = ((currentQ / QUESTIONS.length) * 100) + '%';

        qEl.style.opacity   = '0';
        qEl.style.transform = 'translateY(12px)';
        aEl.style.opacity   = '0';
        aEl.innerHTML       = '';

        setTimeout(() => {
            qEl.textContent      = q.q;
            qEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            qEl.style.opacity    = '1';
            qEl.style.transform  = 'translateY(0)';

            q.answers.forEach((ans, i) => {
                const btn = document.createElement('button');
                btn.className   = 'quiz-ans';
                btn.textContent = ans.text;
                btn.style.animationDelay = (i * 0.08) + 's';
                btn.addEventListener('click', () => pick(ans.scores));
                aEl.appendChild(btn);
            });

            aEl.style.transition = 'opacity 0.4s ease 0.15s';
            aEl.style.opacity    = '1';
        }, 180);
    }

    function pick(s) {
        Object.entries(s).forEach(([k, v]) => { if (k in scores) scores[k] += v; });
        currentQ++;
        if (currentQ >= QUESTIONS.length) finish();
        else renderQuestion();
    }

    function finish() {
        let winner;

        if (konamiGamePending) {
            // Konami tapé pendant le quiz → Jeu Vidéo, quoi que les réponses aient dit
            winner = 'game';
        } else {
            // Thème secret Abyssal si toutes les réponses principales ont été cochées
            const allTouched = ['espace','japon','tokyo','medieval'].every(k => scores[k] >= 3);
            winner = allTouched
                ? 'abyssal'
                : Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
        }

        const theme = THEMES[winner];
        const box   = overlay.querySelector('#quiz-box');
        box.style.transition = 'opacity 0.3s';
        box.style.opacity    = '0';

        setTimeout(() => {
            if (winner === 'game') {
                // Écran résultat spécial — saveur pixel/cheat code
                box.innerHTML = `
                    <div id="quiz-result">
                        <div class="qr-label" style="
                            color:#f59e0b;
                            border-color:rgba(245,158,11,0.32);
                            background:rgba(245,158,11,0.07);
                            font-family:monospace;
                            letter-spacing:.2em;
                            font-size:.62rem;
                        ">↑↑↓↓←→←→BA</div>
                        <div class="qr-theme" style="
                            background:linear-gradient(115deg,#a855f7 0%,#f59e0b 48%,#ef4444 100%);
                            -webkit-background-clip:text;
                            background-clip:text;
                            -webkit-text-fill-color:transparent;
                        ">${theme.label}</div>
                        <div class="qr-sub">— Secret débloqué — Chargement…</div>
                        <div class="qr-bar" style="background:rgba(168,85,247,0.14);">
                            <div class="qr-bar-fill" style="
                                background:linear-gradient(90deg,#a855f7,#f59e0b,#ef4444);
                                transition:width 1.5s cubic-bezier(0.4,0,0.2,1);
                            "></div>
                        </div>
                    </div>
                `;
                box.style.borderColor = 'rgba(245,158,11,0.35)';
                box.style.boxShadow   = '0 0 80px rgba(168,85,247,0.14), 0 0 160px rgba(245,158,11,0.06)';
            } else {
                box.innerHTML = `
                    <div id="quiz-result">
                        <div class="qr-label">Votre univers</div>
                        <div class="qr-theme">${theme.label}</div>
                        <div class="qr-sub">Chargement de votre expérience…</div>
                        <div class="qr-bar"><div class="qr-bar-fill"></div></div>
                    </div>
                `;
            }

            box.style.opacity = '1';
            setTimeout(() => { box.querySelector('.qr-bar-fill').style.width = '100%'; }, 100);
            setTimeout(() => {
                sessionStorage.setItem('lf_theme', winner);
                applyTheme(winner, true);
                closeOverlay();
            }, 1800);
        }, 350);
    }

    function closeOverlay() {
        // Supprimer le listener — le quiz est terminé, le konami n'a plus d'effet ici
        document.removeEventListener('keydown', onKonamiKey);

        overlay.style.transition = 'opacity 0.7s ease';
        overlay.style.opacity    = '0';
        setTimeout(() => overlay.remove(), 750);
    }

    function applyTheme(name, animate) {
        const link = document.getElementById('theme-css');
        if (link) link.href = (name === 'espace') ? '' : (THEMES[name]?.css || '');
        document.body.dataset.theme = name;

        const existing = document.getElementById('theme-script-loaded');
        if (existing) existing.remove();
        const s = document.createElement('script');
        s.id  = 'theme-script-loaded';
        s.src = THEMES[name]?.js || 'script-espace.js';
        document.body.appendChild(s);
    }

    function initQuizBg() {
        const c   = overlay.querySelector('#quiz-bg');
        const ctx = c.getContext('2d');
        c.width   = window.innerWidth;
        c.height  = window.innerHeight;
        const stars = Array.from({ length: 120 }, () => ({
            x: Math.random() * c.width, y: Math.random() * c.height,
            r: Math.random() * 1.2 + 0.2, t: Math.random() * Math.PI * 2,
            s: Math.random() * 0.04 + 0.01,
        }));
        function draw() {
            ctx.clearRect(0, 0, c.width, c.height);
            stars.forEach(s => {
                s.t += s.s;
                const a = Math.max(0, 0.15 + Math.sin(s.t) * 0.25);
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(180,150,255,${a})`; ctx.fill();
            });
            requestAnimationFrame(draw);
        }
        draw();
    }

})();