// ══════════════════════════════════════
//  THÈME MÉDIÉVAL — fond + effets
// ══════════════════════════════════════

// ── FOND : NUIT DE FORGE ──
(function () {
    const canvas = document.getElementById('theme-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    // Particules de braise
    const embers = Array.from({ length: 55 }, () => mkEmber());
    function mkEmber(bottom = false) {
        return {
            x: Math.random(),
            y: bottom ? 1.05 : Math.random(),
            vx: (Math.random() - 0.5) * 0.0008,
            vy: -(0.001 + Math.random() * 0.002),
            r: 1 + Math.random() * 2.5,
            life: 0.4 + Math.random() * 0.6,
            decay: 0.002 + Math.random() * 0.003,
            t: Math.random() * Math.PI * 2,
            s: 0.03 + Math.random() * 0.04,
            hue: 15 + Math.floor(Math.random() * 25) // orange-rouge
        };
    }

    // Quelques étoiles médiévales (très peu, très discrètes)
    const stars = Array.from({ length: 30 }, () => ({
        x: Math.random(), y: Math.random() * 0.45,
        r: Math.random() * 0.7 + 0.2,
        a: Math.random() * 0.2 + 0.03,
        t: Math.random() * Math.PI * 2, s: 0.005 + Math.random() * 0.008
    }));

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Ciel nuit —bordeaux très sombre
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0,    'rgba(5,3,2,1)');
        sky.addColorStop(0.45, 'rgba(10,5,3,1)');
        sky.addColorStop(0.75, 'rgba(18,8,5,1)');
        sky.addColorStop(1,    'rgba(25,10,5,1)');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        // Lueur forge (bas de l'écran)
        const forge = ctx.createRadialGradient(W*0.5, H*1.1, 0, W*0.5, H*1.1, H*0.6);
        forge.addColorStop(0, 'rgba(180,60,10,0.22)');
        forge.addColorStop(0.5, 'rgba(120,30,5,0.1)');
        forge.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = forge;
        ctx.fillRect(0, H * 0.4, W, H * 0.6);

        // Étoiles
        stars.forEach(s => {
            s.t += s.s;
            const a = s.a + Math.sin(s.t) * 0.05;
            ctx.beginPath();
            ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,220,180,${Math.max(0, a)})`;
            ctx.fill();
        });

        // Braise
        embers.forEach((e, i) => {
            e.t += e.s;
            e.x += e.vx + Math.sin(e.t) * 0.0003;
            e.y += e.vy;
            e.life -= e.decay;

            if (e.life <= 0 || e.y < -0.05) {
                embers[i] = mkEmber(true);
                return;
            }

            const a = e.life * 0.85;
            const grd = ctx.createRadialGradient(e.x*W, e.y*H, 0, e.x*W, e.y*H, e.r * 4);
            grd.addColorStop(0, `rgba(255,${120 + e.hue * 3},20,${a})`);
            grd.addColorStop(0.4, `rgba(220,80,10,${a * 0.4})`);
            grd.addColorStop(1, `rgba(180,40,5,0)`);
            ctx.beginPath();
            ctx.arc(e.x * W, e.y * H, e.r * 4, 0, Math.PI * 2);
            ctx.fillStyle = grd; ctx.fill();
            ctx.beginPath();
            ctx.arc(e.x * W, e.y * H, e.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,230,180,${a * 0.9})`;
            ctx.fill();
        });

        // Silhouette château (très simple, fond)
        drawCastle(ctx, W, H);

        requestAnimationFrame(draw);
    }
    draw();
})();

