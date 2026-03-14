// Setup Three.js Scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030712, 0.0015);

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 40;
camera.position.y = 10;
camera.lookAt(0, 0, 0);

// WebGL Renderer
const canvas = document.querySelector('#bg');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const blueLight = new THREE.PointLight(0x00f2fe, 2, 100);
blueLight.position.set(20, 20, 20);
scene.add(blueLight);

const purpleLight = new THREE.PointLight(0x4facfe, 2, 100);
purpleLight.position.set(-20, -20, 20);
scene.add(purpleLight);

// Create Floating 'Data Cubes' (Inventory Items Representation)
const cubes = [];
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);

// Create a glowing, wireframe-like material
const cubeMaterial = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
    emissive: 0x00f2fe,
    emissiveIntensity: 0.2
});

const cubeMaterialalt = new THREE.MeshStandardMaterial({
    color: 0x4facfe,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
    emissive: 0x4facfe,
    emissiveIntensity: 0.2
});

const NUM_CUBES = 150;

for(let i=0; i < NUM_CUBES; i++) {
    const mat = Math.random() > 0.5 ? cubeMaterial : cubeMaterialalt;
    const cube = new THREE.Mesh(cubeGeometry, mat);
    
    // Random positions spread out
    cube.position.x = (Math.random() - 0.5) * 120;
    cube.position.y = (Math.random() - 0.5) * 80;
    cube.position.z = (Math.random() - 0.5) * 100;

    // Random rotations
    cube.rotation.x = Math.random() * Math.PI;
    cube.rotation.y = Math.random() * Math.PI;

    // Random scale for variation
    const scale = Math.random() * 1.5 + 0.5;
    cube.scale.set(scale, scale, scale);

    // Save initial Y pos and random offset for floating math
    cube.userData = {
        yInit: cube.position.y,
        yOffset: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02
    };

    scene.add(cube);
    cubes.push(cube);
}

// Mouse Parallax Effect variables
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Smoothly interpolate camera target based on mouse
    targetX = mouseX * 0.02;
    targetY = mouseY * 0.02;

    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y + 10) * 0.05; // Base Y is 10
    camera.lookAt(0, 0, 0);

    // Animate individual cubes (floating & rotating)
    cubes.forEach(cube => {
        cube.rotation.x += cube.userData.rotSpeedX;
        cube.rotation.y += cube.userData.rotSpeedY;
        // Bobbing up and down
        cube.position.y = cube.userData.yInit + Math.sin(time + cube.userData.yOffset) * 5 * cube.userData.speed;
    });

    // Slowly rotate the entire scene
    scene.rotation.y += 0.001;

    renderer.render(scene, camera);
}

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// GSAP UI Entrance Animations
gsap.to(".hero-content", {
    y: 0,
    opacity: 1,
    duration: 1.2,
    ease: "power3.out",
    delay: 0.5
});

gsap.from(".navbar", {
    y: -50,
    opacity: 0,
    duration: 1,
    ease: "power2.out"
});
