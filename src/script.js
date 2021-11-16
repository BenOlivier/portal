import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Vector3 } from 'three'


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// GUI
const gui = new dat.GUI({ width: 400 })
const controlsFolder = gui.addFolder(`Controls`)
const objectsFolder = gui.addFolder(`Objects`)
const lightingFolder = gui.addFolder(`Lighting`)
const postProcessingFolder = gui.addFolder(`Post Processing`)
gui.close()

/**
 * Update all materials
 */
 const updateAllMaterials = () =>
 {
     scene.traverse((child) =>
     {
         if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
         {
             child.material.envMapIntensity = 2.5
             child.material.needsUpdate = true
             child.castShadow = true
             child.receiveShadow = true
         }
     })
 }





// objectsFolder.addColor(params, 'frameColor').onChange(() => {
//     frameMat.color.set(params.frameColor) })
// objectsFolder.addColor(params, 'lightsEmissionColor').onChange(() => {
//     lightsMat.color.set(params.lightsEmissionColor) })

/**
 * Textures
 */
 const textureLoader = new THREE.TextureLoader()
 const floorShadowTexture = textureLoader.load('/textures/FloorShadow.png')
 const floorAlphaTexture = textureLoader.load('/textures/FloorAlpha.jpg')

/**
* OBJECTS
*///////////////////////////////////////////////////////////////////////////////////

const objectParams =
{
    floorColor: 0x121212,
    floorScale: 10,
    frameColor: 0x121212,
    lightsEmissionColor: 0xa8beff,
    lightsEmissionIntensity: 1
}

// Materials
const frameMat = new THREE.MeshStandardMaterial({
    color: 0xffffff
})
const lightsMat = new THREE.MeshStandardMaterial({
    color: 0xa8beff,
    emissiveIntensity: 1
} )

objectsFolder.addColor(objectParams, 'lightsEmissionColor').onChange(() =>
{
    lightsMat.color.set(objectParams.lightsEmissionColor)
})


const floorMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    map: floorShadowTexture,
    transparent: true,
    alphaMap: floorAlphaTexture
} )
objectsFolder.addColor(objectParams, 'floorColor').onChange(() =>
{
    floorMat.color.set(objectParams.floorColor)
})

const cube = new THREE.Group()
const gltfLoader = new GLTFLoader()
gltfLoader.load(
    '/models/Cube.glb',
    (gltf) =>
    {
        // Frame
        let frame = gltf.scene.children[5]
        const frameMat = new THREE.MeshStandardMaterial( {
            color: objectParams.frameColor
        } )
        frame.traverse((o) => { if (o.isMesh) o.material = frameMat })

        // Windows
        let windows = gltf.scene.children[4]
        windows.rotation.set(frame.rotation.x, frame.rotation.y, frame.rotation.z)
        const windowMat = new THREE.MeshPhysicalMaterial( {
            metalness: .9,
            roughness: .2,
            envMapIntensity: 0.9,
            clearcoat: 1,
            transparent: true,
            //transmission: .95,
            opacity: 0.2,
            reflectivity: .2,
            refractionRatio: 0.1,
            ior: 1,
            // side: THREE.BackSide
        } )
        windows.traverse((o) => { if (o.isMesh) o.material = windowMat })

        // Backgrounds
        let backgrounds = gltf.scene.children[0]
        backgrounds.rotation.set(frame.rotation.x, frame.rotation.y, frame.rotation.z)

        // Lights
        let lights = gltf.scene.children[1]
        lights.rotation.set(frame.rotation.x, frame.rotation.y, frame.rotation.z)
        lights.traverse((o) => { if (o.isMesh) o.material = lightsMat })

        // Objects
        let objects = gltf.scene.children[3]

        // Floor
        let floor = gltf.scene.children[6]
        floor.traverse((o) => { if (o.isMesh) o.material = floorMat })
        
        // Cube
        cube.add(frame, windows, backgrounds, lights, objects, floor)
        cube.position.y = 0.7
        cube.rotation.y = Math.PI / 6
        cube.scale.set(0.5, 0.5, 0.5)
        scene.add(cube)

        updateAllMaterials()
    }
)



/**
 * Lights
 */
// Parameters
const lightParams =
{
    directionalLight1Color: 0xffffff,
    directionalLight2Color: 0xffffff
}

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
lightingFolder.add(ambientLight, 'intensity').min(0).max(5).step(0.001).name('Ambient Intensity')
scene.add(ambientLight)

// Directional light1
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1)
directionalLight1.position.set(-2, 2, 0)
lightingFolder.addColor(lightParams, 'directionalLight1Color').onChange(() =>{
    directionalLight1.color.set(lightParams.directionalLight1Color)
}).name('Directional 1 Color')

lightingFolder.add(directionalLight1, 'intensity').min(0).max(5).step(0.001).name('Directional 1 Intensity')
scene.add(directionalLight1)

// Directional light1
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1)
directionalLight2.position.set(2, 2, 0)
lightingFolder.addColor(lightParams, 'directionalLight2Color').onChange(() =>{
    directionalLight2.color.set(lightParams.directionalLight2Color)
}).name('Directional 2 Color')
lightingFolder.add(directionalLight2, 'intensity').min(0).max(5).step(0.001).name('Directional 2 Intensity')
scene.add(directionalLight2)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * CAMERA + CONTROLS
 *//////////////////////////////////////////////////////////////////////////////////

const cameraPerams =
{
    cameraDistance: 10,
    cameraRotateSpeed: 0.1
}


// Camera
const camera = new THREE.PerspectiveCamera(30, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 1, -7)
camera.lookAt(cube.position)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true
controls.autoRotate = true;
controls.autoRotateSpeed = -1
controls.minDistance = 3
controls.maxDistance = 10
controls.minPolarAngle = 0
controls.maxPolarAngle = 2.5


// Fullscreen
window.addEventListener('dblclick', () =>
{
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
    if(!fullscreenElement)
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
        else if(canvas.webkitRequestFullscreen)
        {
            canvas.webkitRequestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        else if(document.webkitExitFullscreen)
        {
            document.webkitExitFullscreen()
        }
    }
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Post Processing
 */
 
const ppParams = {
    exposure: 1,
    bloomStrength: 0.6,
    bloomThreshold: 0.5,
    bloomRadius: 0
};

const effectComposer = new EffectComposer(renderer)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)

const renderScene = new RenderPass(scene, camera)
effectComposer.addPass(renderScene)

const bloomPass = new UnrealBloomPass()
bloomPass.threshold = 0.5;
bloomPass.strength = 0.6;
bloomPass.radius = ppParams.bloomRadius;

effectComposer.addPass(bloomPass)


// Post Processing GUI
postProcessingFolder.add( ppParams, 'exposure', 0.1, 2 ).onChange( function ( value ) 
{
    renderer.toneMappingExposure = Math.pow( value, 4.0 );
} );

postProcessingFolder.add( ppParams, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) 
{
    bloomPass.threshold = Number( value );
} );

postProcessingFolder.add( ppParams, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) 
{
    bloomPass.strength = Number( value );
} );

postProcessingFolder.add( ppParams, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) 
{
    bloomPass.radius = Number( value );
} );


/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update Animation Mixer
    // if(mixer !== null)
    // {
    //     mixer.update(deltaTime)
    // }
    
    // Update controls
    controls.update()

    // Render
    //renderer.render(scene, camera)
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()