function drawCastle(ctx, W, H) {
    const C = 'rgba(6,3,1,';  // couleur de base — noir quasi total, légère teinte bordeaux
    const base = H * 0.78;    // ligne du sol

    // ── Helpers ──
    function merlons(x, y, totalW, mW, mH, gap, n) {
        // Dessine n créneaux (merlons + créneaux) sur une largeur totalW
        ctx.save();
        ctx.fillStyle = C + '0.97)';
        const step = totalW / n;
        for (let i = 0; i < n; i++) {
            ctx.fillRect(x + i * step, y - mH, mW, mH);
        }
        ctx.restore();
    }

    function tower(cx, baseY, tw, th, nMerlons, hasKeep) {
        ctx.save();
        // Corps de la tour
        ctx.fillStyle = C + '0.97)';
        ctx.fillRect(cx - tw/2, baseY - th, tw, th + H * 0.4);

        // Légère texture : variation de teinte sur les côtés
        const sideG = ctx.createLinearGradient(cx - tw/2, 0, cx + tw/2, 0);
        sideG.addColorStop(0,   'rgba(0,0,0,0.35)');
        sideG.addColorStop(0.3, 'rgba(0,0,0,0)');
        sideG.addColorStop(0.7, 'rgba(0,0,0,0)');
        sideG.addColorStop(1,   'rgba(0,0,0,0.40)');
        ctx.fillStyle = sideG;
        ctx.fillRect(cx - tw/2, baseY - th, tw, th);

        // Merlons du sommet
        const mW = tw / (nMerlons * 2 - 1);
        const mH = tw * 0.14;
        ctx.fillStyle = C + '0.97)';
        for (let i = 0; i < nMerlons; i++) {
            const mx = cx - tw/2 + i * (mW * 2);
            ctx.fillRect(mx, baseY - th - mH, mW, mH);
        }

        // Fenêtres éclairées (2-3 par tour)
        const nWin = hasKeep ? 4 : 2;
        for (let i = 0; i < nWin; i++) {
            const wy = baseY - th * (0.25 + i * (0.55 / nWin));
            const ww = tw * 0.14, wh = tw * 0.22;
            const wx = cx;
            // Arche de fenêtre
            ctx.beginPath();
            ctx.moveTo(wx - ww/2, wy + wh/2);
            ctx.lineTo(wx - ww/2, wy);
            ctx.arc(wx, wy, ww/2, Math.PI, 0);
            ctx.lineTo(wx + ww/2, wy + wh/2);
            ctx.closePath();

            // Lueur orange-feu depuis l'intérieur
            const flicker = 0.55 + Math.sin(Date.now() * 0.003 + i * 1.7 + cx * 0.01) * 0.15;
            const wg = ctx.createRadialGradient(wx, wy + wh*0.2, 0, wx, wy + wh*0.2, tw * 0.35);
            wg.addColorStop(0,   `rgba(255,${140 + i*15},30,${flicker})`);
            wg.addColorStop(0.4, `rgba(200,80,10,${flicker * 0.5})`);
            wg.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.fillStyle = wg; ctx.fill();

            // Halo externe (reflet sur la pierre)
            const halo = ctx.createRadialGradient(wx, wy, 0, wx, wy, tw * 0.5);
            halo.addColorStop(0,   `rgba(200,80,10,${flicker * 0.12})`);
            halo.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.beginPath(); ctx.arc(wx, wy, tw * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = halo; ctx.fill();
        }

        ctx.restore();
    }

    function wall(x1, y1, x2, y2, wallH, nMerlons) {
        ctx.save();
        ctx.fillStyle = C + '0.97)';
        ctx.fillRect(x1, y1 - wallH, x2 - x1, wallH + H * 0.4);

        // Ombre portée sur le mur (dégradé vertical)
        const wg = ctx.createLinearGradient(0, y1 - wallH, 0, y1);
        wg.addColorStop(0,   'rgba(0,0,0,0.20)');
        wg.addColorStop(0.5, 'rgba(0,0,0,0)');
        ctx.fillStyle = wg;
        ctx.fillRect(x1, y1 - wallH, x2 - x1, wallH);

        // Merlons du mur
        const mW = (x2 - x1) / (nMerlons * 2 - 1);
        const mH = Math.max(8, wallH * 0.15);
        ctx.fillStyle = C + '0.97)';
        for (let i = 0; i < nMerlons; i++) {
            ctx.fillRect(x1 + i * mW * 2, y1 - wallH - mH, mW, mH);
        }
        ctx.restore();
    }

    function arch(cx, baseY, w, h) {
        // Porte en ogive (arc brisé gothique)
        ctx.save();
        ctx.fillStyle = 'rgba(2,0,0,1)';
        ctx.beginPath();
        ctx.moveTo(cx - w/2, baseY);
        ctx.lineTo(cx - w/2, baseY - h * 0.5);
        // Arc brisé : deux arcs qui se rejoignent au sommet
        ctx.arc(cx - w/2 + w * 0.35, baseY - h * 0.5, w * 0.35, Math.PI, Math.PI * 1.55, false);
        ctx.arc(cx + w/2 - w * 0.35, baseY - h * 0.5, w * 0.35, Math.PI * 1.45, 0, false);
        ctx.lineTo(cx + w/2, baseY);
        ctx.closePath();
        ctx.fill();

        // Herse (grille) dans la porte
        ctx.strokeStyle = 'rgba(15,5,0,0.8)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            const bx = cx - w/2 + (i+1) * w / 4;
            ctx.beginPath(); ctx.moveTo(bx, baseY); ctx.lineTo(bx, baseY - h * 0.5);
            ctx.stroke();
        }
        for (let j = 0; j < 3; j++) {
            const by = baseY - j * h * 0.16;
            ctx.beginPath(); ctx.moveTo(cx - w/2, by); ctx.lineTo(cx + w/2, by);
            ctx.stroke();
        }
        ctx.restore();
    }

    // ══ COMPOSITION ══
    // Plan arrière : remparts lointains (très sombres, simples)
    ctx.save();
    ctx.globalAlpha = 0.55;
    tower(W * 0.08, base - H*0.06, W*0.05, H*0.20, 3, false);
    tower(W * 0.88, base - H*0.06, W*0.045, H*0.18, 3, false);
    wall(W*0.10, base - H*0.06, W*0.20, base - H*0.06, H*0.11, 5);
    wall(W*0.75, base - H*0.06, W*0.87, base - H*0.06, H*0.10, 4);
    ctx.restore();

    // Plan milieu : aile gauche + droite
    ctx.save();
    ctx.globalAlpha = 0.80;
    tower(W * 0.18, base, W*0.07, H*0.30, 4, false);
    tower(W * 0.78, base, W*0.065, H*0.28, 4, false);
    wall(W*0.215, base, W*0.355, base, H*0.17, 6);
    wall(W*0.625, base, W*0.747, base, H*0.16, 6);
    ctx.restore();

    // Plan avant : donjon central imposant
    // Tours flanquantes du donjon
    tower(W * 0.38, base, W*0.09, H*0.50, 5, false);
    tower(W * 0.62, base, W*0.09, H*0.50, 5, false);

    // Donjon central (le plus haut)
    tower(W * 0.50, base, W*0.13, H*0.62, 6, true);

    // Mur de courtine entre les tours du donjon
    wall(W*0.425, base, W*0.575, base, H*0.33, 8);

    // Porte principale (grande, au centre du mur de courtine)
    arch(W * 0.50, base, W * 0.06, H * 0.18);

    // Petites portes latérales
    arch(W * 0.435, base, W * 0.028, H * 0.10);
    arch(W * 0.565, base, W * 0.028, H * 0.10);

    // ── Sol / base ──
    ctx.fillStyle = C + '0.97)';
    ctx.fillRect(0, base, W, H - base);

    // Lueur forge au pied du château (reflet des flammes sur les pierres)
    const groundGlow = ctx.createLinearGradient(0, base - H*0.05, 0, base + H*0.05);
    groundGlow.addColorStop(0,   'rgba(140,40,5,0)');
    groundGlow.addColorStop(0.5, 'rgba(120,35,5,0.08)');
    groundGlow.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = groundGlow;
    ctx.fillRect(W*0.25, base - H*0.05, W*0.5, H*0.10);
}

