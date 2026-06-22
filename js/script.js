window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

const hamburger = document.getElementById('hamburger');
const mobMenu = document.getElementById('mobMenu');
const mobClose = document.getElementById('mobClose');
if (hamburger && mobMenu) {
    hamburger.addEventListener('click', () => mobMenu.classList.add('open'));
}
if (mobClose && mobMenu) {
    mobClose.addEventListener('click', () => mobMenu.classList.remove('open'));
}
document.querySelectorAll('.mob-menu a').forEach(a => {
    a.addEventListener('click', () => mobMenu && mobMenu.classList.remove('open'));
});

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.hero-dot');
if (slides.length > 1) {
    let current = 0;
    function showSlide(i) {
        slides.forEach((s, idx) => {
            if (idx === i) {
                s.classList.remove('active');
                void s.offsetWidth;
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
        dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
        current = i;
    }
    dots.forEach((d, idx) => d.addEventListener('click', () => showSlide(idx)));
    setInterval(() => {
        showSlide((current + 1) % slides.length);
    }, 8000);
}

// Animated count-up for stats when scrolled into view
const statNums = document.querySelectorAll('.stat-num[data-count]');
if (statNums.length) {
    const statObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                const suffix = el.dataset.suffix || '';
                const duration = 1400;
                const startTime = performance.now();
                function tick(now) {
                    const progress = Math.min((now - startTime) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(target * eased);
                    el.textContent = current + suffix;
                    if (progress < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
                statObserver.unobserve(el);
            }
        });
    }, { threshold: 0.4 });
    statNums.forEach(el => statObserver.observe(el));
}