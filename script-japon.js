// Données bambou pré-générées une seule fois
let _bambooData = null, _bambooW = 0, _bambooH = 0;
function getBambooData(W, H) {
    if (_bambooData && _bambooW === W && _bambooH === H) return _bambooData;
    _bambooData = null; _bambooW = W; _bambooH = H;
    const stalkDefs = [
        { x: 0.87, w: 6,  segs: 9,  lean:  0.003, leaf: -1, alpha: 0.85 },
        { x: 0.91, w: 9,  segs: 8,  lean: -0.002, leaf:  1, alpha: 0.90 },
        { x: 0.95, w: 7,  segs: 10, lean:  0.004, leaf: -1, alpha: 0.80 },
        { x: 0.985,w: 5,  segs: 7,  lean:  0.001, leaf:  1, alpha: 0.65 },
        { x: 0.025,w: 5,  segs: 7,  lean: -0.001, leaf: -1, alpha: 0.65 },
        { x: 0.06, w: 8,  segs: 9,  lean:  0.002, leaf:  1, alpha: 0.88 },
        { x: 0.10, w: 6,  segs: 8,  lean: -0.003, leaf: -1, alpha: 0.78 },
    ];
    // Pré-générer les feuilles avec valeurs fixes
    _bambooData = stalkDefs.map(b => ({
        ...b,
        leaves: Array.from({ length: b.segs }, (_, i) => {
            if (i % 2 === 0) return null;
            const leafCount = 2 + (i % 2);
            return Array.from({ length: leafCount }, (_, k) => ({
                side: k % 2 === 0 ? b.leaf : -b.leaf,
                baseAngle: (k % 2 === 0 ? b.leaf : -b.leaf) * (0.35 + k * 0.18),
                len: 28 + (k * 7 + i * 3) % 22, // déterministe
                curve: (k % 2 === 0 ? b.leaf : -b.leaf) * 12,
                offsetK: k,
            }));
        })
    }));
    return _bambooData;
}

function drawBamboo(ctx, W, H) {
    const stalks = getBambooData(W, H);

    stalks.forEach(b => {
        const baseX = b.x * W;
        const segH  = H / b.segs;
        const hw    = b.w / 2;

        // ── Tige : segments arrondis avec gradient ──
        for (let i = 0; i < b.segs; i++) {
            const lean = b.lean * i * segH;
            const cx   = baseX + lean;
            const yBot = H - i * segH;
            const yTop = H - (i + 1) * segH;
            const segLen = segH * 0.91;

            // Gradient latéral (reflet de lumière sur le cylindre)
            const grad = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
            grad.addColorStop(0,    `rgba(8,22,12,${b.alpha * 0.9})`);
            grad.addColorStop(0.25, `rgba(22,50,28,${b.alpha})`);
            grad.addColorStop(0.55, `rgba(35,72,38,${b.alpha * 0.95})`);
            grad.addColorStop(0.78, `rgba(18,42,22,${b.alpha * 0.85})`);
            grad.addColorStop(1,    `rgba(6,16,9,${b.alpha * 0.8})`);

            // Corps du segment avec coins arrondis (bezier)
            ctx.beginPath();
            ctx.moveTo(cx - hw + 1, yBot);
            ctx.lineTo(cx + hw - 1, yBot);
            ctx.lineTo(cx + hw,     yBot - segLen);
            ctx.lineTo(cx - hw,     yBot - segLen);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();

            // ── Nœud (anneau inter-segment) ──
            const ny = yBot - segLen;
            ctx.beginPath();
            ctx.ellipse(cx, ny, hw + 2.5, 3, 0, 0, Math.PI * 2);
            const nodeGrad = ctx.createLinearGradient(cx - hw - 2, ny, cx + hw + 2, ny);
            nodeGrad.addColorStop(0,    `rgba(5,15,8,${b.alpha * 0.9})`);
            nodeGrad.addColorStop(0.4,  `rgba(28,60,32,${b.alpha})`);
            nodeGrad.addColorStop(0.7,  `rgba(45,85,48,${b.alpha * 0.9})`);
            nodeGrad.addColorStop(1,    `rgba(8,20,10,${b.alpha * 0.85})`);
            ctx.fillStyle = nodeGrad;
            ctx.fill();

            // Trait supérieur du nœud (relief)
            ctx.beginPath();
            ctx.ellipse(cx, ny - 1.5, hw + 1.5, 2, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(55,100,55,${b.alpha * 0.3})`;
            ctx.fill();
        }

        // ── Feuilles naturelles (pré-générées, stables) ──
        for (let i = 1; i < b.segs; i++) {
            if (i % 2 === 0) continue;
            const leafDefs = b.leaves[i];
            if (!leafDefs) continue;
            const lean  = b.lean * i * segH;
            const cx    = baseX + lean;
            const nodeY = H - i * segH;
            for (let k = 0; k < leafDefs.length; k++) {
                const { side, baseAngle, len, curve, offsetK: ok } = leafDefs[k];

                ctx.save();
                ctx.translate(cx, nodeY);
                ctx.rotate(baseAngle - 0.1 * ok);

                // Forme de feuille de bambou : pointue aux deux extrémités
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(
                    curve * 0.3, -len * 0.3,
                    side * (8 + ok * 3), -len * 0.7,
                    side * 4, -len
                );
                ctx.bezierCurveTo(
                    side * 2, -len * 0.85,
                    -curve * 0.2, -len * 0.5,
                    0, 0
                );
                ctx.closePath();

                // Gradient feuille (plus clair au centre)
                const leafGrad = ctx.createLinearGradient(0, 0, side * 8, -len);
                leafGrad.addColorStop(0,    `rgba(12,35,16,${b.alpha * 0.85})`);
                leafGrad.addColorStop(0.4,  `rgba(22,58,26,${b.alpha * 0.75})`);
                leafGrad.addColorStop(0.7,  `rgba(18,48,22,${b.alpha * 0.65})`);
                leafGrad.addColorStop(1,    `rgba(10,28,14,${b.alpha * 0.5})`);
                ctx.fillStyle = leafGrad;
                ctx.fill();

                // Nervure centrale
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(side * 2, -len * 0.35, side * 3, -len * 0.65, side * 3.5, -len * 0.92);
                ctx.strokeStyle = `rgba(35,80,38,${b.alpha * 0.4})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();

                ctx.restore();
            }
        }
    });
}

