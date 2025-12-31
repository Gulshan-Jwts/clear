import * as THREE from "three";
import fragmentShader from "./shader/fragment.glsl?raw";
import vertexShader from "./shader/vertex.glsl?raw";

let scene, camera, renderer, clock;
let stars, starGeo;
let tunnelRings = [];

// Performance-optimized settings
let starCount = 2000;
const tunnelDepth = 300;
const ringCount = 20;

const mouse = new THREE.Vector2();
let speed = 60;
let tunnelSize = 80;
let shapeMode = 3; 

let frameCount = 0;
let lastTime = Date.now();

let performanceLevel = 1; // 0 = low, 1 = medium, 2 = high

// Star shape geometries
let diamondShape, plusShape, beadShape;

// Colors array for vibrant star colors
const starColors = [
    new THREE.Color(0xFF6B6B), // coral
    new THREE.Color(0x4ECDC4), // turquoise
    new THREE.Color(0x45B7D1), // sky blue
    new THREE.Color(0x96CEB4), // mint
    new THREE.Color(0xFFEAA7), // warm yellow
    new THREE.Color(0xDDA0DD)  // plum
];

function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    
    // Create gradient for star glow
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function detectPerformance() {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
        performanceLevel = 0;
        alert("WebGL not supported. Running in low performance mode.");
        return;
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
        const rendererInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        // Simple GPU detection - can be expanded
        if (rendererInfo.includes("Intel") && !rendererInfo.includes("Iris")) {
            performanceLevel = 0;
            alert("WebGL not supported. Running in low performance mode.");
        } else if (
            rendererInfo.includes("GTX") ||
            rendererInfo.includes("RTX") ||
            rendererInfo.includes("RX")
        ) {
            performanceLevel = 2;
            console.log("webGL fully active")
        } else {
            performanceLevel = 1;
            console.log("webGL partially active")
        }
    }

    // Adjust settings based on performance level
    if (performanceLevel === 0) {
        starCount = 2000;
    }
}

function createStarShapes() {
    // Diamond shape
    const diamondGeometry = new THREE.BufferGeometry();
    const diamondVertices = new Float32Array([
        0, 0.5, 0,
        -0.3, 0, 0,
        0, -0.5, 0,
        0.3, 0, 0
    ]);
    const diamondIndices = [0, 1, 2, 0, 2, 3];
    diamondGeometry.setAttribute('position', new THREE.BufferAttribute(diamondVertices, 3));
    diamondGeometry.setIndex(diamondIndices);
    diamondShape = diamondGeometry;

    // Plus shape
    const plusGeometry = new THREE.BufferGeometry();
    const plusVertices = new Float32Array([
        -0.1, 0.4, 0, 0.1, 0.4, 0, 0.1, 0.1, 0, 0.4, 0.1, 0,
        0.4, -0.1, 0, 0.1, -0.1, 0, 0.1, -0.4, 0, -0.1, -0.4, 0,
        -0.1, -0.1, 0, -0.4, -0.1, 0, -0.4, 0.1, 0, -0.1, 0.1, 0
    ]);
    const plusIndices = [
        0, 1, 2, 0, 2, 11,
        2, 3, 4, 2, 4, 5,
        5, 6, 7, 5, 7, 8,
        8, 9, 10, 8, 10, 11,
        11, 2, 5, 11, 5, 8
    ];
    plusGeometry.setAttribute('position', new THREE.BufferAttribute(plusVertices, 3));
    plusGeometry.setIndex(plusIndices);
    plusShape = plusGeometry;

    // Bead shape (circle)
    beadShape = new THREE.CircleGeometry(0.3, 8);
}

function init() {
    detectPerformance();
    createStarShapes();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        tunnelDepth + 50
    );
    camera.position.z = 0;

    // Optimized renderer settings
    renderer = new THREE.WebGLRenderer({
        antialias: performanceLevel > 0,
        powerPreference: "high-performance",
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, performanceLevel === 0 ? 1 : 2)
    );
    
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    createStars();
    createTunnelRings();

    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
    }, 2000);

    window.addEventListener("resize", onWindowResize, false);
    document.addEventListener("mousemove", onTouchMove, false);

    animate();
}

function createStars() {
    if (stars) {
        scene.remove(stars);
        starGeo.dispose();
    }

    starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const shapes = new Float32Array(starCount); // 0: diamond, 1: plus, 2: bead

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;

        // Create cylindrical tunnel distribution
        const radius = (Math.random() * 0.7 + 0.3) * tunnelSize;
        const angle = Math.random() * Math.PI * 2;
        const z = (Math.random() - 0.5) * tunnelDepth * 2;

        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = Math.sin(angle) * radius;
        positions[i3 + 2] = z;

        // Assign random vibrant colors
        const colorIndex = Math.floor(Math.random() * starColors.length);
        const selectedColor = starColors[colorIndex];
        
        // Add some variation to the base colors
        const hueShift = (Math.random() - 0.5) * 0.1;
        const saturation = 0.8 + Math.random() * 0.2;
        const lightness = 0.5 + Math.random() * 0.3;
        
        const finalColor = new THREE.Color().copy(selectedColor);
        finalColor.offsetHSL(hueShift, saturation - 0.8, lightness - 0.65);

        colors[i3] = finalColor.r;
        colors[i3 + 1] = finalColor.g;
        colors[i3 + 2] = finalColor.b;

        sizes[i] = Math.random() * 3 + 1;
        
        // Assign shape type
        if (shapeMode === 3) {
            shapes[i] = Math.floor(Math.random() * 3); // mixed
        } else {
            shapes[i] = shapeMode;
        }
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    starGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    starGeo.setAttribute("shape", new THREE.BufferAttribute(shapes, 1));

    // Use ShaderMaterial with fixed shaders for custom star shapes
    const starMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });

    stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);
}

