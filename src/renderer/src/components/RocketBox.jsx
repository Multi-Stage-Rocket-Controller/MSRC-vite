// RocketBox.jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import RedRocket from '../assets/red_rocket.glb'

const RocketBox = ({
  width = 300,
  height = 300,
  roll = 0,
  pitch = 0,
  yaw = 0,
  currentCamera = 'xy', // Added prop
}) => {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const camerasRef = useRef({})
  const rocketRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    console.log('RocketBox Camera:', { currentCamera })
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
    const aspect = width / height
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

      if (currentCamera && camerasRef.current[currentCamera]) {
        renderer.setViewport(0, 0, width, height)
        renderer.setScissor(0, 0, width, height)
        renderer.setScissorTest(true)
        renderer.render(scene, camerasRef.current[currentCamera])
      }
    }
    animate()

    // Handle Window Resize
    const handleResize = () => {
      const newWidth = containerRef.current.clientWidth
      const newHeight = containerRef.current.clientHeight
      renderer.setSize(newWidth, newHeight)

      const newAspect = newWidth / newHeight
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
  }, [width, height, currentCamera])

  useEffect(() => {
    // console.log('Updating Rocket Rotation:', { roll, pitch, yaw })
    if (rocketRef.current) {
      rocketRef.current.rotation.set(roll, pitch, yaw)
    }
  }, [roll, pitch, yaw])

  return <div ref={containerRef} style={{ width, height, display: 'block', position: 'relative' }} />
}

export default RocketBox