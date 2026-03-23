// ══════════════════════════════════════
//  THÈME JEU VIDÉO — Grotte Vivante
//  Plafond procédural · Trous = lumière naturelle
//  Champignons bioluminescents · Spores · Flaques
// ══════════════════════════════════════

(function () {
    const canvas = document.getElementById('theme-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const myGen = (window._lfThemeGen = (window._lfThemeGen || 0) + 1);

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const mouse = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
    window.addEventListener('mousemove', e => {
        mouse.vx = (e.clientX - mouse.x) * 0.08;
        mouse.vy = (e.clientY - mouse.y) * 0.08;
        mouse.x  = e.clientX;
        mouse.y  = e.clientY;
    });

    // ══════════════════════════════════════
    //  BRUIT ORGANIQUE — plusieurs octaves
    // ══════════════════════════════════════
    function cave(x, seed, scale) {
        return (
            Math.sin(x * 0.0055 * scale + seed)         * 0.50 +
            Math.sin(x * 0.0140 * scale + seed * 1.618) * 0.28 +
            Math.sin(x * 0.0370 * scale + seed * 2.414) * 0.14 +
            Math.sin(x * 0.0920 * scale + seed * 3.141) * 0.06 +
            Math.sin(x * 0.2100 * scale + seed * 4.669) * 0.02
        ); // [-1 .. 1]
    }

    // ══════════════════════════════════════
    //  TROUS DANS LA PAROI — générés une fois
    //  Chaque trou = ouverture vers l'extérieur
    //  → lumière naturelle qui filtre dedans
    // ══════════════════════════════════════
    let holes = [];

    function buildHoles() {
        holes = [];
        const N = 3 + Math.floor(Math.random() * 3); // 3 à 5 trous
        const used = [];

        for (let i = 0; i < N; i++) {
            let cx, tries = 0;
            // Espacer les trous d'au moins 15% de W
            do {
                cx = W * (0.07 + Math.random() * 0.86);
                tries++;
            } while (used.some(u => Math.abs(u - cx) < W * 0.15) && tries < 30);
            used.push(cx);

            holes.push({
                cx,
                // Demi-largeur du trou : entre 3% et 8% de W
                hw:    W * (0.030 + Math.random() * 0.050),
                t:     Math.random() * Math.PI * 2,
                ts:    0.003 + Math.random() * 0.003,
                // Luminosité propre à ce trou (variation naturelle)
                lum:   0.60 + Math.random() * 0.38,
                // Léger angle du rayon (pas tous verticaux)
                lean:  (Math.random() - 0.5) * 0.18,
            });
        }
        // Tri de gauche à droite
        holes.sort((a, b) => a.cx - b.cx);
    }

    // ══════════════════════════════════════
    //  PROFIL DU PLAFOND avec les trous
    //  ceilY(x) = épaisseur de roche en ce point
    //  → 0 = trou ouvert, >0 = roche solide
    // ══════════════════════════════════════
    function ceilY(x) {
        // Profil de base : roche organique (8% à 32% de H)
        const base = H * 0.08 + (cave(x, 1.34, 1.0) * 0.5 + 0.5) * H * 0.24;

        // Influence de chaque trou (smoothstep)
        let maxInfl = 0;
        holes.forEach(h => {
            const d = Math.abs(x - h.cx);
            if (d < h.hw * 1.35) {
                const t = Math.max(0, 1 - d / h.hw);
                const s = t * t * (3 - 2 * t); // smoothstep
                maxInfl = Math.max(maxInfl, s);
            }
        });
        // Là où il y a un trou, la hauteur de roche tombe à 0
        return base * (1 - maxInfl);
    }

    // ══════════════════════════════════════
    //  CLUSTERS DE CHAMPIGNONS
    // ══════════════════════════════════════
    const CLUSTER_DEFS = [
        { xr: 0.12, col: [52,  211, 153] },
        { xr: 0.36, col: [56,  189, 248] },
        { xr: 0.64, col: [167, 139, 250] },
        { xr: 0.88, col: [244, 114, 182] },
    ];
    const SEC_COLS = [
        [110, 231, 183],
        [186, 230, 253],
        [221, 214, 254],
        [251, 191,  36],
    ];

    let clusters  = [];
    let spores    = [];
    let puddles   = [];

    function buildClusters() {
        clusters = [];
        spores   = [];

        CLUSTER_DEFS.forEach((def, ci) => {
            const cx  = def.xr * W;
            const sec = SEC_COLS[ci];
            const mush = [];

            mush.push({ dx: 0, size: 18 + ci * 2, col: def.col, alpha: 1.0,
                t: Math.random() * Math.PI * 2, s: 0.012 + Math.random() * 0.006,
                lean: (Math.random() - 0.5) * 0.08 });

            const small = 4 + (ci % 2);
            for (let j = 0; j < small; j++) {
                const spread = 28 + j * 18;
                const side   = j % 2 === 0 ? 1 : -1;
                mush.push({
                    dx:   side * (spread * 0.6 + (Math.random() - 0.5) * 14),
                    size: 6 + Math.random() * 10,
                    col:  j % 3 === 0 ? sec : def.col,
                    alpha: 0.65 + Math.random() * 0.30,
                    t: Math.random() * Math.PI * 2,
                    s: 0.014 + Math.random() * 0.010,
                    lean: (Math.random() - 0.5) * 0.22,
                });
            }
            clusters.push({ cx, col: def.col, sec, mush });

            // Spores depuis ce cluster
            const N = 30 + ci * 5;
            for (let i = 0; i < N; i++) {
                const m = mush[Math.floor(Math.random() * mush.length)];
                spores.push(mkSpore(ci, cx, m, true));
            }
        });

        puddles = [
            { xr: 0.22, wr: 0.10, depth: 16 },
            { xr: 0.50, wr: 0.08, depth: 13 },
            { xr: 0.75, wr: 0.12, depth: 18 },
        ];
    }

    function mkSpore(clIdx, cx, m, random) {
        const ci  = clIdx;
        const col = Math.random() > 0.5 ? clusters[ci]?.col || SEC_COLS[ci] : SEC_COLS[ci];
        const floorY = H - 22;
        return {
            clIdx, cx,
            x:     cx + (m ? m.dx : 0) + (Math.random() - 0.5) * 8,
            y:     random ? H * 0.18 + Math.random() * H * 0.72 : floorY - (m ? m.size : 15),
            vx:    (Math.random() - 0.5) * 0.30,
            vy:    -(0.08 + Math.random() * 0.28),
            r:     0.6 + Math.random() * 1.8,
            col,
            t:     Math.random() * Math.PI * 2,
            ts:    0.012 + Math.random() * 0.020,
            alpha: 0.4 + Math.random() * 0.55,
            life:  random ? Math.random() : 1.0,
            decay: 0.0012 + Math.random() * 0.0020,
            windVx: 0,
        };
    }

    // ══════════════════════════════════════
    //  BUILD — tout en amont
    // ══════════════════════════════════════
    function build() {
        buildHoles();
        buildClusters();
    }

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        build();
    }
    build();
    window.addEventListener('resize', resize);

    // ══════════════════════════════════════
    //  DESSIN CHAMPIGNON
    // ══════════════════════════════════════
    function drawMushroom(cx, gy, m, T) {
        const [r, g, b] = m.col;
        const s  = m.size;
        const px = cx + m.dx;
        const gA = 0.55 + Math.sin(m.t) * 0.45;

        ctx.save();
        ctx.translate(px, gy);

        const halo = ctx.createRadialGradient(0, -s * 0.9, 0, 0, -s * 0.9, s * 3.8);
        halo.addColorStop(0,   `rgba(${r},${g},${b},${gA * 0.38})`);
        halo.addColorStop(0.4, `rgba(${r},${g},${b},${gA * 0.10})`);
        halo.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.beginPath(); ctx.arc(0, -s * 0.9, s * 3.8, 0, Math.PI * 2);
        ctx.fillStyle = halo; ctx.fill();

        ctx.save();
        ctx.rotate(m.lean);
        ctx.beginPath();
        ctx.moveTo(-s * 0.14, 0);
        ctx.quadraticCurveTo( s * 0.10, -s * 0.55, -s * 0.06, -s * 0.92);
        ctx.lineTo(s * 0.20, -s * 0.92);
        ctx.quadraticCurveTo( s * 0.22, -s * 0.55,  s * 0.14, 0);
        ctx.closePath();
        ctx.fillStyle = `rgba(${Math.round(r*0.32)},${Math.round(g*0.40)},${Math.round(b*0.46)},0.90)`;
        ctx.fill();

        ctx.save();
        ctx.translate(0, -s);
        ctx.rotate(m.lean * 0.5);
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.80, s * 0.40, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${0.78 + gA * 0.20})`;
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, s * 0.06, s * 0.85, s * 0.18, 0, 0, Math.PI);
        ctx.fillStyle = `rgba(${Math.round(r*0.62)},${Math.round(g*0.62)},${Math.round(b*0.62)},0.70)`;
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-s * 0.22, -s * 0.14, s * 0.28, s * 0.12, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${gA * 0.50})`;
        ctx.fill();
        ctx.restore();
        ctx.restore();
        ctx.restore();
    }

    // ══════════════════════════════════════
    //  BOUCLE PRINCIPALE
    // ══════════════════════════════════════
    let T = 0;

    function draw() {
        if (window._lfThemeGen !== myGen) return;
        requestAnimationFrame(draw);
        T += 0.012;

        ctx.clearRect(0, 0, W, H);

        // ════════════════════════════════
        //  1. FOND GROTTE (sombre)
        // ════════════════════════════════
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0,    '#03020b');
        bg.addColorStop(0.30, '#06041a');
        bg.addColorStop(0.70, '#090720');
        bg.addColorStop(1,    '#0d0a28');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Lueur d'ambiance de chaque cluster (lointaine)
        clusters.forEach(cl => {
            const [r, g, b] = cl.col;
            const ag = ctx.createRadialGradient(cl.cx, H * 0.80, 0, cl.cx, H * 0.80, W * 0.28);
            ag.addColorStop(0, `rgba(${r},${g},${b},0.055)`);
            ag.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = ag; ctx.fillRect(0, 0, W, H);
        });

        // ════════════════════════════════
        //  2. LUMIÈRE NATURELLE — DEHORS
        //  Visible UNIQUEMENT là où il y a un trou
        //  → dessinée ici, puis la roche s'affiche par-dessus
        // ════════════════════════════════
        holes.forEach(h => {
            h.t += h.ts;

            // Zone de ciel visible juste derrière le trou
            // On clippe la zone du trou pour éviter les débordements
            const hw  = h.hw * (1 + Math.sin(h.t * 0.7) * 0.04); // légère respiration
            const lum = h.lum * (0.88 + Math.sin(h.t * 1.3) * 0.12);

            ctx.save();
            // Clipping : uniquement la colonne du trou (x±hw, y de 0 à ceilY minimum)
            ctx.beginPath();
            for (let x = h.cx - hw * 1.5; x <= h.cx + hw * 1.5; x += 2) {
                const y = ceilY(x);
                if (x === h.cx - hw * 1.5) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.lineTo(h.cx + hw * 1.5, 0);
            ctx.lineTo(h.cx - hw * 1.5, 0);
            ctx.closePath();
            ctx.clip();

            // Lumière extérieure : chaude, dorée (soleil filtrant)
            const skyG = ctx.createLinearGradient(h.cx, 0, h.cx, H * 0.18);
            skyG.addColorStop(0,   `rgba(255, 245, 200, ${lum})`);
            skyG.addColorStop(0.4, `rgba(240, 220, 150, ${lum * 0.65})`);
            skyG.addColorStop(1,   `rgba(200, 180, 100, 0)`);
            ctx.fillStyle = skyG;
            ctx.fillRect(h.cx - hw * 1.5, 0, hw * 3, H * 0.18);

            ctx.restore();
        });

        // ════════════════════════════════
        //  3. CÔNES DE LUMIÈRE VOLUMÉTRIQUE
        //  Partent du trou, s'élargissent vers le bas
        //  Dessinés AVANT la roche → la roche coupe ce qui est dans la masse
        // ════════════════════════════════
        holes.forEach(h => {
            const hw  = h.hw * (1 + Math.sin(h.t * 0.7) * 0.04);
            const lum = h.lum * (0.88 + Math.sin(h.t * 1.3) * 0.12);

            // Origine : base du trou dans la paroi
            const topY = ceilY(h.cx);
            const topW = hw * 2;

            // Le cône s'élargit et s'estompe
            const botY = H * 0.82;
            const botW = hw * 5.5 + H * 0.14;
            const lean = h.lean; // légère inclinaison

            // Gradient du rayon : dense au sommet, disparaît en bas
            const shG = ctx.createLinearGradient(h.cx, topY, h.cx + lean * (botY - topY), botY);
            shG.addColorStop(0,    `rgba(255,240,180,${lum * 0.55})`);
            shG.addColorStop(0.12, `rgba(250,225,150,${lum * 0.32})`);
            shG.addColorStop(0.40, `rgba(240,210,120,${lum * 0.14})`);
            shG.addColorStop(0.70, `rgba(220,190, 90,${lum * 0.05})`);
            shG.addColorStop(1,    `rgba(200,170, 60,0)`);

            const lx = lean * (botY - topY);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(h.cx - topW / 2, topY);
            ctx.lineTo(h.cx + topW / 2, topY);
            ctx.lineTo(h.cx + lx + botW / 2, botY);
            ctx.lineTo(h.cx + lx - botW / 2, botY);
            ctx.closePath();
            ctx.fillStyle = shG;
            ctx.fill();
            ctx.restore();

            // Halo au sol — tache de lumière là où le rayon touche
            const floorHitX = h.cx + lx;
            const floorHitR = botW * 0.50;
            const fhA = lum * 0.12;
            const fhG = ctx.createRadialGradient(floorHitX, H * 0.90, 0, floorHitX, H * 0.90, floorHitR);
            fhG.addColorStop(0,   `rgba(255,240,160,${fhA})`);
            fhG.addColorStop(0.5, `rgba(220,200,120,${fhA * 0.4})`);
            fhG.addColorStop(1,   `rgba(180,160, 80,0)`);
            ctx.beginPath();
            ctx.ellipse(floorHitX, H * 0.90, floorHitR, floorHitR * 0.28, 0, 0, Math.PI * 2);
            ctx.fillStyle = fhG; ctx.fill();

            // Particules de poussière dans le rayon
            for (let i = 0; i < 4; i++) {
                const pt = T * 0.4 + h.cx * 0.01 + i * 1.57;
                const pr = 0.15 + (i / 4) * 0.70;
                const px = h.cx + lx * pr + Math.sin(pt * 1.3 + i) * hw * 0.9;
                const py = topY + (botY - topY) * pr + Math.cos(pt * 0.9 + i) * 8;
                const pa = 0.08 + Math.sin(pt * 2.1) * 0.05;
                ctx.beginPath();
                ctx.arc(px, py, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,240,180,${pa * lum})`;
                ctx.fill();
            }
        });

        // ════════════════════════════════
        //  4. PAROI ROCHEUSE — plafond
        //  Tracée EN DERNIER pour couvrir la lumière partout sauf dans les trous
        // ════════════════════════════════

        // Couche de fond (roche lointaine, légèrement texturée)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(W, 0);
        for (let x = W; x >= 0; x -= 3) {
            const y = H * 0.07 + (cave(x, 7.1, 0.7) * 0.5 + 0.5) * H * 0.08;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        const rock0G = ctx.createLinearGradient(0, 0, 0, H * 0.16);
        rock0G.addColorStop(0,   '#08051e');
        rock0G.addColorStop(0.7, '#0c082a');
        rock0G.addColorStop(1,   '#0e0a2e');
        ctx.fillStyle = rock0G;
        ctx.fill();
        ctx.restore();

        // Couche principale — avec les trous
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(W, 0);
        for (let x = W; x >= 0; x -= 2) {
            ctx.lineTo(x, ceilY(x));
        }
        ctx.closePath();
        const rock1G = ctx.createLinearGradient(0, 0, 0, H * 0.40);
        rock1G.addColorStop(0,    '#0a0721');
        rock1G.addColorStop(0.35, '#0f0c2e');
        rock1G.addColorStop(0.70, '#130f36');
        rock1G.addColorStop(1,    '#160f38');
        ctx.fillStyle = rock1G;
        ctx.fill();

        // Bord biseauté de la roche (arête mouillée)
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
            const y = ceilY(x);
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(120,95,210,0.28)';
        ctx.lineWidth   = 1.4;
        ctx.stroke();
        ctx.restore();

        // Couche avant — plus courte, plus sombre (profondeur premier plan)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(W, 0);
        for (let x = W; x >= 0; x -= 2) {
            const base = H * 0.035 + (cave(x, 3.77, 1.3) * 0.5 + 0.5) * H * 0.10;
            let maxI = 0;
            holes.forEach(h => {
                const d = Math.abs(x - h.cx);
                if (d < h.hw * 1.2) {
                    const t = Math.max(0, 1 - d / h.hw);
                    maxI = Math.max(maxI, t * t * (3 - 2 * t));
                }
            });
            ctx.lineTo(x, base * (1 - maxI));
        }
        ctx.closePath();
        ctx.fillStyle = '#07041a';
        ctx.fill();
        ctx.restore();

        // ════════════════════════════════
        //  5. CHAMPIGNONS
        // ════════════════════════════════
        clusters.forEach(cl => {
            cl.mush.forEach(m => {
                m.t += m.s;
                drawMushroom(cl.cx, H * 0.90, m, T);
            });
        });

        // ════════════════════════════════
        //  6. SOL
        //  — Stalagmites qui montent DEPUIS H-35
        //  — Sol plat opaque EN DESSOUS
        // ════════════════════════════════
        const FLAT = H * 0.90;

        // Stalagmites couche fond (longues, lointaines)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, FLAT);
        for (let x = 0; x <= W; x += 3) {
            const n = (cave(x, 8.33, 0.7) * 0.5 + 0.5);
            ctx.lineTo(x, FLAT - n * H * 0.28);
        }
        ctx.lineTo(W, FLAT);
        ctx.closePath();
        ctx.fillStyle = '#0d0a24';
        ctx.fill();
        ctx.beginPath();
        for (let x = 0; x <= W; x += 3) {
            const n = (cave(x, 8.33, 0.7) * 0.5 + 0.5);
            x === 0 ? ctx.moveTo(x, FLAT - n * H * 0.28) : ctx.lineTo(x, FLAT - n * H * 0.28);
        }
        ctx.strokeStyle = 'rgba(100,78,190,0.30)';
        ctx.lineWidth = 1.2; ctx.stroke();
        ctx.restore();

        // Stalagmites couche milieu
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, FLAT);
        for (let x = 0; x <= W; x += 2) {
            const n = (cave(x, 5.55, 1.1) * 0.5 + 0.5);
            ctx.lineTo(x, FLAT - n * H * 0.16);
        }
        ctx.lineTo(W, FLAT);
        ctx.closePath();
        ctx.fillStyle = '#090720';
        ctx.fill();
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
            const n = (cave(x, 5.55, 1.1) * 0.5 + 0.5);
            x === 0 ? ctx.moveTo(x, FLAT - n * H * 0.16) : ctx.lineTo(x, FLAT - n * H * 0.16);
        }
        ctx.strokeStyle = 'rgba(80,60,160,0.22)';
        ctx.lineWidth = 1.0; ctx.stroke();
        ctx.restore();

        // Stalagmites couche avant (courtes, très sombres)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, FLAT);
        for (let x = 0; x <= W; x += 2) {
            const n = (cave(x, 2.91, 1.5) * 0.5 + 0.5);
            ctx.lineTo(x, FLAT - n * H * 0.06);
        }
        ctx.lineTo(W, FLAT);
        ctx.closePath();
        ctx.fillStyle = '#050318';
        ctx.fill();
        ctx.restore();

        // Sol plat opaque — couvre tout en dessous de H-35
        ctx.fillStyle = '#020010';
        ctx.fillRect(0, FLAT, W, H - FLAT);

        // Lumière des trous sur le sol plat
        holes.forEach(h => {
            const lx   = h.lean * (H * 0.82 - ceilY(h.cx));
            const hitX = h.cx + lx;
            const hitW = (h.hw * 5.5 + H * 0.14) * 0.65; // demi-largeur ellipse
            const hitH = hitW * 0.18;                      // demi-hauteur (rasante)
            const lum  = h.lum * (0.88 + Math.sin(h.t * 1.3) * 0.12);
            const pulse = 0.85 + Math.sin(h.t * 2.0) * 0.15;

            ctx.save();
            ctx.translate(hitX, FLAT);
            ctx.scale(1, hitH / hitW); // aplatir en ellipse

            // Gradient circulaire dans l'espace scalé = ellipse dans l'espace réel
            const lg = ctx.createRadialGradient(0, 0, 0, 0, 0, hitW);
            lg.addColorStop(0,    `rgba(255,242,180,${lum * 0.55 * pulse})`);
            lg.addColorStop(0.25, `rgba(255,228,140,${lum * 0.35 * pulse})`);
            lg.addColorStop(0.60, `rgba(240,200, 90,${lum * 0.14 * pulse})`);
            lg.addColorStop(1,    `rgba(200,160, 60,0)`);

            ctx.beginPath();
            ctx.arc(0, 0, hitW, 0, Math.PI * 2);
            ctx.fillStyle = lg;
            ctx.fill();
            ctx.restore();

            // Noyau très lumineux au centre de l'impact
            ctx.save();
            ctx.translate(hitX, FLAT);
            ctx.scale(1, 0.08);
            const core = ctx.createRadialGradient(0, 0, 0, 0, 0, hitW * 0.28);
            core.addColorStop(0,   `rgba(255,255,220,${lum * 0.70 * pulse})`);
            core.addColorStop(1,   `rgba(255,240,160,0)`);
            ctx.beginPath();
            ctx.arc(0, 0, hitW * 0.28, 0, Math.PI * 2);
            ctx.fillStyle = core;
            ctx.fill();
            ctx.restore();
        });

        // ════════════════════════════════
        //  8. SPORES
        // ════════════════════════════════
        spores.forEach((sp, i) => {
            sp.t    += sp.ts;
            sp.life -= sp.decay;

            if (sp.life <= 0 || sp.y < H * 0.03) {
                const ci = sp.clIdx;
                const cl = clusters[ci];
                const m  = cl.mush[Math.floor(Math.random() * cl.mush.length)];
                spores[i] = mkSpore(ci, cl.cx, m, false);
                return;
            }

            // Influence souris
            const dx   = sp.x - mouse.x;
            const dy   = sp.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 130 && dist > 1) {
                const f = (1 - dist / 130) * 0.013;
                sp.windVx += (dx / dist) * f + mouse.vx * 0.007;
            }
            sp.windVx *= 0.94;
            sp.vx     += sp.windVx * 0.12;
            sp.vx     *= 0.990;
            sp.x      += sp.vx + Math.sin(sp.t * 0.55) * 0.22;
            sp.y      += sp.vy;

            const [r, g, b] = sp.col;
            const a  = sp.life * sp.alpha * (0.55 + Math.sin(sp.t) * 0.45);
            const px = sp.x, py = sp.y;

            // Traînée
            const trailGrad = ctx.createLinearGradient(px, py, px - sp.vx * 14, py - sp.vy * 14);
            trailGrad.addColorStop(0, `rgba(${r},${g},${b},${a * 0.55})`);
            trailGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px - sp.vx * 14, py - sp.vy * 14);
            ctx.strokeStyle = trailGrad;
            ctx.lineWidth   = sp.r * 0.7;
            ctx.stroke();

            // Halo + noyau
            const hg = ctx.createRadialGradient(px, py, 0, px, py, sp.r * 5);
            hg.addColorStop(0, `rgba(${r},${g},${b},${a * 0.55})`);
            hg.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath(); ctx.arc(px, py, sp.r * 5, 0, Math.PI * 2);
            ctx.fillStyle = hg; ctx.fill();
            ctx.beginPath(); ctx.arc(px, py, sp.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${a * 0.88})`; ctx.fill();
        });

        // ════════════════════════════════
        //  9. PREMIER PLAN — bordure basse
        // ════════════════════════════════
        ctx.save();
        const fgG = ctx.createLinearGradient(0, H * 0.90, 0, H);
        fgG.addColorStop(0, 'rgba(4,2,10,0)');
        fgG.addColorStop(1, 'rgba(4,2,10,0.92)');
        ctx.fillStyle = fgG;
        ctx.fillRect(0, H * 0.90, W, H * 0.10);
        ctx.restore();

        // Halo curseur (seulement hors jeu)
        if (!window._lfGameActive) {
            const cg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 65);
            cg.addColorStop(0,   'rgba(167,139,250,0.12)');
            cg.addColorStop(0.5, 'rgba(52,211,153,0.04)');
            cg.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 65, 0, Math.PI * 2);
            ctx.fillStyle = cg; ctx.fill();
        }
    }

    draw();
})();