// ── RUNE GLOW ──
(function () {
    const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'.split('');

    const overlay = document.createElement('div');
    overlay.id = 'rune-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;';
    document.body.appendChild(overlay);

    function spawnRune() {
        const el = document.createElement('span');
        el.className = 'rune-glyph';
        el.textContent = RUNES[Math.floor(Math.random() * RUNES.length)];
        el.style.cssText = `
            position:absolute;
            left:${5 + Math.random() * 90}%;
            top:${5 + Math.random() * 90}%;
            font-size:${1.2 + Math.random() * 2.5}rem;
            color:rgba(201,146,42,0);
            text-shadow:0 0 20px rgba(201,146,42,0);
            font-family:serif;
            animation:rune-appear ${2 + Math.random() * 3}s ease-in-out forwards;
            animation-delay:0s;
        `;
        overlay.appendChild(el);
        setTimeout(() => el.remove(), 6000);
        setTimeout(spawnRune, 1200 + Math.random() * 2000);
    }
    setTimeout(spawnRune, 1000);
    setTimeout(spawnRune, 2500);
    setTimeout(spawnRune, 4000);
})();

// ── BROUILLARD ──
// window._medievalWind : { force: 0→1, dir: +1/-1 } — alimenté par l'événement vent
window._medievalWind = { force: 0, dir: 1 };

