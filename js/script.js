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
        current = i;
    }
    setInterval(() => {
        showSlide((current + 1) % slides.length);
    }, 14000);
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

// Subtle scroll parallax on the hero background image only.
// (page-header uses a single element for both background and text,
// so parallaxing it would shift the heading text too - skipped to avoid that bug)
const parallaxEls = document.querySelectorAll('.hero-slides');
if (parallaxEls.length && window.matchMedia('(min-width: 769px)').matches) {
    let ticking = false;
    function updateParallax() {
        const scrolled = window.scrollY;
        parallaxEls.forEach(el => {
            const speed = 0.15;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
        ticking = false;
    }
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}

// Magnetic tilt on listing cards - follows cursor, subtle 3D feel
const tiltCards = document.querySelectorAll('.listing-card');
if (window.matchMedia('(min-width: 769px)').matches) {
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(900px) rotateY(${x * 3.5}deg) rotateX(${-y * 3.5}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// Word-by-word headline reveal: splits text into individual words,
// each wrapped in a clipped box, then reveals them in a staggered
// upward slide as the element scrolls into view (or on initial load
// for the hero, since it's visible immediately).
// Walks child nodes (not just textContent) so it safely preserves
// <br> line breaks and <em> emphasis instead of destroying them.
function wrapWord(word, isLast) {
    const wrap = document.createElement('span');
    wrap.className = 'word-reveal';
    const inner = document.createElement('span');
    inner.className = 'word-reveal-inner';
    inner.textContent = word + (isLast ? '' : '\u00A0');
    wrap.appendChild(inner);
    return wrap;
}

function splitIntoWords(el) {
    const nodes = Array.from(el.childNodes);
    const fragment = document.createDocumentFragment();

    nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const words = node.textContent.trim().split(/\s+/).filter(Boolean);
            words.forEach((word, i) => {
                fragment.appendChild(wrapWord(word, i === words.length - 1));
                fragment.appendChild(document.createTextNode(' '));
            });
        } else if (node.nodeName === 'BR') {
            fragment.appendChild(node.cloneNode());
        } else {
            // Element like <em> - split its own text content, keep the tag wrapping it
            const wrapperTag = document.createElement(node.nodeName);
            for (const attr of node.attributes || []) wrapperTag.setAttribute(attr.name, attr.value);
            const words = node.textContent.trim().split(/\s+/).filter(Boolean);
            words.forEach((word, i) => {
                wrapperTag.appendChild(wrapWord(word, i === words.length - 1));
                wrapperTag.appendChild(document.createTextNode(' '));
            });
            fragment.appendChild(wrapperTag);
        }
    });

    el.innerHTML = '';
    el.appendChild(fragment);
}

function revealWords(el, baseDelay = 0) {
    const words = el.querySelectorAll('.word-reveal');
    words.forEach((w, i) => {
        setTimeout(() => w.classList.add('show'), baseDelay + i * 70);
    });
}

const wordSplitTargets = document.querySelectorAll('[data-split-words]');
wordSplitTargets.forEach(el => {
    if (!el.closest('.showcase-text')) splitIntoWords(el);
});

// Hero headline animates immediately on load
const heroHeading = document.querySelector('.hero h1[data-split-words]');
if (heroHeading) {
    setTimeout(() => revealWords(heroHeading, 200), 100);
}

// All other split-word headlines animate when scrolled into view
const wordObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            revealWords(entry.target, 0);
            wordObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.4 });
document.querySelectorAll('[data-split-words]').forEach(el => {
    if (!el.closest('.hero') && !el.closest('.showcase-text')) wordObserver.observe(el);
});

// Showcase headlines re-animate every time their slide becomes active
function animateShowcaseHeadline(slide) {
    const h3 = slide.querySelector('h3[data-split-words]');
    if (h3) {
        splitIntoWords(h3);
        revealWords(h3, 350);
    }
}

// Stagger reveal: child elements within a reveal-group fade in sequentially
document.querySelectorAll('.values-grid, .team-grid').forEach(group => {
    const children = Array.from(group.children);
    children.forEach((child, i) => {
        child.style.transitionDelay = `${i * 90}ms`;
    });
});

// Showcase section: diagonal-split slides with synced image + headline transitions
const showcaseSlides = document.querySelectorAll('.showcase-slide');
const showcaseDots = document.querySelectorAll('.showcase-dot');
if (showcaseSlides.length > 1) {
    let showcaseCurrent = 0;
    function showShowcaseSlide(i) {
        showcaseSlides.forEach((s, idx) => {
            if (idx === i) {
                s.classList.remove('active');
                void s.offsetWidth;
                s.classList.add('active');
                animateShowcaseHeadline(s);
            } else {
                s.classList.remove('active');
            }
        });
        showcaseDots.forEach((d, idx) => d.classList.toggle('active', idx === i));
        showcaseCurrent = i;
    }
    showcaseDots.forEach((d, idx) => d.addEventListener('click', () => showShowcaseSlide(idx)));

    // Only auto-advance once the section has actually scrolled into view,
    // so it doesn't burn through slides while off-screen
    const showcaseSection = document.getElementById('showcase');
    if (showcaseSection) {
        let showcaseInterval = null;
        let showcaseStarted = false;
        const showcaseObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !showcaseInterval) {
                    if (!showcaseStarted) {
                        animateShowcaseHeadline(showcaseSlides[showcaseCurrent]);
                        showcaseStarted = true;
                    }
                    showcaseInterval = setInterval(() => {
                        showShowcaseSlide((showcaseCurrent + 1) % showcaseSlides.length);
                    }, 6500);
                } else if (!entry.isIntersecting && showcaseInterval) {
                    clearInterval(showcaseInterval);
                    showcaseInterval = null;
                }
            });
        }, { threshold: 0.3 });
        showcaseObserver.observe(showcaseSection);
    }
}