function createTunnelRings() {
    // Clear existing rings
    tunnelRings.forEach((ring) => scene.remove(ring));
    tunnelRings = [];

    const ringGeometry = new THREE.RingGeometry(
        tunnelSize * 0.8,
        tunnelSize * 1.2,
        32,
        1
    );

    for (let i = 0; i < ringCount; i++) {
        const hue = (i / ringCount) * 0.8 + 0.1;
        const color = new THREE.Color().setHSL(hue, 0.7, 0.4);
        
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
        });

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.z = (i - ringCount / 2) * (tunnelDepth / ringCount);
        ring.userData = { originalZ: ring.position.z };

        scene.add(ring);
        tunnelRings.push(ring);
    }
}


function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onTouchMove(event) {
    if (event.touches && event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    } else {
        onMouseMove(event);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateFPS() {
    frameCount++;
    const now = Date.now();
    if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;

        // Auto-adjust quality based on FPS
        if (fps < 30 && starCount > 1000) {
            starCount = Math.max(1000, starCount - 500);
            createStars();
        }
    }
}

let scrollY = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});


function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Smooth camera movement with mouse
    const targetRotY = mouse.x * 0.5;
    const targetRotX = mouse.y * 0.3;

    camera.rotation.y += (targetRotY - camera.rotation.y) * delta * 2;
    camera.rotation.x += (targetRotX - camera.rotation.x) * delta * 2;

    // Add subtle camera oscillation for more dynamic movement
    camera.position.x = Math.sin(elapsedTime * 0.5) * 2;
    camera.position.y = Math.cos(elapsedTime * 0.3) * 1.5;

    // Animate stars
    const positions = starGeo.attributes.position.array;
    const colors = starGeo.attributes.color.array;

    // Breathing effect
    const breathing = Math.sin(elapsedTime * 1.5) * 0.15 + 1.0;

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;

        // Move stars towards camera with speed variation
        const speedVariation = 1 + Math.sin(elapsedTime + i * 0.01) * 0.2;
        positions[i3 + 2] += speed * delta * speedVariation;

        // Reset star position when it passes camera
        if (positions[i3 + 2] > camera.position.z + 10) {
            positions[i3 + 2] -= tunnelDepth * 2;

            // Randomize position slightly for variety
            const radius = (Math.random() * 0.7 + 0.3) * tunnelSize;
            const angle = Math.random() * Math.PI * 2;

            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = Math.sin(angle) * radius;

            // Reassign random color
            const colorIndex = Math.floor(Math.random() * starColors.length);
            const selectedColor = starColors[colorIndex];
            const hueShift = (Math.random() - 0.5) * 0.1;
            const saturation = 0.8 + Math.random() * 0.2;
            const lightness = 0.5 + Math.random() * 0.3;
            
            const finalColor = new THREE.Color().copy(selectedColor);
            finalColor.offsetHSL(hueShift, saturation - 0.8, lightness - 0.65);

            colors[i3] = finalColor.r;
            colors[i3 + 1] = finalColor.g;
            colors[i3 + 2] = finalColor.b;
        }

        // Keep original vibrant colors without dimming
        // The shader will handle any distance-based effects
    }

    // Animate tunnel rings
    tunnelRings.forEach((ring, index) => {
        ring.position.z += speed * delta;

        if (ring.position.z > camera.position.z + 50) {
            ring.position.z -= tunnelDepth;
        }

        // Ring effects
        ring.rotation.z += delta * (0.3 + index * 0.05);
        const pulseScale = 1 + Math.sin(elapsedTime * 2 + index * 0.8) * 0.08;
        ring.scale.set(pulseScale, pulseScale, 1);

        // Opacity based on distance with glow effect
        const distance = Math.abs(ring.position.z - camera.position.z);
        const baseOpacity = Math.max(0.05, 0.25 - distance / tunnelDepth);
        const glowPulse = Math.sin(elapsedTime * 3 + index * 1.2) * 0.1 + 1;
        ring.material.opacity = baseOpacity * glowPulse;

        // Color cycling
        const hue = (elapsedTime * 0.1 + index * 0.15) % 1;
        ring.material.color.setHSL(hue, 0.7, 0.4);
    });

    // Apply breathing effect to stars
    stars.scale.set(breathing, breathing, 1);

    // Add star rotation for more dynamic effect
    stars.rotation.z += delta * 0.1;
    stars.position.z = -scrollY * 0.5;
    stars.position.y = scrollY * 0.1; 

    // Update shader uniforms
    if (stars.material.uniforms) {
        stars.material.uniforms.time.value = elapsedTime;
    }

    // Update attributes
    starGeo.attributes.position.needsUpdate = true;
    starGeo.attributes.color.needsUpdate = true;

    renderer.render(scene, camera);
    updateFPS();
}

// Initialize the application
init();