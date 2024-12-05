// RocketBox.jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import RedRocket from '../assets/red_rocket.glb'

const RocketBox = ({
  height = 480,
  width = 420,
  roll = 0,
  pitch = 0,
  yaw = 0,
  currentCamera = 'xy',
}) => {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const camerasRef = useRef({})
  const pivotRef = useRef(null) 
  const animationRef = useRef(null)
  const currentCameraRef = useRef(currentCamera)

  // Update the currentCamera ref whenever it changes
  useEffect(() => {
    currentCameraRef.current = currentCamera
  }, [currentCamera])

  // Initialize Scene, Renderer, and Cameras once
  useEffect(() => {
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer
    containerRef.current.appendChild(renderer.domElement)

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

    // Create Pivot
    const pivot = new THREE.Object3D()
    scene.add(pivot)
    pivotRef.current = pivot

    // Load Rocket Model
    const loader = new GLTFLoader()
    loader.load(
      RedRocket,
      gltf => {
        const model = gltf.scene
        pivot.add(model) // Add model to pivot
        model.scale.set(7,7,7)

        // Model centering
        const bbox = new THREE.Box3().setFromObject(model)
        const center = bbox.getCenter(new THREE.Vector3())
        model.position.sub(center)
      },
      undefined,
      error => console.error('Error loading model:', error)
    )

    // Render Function
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      renderer.clear()

      const cam = currentCameraRef.current
      if (cam && camerasRef.current[cam]) {
        renderer.setViewport(0, 0, width, height)
        renderer.setScissor(0, 0, width, height)
        renderer.setScissorTest(true)
        renderer.render(scene, camerasRef.current[cam])
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
  }, [width, height])

  // Handle Rotation
  useEffect(() => {
    if (pivotRef.current) {
      pivotRef.current.rotation.set(roll, pitch, yaw)
      // pivotRef.current.rotation.set(appliedRoll, appliedPitch, appliedYaw)
      // console.log(`Current Camera: ${currentCamera}, Roll: ${appliedRoll}, Pitch: ${appliedPitch}, Yaw: ${appliedYaw}`)
    }
  }, [roll, pitch, yaw, currentCamera])

  return <div ref={containerRef} style={{ width, height, display: 'block', position: 'relative' }} />
}

export default RocketBox