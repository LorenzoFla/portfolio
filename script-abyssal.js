// ══════════════════════════════════════
//  THÈME ABYSSAL — fond + effets
//  Bioluminescence · méduses · bulles · rayons
// ══════════════════════════════════════

(function () {
    const canvas = document.getElementById('theme-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: W / 2, y: H / 2, active: false };
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
    window.addEventListener('mouseleave', () => { mouse.active = false; });

    // ── Particules bioluminescentes ──
    const PARTICLES = 110;
    const particles = Array.from({ length: PARTICLES }, () => mkParticle(true));

    function mkParticle(random = false) {
        const types = ['orb', 'streak', 'spore'];
        return {
            x:    Math.random() * (W || window.innerWidth),
            y:    random ? Math.random() * (H || window.innerHeight) : (H || window.innerHeight) * (0.6 + Math.random() * 0.5),
            vx:   (Math.random() - 0.5) * 0.28,
            vy:   -(0.06 + Math.random() * 0.22),
            r:    1.2 + Math.random() * 3.8,
            t:    Math.random() * Math.PI * 2,
            s:    0.006 + Math.random() * 0.016,
            life: 0.25 + Math.random() * 0.65,
            type: types[Math.floor(Math.random() * types.length)],
            col:  Math.random() > 0.45
                ? `0,${155 + Math.floor(Math.random() * 80)},${215 + Math.floor(Math.random() * 40)}`
                : `0,${210 + Math.floor(Math.random() * 45)},${150 + Math.floor(Math.random() * 80)}`,
            len:  10 + Math.random() * 22,
            angle: Math.random() * Math.PI * 2,
        };
    }

    // ── Méduses ──
    const JELLIES = 5;
    const jellies = Array.from({ length: JELLIES }, () => mkJelly(true));

    function mkJelly(random = false) {
        const cols = [
            { r:'0,196,245',   inner:'80,230,255'  },
            { r:'0,240,180',   inner:'80,255,220'  },
            { r:'120,80,255',  inner:'180,140,255' },
            { r:'0,160,220',   inner:'60,210,255'  },
        ];
        const col = cols[Math.floor(Math.random() * cols.length)];
        const nTentacles = 10 + Math.floor(Math.random() * 8);
        return {
            x:    Math.random(),
            y:    random ? Math.random() * 1.1 : 1.12,
            vx:   (Math.random() - 0.5) * 0.00022,
            vy:   -(0.00018 + Math.random() * 0.00025),
            r:    0.032 + Math.random() * 0.052,
            t:    Math.random() * Math.PI * 2,
            tOffset: Array.from({length: nTentacles}, () => Math.random() * Math.PI * 2),
            s:    0.007 + Math.random() * 0.010,
            alpha: 0.08 + Math.random() * 0.12,
            col:  col.r,
            inner: col.inner,
            nTentacles,
            // Chaque tentacule a sa propre longueur et phase
            tentLens: Array.from({length: nTentacles}, () => 1.2 + Math.random() * 1.4),
        };
    }

    // ── Rayons de lumière descendant ── */
    const rays = Array.from({ length: 6 }, (_, i) => ({
        x:     0.08 + (i / 5) * 0.84,
        w:     0.018 + Math.random() * 0.038,
        alpha: 0.018 + Math.random() * 0.034,
        t:     Math.random() * Math.PI * 2,
        s:     0.003 + Math.random() * 0.005,
    }));

    // ── Bulles ──
    const BUBBLES = 45;
    const bubbles = Array.from({ length: BUBBLES }, () => mkBubble(true));

    function mkBubble(random = false) {
        return {
            x:    Math.random(),
            y:    random ? Math.random() * 1.1 : 1.06,
            r:    1.2 + Math.random() * 4.5,
            vy:   -(0.00028 + Math.random() * 0.00075),
            vx:   (Math.random() - 0.5) * 0.00008,
            t:    Math.random() * Math.PI * 2,
            s:    0.022 + Math.random() * 0.035,
            alpha: 0.09 + Math.random() * 0.22,
        };
    }

    // ── Lueur curseur ── (l'utilisateur devient une anguille électrique)
    let mouseGlowR = 0;

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Fond abyssal en dégradé profond
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0,    '#000408');
        bg.addColorStop(0.35, '#000c1c');
        bg.addColorStop(0.70, '#010e22');
        bg.addColorStop(1,    '#020f28');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

        // Rayons de lumière depuis la surface
        rays.forEach(ray => {
            ray.t += ray.s;
            const a = ray.alpha * (0.82 + Math.sin(ray.t) * 0.18);
            const x = ray.x * W;
            const g = ctx.createLinearGradient(x, 0, x + W * ray.w * 0.25, H * 0.72);
            g.addColorStop(0,   `rgba(0,170,240,${a})`);
            g.addColorStop(0.5, `rgba(0,140,220,${a * 0.35})`);
            g.addColorStop(1,   `rgba(0,90,180,0)`);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x - W * ray.w * 0.55, 0);
            ctx.lineTo(x + W * ray.w * 1.55, 0);
            ctx.lineTo(x + W * ray.w * 0.75, H * 0.78);
            ctx.lineTo(x - W * ray.w * 0.75, H * 0.78);
            ctx.closePath();
            ctx.fillStyle = g; ctx.fill();
            ctx.restore();
        });

        // Lueur de curseur (anguille électrique)
        if (mouse.active) {
            mouseGlowR += (90 - mouseGlowR) * 0.08;
            const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouseGlowR);
            mg.addColorStop(0,   'rgba(0,210,255,0.16)');
            mg.addColorStop(0.5, 'rgba(0,170,240,0.05)');
            mg.addColorStop(1,   'rgba(0,100,200,0)');
            ctx.beginPath(); ctx.arc(mouse.x, mouse.y, mouseGlowR, 0, Math.PI * 2);
            ctx.fillStyle = mg; ctx.fill();
        } else {
            mouseGlowR *= 0.92;
        }

        // Particules bioluminescentes
        particles.forEach((p, i) => {
            p.t  += p.s;
            p.x  += p.vx + Math.sin(p.t * 0.7) * 0.18;
            p.y  += p.vy;

            if (p.y < -0.04 || p.x < -0.06 || p.x > W + 0.06) {
                particles[i] = mkParticle(false);
                return;
            }

            const a  = p.life * Math.max(0.1, 0.55 + Math.sin(p.t) * 0.45);
            const px = p.x, py = p.y;

            if (p.type === 'orb') {
                const grd = ctx.createRadialGradient(px, py, 0, px, py, p.r * 5.5);
                grd.addColorStop(0,   `rgba(${p.col},${a})`);
                grd.addColorStop(0.4, `rgba(${p.col},${a * 0.28})`);
                grd.addColorStop(1,   `rgba(${p.col},0)`);
                ctx.beginPath(); ctx.arc(px, py, p.r * 5.5, 0, Math.PI * 2);
                ctx.fillStyle = grd; ctx.fill();
                ctx.beginPath(); ctx.arc(px, py, p.r * 0.65, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(190,238,255,${a * 0.75})`; ctx.fill();
            } else if (p.type === 'streak') {
                const ex = px + Math.cos(p.angle) * p.len;
                const ey = py + Math.sin(p.angle) * p.len;
                const g  = ctx.createLinearGradient(px, py, ex, ey);
                g.addColorStop(0, `rgba(${p.col},${a * 0.9})`);
                g.addColorStop(1, `rgba(${p.col},0)`);
                ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey);
                ctx.strokeStyle = g; ctx.lineWidth = p.r * 0.45; ctx.stroke();
            } else {
                // spore
                for (let j = 0; j < 4; j++) {
                    const ang = (j / 4) * Math.PI * 2 + p.t;
                    const sr  = p.r * 1.8;
                    ctx.beginPath();
                    ctx.arc(px + Math.cos(ang) * sr, py + Math.sin(ang) * sr, p.r * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${p.col},${a * 0.6})`; ctx.fill();
                }
            }
        });

        // Bulles
        bubbles.forEach((b, i) => {
            b.t  += b.s;
            b.x  += b.vx + Math.sin(b.t * 0.6) * 0.00008;
            b.y  += b.vy;
            if (b.y < -0.02) { bubbles[i] = mkBubble(false); return; }

            const bx = b.x * W, by = b.y * H;
            const a  = b.alpha * (0.8 + Math.sin(b.t * 2) * 0.2);

            ctx.beginPath();
            ctx.arc(bx, by, b.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(80,210,255,${a})`; ctx.lineWidth = 0.55; ctx.stroke();
            // Reflet interne
            ctx.beginPath();
            ctx.arc(bx - b.r * 0.32, by - b.r * 0.3, b.r * 0.32, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,240,255,${a * 0.38})`; ctx.fill();
        });

        // Méduses
        jellies.forEach((j, i) => {
            j.t  += j.s;
            j.x  += j.vx + Math.sin(j.t * 0.3) * 0.00006;
            j.y  += j.vy + Math.sin(j.t * 0.5) * 0.00005;
            if (j.y < -0.22) { jellies[i] = mkJelly(false); return; }

            const jx  = j.x * W;
            const jy  = j.y * H;
            const jr  = j.r * W;
            // Pulsation organique : contraction rapide, extension lente
            const rawPulse = (Math.sin(j.t) + 1) / 2; // 0→1
            const pulse = 0.78 + rawPulse * 0.28;      // 0.78→1.06
            const pjr = jr * pulse;
            const a   = j.alpha;

            ctx.save();

            // ── Halo externe doux ──
            const hg = ctx.createRadialGradient(jx, jy - pjr*0.1, 0, jx, jy, pjr * 2.2);
            hg.addColorStop(0,   `rgba(${j.col},${a * 0.22})`);
            hg.addColorStop(0.4, `rgba(${j.col},${a * 0.08})`);
            hg.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.beginPath(); ctx.arc(jx, jy, pjr * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = hg; ctx.fill();

            // ── Cloche — forme organique (pas un demi-cercle) ──
            ctx.beginPath();
            ctx.moveTo(jx - pjr, jy);
            // Côté gauche
            ctx.bezierCurveTo(
                jx - pjr * 1.05, jy - pjr * 0.3,
                jx - pjr * 0.85, jy - pjr * 0.88,
                jx,              jy - pjr * 0.98
            );
            // Côté droit
            ctx.bezierCurveTo(
                jx + pjr * 0.85, jy - pjr * 0.88,
                jx + pjr * 1.05, jy - pjr * 0.3,
                jx + pjr,        jy
            );
            // Bord ondulé du bas (festonné)
            const festons = 7;
            for (let f = festons; f >= 0; f--) {
                const fx = jx + pjr * (1 - 2 * f / festons);
                const fy = jy + Math.sin(f / festons * Math.PI * 2 + j.t * 2) * pjr * 0.12;
                ctx.lineTo(fx, fy);
            }
            ctx.closePath();

            // Remplissage en couches
            const bellGrad = ctx.createRadialGradient(jx, jy - pjr * 0.4, pjr * 0.1, jx, jy, pjr * 1.1);
            bellGrad.addColorStop(0,   `rgba(${j.inner},${a * 0.55})`);
            bellGrad.addColorStop(0.35, `rgba(${j.col},${a * 0.38})`);
            bellGrad.addColorStop(0.75, `rgba(${j.col},${a * 0.18})`);
            bellGrad.addColorStop(1,   `rgba(${j.col},${a * 0.06})`);
            ctx.fillStyle = bellGrad;
            ctx.fill();

            // Contour nacré
            ctx.strokeStyle = `rgba(${j.inner},${a * 0.55})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // ── Nervures internes (côtes radiales) ──
            const ribs = 6;
            for (let r = 0; r < ribs; r++) {
                const ribAngle = ((r / ribs) - 0.5) * 1.5;
                const rx1 = jx + Math.sin(ribAngle) * pjr * 0.12;
                const ry1 = jy - pjr * 0.05;
                const rx2 = jx + Math.sin(ribAngle) * pjr * 0.85;
                const ry2 = jy - pjr * 0.82;
                ctx.beginPath();
                ctx.moveTo(rx1, ry1);
                ctx.quadraticCurveTo(
                    jx + Math.sin(ribAngle) * pjr * 0.5,
                    jy - pjr * 0.5,
                    rx2, ry2
                );
                ctx.strokeStyle = `rgba(${j.inner},${a * 0.20})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            // ── Organe central (manubrium) ──
            const mGrad = ctx.createRadialGradient(jx, jy - pjr * 0.35, 0, jx, jy - pjr * 0.35, pjr * 0.28);
            mGrad.addColorStop(0,   `rgba(${j.inner},${a * 0.7})`);
            mGrad.addColorStop(0.5, `rgba(${j.col},${a * 0.35})`);
            mGrad.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.ellipse(jx, jy - pjr * 0.35, pjr * 0.18, pjr * 0.28, 0, 0, Math.PI * 2);
            ctx.fillStyle = mGrad;
            ctx.fill();

            // ── Tentacules filiformes ──
            for (let k = 0; k < j.nTentacles; k++) {
                const spread = (k / (j.nTentacles - 1) - 0.5) * 2;
                const tx0 = jx + spread * pjr * 0.92;
                const ty0 = jy + Math.sin(k / j.nTentacles * Math.PI * 2 + j.t * 2) * pjr * 0.10;
                const tLen = pjr * j.tentLens[k];
                const phase = j.tOffset[k];

                // Tentacule en spirale douce avec 3 points de contrôle
                const w1x = tx0 + Math.sin(j.t * 0.7 + phase) * pjr * 0.35;
                const w1y = ty0 + tLen * 0.28;
                const w2x = tx0 + Math.sin(j.t * 0.9 + phase + 1) * pjr * 0.45;
                const w2y = ty0 + tLen * 0.58;
                const w3x = tx0 + Math.sin(j.t * 0.6 + phase + 2) * pjr * 0.30;
                const w3y = ty0 + tLen * 0.88;
                const w4x = tx0 + Math.sin(j.t * 0.8 + phase + 3) * pjr * 0.20;
                const w4y = ty0 + tLen;

                ctx.beginPath();
                ctx.moveTo(tx0, ty0);
                ctx.bezierCurveTo(w1x, w1y, w2x, w2y, w3x, w3y);
                ctx.bezierCurveTo(w3x, w3y, w4x, w4y * 0.96, w4x, w4y);

                // Dégradé sur la longueur du tentacule
                const tg = ctx.createLinearGradient(tx0, ty0, w4x, w4y);
                tg.addColorStop(0,   `rgba(${j.col},${a * 0.55})`);
                tg.addColorStop(0.5, `rgba(${j.col},${a * 0.30})`);
                tg.addColorStop(1,   `rgba(${j.col},0)`);
                ctx.strokeStyle = tg;
                ctx.lineWidth = 0.6 + (1 - k / j.nTentacles) * 0.4;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            ctx.restore();
        });


        // ── Pieuvre géante ──
        if (window._squidState) window._squidDraw(ctx, W, H);

        requestAnimationFrame(draw);
    }
    draw();
})();