(function () {
    const cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
    document.body.appendChild(cvs);
    const ctx = cvs.getContext('2d');
    let W, H;
    function resize() { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const LAYERS = 3;
    const volutes = [];

    function mkVolute(random = false) {
        const layer = Math.floor(Math.random() * LAYERS); // 0=loin, 2=proche
        const depthScale = 0.4 + layer * 0.30; // plus proche = plus grand et plus opaque
        return {
            x:     random ? Math.random() * 1.2 - 0.1 : (Math.random() > 0.5 ? -0.15 : 1.05),
            y:     0.72 + Math.random() * 0.30,         // sol et un peu au-dessus
            rx:    (0.10 + Math.random() * 0.18) * depthScale * 1.4, // demi-largeur
            ry:    (0.04 + Math.random() * 0.06) * depthScale,        // demi-hauteur
            vx:    (0.00012 + Math.random() * 0.00018) * (Math.random() > 0.5 ? 1 : -1),
            vy:    -(0.00002 + Math.random() * 0.00004), // monte très lentement
            alpha: (0.04 + Math.random() * 0.06) * depthScale,
            t:     Math.random() * Math.PI * 2,
            s:     0.003 + Math.random() * 0.004,  // oscillation
            layer,
        };
    }

    // Remplir avec des volutes initiales réparties
    for (let i = 0; i < 28; i++) volutes.push(mkVolute(true));

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Trier par layer pour le rendu (loin d'abord)
        volutes.sort((a, b) => a.layer - b.layer);

        volutes.forEach((v, i) => {
            v.t  += v.s;
            // Vent : pousse les volutes dans la direction du vent, couches proches plus vite
            const wind = window._medievalWind;
            const windPush = wind.force * wind.dir * (0.00025 + v.layer * 0.00015);
            v.x  += v.vx + windPush + Math.sin(v.t * 0.4) * 0.00008;
            v.y  += v.vy + Math.sin(v.t * 0.6) * 0.000015;

            // Recycler si hors écran
            if (v.x > 1.2 || v.x < -0.2 || v.y < 0.55) {
                volutes[i] = mkVolute(false);
                return;
            }

            const cx = v.x * W;
            const cy = v.y * H;
            const rx = v.rx * W;
            const ry = v.ry * H;

            // Dégradé radial sur l'ellipse — centre légèrement opaque, bords transparents
            // On simule une ellipse en scalant le contexte
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1, ry / rx); // étirer verticalement pour ellipse

            const fog = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
            // Couleur : gris bleuté très froid, teinte nuit médiévale
            const pulse = v.alpha * (0.85 + Math.sin(v.t) * 0.15);
            fog.addColorStop(0,   `rgba(160,155,170,${pulse})`);
            fog.addColorStop(0.4, `rgba(130,125,145,${pulse * 0.55})`);
            fog.addColorStop(0.75,`rgba(100,95,115,${pulse * 0.20})`);
            fog.addColorStop(1,   'rgba(80,75,95,0)');

            ctx.beginPath();
            ctx.arc(0, 0, rx, 0, Math.PI * 2);
            ctx.fillStyle = fog;
            ctx.fill();
            ctx.restore();
        });

        // Nappe de brouillard au sol — gradient horizontal fixe très subtil
        // Donne l'impression que le brouillard sort de la base du château
        const base = H * 0.78;
        const groundFog = ctx.createLinearGradient(0, base - H*0.08, 0, base + H*0.05);
        groundFog.addColorStop(0,   'rgba(120,115,135,0)');
        groundFog.addColorStop(0.4, 'rgba(120,115,135,0.055)');
        groundFog.addColorStop(0.7, 'rgba(100,95,115,0.035)');
        groundFog.addColorStop(1,   'rgba(80,75,95,0)');
        ctx.fillStyle = groundFog;
        ctx.fillRect(0, base - H*0.08, W, H*0.13);

        requestAnimationFrame(draw);
    }
    draw();
})();