// ══════════════════════════════════════
//  THÈME JARDIN JAPONAIS — fond + effets
// ══════════════════════════════════════

// ── FOND : NUIT DE BAMBOU ──
// Fond peint sur canvas : ciel vert-noir profond avec brume basse
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

    // Quelques étoiles très discrètes (pas un starfield)
    const stars = Array.from({ length: 40 }, () => ({
        x: Math.random(), y: Math.random() * 0.55,
        r: Math.random() * 0.8 + 0.2,
        a: Math.random() * 0.25 + 0.05,
        t: Math.random() * Math.PI * 2,
        s: Math.random() * 0.008 + 0.003
    }));

    // Lucioles
    const flies = Array.from({ length: 18 }, () => ({
        x: Math.random(), y: 0.4 + Math.random() * 0.55,
        vx: (Math.random() - 0.5) * 0.0003,
        vy: (Math.random() - 0.5) * 0.0002,
        t: Math.random() * Math.PI * 2,
        s: Math.random() * 0.02 + 0.01,
        r: 1.5 + Math.random() * 2
    }));

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Ciel gradient vert-nuit
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0,   'rgba(3,10,6,1)');
        sky.addColorStop(0.5, 'rgba(6,14,9,1)');
        sky.addColorStop(1,   'rgba(8,18,11,1)');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        // Brume basse (bas de l'écran)
        const mist = ctx.createLinearGradient(0, H * 0.65, 0, H);
        mist.addColorStop(0, 'rgba(30,60,35,0)');
        mist.addColorStop(1, 'rgba(30,60,35,0.18)');
        ctx.fillStyle = mist;
        ctx.fillRect(0, H * 0.65, W, H);

        // Étoiles discrètes
        stars.forEach(s => {
            s.t += s.s;
            const a = s.a + Math.sin(s.t) * 0.08;
            ctx.beginPath();
            ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180,220,190,${Math.max(0, a)})`;
            ctx.fill();
        });

        // Lucioles
        flies.forEach(f => {
            f.x += f.vx; f.y += f.vy; f.t += f.s;
            if (f.x < 0) f.x = 1; if (f.x > 1) f.x = 0;
            if (f.y < 0.35) f.vy = Math.abs(f.vy);
            if (f.y > 0.98) f.vy = -Math.abs(f.vy);
            const a = (Math.sin(f.t) * 0.5 + 0.5) * 0.7;
            const grd = ctx.createRadialGradient(f.x*W, f.y*H, 0, f.x*W, f.y*H, f.r * 6);
            grd.addColorStop(0, `rgba(140,230,120,${a})`);
            grd.addColorStop(1, `rgba(140,230,120,0)`);
            ctx.beginPath();
            ctx.arc(f.x * W, f.y * H, f.r * 6, 0, Math.PI * 2);
            ctx.fillStyle = grd; ctx.fill();
            ctx.beginPath();
            ctx.arc(f.x * W, f.y * H, f.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,255,180,${a * 0.9})`;
            ctx.fill();
        });

        // Silhouettes bambou (droite + gauche)
        drawBamboo(ctx, W, H);

        requestAnimationFrame(draw);
    }
    draw();

})();

