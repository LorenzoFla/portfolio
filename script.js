// ── STARFIELD ──
(function() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, stars = [];
    const mouse = { x: 0, y: 0 };
    const N = 160;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function mkStar() {
        return {
            x:    Math.random() * W,
            y:    Math.random() * H,
            r:    Math.random() * 1.3 + 0.2,
            base: Math.random() * 0.6 + 0.1,
            spd:  Math.random() * 0.12 + 0.02,
            t:    Math.random() * Math.PI * 2,
            gold: Math.random() < 0.08,
            depth: Math.random() * 0.8 + 0.2
        };
    }

    resize();
    for (let i = 0; i < N; i++) stars.push(mkStar());
    window.addEventListener('resize', () => { resize(); });

    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

    function draw() {
        ctx.clearRect(0, 0, W, H);
        stars.forEach(s => {
            s.t += s.spd * 0.03;
            const twinkle = Math.max(0, s.base + Math.sin(s.t) * 0.28);
            const dx = (mouse.x / W - 0.5) * 14 * s.depth;
            const dy = (mouse.y / H - 0.5) * 14 * s.depth;
            const px = (s.x + dx + W) % W;
            const rawY = s.y + dy - scrollY * 0.025 * s.depth;
            const py = ((rawY % H) + H) % H;

            ctx.beginPath();
            ctx.arc(px, py, s.r, 0, Math.PI * 2);
            ctx.fillStyle = s.gold
                ? `rgba(233,201,124,${twinkle})`
                : `rgba(190,165,255,${twinkle})`;
            ctx.fill();

            if (s.r > 1.0) {
                const grd = ctx.createRadialGradient(px, py, 0, px, py, s.r * 3);
                const col = s.gold ? '233,201,124' : '160,100,255';
                grd.addColorStop(0, `rgba(${col},0.15)`);
                grd.addColorStop(1, `rgba(${col},0)`);
                ctx.beginPath();
                ctx.arc(px, py, s.r * 3, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
            }
        });
        requestAnimationFrame(draw);
    }
    draw();
})();

// ── TYPING EFFECT ──
const dtEl = document.getElementById('dynamic-text');
const phrases = [
    'Développeur en devenir',
    'Curieux, rigoureux, passionné',
    'Erasmus au Japon — NIT Gifu',
    'Prêt pour de nouveaux défis'
];
let pi = 0, ci = 0, del = false;

function type() {
    const cur = phrases[pi];
    dtEl.textContent = del ? cur.substring(0, ci--) : cur.substring(0, ci++);
    if (!del && ci === cur.length + 1) { del = true; setTimeout(type, 2000); return; }
    if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
    setTimeout(type, del ? 42 : 88);
}
type();

// ── LIGHT MODE + RAINBOW EASTER EGG ──
const nmcb = document.getElementById('nmcb');
let count = 0, rto;

nmcb.addEventListener('change', () => {
    document.body.classList.toggle('light-mode');
    count++;
    clearTimeout(rto);
    rto = setTimeout(() => count = 0, 350);
    if (count >= 6) {
        document.body.classList.add('rainbow-mode');
        nmcb.disabled = true;
        setTimeout(() => {
            document.body.classList.remove('rainbow-mode');
            document.body.style.background = '';
            nmcb.disabled = false;
            nmcb.checked = false;
            document.body.classList.remove('light-mode');
            count = 0;
        }, 5000);
    }
});

// ── MAGIC BUTTON — activé uniquement par Ctrl+B ──
const mb = document.getElementById('magic-button');
let gameOn = false;

document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        gameOn = true;
        mb.classList.add('active');
    }
});

mb.addEventListener('mouseover', () => {
    if (!gameOn) return;
    const rx = Math.random() * (window.innerWidth - mb.offsetWidth - 20);
    const ry = Math.random() * (window.innerHeight - mb.offsetHeight - 20) + window.scrollY;
    mb.style.position = 'absolute';
    mb.style.left = rx + 'px';
    mb.style.top  = ry + 'px';
    mb.classList.add('moving');
});

mb.addEventListener('click', () => {
    if (gameOn) window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
});