// ── ÉVÉNEMENTS MÉDIÉVAUX ──
(function () {
    const cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none;';
    document.body.appendChild(cvs);
    const ctx = cvs.getContext('2d');
    let W, H;
    function resize() { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    let activeEvent = null;

    function trigger(ev) {
        activeEvent = ev.start();
        activeEvent._done = false;
    }

    // ══════════════════════════════════════
    // 1. ÉCLAIR
    // ══════════════════════════════════════
    function startLightning() {
        let t = 0;
        function mkBolt(x1,y1,x2,y2,depth) {
            if (depth === 0) return [[x1,y1,x2,y2]];
            const mx = (x1+x2)/2 + (Math.random()-0.5)*(x2-x1)*0.8;
            const my = (y1+y2)/2 + (Math.random()-0.5)*(y2-y1)*0.5;
            const segs = [...mkBolt(x1,y1,mx,my,depth-1), ...mkBolt(mx,my,x2,y2,depth-1)];
            if (depth > 1 && Math.random()>0.5) {
                const bx = mx + (Math.random()-0.5)*W*0.14;
                const by = my + Math.random()*H*0.12;
                segs.push(...mkBolt(mx,my,bx,by,depth-2));
            }
            return segs;
        }
        const lx = W*(0.20+Math.random()*0.60);
        const bolt = mkBolt(lx, H*0.01, lx+(Math.random()-0.5)*W*0.08, H*(0.30+Math.random()*0.25), 5);
        const flashes = [0, 10, 18];
        return {
            update() {
                t++;
                const isFlash = flashes.some(f => t >= f && t < f+4);
                if (isFlash) {
                    ctx.save();
                    ctx.globalAlpha = 0.07 + Math.random()*0.05;
                    ctx.fillStyle = 'rgba(190,205,255,1)';
                    ctx.fillRect(0,0,W,H);
                    ctx.restore();
                    ctx.save();
                    ctx.strokeStyle = 'rgba(220,230,255,0.96)';
                    ctx.lineWidth = 2;
                    ctx.shadowColor = 'rgba(160,185,255,1)';
                    ctx.shadowBlur = 14;
                    bolt.forEach(([x1,y1,x2,y2]) => {
                        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
                    });
                    ctx.lineWidth = 6;
                    ctx.globalAlpha = 0.08;
                    ctx.strokeStyle = 'rgba(180,200,255,1)';
                    ctx.shadowBlur = 30;
                    bolt.forEach(([x1,y1,x2,y2]) => {
                        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
                    });
                    ctx.restore();
                }
                if (t > 80) this._done = true;
            }
        };
    }

    // ══════════════════════════════════════
    // 2. PLUIE DE CENDRES
    // ══════════════════════════════════════
    function startAshRain() {
        let t = 0;
        const dur = 1800;
        const ashes = Array.from({length: 120}, () => ({
            x: Math.random() * W,
            y: -Math.random() * H * 0.5,
            vx: -0.3 - Math.random() * 0.5,
            vy: 0.5 + Math.random() * 1.0,
            size: 1 + Math.random() * 2.5,
            alpha: 0.2 + Math.random() * 0.45,
            t: Math.random() * Math.PI * 2,
            s: 0.015 + Math.random() * 0.02,
            rot: Math.random() * Math.PI,
            rotV: (Math.random()-0.5) * 0.03,
        }));
        return {
            update() {
                t++;
                const prog = t / dur;
                const envAlpha = prog < 0.15 ? prog/0.15 : prog > 0.80 ? (1-prog)/0.20 : 1;
                ashes.forEach(a => {
                    a.t += a.s;
                    a.x += a.vx + Math.sin(a.t) * 0.4;
                    a.y += a.vy;
                    a.rot += a.rotV;
                    if (a.y > H + 10) { a.y = -10; a.x = Math.random() * W; }
                    ctx.save();
                    ctx.translate(a.x, a.y);
                    ctx.rotate(a.rot);
                    ctx.globalAlpha = a.alpha * envAlpha;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, a.size, a.size * 0.5, 0, 0, Math.PI*2);
                    ctx.fillStyle = 'rgba(180,170,165,1)';
                    ctx.fill();
                    ctx.restore();
                });
                if (t >= dur) this._done = true;
            }
        };
    }

    // ══════════════════════════════════════
    // 3. AURORE BORÉALE
    // ══════════════════════════════════════
    function startAurora() {
        let t = 0;
        const dur = 700;
        const bands = Array.from({length: 5}, (_, i) => ({
            yBase: H * (0.05 + i * 0.055),
            amp:   H * (0.04 + Math.random() * 0.06),
            freq:  0.003 + Math.random() * 0.003,
            phase: Math.random() * Math.PI * 2,
            speed: 0.008 + Math.random() * 0.006,
            hue:   [145, 160, 175, 200, 250][i],
            sat:   55 + Math.random() * 25,
            alpha: 0.06 + Math.random() * 0.08,
            width: H * (0.03 + Math.random() * 0.04),
        }));
        return {
            update() {
                t++;
                const prog = t / dur;
                const envAlpha = prog < 0.18 ? prog/0.18 : prog > 0.78 ? (1-prog)/0.22 : 1;
                bands.forEach(b => {
                    b.phase += b.speed;
                    ctx.save();
                    ctx.globalAlpha = b.alpha * envAlpha;
                    const steps = Math.ceil(W / 6);
                    for (let i = 0; i < steps - 1; i++) {
                        const x1 = (i / steps) * W;
                        const x2 = ((i+1) / steps) * W;
                        const y1 = b.yBase + Math.sin(x1*b.freq+b.phase)*b.amp + Math.sin(x1*b.freq*1.7+b.phase*1.3)*b.amp*0.4;
                        const y2 = b.yBase + Math.sin(x2*b.freq+b.phase)*b.amp + Math.sin(x2*b.freq*1.7+b.phase*1.3)*b.amp*0.4;
                        const grad = ctx.createLinearGradient(x1, y1-b.width, x1, y1+b.width*1.5);
                        grad.addColorStop(0,    `hsla(${b.hue},${b.sat}%,55%,0)`);
                        grad.addColorStop(0.30, `hsla(${b.hue},${b.sat}%,60%,0.85)`);
                        grad.addColorStop(0.55, `hsla(${b.hue},${b.sat}%,50%,0.70)`);
                        grad.addColorStop(1,    `hsla(${b.hue},${b.sat}%,35%,0)`);
                        ctx.beginPath();
                        ctx.moveTo(x1, y1-b.width); ctx.lineTo(x2, y2-b.width);
                        ctx.lineTo(x2, y2+b.width*1.5); ctx.lineTo(x1, y1+b.width*1.5);
                        ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
                    }
                    ctx.restore();
                });
                if (t >= dur) this._done = true;
            }
        };
    }

    // ══════════════════════════════════════
    // 4. ÉTOILE FILANTE
    // ══════════════════════════════════════
    function startStar() {
        const sx = W*(0.05+Math.random()*0.55);
        const sy = H * 0.03;
        const ang = 0.28 + Math.random() * 0.55;
        const speed = W * 0.020;
        let t = 0; const dur = 85;
        const trail = [];
        return {
            update() {
                t++;
                const prog = t / dur;
                const x = sx + Math.cos(ang)*speed*t;
                const y = sy + Math.sin(ang)*speed*t;
                trail.push({x, y});
                if (trail.length > 26) trail.shift();
                const alpha = prog < 0.12 ? prog/0.12 : prog > 0.65 ? (1-prog)/0.35 : 1;
                trail.forEach((p, i) => {
                    const frac = i / trail.length;
                    const ta = frac * alpha * 0.88;
                    const r = 3.5 * frac;
                    const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*3.5);
                    g.addColorStop(0,  `rgba(240,230,200,${ta})`);
                    g.addColorStop(0.5,`rgba(210,195,155,${ta*0.5})`);
                    g.addColorStop(1,  'rgba(180,160,110,0)');
                    ctx.beginPath(); ctx.arc(p.x,p.y,r*3.5,0,Math.PI*2);
                    ctx.fillStyle=g; ctx.fill();
                });
                const hg = ctx.createRadialGradient(x,y,0,x,y,6);
                hg.addColorStop(0,  `rgba(255,252,235,${alpha})`);
                hg.addColorStop(0.5,`rgba(240,228,190,${alpha*0.6})`);
                hg.addColorStop(1,  'rgba(200,180,130,0)');
                ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2);
                ctx.fillStyle=hg; ctx.fill();
                if (t >= dur) this._done = true;
            }
        };
    }

    // ══════════════════════════════════════
    // 5. BRUME ÉPAISSE
    // ══════════════════════════════════════
    function startThickFog() {
        let t = 0; const dur = 520;
        const volutes = Array.from({length: 22}, () => ({
            x: Math.random(),
            y: 0.76 + Math.random() * 0.20,
            vx: (Math.random()-0.5) * 0.00032,
            ry: 0.035 + Math.random() * 0.065,
            rx: 0.10 + Math.random() * 0.24,
            t: Math.random() * Math.PI * 2,
            s: 0.003 + Math.random() * 0.004,
        }));
        return {
            update() {
                t++;
                const prog = t / dur;
                const envAlpha = prog < 0.20 ? prog/0.20 : prog > 0.75 ? (1-prog)/0.25 : 1;
                volutes.forEach(v => {
                    v.t += v.s;
                    v.x += v.vx + Math.sin(v.t*0.4)*0.00005;
                    if (v.x > 1.2) v.x = -0.2;
                    if (v.x < -0.2) v.x = 1.2;
                    const cx2=v.x*W, cy2=v.y*H, rx=v.rx*W, ry=v.ry*H;
                    ctx.save();
                    ctx.translate(cx2,cy2); ctx.scale(1,ry/rx);
                    const fog = ctx.createRadialGradient(0,0,0,0,0,rx);
                    fog.addColorStop(0,   `rgba(145,140,158,${envAlpha*0.20})`);
                    fog.addColorStop(0.5, `rgba(115,110,128,${envAlpha*0.09})`);
                    fog.addColorStop(1,   'rgba(85,80,98,0)');
                    ctx.beginPath(); ctx.arc(0,0,rx,0,Math.PI*2);
                    ctx.fillStyle=fog; ctx.fill();
                    ctx.restore();
                });
                if (t >= dur) this._done = true;
            }
        };
    }

    // ══════════════════════════════════════
    // 6. PLUIE FINE
    // ══════════════════════════════════════
    function startRain() {
        let t = 0;
        const dur = 1400;
        const DROP_COUNT = 340;
        const drops = Array.from({length: DROP_COUNT}, () => ({
            x:    Math.random() * W * 1.3 - W * 0.15,
            y:    Math.random() * H,
            len:  6 + Math.random() * 10,
            speed:9 + Math.random() * 7,
            alpha:0.12 + Math.random() * 0.22,
        }));
        const ang = 0.22; // diagonale légère
        const cosA = Math.cos(ang), sinA = Math.sin(ang);
        return {
            update() {
                t++;
                const prog = t / dur;
                const envAlpha = prog < 0.12 ? prog/0.12 : prog > 0.82 ? (1-prog)/0.18 : 1;

                ctx.save();
                ctx.strokeStyle = 'rgba(180,185,200,1)';
                ctx.lineCap = 'round';

                drops.forEach(d => {
                    d.x += cosA * d.speed * 0.55;
                    d.y += sinA * d.speed + d.speed;
                    if (d.y > H + 20) {
                        d.y = -20;
                        d.x = Math.random() * W * 1.3 - W * 0.15;
                    }
                    if (d.x > W + 20) d.x -= W * 1.3;

                    ctx.globalAlpha = d.alpha * envAlpha;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(d.x, d.y);
                    ctx.lineTo(d.x - cosA * d.len, d.y - (sinA + 1) * d.len);
                    ctx.stroke();
                });

                // Légère brume au sol (pluie qui rebondit)
                const splash = ctx.createLinearGradient(0, H*0.75, 0, H);
                splash.addColorStop(0, 'rgba(160,165,180,0)');
                splash.addColorStop(0.5,`rgba(160,165,180,${envAlpha*0.04})`);
                splash.addColorStop(1, 'rgba(160,165,180,0)');
                ctx.globalAlpha = 1;
                ctx.fillStyle = splash;
                ctx.fillRect(0, H*0.75, W, H*0.25);

                ctx.restore();
                if (t >= dur) this._done = true;
            }
        };
    }

    // ══════════════════════════════════════
    // 8. VENT
    // ══════════════════════════════════════
    function startWind() {
        let t = 0;
        const dur = 1000;
        const STREAK_COUNT = 180;
        const streaks = Array.from({length: STREAK_COUNT}, () => ({
            x:     Math.random() * W * 1.4 - W * 0.2,
            y:     Math.random() * H * 0.85,
            len:   20 + Math.random() * 60,
            speed: 5 + Math.random() * 9,
            alpha: 0.05 + Math.random() * 0.13,
            vy:    (Math.random()-0.5) * 0.4,
            delay: Math.floor(Math.random() * 80),
        }));

        return {
            update() {
                t++;
                const prog = t / dur;
                const envAlpha = prog < 0.10 ? prog/0.10 : prog > 0.82 ? (1-prog)/0.18 : 1;
                // Rafales : vitesse qui pulse par vagues
                const gustFactor = 0.7 + Math.sin(t*0.04)*0.2 + Math.sin(t*0.09)*0.1;

                // Alimenter le brouillard permanent
                window._medievalWind.force = envAlpha * gustFactor;
                window._medievalWind.dir   = 1; // toujours de gauche à droite

                ctx.save();
                streaks.forEach(s => {
                    if (t < s.delay) return;
                    const spd = s.speed * gustFactor;
                    s.x += spd;
                    s.y += s.vy;
                    if (s.x > W + 80) {
                        s.x = -s.len - Math.random()*W*0.3;
                        s.y = Math.random() * H * 0.85;
                    }

                    // Longueur qui varie avec la rafale
                    const dynLen = s.len * gustFactor;
                    const a = s.alpha * envAlpha;

                    // Trait avec dégradé — plus opaque au milieu
                    const g = ctx.createLinearGradient(s.x - dynLen, s.y, s.x, s.y);
                    g.addColorStop(0,   'rgba(200,195,210,0)');
                    g.addColorStop(0.4, `rgba(200,195,210,${a})`);
                    g.addColorStop(0.75,`rgba(200,195,210,${a*0.6})`);
                    g.addColorStop(1,   'rgba(200,195,210,0)');

                    ctx.beginPath();
                    ctx.moveTo(s.x - dynLen, s.y);
                    ctx.lineTo(s.x, s.y);
                    ctx.strokeStyle = g;
                    ctx.lineWidth = 0.7 + Math.random()*0.4;
                    ctx.stroke();
                });
                ctx.restore();

                if (t >= dur) {
                    window._medievalWind.force = 0;
                    this._done = true;
                }
            }
        };
    }

    // ── Registre ──
    const EVENTS = [
        { id:'lightning', icon:'⚡', name:'Éclair',       start: startLightning },
        { id:'ash',       icon:'🌑', name:'Cendres',       start: startAshRain   },
        { id:'aurora',    icon:'🌌', name:'Aurore',         start: startAurora    },
        { id:'star',      icon:'✨', name:'Étoile',         start: startStar      },
        { id:'fog',       icon:'🌫', name:'Brume',          start: startThickFog  },
        { id:'rain',      icon:'🌧', name:'Pluie',          start: startRain      },
        { id:'wind',      icon:'💨', name:'Vent',           start: startWind      },
    ];

    // ── Panneau d'ambiance (gauche) ──
    const panel = document.createElement('div');
    panel.style.cssText = `
        position:fixed; right:18px; top:50%; transform:translateY(-50%);
        z-index:9999; display:flex; flex-direction:column; gap:5px;
        background:rgba(5,2,1,0.80); border:1px solid rgba(130,70,10,0.28);
        border-radius:10px; padding:10px 8px;
        backdrop-filter:blur(12px);
    `;

    let activeBtn = null;
    let activeEvObj = null;

    EVENTS.forEach(ev => {
        const btn = document.createElement('button');
        btn.innerHTML = `<span style="font-size:1.05rem;display:block">${ev.icon}</span><span style="font-size:0.62rem;letter-spacing:.05em;display:block;margin-top:2px;opacity:0.85">${ev.name}</span>`;
        btn.style.cssText = `
            background:rgba(15,5,1,0.70); border:1px solid rgba(110,48,6,0.25);
            color:rgba(195,128,40,0.78); font-family:serif;
            width:56px; padding:8px 4px; border-radius:7px; cursor:pointer;
            transition:all .18s; text-align:center; line-height:1.25;
        `;

        const setActive = () => {
            btn.style.background    = 'rgba(75,24,3,0.92)';
            btn.style.borderColor   = 'rgba(185,105,18,0.55)';
            btn.style.color         = 'rgba(235,172,65,1)';
            btn.style.boxShadow     = '0 0 12px rgba(150,65,8,0.30), inset 0 0 8px rgba(150,65,8,0.12)';
        };
        const setInactive = () => {
            btn.style.background    = 'rgba(15,5,1,0.70)';
            btn.style.borderColor   = 'rgba(110,48,6,0.25)';
            btn.style.color         = 'rgba(195,128,40,0.78)';
            btn.style.boxShadow     = 'none';
        };

        btn.onmouseenter = () => { if (btn !== activeBtn) btn.style.background = 'rgba(40,12,2,0.88)'; };
        btn.onmouseleave = () => { if (btn !== activeBtn) setInactive(); };

        btn.onclick = () => {
            if (activeBtn === btn) {
                // Clic sur bouton actif → éteindre
                setInactive();
                activeBtn = null;
                activeEvObj = null;
                activeEvent = null;
                window._medievalWind && (window._medievalWind.force = 0);
                return;
            }
            if (activeBtn) setInactive();
            activeBtn = btn;
            activeEvObj = ev;
            setActive();
            activeEvent = null;
            trigger(ev);
        };

        panel.appendChild(btn);
    });

    document.body.appendChild(panel);

    // ── Boucle — relance l'event actif en boucle tant que le bouton est pressé ──
    function draw() {
        ctx.clearRect(0, 0, W, H);
        if (activeEvent) {
            activeEvent.update();
            if (activeEvent._done) {
                if (activeEvObj) {
                    // Relancer immédiatement
                    trigger(activeEvObj);
                } else {
                    activeEvent = null;
                }
            }
        }
        requestAnimationFrame(draw);
    }

    draw();
})();