// ══════════════════════════════════════
//  THÈME ESPACE — fond + effets
// ══════════════════════════════════════

// ── STARFIELD ──
(function () {
    const canvas = document.getElementById('theme-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    const mouse = { x: 0, y: 0 };
    const N = 160;
    const stars = [];

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    function mkStar() {
        return {
            x: Math.random() * W, y: Math.random() * H,
            r: Math.random() * 1.3 + 0.2,
            base: Math.random() * 0.6 + 0.1,
            spd: Math.random() * 0.12 + 0.02,
            t: Math.random() * Math.PI * 2,
            gold: Math.random() < 0.08,
            depth: Math.random() * 0.8 + 0.2
        };
    }

    resize();
    for (let i = 0; i < N; i++) stars.push(mkStar());
    window.addEventListener('resize', resize);

    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

    // Constellation mouse
    window._cm = { x: -9999, y: -9999, active: false };
    window.addEventListener('mousemove', e => { window._cm = { x: e.clientX, y: e.clientY, active: true }; });
    window.addEventListener('mouseleave', () => { window._cm.active = false; });

    // Meteors
    const meteors = [];
    function spawnMeteor() {
        const angle = (15 + Math.random() * 25) * Math.PI / 180;
        meteors.push({
            x: -50 + Math.random() * W * 0.6,
            y: Math.random() * H * 0.4,
            len: 80 + Math.random() * 180,
            speed: 12 + Math.random() * 10,
            angle, life: 1.0,
            decay: 0.018 + Math.random() * 0.012,
            width: 1.5 + Math.random() * 1.5
        });
        setTimeout(spawnMeteor, 15000 + Math.random() * 20000);
    }
    setTimeout(spawnMeteor, 4000 + Math.random() * 8000);

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Stars
        stars.forEach(s => {
            s.t += s.spd * 0.03;
            const twinkle = Math.max(0, s.base + Math.sin(s.t) * 0.28);
            const dx = (mouse.x / W - 0.5) * 14 * s.depth;
            const dy = (mouse.y / H - 0.5) * 14 * s.depth;
            const px = (s.x + dx + W) % W;
            const py = (((s.y + dy - scrollY * 0.025 * s.depth) % H) + H) % H;

            ctx.beginPath();
            ctx.arc(px, py, s.r, 0, Math.PI * 2);
            ctx.fillStyle = s.gold ? `rgba(233,201,124,${twinkle})` : `rgba(190,165,255,${twinkle})`;
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

        // Constellation
        if (window._cm.active) {
            const R = 220;
            stars.forEach(s => {
                const sx = (s.x + (mouse.x / W - 0.5) * 14 * s.depth + W) % W;
                const sy = (((s.y + (mouse.y / H - 0.5) * 14 * s.depth - scrollY * 0.025 * s.depth) % H) + H) % H;
                const dist = Math.hypot(window._cm.x - sx, window._cm.y - sy);
                if (dist < R) {
                    const alpha = (1 - dist / R) * 0.55;
                    ctx.beginPath();
                    ctx.moveTo(window._cm.x, window._cm.y);
                    ctx.lineTo(sx, sy);
                    ctx.strokeStyle = `rgba(180,125,255,${alpha})`;
                    ctx.lineWidth = 1.0;
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(sx, sy, s.r * (1 + (1 - dist / R)), 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(233,201,124,${alpha * 1.5})`;
                    ctx.fill();
                }
            });
        }

        // Meteors
        meteors.forEach((m, i) => {
            m.x += Math.cos(m.angle) * m.speed;
            m.y += Math.sin(m.angle) * m.speed;
            m.life -= m.decay;
            const tx = m.x - Math.cos(m.angle) * m.len;
            const ty = m.y - Math.sin(m.angle) * m.len;
            const g = ctx.createLinearGradient(tx, ty, m.x, m.y);
            g.addColorStop(0, `rgba(255,255,255,0)`);
            g.addColorStop(0.7, `rgba(200,170,255,${m.life * 0.6})`);
            g.addColorStop(1, `rgba(255,255,255,${m.life * 0.9})`);
            ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = g; ctx.lineWidth = m.width * m.life; ctx.stroke();
            const grd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 6);
            grd.addColorStop(0, `rgba(255,255,255,${m.life * 0.8})`);
            grd.addColorStop(1, `rgba(180,125,255,0)`);
            ctx.beginPath(); ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = grd; ctx.fill();
            if (m.life <= 0) meteors.splice(i, 1);
        });

        requestAnimationFrame(draw);
    }
    draw();
})();


    function trigger() {
        const title = document.querySelector('h1.hero-title');
        if (!title) return;
        const spans = title.querySelectorAll('span');
        const target = spans[Math.floor(Math.random() * spans.length)];
        target.classList.add('glitching');
        glitchWord(target, target.textContent);
        setTimeout(() => target.classList.remove('glitching'), 600);
        setTimeout(trigger, 8000 + Math.random() * 4000);
    }
    setTimeout(trigger, 5000);
;