// ── SAKURA + VENT INVISIBLE ──
(function () {
    const overlay = document.createElement('canvas');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none;';
    document.body.appendChild(overlay);
    const ctx = overlay.getContext('2d');
    let W, H;
    function resize() { W = overlay.width = window.innerWidth; H = overlay.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    // Souris + vélocité pour le vent
    const mouse = { x: -999, y: -999, vx: 0, vy: 0, px: -999, py: -999 };
    window.addEventListener('mousemove', e => {
        mouse.vx = e.clientX - mouse.x;
        mouse.vy = e.clientY - mouse.y;
        mouse.x  = e.clientX;
        mouse.y  = e.clientY;
    });
    window.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; mouse.vx = 0; mouse.vy = 0; });

    // Sillage de vent (traînée de particules légères)
    const windTrail = [];

    const PETAL_COUNT = 45;
    const petals = Array.from({ length: PETAL_COUNT }, () => mkPetal(true));

    function mkPetal(random = false) {
        return {
            x:     Math.random() * (W || window.innerWidth),
            y:     random ? Math.random() * (H || window.innerHeight) : -20,
            vx:    0.3 + Math.random() * 0.5,
            vy:    0.4 + Math.random() * 0.7,
            rot:   Math.random() * Math.PI * 2,
            rotV:  (Math.random() - 0.5) * 0.025,
            size:  4 + Math.random() * 5,
            sway:  Math.random() * Math.PI * 2,
            swayS: 0.007 + Math.random() * 0.008,
            swayA: 0.3 + Math.random() * 0.5,
            alpha: 0.4 + Math.random() * 0.45,
            r: 180 + Math.floor(Math.random() * 40),
            g: 100 + Math.floor(Math.random() * 40),
            b: 110 + Math.floor(Math.random() * 40),
            // Vitesse actuelle (affectée par le vent)
            windVx: 0, windVy: 0,
        };
    }

    function drawPetal(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.52, 0, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, `rgba(${p.r+30},${p.g+20},${p.b+20},1)`);
        grad.addColorStop(1, `rgba(${p.r},${p.g},${p.b},0.55)`);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    }

    const WIND_RADIUS = 160;   // rayon d'influence du vent
    const WIND_FORCE  = 0.18;  // force de poussée

    function update() {
        ctx.clearRect(0, 0, W, H);

        // Ajouter particules de sillage si la souris bouge vite
        const speed = Math.hypot(mouse.vx, mouse.vy);
        if (speed > 3 && mouse.x > 0) {
            windTrail.push({
                x: mouse.x, y: mouse.y,
                vx: mouse.vx * 0.08 + (Math.random()-0.5)*0.5,
                vy: mouse.vy * 0.08 + (Math.random()-0.5)*0.5,
                life: 1.0,
                decay: 0.025 + Math.random() * 0.02,
                r: 2 + Math.random() * 4,
            });
            if (windTrail.length > 60) windTrail.shift();
        }

        // Dessiner sillage (ondes de vent translucides)
        windTrail.forEach((w, i) => {
            w.x += w.vx; w.y += w.vy;
            w.life -= w.decay;
            if (w.life <= 0) { windTrail.splice(i, 1); return; }
            const a = w.life * 0.12;
            ctx.beginPath();
            ctx.arc(w.x, w.y, w.r * w.life, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(150,220,170,${a})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
        });

        // Mettre à jour + dessiner pétales
        petals.forEach((p, i) => {
            // ── Influence du vent (souris) ──
            if (mouse.x > 0) {
                const dx   = p.x - mouse.x;
                const dy   = p.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < WIND_RADIUS && dist > 0) {
                    const falloff = (1 - dist / WIND_RADIUS); // plus fort au centre
                    const windSpeed = Math.min(speed, 40);
                    // Composante directionnelle (suit la vélocité souris)
                    p.windVx += mouse.vx * WIND_FORCE * falloff * windSpeed * 0.003;
                    p.windVy += mouse.vy * WIND_FORCE * falloff * windSpeed * 0.003;
                    // Composante de répulsion (les pétales s'écartent du curseur)
                    p.windVx += (dx / dist) * falloff * 0.4;
                    p.windVy += (dy / dist) * falloff * 0.2;
                    // Rotation accélérée sous le vent
                    p.rotV += falloff * 0.004 * (Math.random() - 0.5);
                }
            }

            // Amortissement du vent (retour à la gravité naturelle)
            p.windVx *= 0.94;
            p.windVy *= 0.94;

            // Déplacement naturel + vent
            p.sway += p.swayS;
            p.x   += p.vx + Math.sin(p.sway) * p.swayA + p.windVx;
            p.y   += p.vy + p.windVy;
            p.rot += p.rotV;
            p.rotV *= 0.98; // amortissement rotation

            if (p.y > H + 20 || p.x > W + 60 || p.x < -60) petals[i] = mkPetal();
            drawPetal(p);
        });

        requestAnimationFrame(update);
    }
    update();
})();