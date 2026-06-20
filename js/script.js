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
        slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
        dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
        current = i;
    }
    dots.forEach((d, idx) => d.addEventListener('click', () => showSlide(idx)));
    setInterval(() => {
        showSlide((current + 1) % slides.length);
    }, 5500);
}