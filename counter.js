import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';

// Escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff); // Establece el fondo blanco

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Control de la cámara
const controls = new OrbitControls(camera, renderer.domElement);

// Cargar texturas
const textureLoader = new THREE.TextureLoader();
const albedoMap = textureLoader.load('diamond-metal-siding-unity/diamond-metal-siding_albedo.png');
const aoMap = textureLoader.load('diamond-metal-siding-unity/diamond-metal-siding_ao.png');
const heightMap = textureLoader.load('diamond-metal-siding-unity/diamond-metal-siding_height.png');
const normalMap = textureLoader.load('diamond-metal-siding-unity/diamond-metal-siding_normal-ogl.png');
const metalnessMap = textureLoader.load('diamond-metal-siding-unity/diamond-metal-siding_metallic.png');
const roughnessMap = textureLoader.load('diamond-metal-siding-unity/diamond-metal-siding_roughness.png');

// Asignar el mapa de entorno (opcional)
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envTexture = new THREE.CubeTextureLoader().load([
  'path/posx.jpg', 'path/negx.jpg', 
  'path/posy.jpg', 'path/negy.jpg', 
  'path/posz.jpg', 'path/negz.jpg'
]);
const envMap = pmremGenerator.fromCubemap(envTexture).texture;

// Crear material PBR
const material = new THREE.MeshStandardMaterial({
  map: albedoMap,               // Textura difusa o albedo
  aoMap: aoMap,                 // Mapa de oclusión ambiental
  displacementMap: heightMap,   // Mapa de desplazamiento
  displacementScale: 0.1,       // Ajustar el nivel de desplazamiento si es necesario
  normalMap: normalMap,         // Mapa de normales
  metalnessMap: metalnessMap,   // Mapa de metalicidad
  roughnessMap: roughnessMap,   // Mapa de rugosidad
  roughness: 0.5,               // Ajustar la rugosidad
  metalness: 1.0,               // Definir propiedades metálicas
  envMap: envMap,               // Mapa de entorno
  envMapIntensity: 1.0          // Intensidad del mapa de entorno
});

// Crear esfera
// const geometry = new THREE.SphereGeometry(1, 64, 64); // Esfera de 1 unidad de radio con 64 segmentos
const geometry = new THREE.SphereGeometry(1, 128, 128); // Aumentar los segmentos

geometry.attributes.uv2 = geometry.attributes.uv; // Asegurar que las UV2 están configuradas para aoMap
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Posicionar cámara
camera.position.z = 3;

// Iluminación
const ambientLight = new THREE.AmbientLight(0x404040, 50); // Luz ambiental suave
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 50);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Animación
function animate() {
  requestAnimationFrame(animate);
  sphere.rotation.y += 0.01; // Rotar lentamente la esfera
  controls.update();
  renderer.render(scene, camera);
}
animate();

const gui = new dat.GUI({ autoPlace: false });
const guiContainer = document.getElementById('app');
guiContainer.appendChild(gui.domElement);