// ── SCROLL REVEAL ──
const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.07 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ── GLITCH EFFECT ──
(function () {
    const glitchChars = '!<>-_\\/[]{}—=+*^?#@$%&ABCDEFアイウエオカキクケコ';

    function glitchWord(el, originalText) {
        let iterations = 0;
        const maxIter = 10;
        const interval = setInterval(() => {
            el.textContent = originalText
                .split('')
                .map((char, i) => {
                    if (char === ' ') return ' ';
                    if (i < iterations) return originalText[i];
                    return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                })
                .join('');
            iterations += 0.6;
            if (iterations >= originalText.length) {
                el.textContent = originalText;
                clearInterval(interval);
            }
        }, 40);
    }

    function triggerGlitch() {
        const title = document.querySelector('h1.hero-title');
        if (!title || document.body.classList.contains('konami-mode')) return;

        const spans = title.querySelectorAll('span');
        const target = spans[Math.floor(Math.random() * spans.length)];
        const original = target.textContent;

        // Visual glitch flicker
        target.classList.add('glitching');

        // Run char scramble
        glitchWord(target, original);

        // CSS glitch animation burst
        setTimeout(() => target.classList.remove('glitching'), 600);

        // Schedule next glitch: 8–12 seconds randomly
        setTimeout(triggerGlitch, 8000 + Math.random() * 4000);
    }

    // Start after 5s
    setTimeout(triggerGlitch, 5000);
})();

// ── KONAMI CODE ── ↑↑↓↓←→←→BA
(function () {
    const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let idx = 0;
    let active = false;

    document.addEventListener('keydown', e => {
        if (e.key === KONAMI[idx]) {
            idx++;
            if (idx === KONAMI.length) { idx = 0; active ? deactivateKonami() : activateKonami(); }
        } else {
            idx = e.key === KONAMI[0] ? 1 : 0;
        }
    });

    function activateKonami() {
        active = true;
        document.body.classList.add('konami-mode');

        // ── 1. FLASH BLANC brutal
        const flash = document.createElement('div');
        flash.id = 'konami-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 400);

        // ── 2. MESSAGE ÉPIQUE centré
        const msg = document.createElement('div');
        msg.id = 'konami-msg';
        msg.innerHTML = `
            <div class="km-top">⚡ KONAMI UNLOCKED ⚡</div>
            <div class="km-name">Lorenzo Flagothier</div>
            <div class="km-sub">— Mode secret activé —</div>
            <div class="km-hint">Retape le code pour désactiver</div>
        `;
        document.body.appendChild(msg);

        // ── 3. Scramble TOUT le texte visible
        document.querySelectorAll('h2.s-title, h3, .s-eyebrow').forEach(el => {
            const orig = el.innerHTML;
            el.dataset.origHtml = orig;
            let i = 0;
            const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ!@#$%^&*<>/\\';
            const iv = setInterval(() => {
                if (i > 18) { el.innerHTML = orig; clearInterval(iv); return; }
                el.textContent = orig.replace(/<[^>]+>/g, '').split('').map(c =>
                    c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]
                ).join('');
                i++;
            }, 55);
        });

        // ── 4. Faire exploser les skill cards en vagues
        const skills = document.querySelectorAll('.skill');
        skills.forEach((s, i) => {
            setTimeout(() => {
                s.classList.add('konami-skill-pop');
                setTimeout(() => s.classList.remove('konami-skill-pop'), 600);
            }, i * 80);
        });

        // ── 5. Faire vibrer les projets
        document.querySelectorAll('.proj').forEach((p, i) => {
            setTimeout(() => p.classList.add('konami-proj-shake'), i * 120);
            setTimeout(() => p.classList.remove('konami-proj-shake'), i * 120 + 500);
        });

        // ── 6. Timeline dots explosent
        document.querySelectorAll('.tl-dot').forEach((d, i) => {
            setTimeout(() => d.classList.add('konami-dot-explode'), i * 150);
        });

        // ── 7. Particules qui explosent depuis le centre
        spawnKonamiParticles();

        // Auto-off after 15s
        setTimeout(() => { if (active) deactivateKonami(); }, 15000);
    }

    function deactivateKonami() {
        active = false;
        document.body.classList.remove('konami-mode');
        const msg = document.getElementById('konami-msg');
        if (msg) { msg.classList.add('leaving'); setTimeout(() => msg.remove(), 500); }
        document.querySelectorAll('.konami-dot-explode').forEach(el => el.classList.remove('konami-dot-explode'));

        // Exit flash
        const flash = document.createElement('div');
        flash.id = 'konami-flash';
        flash.style.background = 'rgba(124,58,237,0.3)';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }

    function spawnKonamiParticles() {
        const container = document.createElement('div');
        container.id = 'konami-particles';
        document.body.appendChild(container);

        const colors = ['#b47dff','#e9c97c','#f472b6','#dbbfff','#fff'];
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2 + window.scrollY;

        for (let i = 0; i < 80; i++) {
            const p = document.createElement('div');
            p.className = 'kp';
            const angle = (i / 80) * Math.PI * 2;
            const dist = 120 + Math.random() * 280;
            const size = 3 + Math.random() * 7;
            const dur = 0.6 + Math.random() * 0.8;
            const color = colors[Math.floor(Math.random() * colors.length)];
            p.style.cssText = `
                left:${cx}px; top:${cy}px;
                width:${size}px; height:${size}px;
                background:${color};
                --tx:${Math.cos(angle) * dist}px;
                --ty:${Math.sin(angle) * dist}px;
                animation: kp-fly ${dur}s cubic-bezier(0.2,0,0.8,1) forwards;
                animation-delay:${Math.random() * 0.2}s;
            `;
            container.appendChild(p);
        }
        setTimeout(() => container.remove(), 2000);
    }
})();

