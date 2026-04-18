// ══════════════════════════════════════
//  COMMON — effets partagés toutes DAs
// ══════════════════════════════════════

// ── TYPING EFFECT ──
(function () {
    const dtEl = document.getElementById('dynamic-text');
    if (!dtEl) return;
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
})();

// ── LIGHT MODE + RAINBOW EASTER EGG ──
(function () {
    const nmcb = document.getElementById('nmcb');
    if (!nmcb) return;
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
})();

// ── MAGIC BUTTON — Ctrl+B ──
(function () {
    const mb = document.getElementById('magic-button');
    if (!mb) return;
    let gameOn = false;
    document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key === 'b') { e.preventDefault(); gameOn = true; mb.classList.add('active'); }
    });
    mb.addEventListener('mouseover', () => {
        if (!gameOn) return;
        mb.style.position = 'absolute';
        mb.style.left = Math.random() * (window.innerWidth  - mb.offsetWidth  - 20) + 'px';
        mb.style.top  = Math.random() * (window.innerHeight - mb.offsetHeight - 20) + window.scrollY + 'px';
        mb.classList.add('moving');
    });
    mb.addEventListener('click', () => {
        if (gameOn) window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
    });
})();

// ── SCROLL REVEAL ──
(function () {
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.07 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// ── SMOOTH SCROLL CINÉMATIQUE ──
(function () {
    let current = window.scrollY, target = window.scrollY, raf;

    // Wheel — passive:false peut être refusé sur certains navigateurs/HTTPS
    try {
        window.addEventListener('wheel', e => {
            e.preventDefault();
            target += e.deltaY * 0.9;
            target = Math.max(0, Math.min(target, document.body.scrollHeight - window.innerHeight));
            if (!raf) loop();
        }, { passive: false });
    } catch (err) {
        window.addEventListener('wheel', e => {
            target += e.deltaY * 0.9;
            target = Math.max(0, Math.min(target, document.body.scrollHeight - window.innerHeight));
            if (!raf) loop();
        });
    }

    // Touch
    let touchY = 0;
    window.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', e => {
        const dy = touchY - e.touches[0].clientY;
        touchY = e.touches[0].clientY;
        target += dy * 1.2;
        target = Math.max(0, Math.min(target, document.body.scrollHeight - window.innerHeight));
        if (!raf) loop();
    }, { passive: true });

    // Ancres — différé au cas où le DOM ne serait pas encore complet
    function bindAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', e => {
                const id = a.getAttribute('href');
                if (!id || id === '#') return;
                const el = document.querySelector(id);
                if (!el) return;
                e.preventDefault();
                target = el.getBoundingClientRect().top + window.scrollY;
                target = Math.max(0, Math.min(target, document.body.scrollHeight - window.innerHeight));
                if (!raf) loop();
            });
        });
    }

    // DOMContentLoaded au cas où le script s'exécute avant la fin du parsing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindAnchors);
    } else {
        bindAnchors();
    }

    function loop() {
        current += (target - current) * 0.1;
        if (Math.abs(target - current) < 0.5) { current = target; raf = null; }
        else raf = requestAnimationFrame(loop);
        window.scrollTo(0, current);
    }

    // Sync si l'utilisateur scrolle avec la scrollbar native
    window.addEventListener('scroll', () => {
        if (!raf) {
            current = window.scrollY;
            target  = window.scrollY;
        }
    }, { passive: true });
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
            const r = el.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
            const dy = (e.clientY - (r.top  + r.height / 2)) * 0.28;
            el.style.transform = `translate(${dx}px,${dy}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
})();


// ── BOUTON RESET THÈME ──
(function () {
    const btn = document.createElement('button');
    btn.id = 'theme-reset-btn';
    btn.title = 'Changer de thème';
    btn.textContent = '◈';
    btn.addEventListener('click', () => { sessionStorage.removeItem('lf_theme'); location.reload(); });
    document.body.appendChild(btn);
})();
// ── EMAIL ANTI-SPAM ──
(function () {
    const u = 'flagothier.lorenzo';   // partie avant @
    const d = 'gmail.com';            // ou ton domaine
    const link = document.getElementById('email-link');
    const text = document.getElementById('email-text');
    if (!link || !text) return;
    const email = u + '@' + d;
    text.textContent = email;
    link.href = 'mailto:' + email;
})();