// ══════════════════════════════════════
//  TOWER DEFENSE — Grotte Magique
//  Cartes de pouvoir · Sorts auto · 2 côtés
// ══════════════════════════════════════

(function () {
    const bgCanvas = document.getElementById('theme-canvas');
    if (!bgCanvas) return;

    // ── Canvas overlay jeu ──
    const gc = document.createElement('canvas');
    gc.id = 'game-canvas';
    gc.style.cssText = 'position:fixed;inset:0;z-index:10;pointer-events:none;display:none;';
    document.body.appendChild(gc);
    const gx = gc.getContext('2d');

    // ── Bouton lancer ──
    const btn = document.createElement('button');
    btn.innerHTML = '⚔ Jouer';
    btn.style.cssText = `
        position:fixed;bottom:18px;right:22px;z-index:200;
        font-family:'Press Start 2P',monospace;font-size:.50rem;
        padding:10px 18px;letter-spacing:.08em;
        background:linear-gradient(135deg,#1a0f3d,#2d1b6e);
        color:#a78bfa;border:1px solid rgba(167,139,250,.40);
        border-radius:6px;cursor:pointer;
        box-shadow:0 0 22px rgba(52,211,153,.18);
        transition:box-shadow .2s,transform .2s;
    `;
    btn.onmouseenter = () => { btn.style.boxShadow='0 0 40px rgba(52,211,153,.45)'; btn.style.transform='translateY(-2px)'; };
    btn.onmouseleave = () => { btn.style.boxShadow='0 0 22px rgba(52,211,153,.18)'; btn.style.transform=''; };
    document.body.appendChild(btn);

    // ══════════════════════════════════════
    //  DIMENSIONS
    // ══════════════════════════════════════
    let GW, GH, FLOOR;
    function resize() {
        GW = gc.width  = window.innerWidth;
        GH = gc.height = window.innerHeight;
        FLOOR = GH * 0.90;
        tower.x = GW / 2;
        tower.y = FLOOR;
    }
    window.addEventListener('resize', resize);

    // ══════════════════════════════════════
    //  POOL DE POUVOIRS (10 disponibles)
    // ══════════════════════════════════════
    const POWER_POOL = [
        {
            id: 'cadence',
            name: 'Cadence +',
            desc: 'Tirs 35% plus rapides',
            icon: '⚡',
            col: [56, 189, 248],
            apply: () => { tower.fireRate = Math.max(20, Math.floor(tower.fireRate * 0.65)); },
        },
        {
            id: 'double',
            name: 'Double Sort',
            desc: 'Un 2e sort 0.5s après le 1er',
            icon: '✦',
            col: [167, 139, 250],
            apply: () => { tower.doubleShot = true; },
        },
        {
            id: 'homing',
            name: 'Homing',
            desc: 'Projectiles guidés',
            icon: '🎯',
            col: [251, 191, 36],
            apply: () => { tower.homing = true; },
        },
        {
            id: 'nova',
            name: 'Nova',
            desc: 'Explosion à la mort ennemie',
            icon: '💥',
            col: [244, 114, 182],
            apply: () => { tower.nova = true; },
        },
        {
            id: 'shield',
            name: 'Bouclier',
            desc: '+60 HP max sur le cristal',
            icon: '🛡',
            col: [52, 211, 153],
            apply: () => { tower.maxHp += 60; tower.hp = Math.min(tower.hp + 60, tower.maxHp); },
        },
        {
            id: 'regen',
            name: 'Régénération',
            desc: 'Le cristal se régénère',
            icon: '♥',
            col: [244, 114, 182],
            apply: () => { tower.regen = true; },
        },
        {
            id: 'piercing',
            name: 'Perforation',
            desc: 'Les sorts traversent les ennemis',
            icon: '→',
            col: [186, 230, 253],
            apply: () => { tower.piercing = true; },
        },
        {
            id: 'heavy',
            name: 'Sort Lourd',
            desc: 'Dégâts x2 par projectile',
            icon: '⬟',
            col: [251, 191, 36],
            apply: () => { tower.damage = (tower.damage||1) * 2; },
        },
        {
            id: 'speed',
            name: 'Vitesse',
            desc: 'Projectiles 60% plus rapides',
            icon: '≫',
            col: [110, 231, 183],
            apply: () => { tower.projSpeed = (tower.projSpeed||5.5) * 1.6; },
        },
        {
            id: 'storm',
            name: 'Tempête',
            desc: 'Cible 2 ennemis en même temps',
            icon: '🌀',
            col: [221, 214, 254],
            apply: () => { tower.storm = true; },
        },
    ];

    // ══════════════════════════════════════
    //  ÉTAT
    // ══════════════════════════════════════
    const tower = {
        x: 0, y: 0, hp: 100, maxHp: 100,
        fireRate: 80, fireCooldown: 0,
        multiShot: 1, homing: false, nova: false,
        regen: false, piercing: false, damage: 1,
        projSpeed: 5.5, storm: false, doubleShot: false,
        delayedShots: [], // {frames, target}
    };

    let gameRunning = false, gameOver = false;
    let wave = 0, score = 0;
    let enemies = [], projectiles = [], particles = [];
    let unlockedIds = [];          // IDs des pouvoirs pris
    let activePowers = [];         // liste affichée
    let spawnQueue  = [];          // ennemis à spawner dans la vague
    let spawnTimer  = 0;
    let waveEnemiesLeft = 0;       // combien d'ennemis dans cette vague
    let wavePhase = 'spawning';    // 'spawning' | 'clearing' | 'card' | 'break'
    let breakTimer  = 0;

    // Sélection de cartes
    let cardChoices  = [];
    let showingCards = false;

    // ══════════════════════════════════════
    //  HELPERS
    // ══════════════════════════════════════
    const rand = (a, b) => a + Math.random() * (b - a);

    function nearestEnemy(skip = null) {
        let best = null, bd = Infinity;
        enemies.forEach(e => {
            if (e === skip || e.dead) return;
            const d = Math.hypot(e.x - tower.x, e.y - tower.y);
            if (d < bd) { bd = d; best = e; }
        });
        return best;
    }

    // Nearest ennemi par rapport à une position (pour homing post-impact et piercing)
    function nearestEnemyAt(x, y, skip = null) {
        let best = null, bd = Infinity;
        enemies.forEach(e => {
            if (e === skip || e.dead) return;
            const d = Math.hypot(e.x - x, e.y - y);
            if (d < bd) { bd = d; best = e; }
        });
        return best;
    }

    // ══════════════════════════════════════
    //  TYPES D'ENNEMIS
    // ══════════════════════════════════════
    const ETYPES = [
        { name:'Slime',   hp:3,  spd:0.9, r:11, col:[52,211,153],  reward:10 },
        { name:'Golem',   hp:8,  spd:0.4, r:16, col:[167,139,250], reward:28 },
        { name:'Specter', hp:4,  spd:1.7, r: 9, col:[186,230,253], reward:22 },
        { name:'Titan',   hp:24, spd:0.3, r:22, col:[251,191,36],  reward:65 },
        { name:'Void',    hp:12, spd:1.1, r:14, col:[244,114,182], reward:45 },
    ];

    function mkEnemy() {
        const tier = Math.min(Math.floor(wave / 3), ETYPES.length - 1);
        const t    = ETYPES[Math.floor(rand(0, Math.min(tier + 1, ETYPES.length)))];
        const left = Math.random() > 0.5;
        return {
            x:    left ? -24 : GW + 24,
            y:    FLOOR,
            dir:  left ? 1 : -1,
            spd:  t.spd  * (1 + wave * 0.05),
            hp:   Math.ceil(t.hp * (1 + wave * 0.20)),
            maxHp:Math.ceil(t.hp * (1 + wave * 0.20)),
            r:    t.r, col: t.col, reward: t.reward,
            t: Math.random() * Math.PI * 2,
            dead: false,
        };
    }

    // ══════════════════════════════════════
    //  SPAWN D'UNE VAGUE
    // ══════════════════════════════════════
    function buildWave(w) {
        const n = 3 + w * 2;
        spawnQueue = Array.from({length: n}, mkEnemy);
        waveEnemiesLeft = n;
        spawnTimer = 0;
    }

    // ══════════════════════════════════════
    //  TIR
    // ══════════════════════════════════════
    function spellColor() {
        if (unlockedIds.includes('storm'))    return [221,214,254];
        if (unlockedIds.includes('nova'))     return [244,114,182];
        if (unlockedIds.includes('homing'))   return [251,191,36];
        if (unlockedIds.includes('double'))   return [167,139,250];
        if (unlockedIds.includes('cadence'))  return [56,189,248];
        return [52,211,153];
    }

    function fireAtPos(ox, oy, target) {
        if (!target) return;
        const tx  = target.x;
        const ty  = FLOOR - target.r;
        const dx  = tx - ox;
        const dy  = ty - oy;
        const ang = Math.atan2(dy, dx);
        const spd = tower.projSpeed;
        projectiles.push({
            x: ox, y: oy,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            col: spellColor(),
            target: tower.homing ? target : null,
            piercing: tower.piercing,
            damage: tower.damage || 1,
            r: 5 + (tower.damage > 1 ? 2 : 0),
            trail: [], life: 1,
            hit: new Set(),
        });
    }
    // Alias pour storm
    function fireAt(target) { fireAtPos(tower.x, tower.y - 40, target); }

    function doFire() {
        const t1 = nearestEnemy();
        if (!t1) return;
        fireAtPos(tower.x, tower.y - 40, t1);
        // Double sort : 2e tir 30 frames plus tard
        if (tower.doubleShot) {
            tower.delayedShots.push({ frames: 30, target: t1 });
        }
        // Storm : cible un 2e ennemi simultanément
        if (tower.storm) {
            const t2 = nearestEnemy(t1);
            if (t2) fireAtPos(tower.x, tower.y - 40, t2);
        }
    }

    // ══════════════════════════════════════
    //  PARTICULES
    // ══════════════════════════════════════
    function explode(x, y, col, n = 12, big = false) {
        for (let i = 0; i < n; i++) {
            const ang = rand(0, Math.PI * 2);
            const spd = rand(1.5, big ? 7 : 4);
            particles.push({
                x, y,
                vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd - rand(0,2),
                col, r: rand(2, big ? 7 : 4),
                life: 1, decay: rand(.018, .036),
            });
        }
    }

    // ══════════════════════════════════════
    //  CARTES DE POUVOIR
    // ══════════════════════════════════════
    function pickCards() {
        const available = POWER_POOL.filter(p => !unlockedIds.includes(p.id));
        // Mélange et prend 3
        const shuffled = available.sort(() => Math.random() - 0.5);
        cardChoices = shuffled.slice(0, Math.min(3, shuffled.length));
    }

    function applyCard(card) {
        unlockedIds.push(card.id);
        activePowers.push(card);
        card.apply();
        showingCards = false;
        gc.style.pointerEvents = 'auto';
        // Petite pause avant la vague suivante
        wavePhase = 'break';
        breakTimer = 120;
    }

    // ══════════════════════════════════════
    //  UPDATE
    // ══════════════════════════════════════
    function update() {
        if (!gameRunning || gameOver || showingCards) return;

        // Regén
        if (tower.regen && tower.hp < tower.maxHp) {
            tower.hp = Math.min(tower.maxHp, tower.hp + 0.015);
        }

        // ── Phase spawning ──
        if (wavePhase === 'spawning') {
            spawnTimer++;
            if (spawnTimer >= 55 && spawnQueue.length > 0) {
                spawnTimer = 0;
                enemies.push(spawnQueue.shift());
            }
            if (spawnQueue.length === 0 && enemies.length === 0 && waveEnemiesLeft === 0) {
                // Vague terminée
                wavePhase = 'card';
                showingCards = true;
                pickCards();
                gc.style.pointerEvents = 'auto';
                return;
            }
            if (spawnQueue.length === 0 && enemies.every(e => e.dead)) {
                wavePhase = 'card';
                showingCards = true;
                pickCards();
                gc.style.pointerEvents = 'auto';
                return;
            }
        }

        // ── Phase break (après choix de carte) ──
        if (wavePhase === 'break') {
            breakTimer--;
            if (breakTimer <= 0) {
                wave++;
                buildWave(wave);
                wavePhase = 'spawning';
            }
            return;
        }

        // ── Tir ──
        tower.fireCooldown--;
        if (tower.fireCooldown <= 0 && enemies.some(e => !e.dead)) {
            tower.fireCooldown = tower.fireRate;
            doFire();
        }
        // Tirs différés (double sort)
        tower.delayedShots = tower.delayedShots.filter(d => {
            d.frames--;
            if (d.frames <= 0) {
                const tgt = d.target && !d.target.dead ? d.target : nearestEnemy();
                if (tgt) fireAtPos(tower.x, tower.y - 40, tgt);
                return false;
            }
            return true;
        });

        // ── Ennemis ──
        enemies.forEach(e => {
            if (e.dead) return;
            e.t += 0.08;
            const dist = Math.abs(e.x - tower.x);
            if (dist > e.r + 20) {
                // Avance vers la tour
                e.x += e.dir * e.spd;
            } else {
                // Arrêté au contact — tape le cristal
                tower.hp -= 0.15;
                if (tower.hp <= 0) { tower.hp = 0; doGameOver(); }
            }
        });
        enemies = enemies.filter(e => !e.dead);

        // ── Projectiles ──
        projectiles.forEach((p, pi) => {
            // Homing
            if (p.target && !p.target.dead) {
                const tx  = p.target.x;
                const ty  = FLOOR - p.target.r;
                const ddx = tx - p.x, ddy = ty - p.y;
                const dlen = Math.hypot(ddx, ddy) || 1;
                const spd  = Math.hypot(p.vx, p.vy);
                p.vx += (ddx/dlen*spd - p.vx) * 0.13;
                p.vy += (ddy/dlen*spd - p.vy) * 0.13;
                const ns = Math.hypot(p.vx, p.vy);
                p.vx = p.vx/ns*spd; p.vy = p.vy/ns*spd;
            } else if (tower.homing && !p.piercing) {
                p.target = nearestEnemyAt(p.x, p.y);
            }

            p.trail.push({x: p.x, y: p.y});
            if (p.trail.length > 10) p.trail.shift();
            p.x += p.vx; p.y += p.vy;

            // Collision — vise le centre du corps de l'ennemi
            enemies.forEach(e => {
                if (e.dead || p.hit.has(e)) return;
                const cy = FLOOR - e.r;
                if (Math.hypot(p.x - e.x, p.y - cy) < p.r + e.r) {
                    p.hit.add(e);
                    e.hp -= p.damage;
                    explode(p.x, p.y, p.col, 5);
                    if (p.piercing && p.hit.size <= 1) {
                        // Perfore 1 ennemi : continue tout droit, cherche nearest au point d'impact
                        p.target = nearestEnemyAt(p.x, p.y, e);
                    } else {
                        p.life = 0;
                    }
                    if (e.hp <= 0) {
                        e.dead = true;
                        score += e.reward;
                        explode(e.x, FLOOR - e.r, e.col, tower.nova ? 24 : 12, tower.nova);
                    }
                }
            });

            if (p.x < -60 || p.x > GW+60 || p.y < -100 || p.y > GH+60) p.life = 0;
        });
        projectiles = projectiles.filter(p => p.life > 0);

        // ── Particules ──
        particles.forEach(p => {
            p.x+=p.vx; p.y+=p.vy; p.vy+=0.09; p.vx*=0.96; p.vy*=0.96; p.life-=p.decay;
        });
        particles = particles.filter(p => p.life > 0);
    }

    // ══════════════════════════════════════
    //  DESSIN
    // ══════════════════════════════════════
    function drawGame() {
        gx.clearRect(0, 0, GW, GH);
        if (!gameRunning) return;

        const tx = tower.x, ty = tower.y;

        // ── Cristal central ──
        const pct  = tower.hp / tower.maxHp;
        const tCol = pct > 0.5 ? [52,211,153] : pct > 0.25 ? [251,191,36] : [244,114,182];
        const [tr,tg,tb] = tCol;
        const crystalH = 52 + Math.sin(Date.now()*0.002) * 3;

        // Halo
        const tH = gx.createRadialGradient(tx, ty-35, 0, tx, ty-35, 60);
        tH.addColorStop(0, `rgba(${tr},${tg},${tb},0.28)`);
        tH.addColorStop(1, 'rgba(0,0,0,0)');
        gx.beginPath(); gx.arc(tx, ty-35, 60, 0, Math.PI*2);
        gx.fillStyle = tH; gx.fill();

        // Socle
        gx.fillStyle = `rgba(${tr},${tg},${tb},0.22)`;
        gx.fillRect(tx-20, ty-10, 40, 10);

        // Corps cristal
        gx.save();
        gx.translate(tx, ty-10);
        gx.beginPath();
        gx.moveTo(0, -crystalH);
        gx.lineTo(14, -crystalH*0.45);
        gx.lineTo(14,  crystalH*0.18);
        gx.lineTo(0,   crystalH*0.28);
        gx.lineTo(-14, crystalH*0.18);
        gx.lineTo(-14,-crystalH*0.45);
        gx.closePath();
        const cG = gx.createLinearGradient(-14,-crystalH,14,0);
        cG.addColorStop(0,   'rgba(255,255,255,0.92)');
        cG.addColorStop(0.3, `rgba(${tr},${tg},${tb},0.90)`);
        cG.addColorStop(1,   `rgba(${Math.round(tr*.5)},${Math.round(tg*.5)},${Math.round(tb*.5)},0.80)`);
        gx.fillStyle = cG; gx.fill();
        gx.strokeStyle = 'rgba(255,255,255,0.35)'; gx.lineWidth = 1.2; gx.stroke();
        // Reflet
        gx.beginPath();
        gx.moveTo(-4,-crystalH*.85); gx.lineTo(2,-crystalH*.5); gx.lineTo(-2,-crystalH*.5);
        gx.closePath(); gx.fillStyle='rgba(255,255,255,0.55)'; gx.fill();
        gx.restore();

        // Barre de vie
        const bw=80, bh=7, bx=tx-bw/2, by=ty-crystalH-26;
        gx.fillStyle='rgba(0,0,0,0.55)'; gx.fillRect(bx,by,bw,bh);
        const hG=gx.createLinearGradient(bx,0,bx+bw,0);
        hG.addColorStop(0,`rgba(${tr},${tg},${tb},0.9)`); hG.addColorStop(1,'rgba(255,255,255,0.7)');
        gx.fillStyle=hG; gx.fillRect(bx,by,bw*pct,bh);
        gx.strokeStyle='rgba(255,255,255,0.18)'; gx.lineWidth=0.8; gx.strokeRect(bx,by,bw,bh);

        // ── Ennemis ──
        enemies.forEach(e => {
            const [r,g,b] = e.col;
            const bounce = Math.abs(Math.sin(e.t*2.5))*5;
            const ey = FLOOR - e.r - bounce;

            // Ombre
            gx.save();
            gx.beginPath(); gx.ellipse(e.x, FLOOR, e.r*.9, 4, 0, 0, Math.PI*2);
            gx.fillStyle='rgba(0,0,0,0.32)'; gx.fill(); gx.restore();

            // Halo
            const eH=gx.createRadialGradient(e.x,ey,0,e.x,ey,e.r*2.2);
            eH.addColorStop(0,`rgba(${r},${g},${b},0.28)`); eH.addColorStop(1,'rgba(0,0,0,0)');
            gx.beginPath(); gx.arc(e.x,ey,e.r*2.2,0,Math.PI*2);
            gx.fillStyle=eH; gx.fill();

            // Corps
            gx.beginPath(); gx.arc(e.x,ey,e.r,0,Math.PI*2);
            const eG=gx.createRadialGradient(e.x-e.r*.3,ey-e.r*.3,0,e.x,ey,e.r);
            eG.addColorStop(0,'rgba(255,255,255,0.88)');
            eG.addColorStop(0.4,`rgba(${r},${g},${b},0.95)`);
            eG.addColorStop(1,`rgba(${Math.round(r*.5)},${Math.round(g*.5)},${Math.round(b*.5)},0.80)`);
            gx.fillStyle=eG; gx.fill();

            // Yeux
            const ed=e.dir>0?1:-1;
            gx.fillStyle='rgba(255,255,255,0.9)';
            gx.fillRect(e.x+ed*e.r*.22-3, ey-e.r*.22, 5, 5);
            gx.fillStyle='rgba(5,2,20,0.95)';
            gx.fillRect(e.x+ed*e.r*.22-2+ed, ey-e.r*.20, 3, 3);

            // HP bar
            const ew=e.r*2.2;
            gx.fillStyle='rgba(0,0,0,0.48)';
            gx.fillRect(e.x-ew/2, ey-e.r-8, ew, 3);
            gx.fillStyle=`rgba(${r},${g},${b},0.9)`;
            gx.fillRect(e.x-ew/2, ey-e.r-8, ew*(e.hp/e.maxHp), 3);
        });

        // ── Projectiles ──
        projectiles.forEach(p => {
            const [r,g,b]=p.col;
            p.trail.forEach((pt,i)=>{
                const a=(i/p.trail.length)*0.4;
                const tr=p.r*(i/p.trail.length)*.6;
                gx.beginPath(); gx.arc(pt.x,pt.y,tr,0,Math.PI*2);
                gx.fillStyle=`rgba(${r},${g},${b},${a})`; gx.fill();
            });
            const pH=gx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
            pH.addColorStop(0,`rgba(${r},${g},${b},0.55)`); pH.addColorStop(1,'rgba(0,0,0,0)');
            gx.beginPath(); gx.arc(p.x,p.y,p.r*3,0,Math.PI*2);
            gx.fillStyle=pH; gx.fill();
            gx.beginPath(); gx.arc(p.x,p.y,p.r,0,Math.PI*2);
            gx.fillStyle='rgba(255,255,255,0.95)'; gx.fill();
        });

        // ── Particules ──
        particles.forEach(p => {
            const [r,g,b]=p.col;
            gx.beginPath(); gx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);
            gx.fillStyle=`rgba(${r},${g},${b},${p.life*.85})`; gx.fill();
        });

        // ── HUD ──
        gx.save();
        gx.font='.50rem "Press Start 2P",monospace';
        gx.fillStyle='rgba(167,139,250,0.88)';
        gx.fillText(`VAGUE  ${String(wave).padStart(2,'0')}`, 22, 38);
        gx.fillStyle='rgba(251,191,36,0.88)';
        gx.fillText(`SCORE  ${score}`, 22, 62);
        gx.restore();

        // Pouvoirs actifs (bas gauche)
        gx.save();
        gx.font='.36rem "Press Start 2P",monospace';
        activePowers.forEach((p,i)=>{
            const [r,g,b]=p.col;
            gx.fillStyle=`rgba(${r},${g},${b},0.75)`;
            gx.fillText(`${p.icon} ${p.name}`, 18, FLOOR - 18 - i*17);
        });
        gx.restore();

        // Break — countdown
        if (wavePhase==='break') {
            const a = Math.min(1,(breakTimer/80));
            gx.save(); gx.globalAlpha=a; gx.textAlign='center';
            gx.font='.65rem "Press Start 2P",monospace';
            gx.shadowColor='rgba(56,189,248,.9)'; gx.shadowBlur=28;
            gx.fillStyle='rgba(186,230,253,.95)';
            gx.fillText(`— VAGUE ${wave+1} —`, GW/2, GH*.42);
            gx.restore();
        }

        // ── CARTES DE POUVOIR ──
        if (showingCards && cardChoices.length > 0) {
            drawCards();
        }

        // ── GAME OVER ──
        if (gameOver) {
            gx.save();
            gx.fillStyle='rgba(0,0,0,0.72)'; gx.fillRect(0,0,GW,GH);
            gx.textAlign='center';
            gx.font='1.0rem "Press Start 2P",monospace';
            gx.shadowColor='rgba(244,114,182,.9)'; gx.shadowBlur=40;
            gx.fillStyle='rgba(244,114,182,.95)';
            gx.fillText('GAME OVER', GW/2, GH*.38);
            gx.font='.48rem "Press Start 2P",monospace';
            gx.shadowBlur=0;
            gx.fillStyle='rgba(251,191,36,.90)';
            gx.fillText(`Score : ${score}   Vague : ${wave}`, GW/2, GH*.50);
            gx.fillStyle='rgba(167,139,250,.80)';
            gx.fillText('[ Cliquer pour rejouer ]', GW/2, GH*.62);
            gx.restore();
        }
    }

    // ══════════════════════════════════════
    //  DESSIN CARTES
    // ══════════════════════════════════════
    function drawCards() {
        // Fond assombri
        gx.fillStyle='rgba(0,0,0,0.68)';
        gx.fillRect(0,0,GW,GH);

        // Titre
        gx.save(); gx.textAlign='center';
        gx.font='.60rem "Press Start 2P",monospace';
        gx.shadowColor='rgba(167,139,250,.9)'; gx.shadowBlur=22;
        gx.fillStyle='rgba(221,214,254,.95)';
        gx.fillText('— CHOISISSEZ UN POUVOIR —', GW/2, GH*.20);
        gx.restore();

        const n     = cardChoices.length;
        const cw    = Math.min(220, GW*0.22);
        const ch    = cw * 1.55;
        const gap   = cw * 0.18;
        const total = n*cw + (n-1)*gap;
        const startX= GW/2 - total/2;
        const cardY = GH/2 - ch/2 - 10;

        cardChoices.forEach((card, i) => {
            const cx = startX + i*(cw+gap);
            const [r,g,b] = card.col;
            const hover = hoveredCard === i;
            const scale = hover ? 1.04 : 1.0;
            const scx   = cx + cw/2;
            const scy   = cardY + ch/2;

            gx.save();
            gx.translate(scx, scy);
            gx.scale(scale, scale);
            gx.translate(-cw/2, -ch/2);

            // Ombre portée
            gx.shadowColor=`rgba(${r},${g},${b},${hover?0.55:0.28})`;
            gx.shadowBlur = hover ? 38 : 20;

            // Fond de la carte — arche
            const arcR = cw/2;
            const flatH = ch - arcR;
            gx.beginPath();
            gx.moveTo(0, flatH);
            gx.lineTo(0, arcR);
            gx.arc(cw/2, arcR, arcR, Math.PI, 0);
            gx.lineTo(cw, flatH);
            gx.closePath();
            const cardBg = gx.createLinearGradient(0,0,0,ch);
            cardBg.addColorStop(0, `rgba(${Math.round(r*.25)},${Math.round(g*.20)},${Math.round(b*.35)},0.96)`);
            cardBg.addColorStop(0.5,`rgba(18,12,40,0.96)`);
            cardBg.addColorStop(1,  `rgba(10,8,28,0.98)`);
            gx.fillStyle=cardBg; gx.fill();

            // Bordure argentée / colorée
            gx.beginPath();
            gx.moveTo(0, flatH);
            gx.lineTo(0, arcR);
            gx.arc(cw/2, arcR, arcR, Math.PI, 0);
            gx.lineTo(cw, flatH);
            gx.closePath();
            const borderG = gx.createLinearGradient(0,0,cw,ch);
            borderG.addColorStop(0,  hover ? `rgba(${r},${g},${b},0.9)` : 'rgba(180,175,200,0.6)');
            borderG.addColorStop(0.5,hover ? `rgba(255,255,255,0.5)` : 'rgba(140,135,165,0.4)');
            borderG.addColorStop(1,  hover ? `rgba(${r},${g},${b},0.7)` : 'rgba(110,105,140,0.3)');
            gx.strokeStyle=borderG; gx.lineWidth=hover?2.5:1.8; gx.stroke();

            gx.shadowBlur=0;

            // Cercle décoratif de runes (simulé avec tirets)
            gx.save();
            gx.translate(cw/2, arcR);
            for (let d=0;d<24;d++) {
                const a=(d/24)*Math.PI*2;
                const ir=arcR*.72, or=arcR*.80;
                gx.beginPath();
                gx.moveTo(Math.cos(a)*ir, Math.sin(a)*ir);
                gx.lineTo(Math.cos(a)*or, Math.sin(a)*or);
                gx.strokeStyle=`rgba(${r},${g},${b},${hover?0.45:0.25})`;
                gx.lineWidth=1; gx.stroke();
            }
            // Cercle intérieur
            gx.beginPath(); gx.arc(0,0,arcR*.68,0,Math.PI*2);
            gx.strokeStyle=`rgba(${r},${g},${b},${hover?0.5:0.28})`; gx.lineWidth=0.8; gx.stroke();
            gx.restore();

            // Icône
            gx.save();
            gx.textAlign='center';
            gx.font=`${cw*.28}px sans-serif`;
            gx.fillStyle=`rgba(255,255,255,${hover?1:0.88})`;
            gx.shadowColor=`rgba(${r},${g},${b},0.8)`; gx.shadowBlur=hover?22:12;
            gx.fillText(card.icon, cw/2, arcR*1.08);
            gx.restore();

            // Nom
            gx.save();
            gx.textAlign='center';
            gx.font=`.36rem "Press Start 2P",monospace`;
            gx.fillStyle=`rgba(255,255,255,${hover?1:0.90})`;
            gx.shadowColor=`rgba(${r},${g},${b},0.7)`; gx.shadowBlur=hover?14:6;
            gx.fillText(card.name, cw/2, flatH - ch*.22);
            gx.restore();

            // Description (word wrap simple)
            gx.save();
            gx.textAlign='center';
            gx.font=`.28rem "Press Start 2P",monospace`;
            gx.fillStyle=`rgba(200,195,220,${hover?0.90:0.72})`;
            gx.shadowBlur=0;
            const words=card.desc.split(' ');
            let line='', ly=flatH-ch*.10;
            words.forEach(w=>{
                const test=line?line+' '+w:w;
                if (gx.measureText(test).width > cw*.80 && line) {
                    gx.fillText(line,cw/2,ly); ly+=14; line=w;
                } else { line=test; }
            });
            gx.fillText(line,cw/2,ly);
            gx.restore();

            // Bouton bas
            gx.save();
            gx.beginPath();
            gx.arc(cw/2, flatH+2, 8, 0, Math.PI*2);
            const btnG=gx.createRadialGradient(cw/2,flatH+2,0,cw/2,flatH+2,8);
            btnG.addColorStop(0,`rgba(${r},${g},${b},${hover?1:0.7})`);
            btnG.addColorStop(1,`rgba(${Math.round(r*.5)},${Math.round(g*.5)},${Math.round(b*.5)},0)`);
            gx.fillStyle=btnG; gx.fill();
            gx.restore();

            gx.restore(); // scale/translate
        });

        // Store card rects pour le hit-test (dans drawCards car les coords changent selon hover)
        window._lfCardRects = cardChoices.map((_, i) => {
            const cx = startX + i*(cw+gap);
            return { x:cx, y:cardY, w:cw, h:ch };
        });
    }

    // ── Hover carte ──
    let hoveredCard = -1;
    gc.addEventListener('mousemove', e => {
        if (!showingCards || !window._lfCardRects) return;
        const rects = window._lfCardRects;
        hoveredCard = rects.findIndex(r => e.clientX>=r.x && e.clientX<=r.x+r.w && e.clientY>=r.y && e.clientY<=r.y+r.h);
    });

    // ── Clic carte / game over ──
    gc.addEventListener('click', e => {
        if (gameOver) { startGame(); return; }
        if (showingCards && window._lfCardRects) {
            const rects = window._lfCardRects;
            const idx = rects.findIndex(r => e.clientX>=r.x && e.clientX<=r.x+r.w && e.clientY>=r.y && e.clientY<=r.y+r.h);
            if (idx >= 0) applyCard(cardChoices[idx]);
        }
    });

    // ══════════════════════════════════════
    //  GAME OVER / START
    // ══════════════════════════════════════
    function doGameOver() {
        gameOver = true;
        explode(tower.x, tower.y-30, [244,114,182], 40, true);
    }

    function startGame() {
        wave=1; score=0; gameOver=false; showingCards=false; hoveredCard=-1;
        wavePhase='spawning'; breakTimer=0; spawnTimer=0;
        enemies=[]; projectiles=[]; particles=[]; activePowers=[]; unlockedIds=[];
        cardChoices=[]; window._lfCardRects=null;
        Object.assign(tower, {
            hp:100, maxHp:100, fireRate:80, fireCooldown:0,
            multiShot:1, homing:false, nova:false, regen:false,
            piercing:false, damage:1, projSpeed:5.5, storm:false,
            doubleShot:false, delayedShots:[],
        });
        tower.x = GW/2; tower.y = FLOOR;
        buildWave(wave);
        gameRunning=true;
        window._lfGameActive=true;
        gc.style.display='block';
        gc.style.pointerEvents='auto';
        btn.innerHTML='✕ Quitter';
    }

    function stopGame() {
        gameRunning=false; window._lfGameActive=false;
        gc.style.display='none'; gc.style.pointerEvents='none';
        btn.innerHTML='⚔ Jouer';
        enemies=[]; projectiles=[]; particles=[];
    }

    // ══════════════════════════════════════
    //  BOUCLE
    // ══════════════════════════════════════
    function loop() { update(); drawGame(); requestAnimationFrame(loop); }
    resize(); loop();

    btn.addEventListener('click', () => {
        if (gameRunning && !gameOver) stopGame(); else startGame();
    });
})();