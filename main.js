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

  selectedTexturePack = 'diamond-metal-siding-unity';

  // Parámetros de rotación
  rotationSpeed = 0.01; // Velocidad inicial de rotación
  isRotating = true;    // Bandera para detener la animación

  ambientLight;
  pointLight;
  directionalLight;
  spotLight;

  constructor(){
    this.init3dScene();
    this.populateTexturePackSelector();  // Llama a la función para generar opciones del selector
    this.setupTexturePackSelector();
    this.uiListeners();
    this.bgCreate();

    window.addEventListener('resize', () => this.onWindowResize());
  }
  populateTexturePackSelector() {
    // Obtén el elemento select
    const texturePackSelector = document.getElementById('texture-pack-selector');

    // Limpia el contenido actual del selector
    texturePackSelector.innerHTML = '';

    // Recorre los packs de textura y crea una opción para cada uno
    for (const packKey in this.texturePacks) {
      if (this.texturePacks.hasOwnProperty(packKey)) {
        // Crea el elemento option
        const option = document.createElement('option');
        option.value = packKey;
        option.textContent = packKey
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase()); // Formato de nombre

        // Añadir el elemento option al selector
        texturePackSelector.appendChild(option);
      }
    }
  }

  updateTexturePack(packKey) {
    // Carga el nuevo pack de texturas y actualiza la malla y la vista previa
    // const newMaterial = this.loadTexturePack(packKey);
    // if (this.mesh && newMaterial) {
    //   this.mesh.material.dispose(); // Libera el material anterior para evitar fugas de memoria
    //   this.mesh.material = newMaterial; // Actualiza el material de la malla
    // }

    const pack = this.texturePacks[packKey];
      
    if (!pack) {
      console.error(`El pack de texturas "${packKey}" no está definido.`);
      return;
    }
  
    // Asignar texturas al material existente sin crear uno nuevo
    this.mesh.material.map = this.textureLoader.load(pack.albedoMap);
    this.mesh.material.aoMap = this.textureLoader.load(pack.aoMap);
    this.mesh.material.displacementMap = this.textureLoader.load(pack.heightMap);
    this.mesh.material.normalMap = this.textureLoader.load(pack.normalMap);
    this.mesh.material.metalnessMap = this.textureLoader.load(pack.metalnessMap);
    this.mesh.material.roughnessMap = this.textureLoader.load(pack.roughnessMap);
  
    // Asegurar que los cambios de textura se actualicen en el renderizado
    this.mesh.material.needsUpdate = true;    

  }

  setupTexturePackSelector() {
    const texturePackSelector = document.getElementById('texture-pack-selector');
    texturePackSelector.addEventListener('change', (event) => {
      const selectedPack = event.target.value;
      this.selectedTexturePack = selectedPack;  // Actualiza la propiedad aquí
      this.updateTexturePack(selectedPack);
    });
  }

  // Función para actualizar la vista previa de la textura en la interfaz
  setTexturePreview(textureName, textureUrl) {
    // Selecciona el elemento de vista previa de la textura
    const textureImageElement = document.querySelector(`.texture-item[aria-labelledby="texture-${textureName.toLowerCase()}"] .texture-image`);
    
    if (textureImageElement) {
      textureImageElement.style.backgroundImage = `url('${textureUrl}')`;
      textureImageElement.style.backgroundSize = 'cover'; // Ajusta la imagen para cubrir el espacio de preview
      textureImageElement.style.backgroundPosition = 'center';
      textureImageElement.style.display = 'block'; // Asegura que esté visible
    } else {
      console.warn(`No se encontró el elemento de vista previa para la textura: ${textureName}`);
    }
  }
  init3dScene(){
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    
    this.renderer.setClearColor( 0xffffff, 0);
        
    // Ajustar tamaño al contenedor
    const previewContainer = document.querySelector(".preview-3d");
    this.renderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);

    // Añadir canvas al contenedor en lugar de a document.body
    previewContainer.innerHTML = ""; //clear
    previewContainer.appendChild(this.renderer.domElement);

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
  onWindowResize() {
    const previewContainer = document.querySelector(".preview-3d");
    
    // Ajusta la cámara y el renderer al nuevo tamaño del contenedor
   // this.camera.aspect = previewContainer.clientWidth / previewContainer.clientHeight;
    this.camera.updateProjectionMatrix();
    //this.renderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);

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

    // Cargar y actualizar texturas con vista previa
    this.albedoMap = this.textureLoader.load(pack.albedoMap);
    this.setTexturePreview('Albedo', pack.albedoMap);
    
    this.aoMap = this.textureLoader.load(pack.aoMap);
    this.setTexturePreview('Occlusion', pack.aoMap);
    
    this.heightMap = this.textureLoader.load(pack.heightMap);
    this.setTexturePreview('Displacement', pack.heightMap);
    
    this.normalMap = this.textureLoader.load(pack.normalMap);
    this.setTexturePreview('Normal', pack.normalMap);
    
    this.metalnessMap = this.textureLoader.load(pack.metalnessMap);
    this.setTexturePreview('Metalness', pack.metalnessMap);
    
    this.roughnessMap = this.textureLoader.load(pack.roughnessMap);
    this.setTexturePreview('Roughness', pack.roughnessMap);

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

    materialFolder.add(this.material, 'displacementScale', 0, 1, 0.01)
    .name('Desplazamiento')
    .onChange((newDisplacementValue) => {
      // Verifica si el mesh y el material están definidos
      if (this.mesh && this.mesh.material) {
        // Imprime un mensaje detallado sobre el cambio en desplazamiento
        console.log(`\n==== Cambio en Desplazamiento ====\n`);
        console.log(`Pack de Texturas Seleccionado: ${this.selectedTexturePack}`);
        console.log(`Valor de Desplazamiento Actualizado a: ${newDisplacementValue}`);
        console.log(`Material Asignado Actualmente al Mesh:\n`);
  
        // Log detallado del material
        const material = this.mesh.material;
        console.log(`Tipo de Material: ${material.type}`);
        console.log(`Textura Albedo: ${material.map ? material.map.image.src : 'No asignada'}`);
        console.log(`Mapa de Oclusión Ambiental: ${material.aoMap ? material.aoMap.image.src : 'No asignado'}`);
        console.log(`Mapa de Desplazamiento: ${material.displacementMap ? material.displacementMap.image.src : 'No asignado'}`);
        console.log(`Mapa de Normales: ${material.normalMap ? material.normalMap.image.src : 'No asignado'}`);
        console.log(`Mapa de Metalicidad: ${material.metalnessMap ? material.metalnessMap.image.src : 'No asignado'}`);
        console.log(`Mapa de Rugosidad: ${material.roughnessMap ? material.roughnessMap.image.src : 'No asignado'}`);
        
        console.log(`\nPropiedades Adicionales del Material:`);
        console.log(`Metallicidad: ${material.metalness}`);
        console.log(`Rugosidad: ${material.roughness}`);
        console.log(`Intensidad del Mapa de Entorno: ${material.envMapIntensity}`);
        console.log(`Wireframe Activado: ${material.wireframe ? 'Sí' : 'No'}`);
        console.log(`\n==== Fin del Log ====\n`);
      } else {
        console.warn("No se encontró un material asignado a la malla o el mesh no está definido.");
      }
    });


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
  materialFolder.add(this, 'selectedTexturePack', texturePackKeys)
    .name('Pack de Texturas')
    .onChange((value) => {
      // Actualizar el pack de texturas seleccionado
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





    // materialFolder.open();
    // meshFolder.open();
    // animationFolder.open();
    // lightFolder.open();
    // sceneFolder.open();

  }

  uiListeners(){
    let _me = this;

    _me.uiBtnEditForm();

    _me.uiLoadFile();

    _me.utilseditTexturesForm();

    _me.uiPopUpGeneratorNormlaPBR();

  }

  uiBtnEditForm(){
    let _me = this;
    // Selección de todos los botones de edición y formulario de edición
    document.querySelectorAll('.btnEdition').forEach(editButton => {
      editButton.addEventListener('click', function () {
        // Ocultar el botón de editar, el botón de cargar y el contenedor de botones de edición
        this.style.display = 'none';
        const textureItem = this.closest('.texture-item');
        const loadButton = textureItem.querySelector('.btnLoad');
        const editButtonsContainer = textureItem.querySelector('.edit-buttons');

        loadButton.style.display = 'none';
        editButtonsContainer.style.display = 'none';

        // Seleccionar y mostrar el formulario de edición correspondiente
        const editForm = textureItem.querySelector('.edit-form');
        editForm.classList.add('edit-form-visible');
      });
    });

    // Selección de todos los botones de cancelar dentro de los formularios de edición
    document.querySelectorAll('.cancel-btn').forEach(cancelButton => {
      cancelButton.addEventListener('click', function () {
        // Seleccionar el formulario de edición que se debe ocultar
        const textureItem = this.closest('.texture-item');
        const editForm = textureItem.querySelector('.edit-form');
        editForm.classList.remove('edit-form-visible');

        // Mostrar nuevamente los botones de edición, carga, y el contenedor de botones de edición
        const editButton = textureItem.querySelector('.btnEdition');
        const loadButton = textureItem.querySelector('.btnLoad');
        const editButtonsContainer = textureItem.querySelector('.edit-buttons');

        editButton.style.display = 'inline-block';
        loadButton.style.display = 'inline-block';
        editButtonsContainer.style.display = 'flex';
      });
    });

    // Abre el popup
    document.querySelectorAll('.texture-image').forEach(textureImage => {
      textureImage.addEventListener('click', function () {
          const backgroundImage = this.style.backgroundImage;

          if (backgroundImage) {
              const imageUrl = backgroundImage.slice(5, -2);
              const popupImage = document.getElementById('popup-image');
              popupImage.src = imageUrl;
              document.getElementById('image-popup').classList.add('show');
          }
      });
    });

    // Cierra el popup al hacer clic en el botón de cierre
    document.getElementById('close-popup').addEventListener('click', function () {
      const popup = document.getElementById('image-popup');
      popup.classList.remove('show');
      setTimeout(() => {
          document.getElementById('popup-image').src = '';
      }, 400); 
    });

    // Cierra el popup al hacer clic fuera del contenido
    document.getElementById('image-popup').addEventListener('click', function (event) {
      if (event.target === this) {
          this.classList.remove('show');
          setTimeout(() => {
              document.getElementById('popup-image').src = '';
          }, 400);
      }
    });
  }

  uiLoadFile(){
    let _me = this;
    // Escuchar clic en los botones "Cargar" para activar el input de archivo
    document.querySelectorAll('.btnLoad').forEach(button => {
      button.addEventListener('click', function () {
        const textureItem = this.closest('.texture-item');
        const fileInput = textureItem.querySelector('input[type="file"]');
        fileInput.click(); // Activa el input de archivo
      });
    });

    // Manejar el cambio en el input de archivo
    document.querySelectorAll('.editor input[type="file"]').forEach(input => {
      input.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();

          // Leer el archivo y cargar la imagen
          reader.onload = (e) => {
            const textureURL = e.target.result; // URL de la imagen cargada
            const textureItem = this.closest('.texture-item');
            const textureName = textureItem.querySelector('.texture-name').textContent.toLowerCase();
            
            // Actualizar vista previa
            _me.setTexturePreview(textureName, textureURL);

            // Reemplazar textura en el objeto 3D
            const texture = new THREE.TextureLoader().load(textureURL);
            switch (textureName) {
              case 'albedo':
                _me.material.map = texture;
                break;
              case 'normal':
                _me.material.normalMap = texture;
                break;
              case 'roughness':
                _me.material.roughnessMap = texture;
                break;
              case 'metalness':
                _me.material.metalnessMap = texture;
                break;
              case 'occlusion':
                _me.material.aoMap = texture;
                break;
              case 'displacement':
                _me.material.displacementMap = texture;
                break;
            }

            // Asegurarse de que los cambios se reflejan en el material
            _me.material.needsUpdate = true;
          };

          reader.readAsDataURL(file); // Leer archivo como Data URL
        }
      });
    });
    
  }

  utilseditTexturesForm(){
    let _me = this;
    // Listener específico para el botón Confirmar de la textura Albedo
    const confirmAlbedoBtn = document.getElementById('confirmAlbedoBtn');
    if (confirmAlbedoBtn) {
      confirmAlbedoBtn.addEventListener('click', function () {
        // Obtener valores de color y saturación del formulario de edición de Albedo
        const textureItem = this.closest('.texture-item');
        const colorInput = textureItem.querySelector('#albedo-color');
        const saturationInput = textureItem.querySelector('#albedo-saturation');

        const baseColor = new THREE.Color(colorInput.value);
        const saturation = parseFloat(saturationInput.value);

        // Ajustar la saturación del color
        const albedoColor = baseColor.clone().multiplyScalar(saturation);

        // Aplicar el color a la textura Albedo en el material de THREE.js
        if (_me.material.map) {
          _me.material.color = albedoColor; // Modifica el color base del material
          _me.material.needsUpdate = true;  // Asegura que los cambios se apliquen
        }

        // Ocultar el formulario de edición después de confirmar
        const editForm = textureItem.querySelector('.edit-form');
        editForm.classList.remove('edit-form-visible');

        // Restaurar los botones de edición y carga
        const editButton = textureItem.querySelector('.btnEdition');
        const loadButton = textureItem.querySelector('.btnLoad');
        const editButtonsContainer = textureItem.querySelector('.edit-buttons');
        editButton.style.display = 'inline-block';
        loadButton.style.display = 'inline-block';
        editButtonsContainer.style.display = 'flex';
      });
    }

    // Listener específico para el botón Confirmar de la textura Normal
    const confirmNormalBtn = document.getElementById('confirmNormalBtn');
    if (confirmNormalBtn) {
      confirmNormalBtn.addEventListener('click', function () {
        // Obtener valores del formulario de edición de Normal
        const textureItem = this.closest('.texture-item');
        const intensityInput = textureItem.querySelector('#normal-intensity');
        const invertXAxis = textureItem.querySelector('#invert-x-axis').checked;
        const invertYAxis = textureItem.querySelector('#invert-y-axis').checked;

        // Ajustar intensidad del mapa normal
        const intensity = parseFloat(intensityInput.value);

        if (_me.material.normalMap) {
          // Clonar y actualizar el normalScale del mapa normal
          _me.material.normalScale.set(
            intensity * (invertXAxis ? -1 : 1),
            intensity * (invertYAxis ? -1 : 1)
          );
          _me.material.needsUpdate = true;  // Asegura que los cambios se apliquen
        }

        // Ocultar el formulario de edición después de confirmar
        const editForm = textureItem.querySelector('.edit-form');
        editForm.classList.remove('edit-form-visible');

        // Restaurar los botones de edición y carga
        const editButton = textureItem.querySelector('.btnEdition');
        const loadButton = textureItem.querySelector('.btnLoad');
        const editButtonsContainer = textureItem.querySelector('.edit-buttons');
        editButton.style.display = 'inline-block';
        loadButton.style.display = 'inline-block';
        editButtonsContainer.style.display = 'flex';
      });
    }

    // Listener específico para el botón Confirmar de la textura Roughness
    const confirmRoughnessBtn = document.getElementById('confirmRoughnessBtn');
    if (confirmRoughnessBtn) {
      confirmRoughnessBtn.addEventListener('click', function () {
        // Obtener valor del nivel de rugosidad desde el formulario de edición
        const textureItem = this.closest('.texture-item');
        const roughnessLevelInput = textureItem.querySelector('#roughness-level');

        // Extraer el valor del slider y convertirlo a número
        const roughnessLevel = parseFloat(roughnessLevelInput.value);

        // Aplicar el nivel de rugosidad al material de THREE.js
        if (_me.material) {
          _me.material.roughness = roughnessLevel;
          _me.material.needsUpdate = true;  // Asegura que los cambios se reflejen en el material
        }

        // Ocultar el formulario de edición después de confirmar
        const editForm = textureItem.querySelector('.edit-form');
        editForm.classList.remove('edit-form-visible');

        // Restaurar los botones de edición y carga
        const editButton = textureItem.querySelector('.btnEdition');
        const loadButton = textureItem.querySelector('.btnLoad');
        const editButtonsContainer = textureItem.querySelector('.edit-buttons');
        editButton.style.display = 'inline-block';
        loadButton.style.display = 'inline-block';
        editButtonsContainer.style.display = 'flex';
      });
    }

    // Listener específico para el botón Confirmar de la textura Metalness
    const confirmMetalnessBtn = document.getElementById('confirmMetalnessBtn');
    if (confirmMetalnessBtn) {
      confirmMetalnessBtn.addEventListener('click', function () {
        // Obtener valor del nivel de metalicidad desde el formulario de edición
        const textureItem = this.closest('.texture-item');
        const metalnessLevelInput = textureItem.querySelector('#metalness-level');

        // Extraer el valor del slider y convertirlo a número
        const metalnessLevel = parseFloat(metalnessLevelInput.value);

        // Aplicar el nivel de metalicidad al material de THREE.js
        if (_me.material) {
          _me.material.metalness = metalnessLevel;
          _me.material.needsUpdate = true;  // Asegura que los cambios se reflejen en el material
        }

        // Ocultar el formulario de edición después de confirmar
        const editForm = textureItem.querySelector('.edit-form');
        editForm.classList.remove('edit-form-visible');

        // Restaurar los botones de edición y carga
        const editButton = textureItem.querySelector('.btnEdition');
        const loadButton = textureItem.querySelector('.btnLoad');
        const editButtonsContainer = textureItem.querySelector('.edit-buttons');
        editButton.style.display = 'inline-block';
        loadButton.style.display = 'inline-block';
        editButtonsContainer.style.display = 'flex';
      });
    }


    // Listener específico para el botón Confirmar de la textura Occlusion
    const confirmOcclusionBtn = document.getElementById('confirmOcclusionBtn');
    if (confirmOcclusionBtn) {
      confirmOcclusionBtn.addEventListener('click', function () {
        // Obtener valor de la intensidad de oclusión desde el formulario de edición
        const textureItem = this.closest('.texture-item');
        const occlusionIntensityInput = textureItem.querySelector('#occlusion-intensity');

        // Extraer el valor del slider y convertirlo a número
        const occlusionIntensity = parseFloat(occlusionIntensityInput.value);

        // Aplicar la intensidad de oclusión al material de THREE.js
        if (_me.material.aoMap) {
          _me.material.aoMapIntensity = occlusionIntensity;
          _me.material.needsUpdate = true;  // Asegura que los cambios se reflejen en el material
        }

        // Ocultar el formulario de edición después de confirmar
        const editForm = textureItem.querySelector('.edit-form');
        editForm.classList.remove('edit-form-visible');

        // Restaurar los botones de edición y carga
        const editButton = textureItem.querySelector('.btnEdition');
        const loadButton = textureItem.querySelector('.btnLoad');
        const editButtonsContainer = textureItem.querySelector('.edit-buttons');
        editButton.style.display = 'inline-block';
        loadButton.style.display = 'inline-block';
        editButtonsContainer.style.display = 'flex';
      });
    }

    // Listener específico para el botón Confirmar de la textura Displacement
    const confirmDisplacementBtn = document.getElementById('confirmDisplacementBtn');
    if (confirmDisplacementBtn) {
      confirmDisplacementBtn.addEventListener('click', function () {
        // Obtener valor del nivel de desplazamiento desde el formulario de edición
        const textureItem = this.closest('.texture-item');
        const displacementHeightInput = textureItem.querySelector('#displacement-height');

        // Extraer el valor del slider y convertirlo a número
        const displacementHeight = parseFloat(displacementHeightInput.value);

        // Aplicar el nivel de desplazamiento al material de THREE.js
        if (_me.material.displacementMap) {
          _me.material.displacementScale = displacementHeight;
          _me.material.needsUpdate = true;  // Asegura que los cambios se reflejen en el material
        }

        // Ocultar el formulario de edición después de confirmar
        const editForm = textureItem.querySelector('.edit-form');
        editForm.classList.remove('edit-form-visible');

        // Restaurar los botones de edición y carga
        const editButton = textureItem.querySelector('.btnEdition');
        const loadButton = textureItem.querySelector('.btnLoad');
        const editButtonsContainer = textureItem.querySelector('.edit-buttons');
        editButton.style.display = 'inline-block';
        loadButton.style.display = 'inline-block';
        editButtonsContainer.style.display = 'flex';
      });
    }
  }

  bgCreate(){
      // Crear la escena, cámara y renderizador para el shader de fondo
      const sceneBg = new THREE.Scene();
      const cameraBg = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      const rendererBg = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      
      // Configuración inicial
      rendererBg.domElement.id = 'shader-background';
      rendererBg.setSize(window.innerWidth, window.innerHeight);
      rendererBg.domElement.style.position = 'fixed';
      rendererBg.domElement.style.top = '0';
      rendererBg.domElement.style.left = '0';
      rendererBg.domElement.style.zIndex = '-1';
      rendererBg.domElement.style.width = '100vw';
      rendererBg.domElement.style.height = '100vh';
      rendererBg.domElement.style.pointerEvents = 'none';

      document.body.appendChild(rendererBg.domElement);

      cameraBg.position.z = 5;

      // Reemplaza la geometría con un tamaño dinámico basado en la relación de aspecto de la ventana
      const geometryBg = new THREE.PlaneGeometry(2 * cameraBg.aspect * cameraBg.position.z, 2 * cameraBg.position.z);

      const fragmentShaderBg = `
          precision mediump float;
          uniform float time;
          varying vec2 vUv;

          void main() {
              vec3 color1 = vec3(1.0, 0.0, 0.5);
              vec3 color2 = vec3(1.0, 1.0, 0.0);
              vec3 color3 = vec3(1.0, 0.0, 0.0);

              float gradient = smoothstep(0.0, 1.0, vUv.y * 2.0 + sin(time) * 0.5);
              vec3 color = mix(color1, color2, gradient);
              color = mix(color, color3, sin(vUv.x * 3.1416 + time));

              gl_FragColor = vec4(color, 1.0);
          }
      `;

      const vertexShaderBg = `
          varying vec2 vUv;
          void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
      `;

      const materialBg = new THREE.ShaderMaterial({
          uniforms: { time: { value: 0.0 } },
          vertexShader: vertexShaderBg,
          fragmentShader: fragmentShaderBg
      });

      const planeBg = new THREE.Mesh(geometryBg, materialBg);
      sceneBg.add(planeBg);

      // Ajustar tamaño y posición en redimensionamiento
      window.addEventListener('resize', () => {
        rendererBg.setSize(window.innerWidth, window.innerHeight);
        cameraBg.aspect = window.innerWidth / window.innerHeight;
        cameraBg.updateProjectionMatrix();
    
        // Reajusta el tamaño del plano
        planeBg.geometry.dispose();
        planeBg.geometry = new THREE.PlaneGeometry(2 * cameraBg.aspect * cameraBg.position.z, 2 * cameraBg.position.z);
      });
    
      function animateBg(time) {
          materialBg.uniforms.time.value = time * 0.001;
          rendererBg.render(sceneBg, cameraBg);
          requestAnimationFrame(animateBg);
      }

      animateBg();
  }

  firstRenderNormalized = true;
  uiPopUpGeneratorNormlaPBR(){
    let _me = this;
    document.getElementById('generateTextureBtn').addEventListener('click', function () {
      if(_me.firstRenderNormalized){
        _me.generateSceneNormalTexture();
        _me.firstRenderNormalized = false;
      }
        document.getElementById('generatePopup').classList.add('show');
    });
    
    document.getElementById('closeGeneratePopup').addEventListener('click', function () {
        document.getElementById('generatePopup').classList.remove('show');
    });
    
    // Añadir el evento de carga de imagen al input de archivo
    document.getElementById('inputImage').addEventListener('change', function () {
        const inputImage = this.files[0];
        if (inputImage) {
            console.log('Image file received:', inputImage);
            _me.loadImageNormalgenerate(inputImage);
        } else {
            alert('Please upload an image first.');
        }
    });

    // Maneja la generación de la textura cuando el botón "Generate" es presionado
    document.getElementById('generateBtn').addEventListener('click', function () {
        document.getElementById('inputImage').click();     
    });

  }
  loadImageNormalgenerate(inputImage){
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;
        this.uniformsNormalTexture.uTexture.value = texture;
        this.rendererNormalTexture.render(this.sceneNormalTexture, this.cameraNormalTexture);
      };
    };
    reader.readAsDataURL(inputImage);
  }

  generateSceneNormalTexture() {
    let _me = this;
    let sectioncanvas = document.getElementById('canvasGeneratePopUpNormal');

    // Fijar dimensiones del contenedor
    sectioncanvas.style.width = '400px';
    sectioncanvas.style.height = '400px';

    // Configuración de la escena básica
    this.sceneNormalTexture = new THREE.Scene();
    this.cameraNormalTexture = new THREE.PerspectiveCamera(
        75,
        400 / 400, // Aspect ratio fijo de 1:1
        0.1,
        1000
    );
    this.rendererNormalTexture = new THREE.WebGLRenderer({ antialias: true });
    this.rendererNormalTexture.setSize(400, 400); // Tamaño fijo de 400px x 400px
    sectioncanvas.appendChild(this.rendererNormalTexture.domElement);

    this.cameraNormalTexture.position.z = 2;
    const controls = new OrbitControls(this.cameraNormalTexture, this.rendererNormalTexture.domElement);

    // Material del shader con sus propiedades
    const vertexShader = ` 
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform float uStrength;
      uniform float uBias; // Control del sesgo
      uniform float uInvertR; // Control para invertir el canal rojo
      uniform float uInvertG; // Control para invertir el canal verde
      varying vec2 vUv;

      void main() {
        vec3 color = texture2D(uTexture, vUv).rgb;
        float gray = dot(color, vec3(0.299, 0.587, 0.114)); // Convertir a escala de grises

        // Calcular derivadas en el espacio de la textura
        float dx = dFdx(gray);
        float dy = dFdy(gray);

        // Calcular la normal en el espacio de la textura y aplicar inversión de canales
        vec3 normal = normalize(vec3(
          -dx * uStrength * (uInvertR > 0.5 ? -1.0 : 1.0), 
          -dy * uStrength * (uInvertG > 0.5 ? -1.0 : 1.0), 
          1.0 - (uBias / 100.0)
        ));

        // Mapear de [-1,1] a [0,1] para el color
        gl_FragColor = vec4(0.5 * normal + 0.5, 1.0);
      }
    `;

    this.uniformsNormalTexture = {
        uTexture: { value: new THREE.Texture() },
        uStrength: { value: 1.0 },
        uBias: { value: 50.0 },
        uInvertR: { value: 0.0 },
        uInvertG: { value: 0.0 }
    };

    const material = new THREE.ShaderMaterial({
        uniforms: this.uniformsNormalTexture,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, material);
    this.sceneNormalTexture.add(plane);

    // Configuración de la GUI
    const gui = new dat.GUI();//guiContainerNormal
    const guiContainer = document.getElementById('guiContainerNormal');
    guiContainer.appendChild(gui.domElement);

    const params = {
        strength: this.uniformsNormalTexture.uStrength.value,
        bias: this.uniformsNormalTexture.uBias.value,
        invertR: false,
        invertG: false,
        refresh: () => _me.rendererNormalTexture.render(_me.sceneNormalTexture, _me.cameraNormalTexture),
        save: function () {
            _me.rendererNormalTexture.render(_me.sceneNormalTexture, _me.cameraNormalTexture);
            const tempCanvas = document.createElement('canvas');
            const tempContext = tempCanvas.getContext('2d');
            tempCanvas.width = 400;
            tempCanvas.height = 400;
            tempContext.drawImage(_me.rendererNormalTexture.domElement, 0, 0, 400, 400);
            const dataURL = tempCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'normal_texture.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    gui.add(params, 'strength', 0.1, 5.0).step(0.1).name('Normal Strength').onChange(value => {
        _me.uniformsNormalTexture.uStrength.value = value;
    });

    gui.add(params, 'bias', 0, 100).step(1).name('Bias').onChange(value => {
        _me.uniformsNormalTexture.uBias.value = value;
    });

    gui.add(params, 'invertR').name('Invert R').onChange(value => {
        _me.uniformsNormalTexture.uInvertR.value = value ? 1.0 : 0.0;
    });

    gui.add(params, 'invertG').name('Invert G').onChange(value => {
        _me.uniformsNormalTexture.uInvertG.value = value ? 1.0 : 0.0;
    });

    gui.add(params, 'save').name('Download Image');

    // Loop de animación
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        _me.rendererNormalTexture.render(_me.sceneNormalTexture, _me.cameraNormalTexture);
    }
    animate();
}




}


let engine = new Engine();