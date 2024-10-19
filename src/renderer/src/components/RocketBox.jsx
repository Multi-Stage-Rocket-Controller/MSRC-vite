import React, { useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import RedRocket from '../assets/red_rocket.glb'

const RocketBox = ({ size }) => {
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // Add lighting for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5) // Softer ambient light
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1) // Strong directional light
    directionalLight.position.set(0, 100, 100).normalize() // Set light direction
    scene.add(directionalLight)

    // Create a cube for reference
    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial({ color: 0x033ff0 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // Adjust camera distance for better viewing
    camera.position.set(0, 40, 150) // Move camera further back to see more

    let rocketModel // To reference the rocket model

    // Load the GLTF model
    const loader = new GLTFLoader()
    loader.load(
      RedRocket,
      (gltf) => {
        const model = gltf.scene
        rocketModel = model // Store the rocket model for later access

        // Adjust scale and position
        model.scale.set(5, 5, 5) // Scale up the model
        model.position.set(0, 0, 0) // Ensure it's centered

        // Optional: Bounding box helper to check model's bounds
        const bbox = new THREE.Box3().setFromObject(model)
        const bboxHelper = new THREE.BoxHelper(model, 0xff0000)
        scene.add(bboxHelper)

        console.log('Model bounding box:', bbox)

        scene.add(model)
      },
      undefined,
      (error) => {
        console.error('Error loading GLTF model:', error)
      }
    )

    // Handle resizing of the renderer
    const resizeRenderer = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }

    resizeRenderer()
    window.addEventListener('resize', resizeRenderer)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Slowly rotate the rocket model along the x-axis if it's loaded
      if (rocketModel) {
        rocketModel.rotation.x += 0.01 // Adjust speed here as needed
      }

      cube.rotation.x += 0.01
      cube.rotation.y += 0.01

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      renderer.dispose()
      document.body.removeChild(renderer.domElement)
      window.removeEventListener('resize', resizeRenderer)
    }
  }, [size])

  return null
}

export default RocketBox
