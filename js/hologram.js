// Holographic 3D wireframe building - drag to rotate, gentle auto-rotation
// Uses Three.js (loaded via CDN in index.html head)
(function () {
    const wrap = document.getElementById('hologramCanvas');
    if (!wrap || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    camera.position.set(4.8, 3.1, 6.0);
    camera.lookAt(0, 1.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    wrap.appendChild(renderer.domElement);

    const holoGroup = new THREE.Group();

    function fineWire(geometry, color, opacity) {
        const edges = new THREE.EdgesGeometry(geometry);
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
        return new THREE.LineSegments(edges, mat);
    }

    const BRASS = 0xd4af6a;
    const EMERALD = 0x4a7a6a;
    const PALE = 0xdfeeff;

    const f1 = fineWire(new THREE.BoxGeometry(3.2, 1.3, 2.4), PALE, 0.55);
    f1.position.y = 0.65;
    holoGroup.add(f1);

    const slab1 = fineWire(new THREE.BoxGeometry(3.4, 0.08, 2.6), BRASS, 0.65);
    slab1.position.y = 1.34;
    holoGroup.add(slab1);

    const f2 = fineWire(new THREE.BoxGeometry(2.6, 1.2, 1.9), PALE, 0.55);
    f2.position.set(-0.2, 1.98, 0.1);
    holoGroup.add(f2);

    const roofSlab = fineWire(new THREE.BoxGeometry(2.8, 0.08, 2.1), BRASS, 0.65);
    roofSlab.position.set(-0.2, 2.62, 0.1);
    holoGroup.add(roofSlab);

    const f3 = fineWire(new THREE.BoxGeometry(1.5, 0.9, 1.2), PALE, 0.55);
    f3.position.set(0.1, 3.1, -0.2);
    holoGroup.add(f3);

    const roofSlab2 = fineWire(new THREE.BoxGeometry(1.7, 0.06, 1.4), BRASS, 0.65);
    roofSlab2.position.set(0.1, 3.58, -0.2);
    holoGroup.add(roofSlab2);

    const colMat = new THREE.LineBasicMaterial({ color: PALE, transparent: true, opacity: 0.4 });
    [[-1.5, 1.1], [1.5, 1.1], [-1.5, -1.1], [1.5, -1.1]].forEach(([x, z]) => {
        const pts = [new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 1.3, z)];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        holoGroup.add(new THREE.Line(geo, colMat));
    });

    const scanMat = new THREE.LineBasicMaterial({ color: EMERALD, transparent: true, opacity: 0.35 });
    [0.3, 0.95, 1.65, 2.3, 2.95].forEach(y => {
        const pts = [];
        const r = 2.0;
        for (let a = 0; a <= 48; a++) {
            const ang = (a / 48) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(ang) * r, y, Math.sin(ang) * r));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        holoGroup.add(new THREE.LineLoop(geo, scanMat));
    });

    const travelRingGeo = new THREE.RingGeometry(1.96, 2.0, 64);
    const travelRingMat = new THREE.MeshBasicMaterial({ color: 0x7fd9c4, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const travelRing = new THREE.Mesh(travelRingGeo, travelRingMat);
    travelRing.rotation.x = -Math.PI / 2;
    holoGroup.add(travelRing);

    const gridHelper = new THREE.GridHelper(6, 24, 0xd4af6a, 0x2a2014);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.15;
    holoGroup.add(gridHelper);

    const ringGeo = new THREE.RingGeometry(2.7, 2.75, 80);
    const ringMat = new THREE.MeshBasicMaterial({ color: BRASS, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    holoGroup.add(ring);

    const ring2Geo = new THREE.RingGeometry(2.95, 2.97, 80);
    const ring2 = new THREE.Mesh(ring2Geo, new THREE.MeshBasicMaterial({ color: EMERALD, transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
    ring2.rotation.x = -Math.PI / 2;
    holoGroup.add(ring2);

    const particleCount = 80;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const c1 = new THREE.Color(PALE), c2 = new THREE.Color(BRASS);
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 2.0 + Math.random() * 1.4;
        const height = Math.random() * 3.6;
        particlePositions[i * 3] = Math.cos(angle) * radius;
        particlePositions[i * 3 + 1] = height;
        particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
        const mixed = Math.random() > 0.6 ? c2 : c1;
        particleColors[i * 3] = mixed.r; particleColors[i * 3 + 1] = mixed.g; particleColors[i * 3 + 2] = mixed.b;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const particleMat = new THREE.PointsMaterial({ size: 0.03, transparent: true, opacity: 0.55, vertexColors: true });
    const particles = new THREE.Points(particleGeo, particleMat);
    holoGroup.add(particles);

    scene.add(holoGroup);

    const glowLight = new THREE.PointLight(0xd4af6a, 0.7, 9);
    glowLight.position.set(0, 2.2, 0);
    scene.add(glowLight);
    const glowLight2 = new THREE.PointLight(0x4a7a6a, 0.5, 9);
    glowLight2.position.set(-2, 1, 2);
    scene.add(glowLight2);
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));

    let isDragging = false, prevX = 0, rotationY = 0.5;
    holoGroup.rotation.y = rotationY;

    function onDown(x) { isDragging = true; prevX = x; }
    function onMove(x) { if (!isDragging) return; rotationY += (x - prevX) * 0.008; prevX = x; }
    function onUp() { isDragging = false; }

    wrap.addEventListener('mousedown', e => onDown(e.clientX));
    window.addEventListener('mousemove', e => onMove(e.clientX));
    window.addEventListener('mouseup', onUp);
    wrap.addEventListener('touchstart', e => onDown(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove', e => onMove(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchend', onUp);

    // Only render while the section is visible, to avoid wasting GPU cycles
    // when the user has scrolled past it.
    let isVisible = false;
    const visibilityObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => { isVisible = entry.isIntersecting; });
    }, { threshold: 0.1 });
    visibilityObserver.observe(wrap);

    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;
        t += 0.01;
        if (!isDragging) rotationY += 0.0022;
        holoGroup.rotation.y = rotationY;
        glowLight.intensity = 0.6 + Math.sin(t * 1.3) * 0.15;
        particles.rotation.y += 0.0006;
        const travelY = 1.6 + Math.sin(t * 0.6) * 1.5;
        travelRing.position.y = travelY;
        travelRingMat.opacity = 0.5 + Math.sin(t * 0.6) * 0.2;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = wrap.clientWidth / wrap.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    });
})();