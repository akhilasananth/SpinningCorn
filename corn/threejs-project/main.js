import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Camera
const camera = new THREE.PerspectiveCamera(
  15,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
hemiLight.position.set(0, 1, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(3, 10, 10);
scene.add(dirLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.5;

controls.enableZoom = false; // Optional: disable zoom
controls.enablePan = false;  // Optional: disable pan

controls.minPolarAngle = Math.PI / 2; // 90°
controls.maxPolarAngle = Math.PI / 2; // 90°
// controls.autoRotate = true;
// controls.autoRotateSpeed = 4.0; 

controls.target.set(0, 0, 0);
controls.update();

// Load GLB model
const loader = new GLTFLoader();
loader.load('/model.glb', (gltf) => {

  const model = gltf.scene;

  // Measure object
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);

  model.position.sub(center); 

  // Shadow 
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      child.geometry.boundingBox.getCenter(center);
      child.geometry.translate(-center.x, -center.y, -center.z);
    }
  });

  // Create a wrapper to isolate model transforms
  const wrapper = new THREE.Group();
  wrapper.add(model);
  scene.add(wrapper);


  // Rotate model upright first
  wrapper.rotation.x = 0;

  // Rotate wrapper to turn it to face East
  wrapper.rotation.z = -Math.PI / 2;

  window.model = wrapper;

}, undefined, (error) => {
  console.error('Error loading model:', error);
});


// Mouse drag listeners
let isDragging = false;
let previousMousePosition = { x: 0 };

// renderer.domElement.addEventListener('mousedown', () => isDragging = true);
// renderer.domElement.addEventListener('mouseup', () => isDragging = false);
// renderer.domElement.addEventListener('mousemove', (event) => {
//   if (!isDragging || !window.model) return;
//   const deltaX = event.clientX - previousMousePosition.x;
//   window.model.rotation.x += deltaX * 0.10; // Rotating around X if it lies on X
//   previousMousePosition.x = event.clientX;
// });

window.addEventListener('wheel', (event) => {
  event.preventDefault();
  const deltaX = event.clientX - previousMousePosition.x;

  if (event.deltaY < 0) {
    window.model.rotation.x -= 0.05 ;
  } else {
    window.model.rotation.x += 0.05;
  }

  previousMousePosition.x = event.clientX;
  
}, { passive: false });

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
