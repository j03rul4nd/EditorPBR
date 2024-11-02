import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';


class Engine{
  scene;
  camera;
  controls;
  renderer;
  textureLoader;

  texturePacks = {
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
    },
    'Crusted_snow2-bl':{
      albedoMap: 'Crusted_snow2-bl/Crusted_snow2_Base_Color.png',
        aoMap: 'Crusted_snow2-bl/Crusted_snow2_ao.png',
        heightMap: 'Crusted_snow2-bl/Crusted_snow2_Height.png',
        normalMap: 'Crusted_snow2-bl/Crusted_snow2_Normal-ogl.png',
        metalnessMap: 'Crusted_snow2-bl/Crusted_snow2_Metallic.png',
        roughnessMap: 'Crusted_snow2-bl/Crusted_snow2_Roughness.png'
    }
  };

  albedoMap;               // Textura difusa o albedo
  aoMap;                 // Mapa de oclusión ambiental
  heightMap;   // Mapa de desplazamiento
  normalMap;         // Mapa de normales
  metalnessMap;   // Mapa de metalicidad
  roughnessMap;   // Mapa de rugosidad
  material;
  sphere;
  segments;
  geometry;
  geometryType = 'Sphere'; // Tipo de geometría inicial


  // Parámetros de rotación
  rotationSpeed = 0.01; // Velocidad inicial de rotación
  isRotating = true;    // Bandera para detener la animación

  ambientLight;
  pointLight;
  directionalLight;
  spotLight;

  constructor(){
    this.init3dScene();
  }
  init3dScene(){
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    
    this.renderer.setClearColor( 0xffffff, 0);
        
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.textureLoader = new THREE.TextureLoader();

    this.createMaterial();
    this.createGeometry();

    // Posicionar cámara
    this.camera.position.z = 3;

    this.createLight();

    const animate = () => {
      requestAnimationFrame(animate);
      this.animation();
    }
    animate();

    this.createGUI()

  }
    // Animación
  animation() {
    if (this.isRotating) {
      this.mesh.rotation.y += this.rotationSpeed; // Ajustar la velocidad de rotación
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
  // Función para cargar las texturas de un pack específico
  loadTexturePack(packKey) {
    const pack = this.texturePacks[packKey];
    
    if (!pack) {
      console.error(`El pack de texturas "${packKey}" no está definido.`);
      return null;
    }

    // Cargar texturas
    this.albedoMap = this.textureLoader.load(pack.albedoMap);
    this.aoMap = this.textureLoader.load(pack.aoMap);
    this.heightMap = this.textureLoader.load(pack.heightMap);
    this.normalMap = this.textureLoader.load(pack.normalMap);
    this.metalnessMap = this.textureLoader.load(pack.metalnessMap);
    this.roughnessMap = this.textureLoader.load(pack.roughnessMap);

    // Asignar el mapa de entorno (opcional, podrías parametrizar esto también si es necesario)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const envTexture = new THREE.CubeTextureLoader().load([
      'path/posx.jpg', 'path/negx.jpg',
      'path/posy.jpg', 'path/negy.jpg',
      'path/posz.jpg', 'path/negz.jpg'
    ]);
    const envMap = pmremGenerator.fromCubemap(envTexture).texture;

    // Crear material PBR basado en el pack cargado
    const material = new THREE.MeshStandardMaterial({
      map: this.albedoMap,               // Textura difusa o albedo
      aoMap: this.aoMap,                 // Mapa de oclusión ambiental
      displacementMap: this.heightMap,   // Mapa de desplazamiento
      displacementScale: 0.1,       // Ajustar el nivel de desplazamiento si es necesario
      normalMap: this.normalMap,         // Mapa de normales
      metalnessMap: this.metalnessMap,   // Mapa de metalicidad
      roughnessMap: this.roughnessMap,   // Mapa de rugosidad
      roughness: 0.5,               // Ajustar la rugosidad
      metalness: 1.0,               // Definir propiedades metálicas
      envMap: envMap,               // Mapa de entorno
      envMapIntensity: 1.0,         // Intensidad del mapa de entorno
      side: THREE.DoubleSide
    });

    return material;
  }

  createMaterial(){
    // Usar la función para cargar un pack de texturas
    const selectedPackKey = 'Crusted_snow2-bl';  // Puedes cambiar esto dinámicamente
    this.material = this.loadTexturePack(selectedPackKey);
  }
  updateSegments(value) {
    // Actualizar segmentos y usar la misma función
    this.segments = value;
    this.createOrUpdateGeometry(this.geometryType, this.segments);
  }

  createSphere(){
    // Crear esfera
    this.segments = 128;  // Valor inicial de segmentos
    this.geometry = new THREE.SphereGeometry(1, this.segments, this.segments);

    this.geometry.attributes.uv2 = this.geometry.attributes.uv; // Asegurar que las UV2 están configuradas para aoMap
    this.sphere = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.sphere);
  }
  // Crear geometría genérica
  createGeometry() {
    // Valor predeterminado para los segmentos
    this.segments = this.segments || 128;
    // Usar la nueva función para crear la geometría inicial
    this.createOrUpdateGeometry(this.geometryType, this.segments);
  }

  createOrUpdateGeometry(type, segments) {
    let newGeometry;
  
    switch (type) {
      case 'Sphere':
        newGeometry = new THREE.SphereGeometry(1, segments, segments);
        break;
      case 'Cube':
        const widthSegments = segments;
        const heightSegments = segments;
        const depthSegments = segments;
        newGeometry = new THREE.BoxGeometry(1, 1, 1, widthSegments, heightSegments, depthSegments);
        break;
      case 'Cylinder':
        newGeometry = new THREE.CylinderGeometry(1, 1, 2, segments);
        break;
      case 'Torus':
        newGeometry = new THREE.TorusGeometry(1, 0.4, 16, segments);
        break;
      case 'Plane':
        newGeometry = new THREE.PlaneGeometry(2, 2, segments, segments);
        break;
      case 'Cone':
        newGeometry = new THREE.ConeGeometry(1, 2, segments);
        break;
      case 'Dodecahedron':
        newGeometry = new THREE.DodecahedronGeometry(1, segments);
        break;
      case 'Octahedron':
        newGeometry = new THREE.OctahedronGeometry(1, segments);
        break;
      case 'Tetrahedron':
        newGeometry = new THREE.TetrahedronGeometry(1, segments);
        break;
      case 'Icosahedron':
        newGeometry = new THREE.IcosahedronGeometry(1, segments);
        break;
      case 'TorusKnot':
        newGeometry = new THREE.TorusKnotGeometry(1, 0.4, segments, 8);
        break;
      case 'Ring':
        newGeometry = new THREE.RingGeometry(0.5, 1, segments, 1);
        break;
      default:
        console.warn('El tipo de geometría no soporta segmentos: ', type);
        return;
    }
    

  
    if (newGeometry) {
      // Configurar UV2 para el aoMap si es necesario
      newGeometry.attributes.uv2 = newGeometry.attributes.uv;
  
      // Si ya existe un mesh, simplemente actualizamos su geometría
      if (this.mesh) {
        this.mesh.geometry.dispose();  // Liberar la geometría anterior para evitar fugas de memoria
        this.mesh.geometry = newGeometry;  // Asignar la nueva geometría
      } else {
        // Crear un nuevo mesh si no existe
        this.mesh = new THREE.Mesh(newGeometry, this.material);
        this.scene.add(this.mesh);
      }
    }
  }
  

  createLight(){
    // Iluminación
    this.ambientLight = new THREE.AmbientLight(0x404040, 50); // Luz ambiental suave
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight(0xffffff, 50);
    this.pointLight.position.set(5, 5, 5);
    this.scene.add(this.pointLight);

    // Añadir luces adicionales
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz direccional
    this.directionalLight.position.set(-3, 10, -10);
    this.scene.add(this.directionalLight);

    this.spotLight = new THREE.SpotLight(0xffffff, 2); // Spotlight
    this.spotLight.position.set(10, 10, 10);
    this.spotLight.angle = Math.PI / 6;  // Controlar el ángulo del spotlight
    this.scene.add(this.spotLight);

  }

  createGUI(){
    // GUI para controlar parámetros
    const gui = new dat.GUI({ autoPlace: false });
    const guiContainer = document.getElementById('app');
    guiContainer.appendChild(gui.domElement);

    const materialFolder = gui.addFolder('Material');
    materialFolder.add(this.material, 'roughness', 0, 1, 0.01).name('Rugosidad');
    materialFolder.add(this.material, 'metalness', 0, 1, 0.01).name('Metalicidad');
    materialFolder.add(this.material, 'displacementScale', 0, 1, 0.01).name('Desplazamiento');
    materialFolder.add(this.material, 'envMapIntensity', 0, 3, 0.1).name('Intensidad EnvMap');

    // Opción para cambiar el color del mesh
    materialFolder.addColor({ color: this.material.color.getHex() }, 'color').name('Color del Mesh').onChange((value) => {
      this.material.color.setHex(value);
    });

    // Opción para ver los wireframes del mesh
    materialFolder.add(this.material, 'wireframe').name('Mostrar Wireframe');
    /**

    materialFolder.add(material, 'transmission', 0, 1, 0.01).name('Transmisión');
    materialFolder.add(material, 'thickness', 0, 10, 0.1).name('Espesor');
    materialFolder.add(material, 'sheen', 0, 1, 0.01).name('Sheen');
    materialFolder.addColor({ sheenColor: material.sheenColor.getHex() }, 'sheenColor').name('Color Sheen').onChange((value) => {
      material.sheenColor.setHex(value);
    });
    materialFolder.add(material, 'anisotropy', 0, 1, 0.01).name('Anisotropía');
    */

  // Opción para cambiar entre packs de texturas
  const texturePackKeys = Object.keys(this.texturePacks); // Obtener las claves de los packs de texturas
  materialFolder.add(this, 'selectedTexturePack', texturePackKeys).name('Pack de Texturas').onChange((value) => {
      // Cargar el nuevo pack de texturas seleccionado
      this.material = this.loadTexturePack(value);
      this.mesh.material = this.material;  // Aplicar el nuevo material a la malla
  });


    const lightFolder = gui.addFolder('Luces');
    const ambientLightFolder = lightFolder.addFolder('Luz Ambiental');
    ambientLightFolder.add(this.ambientLight, 'intensity', 0, 100, 1).name('Intensidad');
    ambientLightFolder.addColor({ color: this.ambientLight.color.getHex() }, 'color').name('Color Luz Ambiental').onChange((value) => {
      this.ambientLight.color.setHex(value);
    });

    const pointLightFolder = lightFolder.addFolder('Luz Puntual');
    pointLightFolder.add(this.pointLight, 'intensity', 0, 100, 1).name('Intensidad');
    pointLightFolder.add(this.pointLight.position, 'x', -10, 10, 0.1).name('Posición X');
    pointLightFolder.add(this.pointLight.position, 'y', -10, 10, 0.1).name('Posición Y');
    pointLightFolder.add(this.pointLight.position, 'z', -10, 10, 0.1).name('Posición Z');
    pointLightFolder.addColor({ color: this.pointLight.color.getHex() }, 'color').name('Color Luz Puntual').onChange((value) => {
      this.pointLight.color.setHex(value);
    });

    const directionalLightFolder = lightFolder.addFolder('Luz Direccional');
    directionalLightFolder.add(this.directionalLight, 'intensity', 0, 10, 0.1).name('Intensidad');
    directionalLightFolder.add(this.directionalLight.position, 'x', -10, 10, 0.1).name('Posición X');
    directionalLightFolder.add(this.directionalLight.position, 'y', -10, 10, 0.1).name('Posición Y');
    directionalLightFolder.add(this.directionalLight.position, 'z', -10, 10, 0.1).name('Posición Z');
    directionalLightFolder.addColor({ color: this.directionalLight.color.getHex() }, 'color').name('Color Luz Direccional').onChange((value) => {
      this.directionalLight.color.setHex(value);
    });

    const spotLightFolder = lightFolder.addFolder('Spotlight');
    spotLightFolder.add(this.spotLight, 'intensity', 0, 10, 0.1).name('Intensidad');
    spotLightFolder.add(this.spotLight.position, 'x', -10, 10, 0.1).name('Posición X');
    spotLightFolder.add(this.spotLight.position, 'y', -10, 10, 0.1).name('Posición Y');
    spotLightFolder.add(this.spotLight.position, 'z', -10, 10, 0.1).name('Posición Z');
    spotLightFolder.add(this.spotLight, 'angle', 0, Math.PI / 2, 0.01).name('Ángulo');
    spotLightFolder.addColor({ color: this.spotLight.color.getHex() }, 'color').name('Color Spotlight').onChange((value) => {
      this.spotLight.color.setHex(value);
    });

    const meshFolder = gui.addFolder('Geometría');
    meshFolder.add(this, 'segments', 16, 512, 1).name('Segmentos').onChange((value) => {
      this.updateSegments(value);
    });
    // Opción para cambiar el tipo de geometría
    meshFolder.add(this, 'geometryType',  [
      'Sphere', 
      'Cube', 
      'Cylinder', 
      'Torus', 
      'Plane', 
      'Cone', 
      'Dodecahedron', 
      'Octahedron', 
      'Tetrahedron', 
      'Icosahedron', 
      'TorusKnot', 
      'Ring'
    ]).name('Tipo de Geometría').onChange((value) => {
      this.createOrUpdateGeometry(value, this.segments); // Actualiza la geometría al cambiar el tipo
    });
    

    const animationFolder = gui.addFolder('Animación');
    animationFolder.add( this, 'rotationSpeed', 0, 0.1, 0.001).name('Velocidad de Rotación').onChange(function (value) {
      this.rotationSpeed = value; // Cambiar la velocidad de rotación
    });
    animationFolder.add( this, 'isRotating').name('Rotación Activa').onChange(function (value) {
      this.isRotating = value; // Activar o desactivar la rotación
    });

    // Opción para cambiar el color del fondo
    const sceneFolder = gui.addFolder('Escena');

    // Inicializa el color antes de obtenerlo
    sceneFolder.addColor({ color: 0xffffff }, 'color').name('Color del Fondo').onChange((value) => {
      this.renderer.setClearColor(value);
    });

    const toneMappingParams = {
      exposure: 1.0,
      toneMapping: THREE.NoToneMapping // Puedes cambiar a otros modos como `THREE.ACESFilmicToneMapping`
    };

    sceneFolder.add(toneMappingParams, 'exposure', 0, 2, 0.01).name('Exposición').onChange((value) => {
      this.renderer.toneMappingExposure = value;
    });
    sceneFolder.add(toneMappingParams, 'toneMapping', {
      'No Tone Mapping': THREE.NoToneMapping,
      'Linear Tone Mapping': THREE.LinearToneMapping,
      'Reinhard Tone Mapping': THREE.ReinhardToneMapping,
      'Cineon Tone Mapping': THREE.CineonToneMapping,
      'ACES Filmic Tone Mapping': THREE.ACESFilmicToneMapping
    }).name('Tone Mapping').onChange((value) => {
      this.renderer.toneMapping = parseInt(value);
    });





    materialFolder.open();
    meshFolder.open();
    animationFolder.open();
    lightFolder.open();
    sceneFolder.open();

  }

}


let engine = new Engine();