// ── GLITCH DISTORTION EAU ──
(function () {
    function trigger() {
        const title = document.querySelector('h1.hero-title');
        if (!title || document.body.classList.contains('konami-mode')) return;
        title.querySelectorAll('span').forEach(span => {
            span.classList.add('glitching');
            setTimeout(() => span.classList.remove('glitching'), 500);
        });
        setTimeout(trigger, 9000 + Math.random() * 7000);
    }
    setTimeout(trigger, 5000);
})();
// ── CRÉATURE DES ABYSSES : CALAMAR GÉANT ──
// Dessinée dans le canvas principal (après le fond, avant les méduses)
(function () {
    function sn(t, seed) {
        return (
            Math.sin(t * 0.0083 + seed * 1.618) * 0.50 +
            Math.sin(t * 0.0197 + seed * 2.718) * 0.30 +
            Math.sin(t * 0.0431 + seed * 3.141) * 0.13 +
            Math.sin(t * 0.0911 + seed * 1.414) * 0.07
        );
    }

    let squid = null;

    function spawnSquid() {
        const fromLeft   = Math.random() > 0.5;
        const baseSize   = Math.min(window.innerWidth, window.innerHeight) * 0.55;
        const size       = baseSize * (0.70 + Math.random() * 0.60);
        const cruise     = 0.75 + Math.random() * 0.40;
        const mantleHalf = size * 0.28;
        const W = window.innerWidth, H = window.innerHeight;
        const startX     = fromLeft ? -mantleHalf : W + mantleHalf;
        const startY     = H * (0.15 + Math.random() * 0.70);
        const totalDist  = W + size * 2.5;
        const lifespan   = totalDist / cruise;

        squid = {
            x: startX, y: startY,
            ang: fromLeft ? 0 : Math.PI,
            size, cruise, fromLeft,
            t: 0, lifespan,
            sa: Math.random() * 100,
            sc: Math.random() * 100,
            alpha: 0, maxAlpha: 0.60,
            surgeCooldown: 150 + Math.random() * 280,
            surgeT: 0, surging: false,
            _arms: makeSquidArms(size),
        };
        window._squidState = squid;
    }

    function scheduleNext() { setTimeout(spawnSquid, 55000 + Math.random() * 60000); }
    setTimeout(spawnSquid, 12000);

    function makeBras(angleLocal, len, nSeg, phaseOff, isHunting) {
        return { angleLocal, len, nSeg, phaseOff, isHunting,
                 pts: Array.from({length: nSeg}, () => ({x:0, y:0})) };
    }

    function updateBras(arm, ox, oy, headAng, t, surging) {
        const {len, nSeg, phaseOff, angleLocal, isHunting} = arm;
        const segL = len / nSeg;
        const waveSpeed = (isHunting ? 0.060 : 0.044) * (surging ? 1.8 : 1.0);
        const waveLen   = isHunting ? 2.8 : 2.1;
        const maxAmp    = surging && isHunting ? 0.40 : (isHunting ? 0.90 : 0.82);
        arm.pts[0].x = ox; arm.pts[0].y = oy;
        for (let i = 1; i < nSeg; i++) {
            const prog   = i / (nSeg - 1);
            const amp    = maxAmp * (0.03 + prog * 0.97);
            const wave   = Math.sin(t * waveSpeed - prog * waveLen + phaseOff) * amp;
            const surgeForward = (surging && isHunting) ? -angleLocal * (1 - prog) * 0.6 : 0;
            const segAng = headAng + angleLocal + wave + surgeForward;
            arm.pts[i].x = arm.pts[i-1].x + Math.cos(segAng) * segL;
            arm.pts[i].y = arm.pts[i-1].y + Math.sin(segAng) * segL;
        }
    }

    function drawBras(ctx, arm, alpha, size) {
        const pts = arm.pts;
        const baseW = arm.isHunting ? size * 0.026 : size * 0.019;
        ctx.save();
        for (let i = 1; i < pts.length; i++) {
            const prog = i / (pts.length - 1);
            const w = baseW * Math.pow(1 - prog, 0.38);
            if (w < 0.25) continue;
            const a = alpha * (arm.isHunting ? 0.55 : 0.42) * (1 - prog * 0.60);
            ctx.beginPath();
            ctx.moveTo(pts[i-1].x, pts[i-1].y);
            ctx.lineTo(pts[i].x,   pts[i].y);
            ctx.strokeStyle = arm.isHunting
                ? `rgba(60,90,120,${a * 0.7})`
                : `rgba(30,50,80,${a * 0.6})`;
            ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke();

        }
        ctx.restore();
    }

    function makeSquidArms(size) {
        const arms = [];
        for (let k = 0; k < 8; k++) {
            const frac = k / 7;
            const al   = (frac - 0.5) * Math.PI * 0.92;
            const dist = Math.abs(frac - 0.5) * 2;
            const len  = size * (0.72 + (1 - dist) * 0.28 + Math.random() * 0.18);
            arms.push(makeBras(al, len, 16, k * (Math.PI * 2 / 8), false));
        }
        arms.push(makeBras(-0.05, size * 2.6, 26, 0.3,  true));
        arms.push(makeBras( 0.05, size * 2.6, 26, 1.7,  true));
        return arms;
    }

    // Exposé au canvas principal
    window._squidDraw = function(ctx, W, H) {
        if (!squid) return;
        const sq = squid;
        sq.t++;
        const progress = sq.t / sq.lifespan;

        sq.surgeCooldown--;
        if (sq.surgeCooldown <= 0 && !sq.surging) {
            sq.surging = true; sq.surgeT = 0;
            sq.surgeCooldown = 180 + Math.random() * 320;
        }
        if (sq.surging) {
            sq.surgeT++;
            if (sq.surgeT > 55) { sq.surging = false; sq.surgeT = 0; }
        }
        const surgeBoost = 1.0;

        const crossAng     = sq.fromLeft ? 0 : Math.PI;
        const lateralDrift = sn(sq.t, sq.sa) * 0.38;
        const toCenter     = (H * 0.5 - sq.y) / H * 0.8;
        const margin       = 0.10;
        let vertBias = sq.y < H * margin ? 0.35 : sq.y > H*(1-margin) ? -0.35 : toCenter * 0.12;
        const targetAng = crossAng + lateralDrift + vertBias;
        let da = targetAng - sq.ang;
        while (da >  Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        sq.ang += da * (sq.surging ? 0.055 : 0.030);

        const speedMod = 0.85 + sn(sq.t, sq.sc) * 0.22;
        sq.x += Math.cos(sq.ang) * sq.cruise * speedMod * surgeBoost;
        sq.y += Math.sin(sq.ang) * sq.cruise * speedMod * surgeBoost;

        if      (progress < 0.05) sq.alpha = Math.min(sq.maxAlpha, sq.alpha + 0.012);
        else if (progress > 0.88) sq.alpha = Math.max(0, sq.alpha - 0.008);
        else                      sq.alpha = Math.min(sq.maxAlpha, sq.alpha + 0.004);

        const out = sq.fromLeft ? sq.x > W + sq.size*2 : sq.x < -sq.size*2;
        if (out || sq.alpha <= 0.001) { squid = null; window._squidState = null; scheduleNext(); return; }

        const {x, y, size: s, alpha, t, ang, surging} = sq;

        const attachX = x - Math.cos(ang) * s * 0.42;
        const attachY = y - Math.sin(ang) * s * 0.42;
        const tentAng = ang + Math.PI;
        sq._arms.forEach(arm => updateBras(arm, attachX, attachY, tentAng, t, surging));

        ctx.save(); ctx.globalAlpha = alpha;

        // Ombre massive
        const shadowR = s * 4.0;
        const shX = x + Math.cos(ang) * s * 0.2, shY = y + Math.sin(ang) * s * 0.2;
        const shadow = ctx.createRadialGradient(shX,shY,0,shX,shY,shadowR);
        shadow.addColorStop(0,   `rgba(0,0,2,${alpha*0.85})`);
        shadow.addColorStop(0.25,`rgba(0,0,3,${alpha*0.60})`);
        shadow.addColorStop(0.6, `rgba(0,0,2,${alpha*0.22})`);
        shadow.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(shX,shY,shadowR,0,Math.PI*2); ctx.fillStyle=shadow; ctx.fill();

        // Bras derrière
        sq._arms.filter(a => !a.isHunting).forEach(arm => drawBras(ctx, arm, alpha, s));

        // Manteau translucide
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang);

        ctx.beginPath();
        ctx.moveTo(s*0.52, 0);
        ctx.bezierCurveTo( s*0.38,-s*0.11,  s*0.06,-s*0.17,-s*0.18,-s*0.16);
        ctx.bezierCurveTo(-s*0.36,-s*0.13, -s*0.50,-s*0.06,-s*0.52,  0);
        ctx.bezierCurveTo(-s*0.50, s*0.06, -s*0.36, s*0.13,-s*0.18, s*0.16);
        ctx.bezierCurveTo( s*0.06, s*0.17,  s*0.38, s*0.11, s*0.52,  0);
        ctx.closePath();
        const bodyG = ctx.createRadialGradient(s*0.10,0,s*0.02,0,0,s*0.58);
        bodyG.addColorStop(0,  'rgba(60,85,120,0.10)');
        bodyG.addColorStop(0.4,'rgba(35,55,90,0.07)');
        bodyG.addColorStop(0.8,'rgba(15,28,55,0.04)');
        bodyG.addColorStop(1,  'rgba(2,6,14,0.02)');
        ctx.fillStyle=bodyG; ctx.fill();
        ctx.strokeStyle='rgba(60,90,130,0.10)'; ctx.lineWidth=1.0; ctx.stroke();

        // Organes internes
        ctx.beginPath(); ctx.ellipse(0,0,s*0.28,s*0.10,0,0,Math.PI*2);
        const organG=ctx.createRadialGradient(s*0.05,0,0,0,0,s*0.30);
        organG.addColorStop(0,'rgba(20,28,45,0.55)'); organG.addColorStop(0.6,'rgba(10,15,28,0.35)'); organG.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=organG; ctx.fill();

        ctx.beginPath(); ctx.ellipse(-s*0.05,s*0.06,s*0.06,s*0.025,-0.3,0,Math.PI*2);
        ctx.fillStyle='rgba(15,22,38,0.40)'; ctx.fill();
        ctx.strokeStyle='rgba(100,125,160,0.15)'; ctx.lineWidth=0.6; ctx.stroke();

        // Veines
        [[[s*0.35,-s*0.04],[s*0.15,-s*0.09],[-s*0.05,-s*0.10],[-s*0.25,-s*0.07]],
         [[s*0.35, s*0.04],[s*0.15, s*0.09],[-s*0.05, s*0.10],[-s*0.25, s*0.07]],
         [[s*0.20,-s*0.12],[s*0.00,-s*0.14],[-s*0.18,-s*0.11]],
         [[s*0.20, s*0.12],[s*0.00, s*0.14],[-s*0.18, s*0.11]]].forEach((v,vi)=>{
            const vA = 0.06+Math.sin(t*0.032+vi*1.8)*0.03;
            ctx.beginPath(); ctx.moveTo(v[0][0],v[0][1]);
            for(let i=1;i<v.length;i++) ctx.lineTo(v[i][0],v[i][1]);
            ctx.strokeStyle=`rgba(130,155,185,${vA})`; ctx.lineWidth=0.5; ctx.stroke();
        });

        // Nageoires
        const fw=Math.sin(t*0.045)*0.055;
        [-1,1].forEach(side=>{
            ctx.beginPath(); ctx.moveTo(-s*0.04,0);
            ctx.bezierCurveTo(-s*0.16,side*s*(0.11+fw),-s*0.33,side*s*(0.22+fw),-s*0.47,side*s*(0.13+fw*0.5));
            ctx.bezierCurveTo(-s*0.31,side*s*0.06,-s*0.12,side*s*0.03,-s*0.04,0);
            ctx.closePath(); ctx.fillStyle='rgba(80,100,130,0.10)'; ctx.fill();
            ctx.strokeStyle='rgba(150,175,205,0.16)'; ctx.lineWidth=0.8; ctx.stroke();
        });

        // Yeux blancs fixes
        [-1,1].forEach(side=>{
            const ex=s*0.17, ey=side*s*0.09, eyeR=s*0.055;
            const halo=ctx.createRadialGradient(ex,ey,0,ex,ey,eyeR*4.0);
            halo.addColorStop(0,'rgba(180,200,220,0.07)'); halo.addColorStop(0.3,'rgba(140,170,200,0.03)'); halo.addColorStop(1,'rgba(0,0,0,0)');
            ctx.beginPath(); ctx.arc(ex,ey,eyeR*4.0,0,Math.PI*2); ctx.fillStyle=halo; ctx.fill();
            const eyeG=ctx.createRadialGradient(ex,ey,0,ex,ey,eyeR);
            eyeG.addColorStop(0,'rgba(200,215,230,0.55)'); eyeG.addColorStop(0.5,'rgba(160,185,210,0.30)'); eyeG.addColorStop(0.85,'rgba(100,135,170,0.12)'); eyeG.addColorStop(1,'rgba(40,70,110,0.04)');
            ctx.beginPath(); ctx.arc(ex,ey,eyeR,0,Math.PI*2); ctx.fillStyle=eyeG; ctx.fill();
        });

        ctx.restore();

        // Tentacules de chasse par-dessus
        sq._arms.filter(a => a.isHunting).forEach(arm => drawBras(ctx, arm, alpha, s));
        ctx.restore();
    };
})();