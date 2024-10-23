import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';

// Escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.setClearColor( 0xffffff, 0);


renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Control de la cámara
const controls = new OrbitControls(camera, renderer.domElement);

// Cargar texturas
const textureLoader = new THREE.TextureLoader();
// Definimos los packs de texturas
const texturePacks = {
  'diamond-metal-siding-unity': {
      albedoMap: 'diamond-metal-siding-unity/diamond-metal-siding_albedo.png',
      aoMap: 'diamond-metal-siding-unity/diamond-metal-siding_ao.png',
      heightMap: 'diamond-metal-siding-unity/diamond-metal-siding_height.png',
      normalMap: 'diamond-metal-siding-unity/diamond-metal-siding_normal-ogl.png',
      metalnessMap: 'diamond-metal-siding-unity/diamond-metal-siding_metallic.png',
      roughnessMap: 'diamond-metal-siding-unity/diamond-metal-siding_roughness.png'
  },
  'rock-slab-wall1-bl': {
      albedoMap: 'rock-slab-wall1-bl/rock-slab-wall_albedo.png',
      aoMap: 'rock-slab-wall1-bl/rock-slab-wall_ao.png',
      heightMap: 'rock-slab-wall1-bl/rock-slab-wall_height.png',
      normalMap: 'rock-slab-wall1-bl/rock-slab-wall_normal-ogl.png',
      metalnessMap: 'rock-slab-wall1-bl/rock-slab-wall_metallic.png',
      roughnessMap: 'rock-slab-wall1-bl/rock-slab-wall_roughness.png'
  }
};

// Función para cargar las texturas de un pack específico
function loadTexturePack(packKey) {
  const pack = texturePacks[packKey];
  
  if (!pack) {
    console.error(`El pack de texturas "${packKey}" no está definido.`);
    return null;
  }

  // Cargar texturas
  const albedoMap = textureLoader.load(pack.albedoMap);
  const aoMap = textureLoader.load(pack.aoMap);
  const heightMap = textureLoader.load(pack.heightMap);
  const normalMap = textureLoader.load(pack.normalMap);
  const metalnessMap = textureLoader.load(pack.metalnessMap);
  const roughnessMap = textureLoader.load(pack.roughnessMap);

  // Asignar el mapa de entorno (opcional, podrías parametrizar esto también si es necesario)
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTexture = new THREE.CubeTextureLoader().load([
    'path/posx.jpg', 'path/negx.jpg',
    'path/posy.jpg', 'path/negy.jpg',
    'path/posz.jpg', 'path/negz.jpg'
  ]);
  const envMap = pmremGenerator.fromCubemap(envTexture).texture;

  // Crear material PBR basado en el pack cargado
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

  return material;
}

// Usar la función para cargar un pack de texturas
const selectedPackKey = 'rock-slab-wall1-bl';  // Puedes cambiar esto dinámicamente
const material = loadTexturePack(selectedPackKey);


// Crear esfera
let segments = 128;  // Valor inicial de segmentos
let geometry = new THREE.SphereGeometry(1, segments, segments);

geometry.attributes.uv2 = geometry.attributes.uv; // Asegurar que las UV2 están configuradas para aoMap
let sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Posicionar cámara
camera.position.z = 3;

// Iluminación
const ambientLight = new THREE.AmbientLight(0x404040, 50); // Luz ambiental suave
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 50);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Añadir luces adicionales
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz direccional
directionalLight.position.set(-3, 10, -10);
scene.add(directionalLight);

const spotLight = new THREE.SpotLight(0xffffff, 2); // Spotlight
spotLight.position.set(10, 10, 10);
spotLight.angle = Math.PI / 6;  // Controlar el ángulo del spotlight
scene.add(spotLight);

// Parámetros de rotación
let rotationSpeed = 0.01; // Velocidad inicial de rotación
let isRotating = true;    // Bandera para detener la animación

