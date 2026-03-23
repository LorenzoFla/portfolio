// ══════════════════════════════════════
//  THÈME CYBER-TOKYO — fond + effets
// ══════════════════════════════════════

// ── FOND : BLADE RUNNER ──
(function () {
    const canvas = document.getElementById('theme-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    // ── Pluie fine ──
    const rain = Array.from({ length: 220 }, () => mkRain());
    function mkRain(fromTop = false) {
        return {
            x:     Math.random() * 1.2 - 0.1,
            y:     fromTop ? -0.05 : Math.random(),
            len:   0.018 + Math.random() * 0.03,
            speed: 0.006 + Math.random() * 0.008,
            alpha: 0.04 + Math.random() * 0.1,
            w:     0.3 + Math.random() * 0.5,
        };
    }

    // ── Skyline (générée une fois) ──
    const buildings = [];
    (function () {
        let x = 0;
        while (x < 1.05) {
            const bw = 0.02 + Math.random() * 0.055;
            const bh = 0.12 + Math.random() * 0.32;
            const wins = [];
            const cols = Math.max(1, Math.floor(bw * 900 / 10));
            const rows = Math.max(1, Math.floor(bh * 700 / 14));
            const palettes = [[22,211,238],[192,38,211],[244,114,182],[250,220,100],[200,200,255]];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (Math.random() > 0.42) continue;
                    const col = palettes[Math.floor(Math.random()*palettes.length)];
                    wins.push({ cx:c/cols, cy:r/rows, col, alpha:0.3+Math.random()*0.55,
                        blink:Math.random()>0.88, t:Math.random()*Math.PI*2, s:0.01+Math.random()*0.03 });
                }
            }
            buildings.push({ x, w:bw, h:bh, wins });
            x += bw + Math.random() * 0.004;
        }
    })();

    // ── Halos de néon ──
    const halos = [
        { x:0.12, y:0.67, r:0.18, col:'22,211,238',   a:0.06 },
        { x:0.48, y:0.71, r:0.24, col:'192,38,211',   a:0.07 },
        { x:0.80, y:0.65, r:0.17, col:'244,114,182',  a:0.05 },
        { x:0.33, y:0.74, r:0.14, col:'22,211,238',   a:0.04 },
        { x:0.67, y:0.69, r:0.20, col:'139,92,246',   a:0.055 },
    ];

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Ciel
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0,    '#010109');
        sky.addColorStop(0.5,  '#03020f');
        sky.addColorStop(0.75, '#06031c');
        sky.addColorStop(1,    '#090424');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

        // Halos brumeux
        halos.forEach(h => {
            const g = ctx.createRadialGradient(h.x*W, h.y*H, 0, h.x*W, h.y*H, h.r*W);
            g.addColorStop(0,   `rgba(${h.col},${h.a})`);
            g.addColorStop(0.5, `rgba(${h.col},${h.a*0.3})`);
            g.addColorStop(1,   `rgba(${h.col},0)`);
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(h.x*W, h.y*H, h.r*W, 0, Math.PI*2); ctx.fill();
        });

        // Brume basse
        const mist = ctx.createLinearGradient(0, H*0.58, 0, H*0.78);
        mist.addColorStop(0, 'rgba(8,3,25,0)');
        mist.addColorStop(1, 'rgba(12,4,35,0.5)');
        ctx.fillStyle = mist; ctx.fillRect(0, H*0.58, W, H*0.2);

        // Skyline
        buildings.forEach(b => {
            const bx=b.x*W, bw=b.w*W, by=H*(1-b.h), bh=b.h*H+2;
            const bg = ctx.createLinearGradient(bx,by,bx,H);
            bg.addColorStop(0, 'rgba(7,4,18,0.97)');
            bg.addColorStop(1, 'rgba(10,5,24,1)');
            ctx.fillStyle = bg; ctx.fillRect(bx, by, bw, bh);
            b.wins.forEach(w => {
                w.t += w.s;
                let a = w.alpha;
                if (w.blink) a *= Math.sin(w.t*3) > 0 ? 1 : 0.04;
                const wx = bx + w.cx*bw, wy = by + w.cy*bh;
                const ww = Math.max(2, bw*0.13), wh = Math.max(2, bh*0.042);
                // Halo doux
                const wg = ctx.createRadialGradient(wx,wy,0,wx,wy,ww*4);
                wg.addColorStop(0, `rgba(${w.col.join(',')},${a*0.12})`);
                wg.addColorStop(1, `rgba(${w.col.join(',')},0)`);
                ctx.fillStyle = wg;
                ctx.beginPath(); ctx.arc(wx,wy,ww*4,0,Math.PI*2); ctx.fill();
                // Fenêtre
                ctx.fillStyle = `rgba(${w.col.join(',')},${a})`;
                ctx.fillRect(wx-ww/2, wy-wh/2, ww, wh);
            });
        });

        // Sol
        ctx.fillStyle = 'rgba(6,3,18,1)'; ctx.fillRect(0, H*0.88, W, H*0.12);

        // Reflets sol
        halos.forEach(h => {
            const g = ctx.createRadialGradient(h.x*W, H*0.9, 0, h.x*W, H*0.9, h.r*W*0.4);
            g.addColorStop(0, `rgba(${h.col},${h.a*0.7})`);
            g.addColorStop(1, `rgba(${h.col},0)`);
            ctx.fillStyle = g;
            ctx.save(); ctx.scale(1, 0.12);
            ctx.beginPath(); ctx.arc(h.x*W, H*0.9/0.12, h.r*W*0.4, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        });

        // Pluie
        rain.forEach((r, i) => {
            r.y += r.speed; r.x += r.speed * 0.07;
            if (r.y > 1.05) rain[i] = mkRain(true);
            const x1=r.x*W, y1=r.y*H, x2=x1+r.len*H*0.07, y2=y1+r.len*H;
            const g = ctx.createLinearGradient(x1,y1,x2,y2);
            g.addColorStop(0, `rgba(140,200,255,0)`);
            g.addColorStop(0.5, `rgba(180,220,255,${r.alpha})`);
            g.addColorStop(1, `rgba(140,200,255,0)`);
            ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
            ctx.strokeStyle = g; ctx.lineWidth = r.w; ctx.stroke();
        });

        requestAnimationFrame(draw);
    }
    draw();
})();

