// Architectural blueprint 3D model - drag to rotate, cinematic camera fly-around
// Uses Three.js (loaded via CDN in index.html head)
(function () {
    const wrap = document.getElementById('hologramCanvas');
    if (!wrap || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, wrap.clientWidth / wrap.clientHeight, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    wrap.appendChild(renderer.domElement);

    const holoGroup = new THREE.Group();
    const LINE_COLOR = 0xbfe3ff;
    const LINE_BRIGHT = 0xeaf6ff;

    function wire(geometry, opacity, color) {
        const edges = new THREE.EdgesGeometry(geometry);
        const mat = new THREE.LineBasicMaterial({ color: color || LINE_COLOR, transparent: true, opacity });
        return new THREE.LineSegments(edges, mat);
    }
    function lineBetween(p1, p2, opacity, color) {
        const mat = new THREE.LineBasicMaterial({ color: color || LINE_COLOR, transparent: true, opacity });
        return new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1, p2]), mat);
    }

    const W = 3.2, D = 2.4;
    const FLOOR_H = 1.05;
    const FLOORS = 3;

    for (let f = 0; f < FLOORS; f++) {
        const y = f * FLOOR_H;
        const slab = wire(new THREE.BoxGeometry(W, FLOOR_H, D), f === 0 ? 0.85 : 0.6);
        slab.position.y = y + FLOOR_H / 2;
        holoGroup.add(slab);

        [-0.9, 0.4].forEach(x => {
            const wallPts = [
                new THREE.Vector3(x, y, -D / 2),
                new THREE.Vector3(x, y, D / 2),
                new THREE.Vector3(x, y + FLOOR_H, D / 2),
                new THREE.Vector3(x, y + FLOOR_H, -D / 2)
            ];
            for (let i = 0; i < 4; i++) {
                holoGroup.add(lineBetween(wallPts[i], wallPts[(i + 1) % 4], 0.25));
            }
        });

        const winY = y + FLOOR_H / 2;
        [-1.15, -0.25, 0.85].forEach(x => {
            const win = wire(new THREE.BoxGeometry(0.5, 0.5, 0.04), 0.65, LINE_BRIGHT);
            win.position.set(x, winY, D / 2 + 0.02);
            holoGroup.add(win);
            holoGroup.add(lineBetween(new THREE.Vector3(x - 0.25, winY, D / 2 + 0.03), new THREE.Vector3(x + 0.25, winY, D / 2 + 0.03), 0.4));
            holoGroup.add(lineBetween(new THREE.Vector3(x, winY - 0.25, D / 2 + 0.03), new THREE.Vector3(x, winY + 0.25, D / 2 + 0.03), 0.4));
        });

        const winSide = wire(new THREE.BoxGeometry(0.04, 0.5, 0.5), 0.5, LINE_BRIGHT);
        winSide.position.set(W / 2 + 0.02, winY, 0.3);
        holoGroup.add(winSide);
    }

    const door = wire(new THREE.BoxGeometry(0.55, 0.95, 0.04), 0.7, LINE_BRIGHT);
    door.position.set(1.25, 0.475, D / 2 + 0.02);
    holoGroup.add(door);

    function buildRoof(width, depth, height) {
        const shape = new THREE.Shape();
        shape.moveTo(-width / 2, 0);
        shape.lineTo(0, height);
        shape.lineTo(width / 2, 0);
        shape.lineTo(-width / 2, 0);
        const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
        geo.translate(0, 0, -depth / 2);
        geo.rotateY(Math.PI / 2);
        return geo;
    }
    const roofY = FLOORS * FLOOR_H;
    const roofWire = wire(buildRoof(W + 0.3, D + 0.3, 1.0), 0.85, LINE_BRIGHT);
    roofWire.position.set(0, roofY, 0);
    holoGroup.add(roofWire);

    holoGroup.add(lineBetween(
        new THREE.Vector3(0, roofY + 1.0, -(D + 0.3) / 2),
        new THREE.Vector3(0, roofY + 1.0, (D + 0.3) / 2), 0.5, LINE_BRIGHT
    ));
    for (let i = -1; i <= 1; i++) {
        const z = i * (D + 0.3) / 3;
        holoGroup.add(lineBetween(new THREE.Vector3(-(W + 0.3) / 2, roofY, z), new THREE.Vector3(0, roofY + 1.0, z), 0.3));
        holoGroup.add(lineBetween(new THREE.Vector3((W + 0.3) / 2, roofY, z), new THREE.Vector3(0, roofY + 1.0, z), 0.3));
    }

    const gridHelper = new THREE.GridHelper(8, 32, 0x2a5070, 0x152535);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.5;
    holoGroup.add(gridHelper);

    function addDim(start, end, offset, tickSize) {
        tickSize = tickSize || 0.08;
        const dimMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        const perp = new THREE.Vector3(-dir.z, 0, dir.x);
        const s = start.clone().add(perp.clone().multiplyScalar(offset));
        const e = end.clone().add(perp.clone().multiplyScalar(offset));
        holoGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([s, e]), dimMat));
        [s, e].forEach(p => {
            const t1 = p.clone().add(perp.clone().multiplyScalar(tickSize));
            const t2 = p.clone().add(perp.clone().multiplyScalar(-tickSize));
            holoGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([t1, t2]), dimMat));
        });
    }
    addDim(new THREE.Vector3(-W/2, 0, D/2 + 0.4), new THREE.Vector3(W/2, 0, D/2 + 0.4), 0.4);
    addDim(new THREE.Vector3(-W/2 - 0.4, 0, -D/2), new THREE.Vector3(-W/2 - 0.4, 0, D/2), -0.4);
    addDim(new THREE.Vector3(W/2 + 0.5, 0, -D/2), new THREE.Vector3(W/2 + 0.5, FLOORS * FLOOR_H, -D/2), 0.3, 0.1);

    for (let f = 1; f <= FLOORS; f++) {
        const y = f * FLOOR_H;
        holoGroup.add(lineBetween(new THREE.Vector3(W/2, y, -D/2), new THREE.Vector3(W/2 + 0.25, y, -D/2), 0.6, LINE_BRIGHT));
    }

    const particleCount = 60;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 2.6 + Math.random() * 1.4;
        const height = Math.random() * 4.2;
        particlePositions[i * 3] = Math.cos(angle) * radius;
        particlePositions[i * 3 + 1] = height;
        particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: LINE_COLOR, size: 0.02, transparent: true, opacity: 0.3 });
    const particles = new THREE.Points(particleGeo, particleMat);
    holoGroup.add(particles);

    scene.add(holoGroup);

    const keyLight = new THREE.PointLight(0xbfe3ff, 0.6, 12);
    keyLight.position.set(0, 4, 4);
    scene.add(keyLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));

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

    let isVisible = false;
    const visibilityObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => { isVisible = entry.isIntersecting; });
    }, { threshold: 0.1 });
    visibilityObserver.observe(wrap);

    const cameraCycle = 20;
    let camT = 0;
    let userControlling = false;
    wrap.addEventListener('mousedown', () => userControlling = true);
    window.addEventListener('mouseup', () => setTimeout(() => userControlling = false, 1800));
    wrap.addEventListener('touchstart', () => userControlling = true, { passive: true });
    window.addEventListener('touchend', () => setTimeout(() => userControlling = false, 1800));

    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;
        t += 0.01;
        if (!isDragging) rotationY += 0.0012;
        holoGroup.rotation.y = rotationY;
        particles.rotation.y += 0.0004;

        if (!userControlling) {
            camT += 0.016 / cameraCycle;
            const cycle = camT % 1;
            const dist = 5.0 + Math.sin(cycle * Math.PI * 2) * 2.0;
            const height = 2.4 + Math.sin(cycle * Math.PI * 2 + 1.1) * 2.0;
            const orbitAngle = cycle * Math.PI * 2 * 0.5;
            camera.position.x = Math.cos(orbitAngle) * dist;
            camera.position.z = Math.sin(orbitAngle) * dist + 1.3;
            camera.position.y = Math.max(height, 0.8);
            camera.lookAt(0, 1.6, 0);
        }

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = wrap.clientWidth / wrap.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    });
})();