import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import RedRocket from '../assets/red_rocket.glb'

const RocketBox = ({
  width = 900,
  height = 300,
  roll,
  pitch,
  yaw,
  initialOrientation = { x: 0, y: 0, z: 0 },
  orientationQueue = [], // Array of target orientations
}) => {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const camerasRef = useRef({})
  const rocketRef = useRef(null)
  const animationRef = useRef(null)
  const currentOrientation = useRef(initialOrientation)
  const targetOrientations = useRef([...orientationQueue])

  useEffect(() => {
    console.log("ROCKETBOX Current Roll: ", roll, "Current Pitch: ", pitch, "Current Yaw: ", yaw);
    // Initialize Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Initialize Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer
    containerRef.current.appendChild(renderer.domElement)

    // Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    const directionalLights = [
      { position: [0, 100, 100], intensity: 5 },
      { position: [100, 0, 100], intensity: 5 },
      { position: [100, 100, 0], intensity: 5 },
      { position: [0, 100, 0], intensity: 5 },
    ]

    directionalLights.forEach(lightInfo => {
      const light = new THREE.DirectionalLight(0xffffff, lightInfo.intensity)
      light.position.set(...lightInfo.position).normalize()
      scene.add(light)
    })

    // Initialize Cameras
    const aspect = (width / 3) / height
    camerasRef.current.xy = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000)
    camerasRef.current.xy.position.set(0, 0, 150)
    camerasRef.current.xy.lookAt(0, 0, 0)

    camerasRef.current.yz = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000)
    camerasRef.current.yz.position.set(150, 0, 0)
    camerasRef.current.yz.lookAt(0, 0, 0)

    camerasRef.current.xz = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000)
    camerasRef.current.xz.position.set(0, 150, 0)
    camerasRef.current.xz.lookAt(0, 0, 0)

    // Load Rocket Model
    const loader = new GLTFLoader()
    loader.load(
      RedRocket,
      gltf => {
        const model = gltf.scene
        rocketRef.current = model
        model.scale.set(5, 5, 5)
        model.rotation.set(initialOrientation.x, initialOrientation.y, initialOrientation.z)

        // Center the model
        const bbox = new THREE.Box3().setFromObject(model)
        const center = bbox.getCenter(new THREE.Vector3())
        model.position.sub(center)

        scene.add(model)
      },
      undefined,
      error => console.error('Error loading model:', error)
    )

    // Render Function
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      renderer.clear()

      const viewports = [
        { x: 0, y: 0, width: width / 3, height },
        { x: width / 3, y: 0, width: width / 3, height },
        { x: (2 * width) / 3, y: 0, width: width / 3, height },
      ]

      const cameraKeys = ['xy', 'yz', 'xz']

      viewports.forEach((vp, index) => {
        renderer.setViewport(vp.x, vp.y, vp.width, vp.height)
        renderer.setScissor(vp.x, vp.y, vp.width, vp.height)
        renderer.setScissorTest(true)
        renderer.render(scene, camerasRef.current[cameraKeys[index]])
      })

      updateAnimation()
    }
    animate()

    // Handle Window Resize
    const handleResize = () => {
      const newWidth = containerRef.current.clientWidth
      const newHeight = containerRef.current.clientHeight
      renderer.setSize(newWidth, newHeight)

      const newAspect = (newWidth / 3) / newHeight
      Object.values(camerasRef.current).forEach(camera => {
        camera.aspect = newAspect
        camera.updateProjectionMatrix()
      })
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [width, height, initialOrientation])

  useEffect(() => {
    targetOrientations.current.push(...orientationQueue)
  }, [orientationQueue])

  const updateAnimation = () => {
    if (!rocketRef.current || targetOrientations.current.length === 0) return

    const target = targetOrientations.current[0]
    const speed = 0.02

    // Interpolate rotation
    currentOrientation.current.x += (target.x - currentOrientation.current.x) * speed
    currentOrientation.current.y += (target.y - currentOrientation.current.y) * speed
    currentOrientation.current.z += (target.z - currentOrientation.current.z) * speed

    rocketRef.current.rotation.set(
      currentOrientation.current.x,
      currentOrientation.current.y,
      currentOrientation.current.z
    )

    // Check if rotation is close to target
    if (
      Math.abs(target.x - currentOrientation.current.x) < 0.01 &&
      Math.abs(target.y - currentOrientation.current.y) < 0.01 &&
      Math.abs(target.z - currentOrientation.current.z) < 0.01
    ) {
      targetOrientations.current.shift()
    }
  }

  return <div ref={containerRef} style={{ width, height, display: 'block' }} />
}

export default RocketBox