// ── HOLOGRAM FLICKER ──
(function () {
    const overlay = document.createElement('canvas');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none;';
    document.body.appendChild(overlay);
    const ctx = overlay.getContext('2d');
    let W, H;
    function resize() { W = overlay.width = window.innerWidth; H = overlay.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);

    const holos = [];
    function spawnHolo() {
        const size = 90 + Math.random() * 180;
        holos.push({
            x: 80 + Math.random() * (window.innerWidth - 160),
            y: 80 + Math.random() * (window.innerHeight - 160),
            size, rot: Math.random()*Math.PI, life: 1.0,
            decay: 0.005 + Math.random()*0.009,
            flicker: 0, flickerRate: 0.08 + Math.random()*0.14,
            color: ['22,211,238','192,38,211','244,114,182'][Math.floor(Math.random()*3)],
            type: Math.floor(Math.random()*3)
        });
        setTimeout(spawnHolo, 2500 + Math.random()*3500);
    }
    setTimeout(spawnHolo, 800);
    setTimeout(spawnHolo, 2500);

    function drawGrid(h) {
        const step=h.size/5, half=h.size/2;
        ctx.save(); ctx.translate(h.x,h.y); ctx.rotate(h.rot);
        ctx.strokeStyle=`rgba(${h.color},${h.life*0.11})`; ctx.lineWidth=0.5;
        for(let i=0;i<=5;i++){
            ctx.beginPath(); ctx.moveTo(-half+i*step,-half); ctx.lineTo(-half+i*step,half); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-half,-half+i*step); ctx.lineTo(half,-half+i*step); ctx.stroke();
        }
        ctx.strokeStyle=`rgba(${h.color},${h.life*0.5})`; ctx.lineWidth=1;
        ctx.strokeRect(-half,-half,h.size,h.size); ctx.restore();
    }
    function drawCircle(h) {
        ctx.save(); ctx.translate(h.x,h.y);
        for(let i=1;i<=3;i++){
            ctx.beginPath(); ctx.arc(0,0,(h.size/3)*i,0,Math.PI*2);
            ctx.strokeStyle=`rgba(${h.color},${h.life*0.2/i})`; ctx.lineWidth=0.6; ctx.stroke();
        }
        ctx.strokeStyle=`rgba(${h.color},${h.life*0.3})`; ctx.lineWidth=0.5;
        ctx.beginPath(); ctx.moveTo(-h.size/2,0); ctx.lineTo(h.size/2,0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,-h.size/2); ctx.lineTo(0,h.size/2); ctx.stroke();
        ctx.restore();
    }
    function drawHex(h) {
        ctx.save(); ctx.translate(h.x,h.y); ctx.rotate(h.rot);
        [1,0.55].forEach((m,idx)=>{
            const r=(h.size/2)*m;
            ctx.beginPath();
            for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2-Math.PI/6; i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
            ctx.closePath(); ctx.strokeStyle=`rgba(${h.color},${h.life*(idx===0?0.4:0.2)})`; ctx.lineWidth=idx===0?1:0.5; ctx.stroke();
        }); ctx.restore();
    }

    let fr=0;
    function render() {
        fr++; ctx.clearRect(0,0,W,H);
        holos.forEach((h,i)=>{
            h.flicker+=h.flickerRate;
            if(Math.sin(h.flicker*10)<-0.15+Math.random()*0.1){h.life-=h.decay*0.3;return;}
            h.life-=h.decay;
            if(h.type===0)drawGrid(h); else if(h.type===1)drawCircle(h); else drawHex(h);
            if(fr%4===0){
                const sy=h.y-h.size/2+((fr*1.5)%h.size);
                ctx.fillStyle=`rgba(${h.color},${h.life*0.07})`;
                ctx.fillRect(h.x-h.size/2,sy,h.size,1.5);
            }
            if(h.life<=0)holos.splice(i,1);
        });
        requestAnimationFrame(render);
    }
    render();
})();