// ── SMOOTH SCROLL CINÉMATIQUE ──
(function () {
    let current = window.scrollY;
    let target  = window.scrollY;
    let raf;

    window.addEventListener('wheel', e => {
        e.preventDefault();
        target += e.deltaY * 0.9;
        target = Math.max(0, Math.min(target, document.body.scrollHeight - window.innerHeight));
        if (!raf) loop();
    }, { passive: false });

    // Touch support
    let touchY = 0;
    window.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', e => {
        const dy = touchY - e.touches[0].clientY;
        touchY = e.touches[0].clientY;
        target += dy * 1.2;
        target = Math.max(0, Math.min(target, document.body.scrollHeight - window.innerHeight));
        if (!raf) loop();
    }, { passive: true });

    function loop() {
        current += (target - current) * 0.1;
        if (Math.abs(target - current) < 0.5) { current = target; raf = null; }
        else raf = requestAnimationFrame(loop);
        window.scrollTo(0, current);
    }
})();

// ── MAGNETIC HOVER ──
(function () {
    const targets = [
        ...document.querySelectorAll('.btn'),
        ...document.querySelectorAll('.cc'),
        ...document.querySelectorAll('.skill'),
        ...document.querySelectorAll('.proj-link'),
    ];

    targets.forEach(el => {
        el.addEventListener('mousemove', e => {
            const r   = el.getBoundingClientRect();
            const cx  = r.left + r.width  / 2;
            const cy  = r.top  + r.height / 2;
            const dx  = (e.clientX - cx) * 0.28;
            const dy  = (e.clientY - cy) * 0.28;
            el.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
})();

// ── CONSTELLATION ──
(function () {
    // Extend starfield canvas to draw connection lines near mouse
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    // We'll hook into the existing draw loop via a shared mouse ref
    // Instead, override by storing mouse position globally for starfield to use
    window._constellationMouse = { x: -9999, y: -9999, active: false };

    window.addEventListener('mousemove', e => {
        window._constellationMouse = { x: e.clientX, y: e.clientY, active: true };
    });
    window.addEventListener('mouseleave', () => {
        window._constellationMouse.active = false;
    });
})();

// ── METEOR SHOWER ──
(function () {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    window._meteors = [];

    function spawnMeteor() {
        const angle = (15 + Math.random() * 25) * Math.PI / 180;
        window._meteors.push({
            x:     -50 + Math.random() * window.innerWidth * 0.6,
            y:     Math.random() * window.innerHeight * 0.4,
            len:   80 + Math.random() * 180,
            speed: 12 + Math.random() * 10,
            angle,
            life:  1.0,
            decay: 0.018 + Math.random() * 0.012,
            width: 1.5 + Math.random() * 1.5
        });
        const next = 15000 + Math.random() * 20000;
        setTimeout(spawnMeteor, next);
    }
    setTimeout(spawnMeteor, 4000 + Math.random() * 8000);
})();

// ── STARFIELD UPGRADÉ (constellation + météores + warp) ──
// On réécrit la boucle de rendu du starfield pour intégrer tout ça
(function () {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    // Stop the old draw loop by replacing it — we inject into the global RAF
    // The original starfield already runs; we add a second canvas overlay
    const overlay = document.createElement('canvas');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;width:100%;height:100%;';
    document.body.insertBefore(overlay, canvas.nextSibling);
    const ctx = overlay.getContext('2d');

    function resize() { overlay.width = window.innerWidth; overlay.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    // Access stars from the original starfield — we re-expose them
    // Since they're in a closure, we rebuild a lighter star array for overlay use
    const stars = [];
    function mkStar() {
        return {
            x: Math.random() * overlay.width,
            y: Math.random() * overlay.height,
            r: Math.random() * 1.2 + 0.3,
        };
    }
    for (let i = 0; i < 160; i++) stars.push(mkStar());

    function drawOverlay() {
        const W = overlay.width, H = overlay.height;
        ctx.clearRect(0, 0, W, H);
        const scroll = window.scrollY;
        const cm = window._constellationMouse || { x: -9999, y: -9999, active: false };

        // ── Constellation lines ──
        if (cm.active) {
            const RADIUS = 220;
            stars.forEach(s => {
                const sx = s.x;
                const sy = ((s.y - scroll * 0.025 * s.r) % H + H) % H;
                const dx = cm.x - sx;
                const dy = cm.y - sy;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < RADIUS) {
                    const alpha = (1 - dist / RADIUS) * 0.55;
                    ctx.beginPath();
                    ctx.moveTo(cm.x, cm.y);
                    ctx.lineTo(sx, sy);
                    ctx.strokeStyle = `rgba(180,125,255,${alpha})`;
                    ctx.lineWidth = 1.0;
                    ctx.stroke();
                    // dot glow on connected star
                    ctx.beginPath();
                    ctx.arc(sx, sy, s.r * (1 + (1 - dist/RADIUS)), 0, Math.PI*2);
                    ctx.fillStyle = `rgba(233,201,124,${alpha * 1.5})`;
                    ctx.fill();
                }
            });
        }

        // ── Meteors ──
        const meteors = window._meteors || [];
        meteors.forEach((m, i) => {
            m.x += Math.cos(m.angle) * m.speed;
            m.y += Math.sin(m.angle) * m.speed;
            m.life -= m.decay;

            const tailX = m.x - Math.cos(m.angle) * m.len;
            const tailY = m.y - Math.sin(m.angle) * m.len;
            const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
            grad.addColorStop(0, `rgba(255,255,255,0)`);
            grad.addColorStop(0.7, `rgba(200,170,255,${m.life * 0.6})`);
            grad.addColorStop(1, `rgba(255,255,255,${m.life * 0.9})`);
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = m.width * m.life;
            ctx.stroke();

            // Glow head
            const grd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 6);
            grd.addColorStop(0, `rgba(255,255,255,${m.life * 0.8})`);
            grd.addColorStop(1, `rgba(180,125,255,0)`);
            ctx.beginPath();
            ctx.arc(m.x, m.y, 6, 0, Math.PI*2);
            ctx.fillStyle = grd;
            ctx.fill();

            if (m.life <= 0) meteors.splice(i, 1);
        });


        requestAnimationFrame(drawOverlay);
    }
    drawOverlay();
})();

// ── CYBER-TOKYO : Pluie de katakana ──
(function () {
    function initKatakanaRain() {
        if (document.body.dataset.theme !== 'tokyo') return;
        const existing = document.getElementById('katakana-rain');
        if (existing) return;

        const rain = document.createElement('div');
        rain.id = 'katakana-rain';
        document.body.appendChild(rain);

        const kana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const cols = Math.floor(window.innerWidth / 28);
        for (let i = 0; i < cols; i++) {
            const col = document.createElement('div');
            col.className = 'kana-col';
            col.style.left = (i * 28 + Math.random() * 14) + 'px';
            col.style.animationDuration = (8 + Math.random() * 16) + 's';
            col.style.animationDelay = (-Math.random() * 20) + 's';
            const len = 6 + Math.floor(Math.random() * 14);
            col.textContent = Array.from({length:len}, () => kana[Math.floor(Math.random()*kana.length)]).join('\n');
            rain.appendChild(col);
        }
    }

    // Run on load + observe theme changes
    window.addEventListener('load', initKatakanaRain);
    const obs = new MutationObserver(() => initKatakanaRain());
    obs.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
})();

// ── BOUTON RESET THÈME ──
(function () {
    const btn = document.createElement('button');
    btn.id = 'theme-reset-btn';
    btn.title = 'Changer de thème';
    btn.textContent = '◈';
    btn.addEventListener('click', () => {
        sessionStorage.removeItem('lf_theme');
        location.reload();
    });
    document.body.appendChild(btn);
})();