// Animación
function animate() {
  requestAnimationFrame(animate);
  if (isRotating) {
    sphere.rotation.y += rotationSpeed; // Ajustar la velocidad de rotación
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

// GUI para controlar parámetros
const gui = new dat.GUI({ autoPlace: false });
const guiContainer = document.getElementById('app');
guiContainer.appendChild(gui.domElement);

const materialFolder = gui.addFolder('Material');
materialFolder.add(material, 'roughness', 0, 1, 0.01).name('Rugosidad');
materialFolder.add(material, 'metalness', 0, 1, 0.01).name('Metalicidad');
materialFolder.add(material, 'displacementScale', 0, 1, 0.01).name('Desplazamiento');
materialFolder.add(material, 'envMapIntensity', 0, 3, 0.1).name('Intensidad EnvMap');

// Opción para cambiar el color del mesh
materialFolder.addColor({ color: material.color.getHex() }, 'color').name('Color del Mesh').onChange((value) => {
  material.color.setHex(value);
});

// Opción para ver los wireframes del mesh
materialFolder.add(material, 'wireframe').name('Mostrar Wireframe');
/**

materialFolder.add(material, 'transmission', 0, 1, 0.01).name('Transmisión');
materialFolder.add(material, 'thickness', 0, 10, 0.1).name('Espesor');
materialFolder.add(material, 'sheen', 0, 1, 0.01).name('Sheen');
materialFolder.addColor({ sheenColor: material.sheenColor.getHex() }, 'sheenColor').name('Color Sheen').onChange((value) => {
  material.sheenColor.setHex(value);
});
materialFolder.add(material, 'anisotropy', 0, 1, 0.01).name('Anisotropía');
*/


const lightFolder = gui.addFolder('Luces');
const ambientLightFolder = lightFolder.addFolder('Luz Ambiental');
ambientLightFolder.add(ambientLight, 'intensity', 0, 100, 1).name('Intensidad');
ambientLightFolder.addColor({ color: ambientLight.color.getHex() }, 'color').name('Color Luz Ambiental').onChange((value) => {
  ambientLight.color.setHex(value);
});

const pointLightFolder = lightFolder.addFolder('Luz Puntual');
pointLightFolder.add(pointLight, 'intensity', 0, 100, 1).name('Intensidad');
pointLightFolder.add(pointLight.position, 'x', -10, 10, 0.1).name('Posición X');
pointLightFolder.add(pointLight.position, 'y', -10, 10, 0.1).name('Posición Y');
pointLightFolder.add(pointLight.position, 'z', -10, 10, 0.1).name('Posición Z');
pointLightFolder.addColor({ color: pointLight.color.getHex() }, 'color').name('Color Luz Puntual').onChange((value) => {
  pointLight.color.setHex(value);
});

const directionalLightFolder = lightFolder.addFolder('Luz Direccional');
directionalLightFolder.add(directionalLight, 'intensity', 0, 10, 0.1).name('Intensidad');
directionalLightFolder.add(directionalLight.position, 'x', -10, 10, 0.1).name('Posición X');
directionalLightFolder.add(directionalLight.position, 'y', -10, 10, 0.1).name('Posición Y');
directionalLightFolder.add(directionalLight.position, 'z', -10, 10, 0.1).name('Posición Z');
directionalLightFolder.addColor({ color: directionalLight.color.getHex() }, 'color').name('Color Luz Direccional').onChange((value) => {
  directionalLight.color.setHex(value);
});

const spotLightFolder = lightFolder.addFolder('Spotlight');
spotLightFolder.add(spotLight, 'intensity', 0, 10, 0.1).name('Intensidad');
spotLightFolder.add(spotLight.position, 'x', -10, 10, 0.1).name('Posición X');
spotLightFolder.add(spotLight.position, 'y', -10, 10, 0.1).name('Posición Y');
spotLightFolder.add(spotLight.position, 'z', -10, 10, 0.1).name('Posición Z');
spotLightFolder.add(spotLight, 'angle', 0, Math.PI / 2, 0.01).name('Ángulo');
spotLightFolder.addColor({ color: spotLight.color.getHex() }, 'color').name('Color Spotlight').onChange((value) => {
  spotLight.color.setHex(value);
});

const meshFolder = gui.addFolder('Geometría');
meshFolder.add({ segments }, 'segments', 16, 512, 1).name('Segmentos').onChange(function (value) {
  segments = value;
  scene.remove(sphere);  // Eliminar la esfera actual
  geometry = new THREE.SphereGeometry(1, segments, segments); // Crear nueva geometría
  geometry.attributes.uv2 = geometry.attributes.uv;  // Configurar UV2 para el aoMap
  sphere = new THREE.Mesh(geometry, material);  // Crear nuevo mesh con la nueva geometría
  scene.add(sphere);  // Añadir nuevamente a la escena
});

const animationFolder = gui.addFolder('Animación');
animationFolder.add({ rotationSpeed }, 'rotationSpeed', 0, 0.1, 0.001).name('Velocidad de Rotación').onChange(function (value) {
  rotationSpeed = value; // Cambiar la velocidad de rotación
});
animationFolder.add({ isRotating }, 'isRotating').name('Rotación Activa').onChange(function (value) {
  isRotating = value; // Activar o desactivar la rotación
});

// Opción para cambiar el color del fondo
const sceneFolder = gui.addFolder('Escena');

// Inicializa el color antes de obtenerlo
sceneFolder.addColor({ color: 0xffffff }, 'color').name('Color del Fondo').onChange((value) => {
  renderer.setClearColor(value);
});

const toneMappingParams = {
  exposure: 1.0,
  toneMapping: THREE.NoToneMapping // Puedes cambiar a otros modos como `THREE.ACESFilmicToneMapping`
};

sceneFolder.add(toneMappingParams, 'exposure', 0, 2, 0.01).name('Exposición').onChange((value) => {
  renderer.toneMappingExposure = value;
});
sceneFolder.add(toneMappingParams, 'toneMapping', {
  'No Tone Mapping': THREE.NoToneMapping,
  'Linear Tone Mapping': THREE.LinearToneMapping,
  'Reinhard Tone Mapping': THREE.ReinhardToneMapping,
  'Cineon Tone Mapping': THREE.CineonToneMapping,
  'ACES Filmic Tone Mapping': THREE.ACESFilmicToneMapping
}).name('Tone Mapping').onChange((value) => {
  renderer.toneMapping = parseInt(value);
});





materialFolder.open();
meshFolder.open();
animationFolder.open();
lightFolder.open();
sceneFolder.open();