// ── KATAKANA MATRIX ──
(function () {
    const existing = document.getElementById('katakana-rain');
    if (existing) existing.remove();
    const rain = document.createElement('div');
    rain.id = 'katakana-rain';
    document.body.appendChild(rain);
    const kana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const cols = Math.floor(window.innerWidth / 28);
    for (let i = 0; i < cols; i++) {
        const col = document.createElement('div');
        col.className = 'kana-col';
        col.style.left = (i*28+Math.random()*14)+'px';
        col.style.animationDuration = (10+Math.random()*18)+'s';
        col.style.animationDelay = (-Math.random()*20)+'s';
        col.textContent = Array.from({length:6+Math.floor(Math.random()*12)},()=>kana[Math.floor(Math.random()*kana.length)]).join('\n');
        rain.appendChild(col);
    }
})();

// ── GLITCH TITRE TOKYO ──
(function () {
    const glitchChars = 'アイウエオカキクケコサシスセソ!<>[]{}=#@$%';
    function glitchWord(el, orig) {
        let it=0;
        const iv=setInterval(()=>{
            el.textContent=orig.split('').map((c,i)=>c===' '?' ':i<it?orig[i]:glitchChars[Math.floor(Math.random()*glitchChars.length)]).join('');
            it+=0.5; if(it>=orig.length){el.textContent=orig;clearInterval(iv);}
        },35);
    }
    function trigger() {
        const title=document.querySelector('h1.hero-title');
        if(!title||document.body.classList.contains('konami-mode'))return;
        title.querySelectorAll('span').forEach(span=>{
            span.classList.add('glitching'); glitchWord(span,span.textContent);
            setTimeout(()=>span.classList.remove('glitching'),500);
        });
        setTimeout(trigger, 5000+Math.random()*5000);
    }
    setTimeout(trigger, 3000);
})();
