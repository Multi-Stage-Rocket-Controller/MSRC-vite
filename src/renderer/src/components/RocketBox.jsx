import React, { useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import RedRocket from '../assets/red_rocket.glb'

const RocketBox = ({ width = 300, height = 300, x_cam = 0, y_cam = 0, z_cam = 150, containerRef }) => {
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)

    // Append renderer to the container div
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement)
    }

    // Create a cube for reference
    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial({ color: 0x033ff0 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // Position the camera
    camera.position.set(x_cam, y_cam, z_cam)
    camera.lookAt(0, 0, 0) // Ensure the camera is always looking at the center of the scene

    let rocketModel
    const loader = new GLTFLoader()
    loader.load(
      RedRocket,
      (gltf) => {
        const model = gltf.scene
        rocketModel = model // Store the rocket model for later access

        // Adjust scale and position
        model.scale.set(5, 5, 5) // Scale up the model
        model.position.set(0, 0, 0) // Ensure it's centered

        // Apply MeshBasicMaterial to all child meshes
        model.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ color: 0xffffff })
          }
        })

        // Bounding box helper to check model's bounds
        const bboxHelper = new THREE.BoxHelper(model, 0xff0000)
        scene.add(bboxHelper)

        console.log('Model bounding box:', bboxHelper)

        scene.add(model)
      },
      undefined,
      (error) => {
        console.error('Error loading GLTF model:', error)
      }
    )

    // Handle resizing of the renderer
    const resizeRenderer = () => {
      renderer.setSize(width, height)
      camera.aspect = width / height
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
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      window.removeEventListener('resize', resizeRenderer)
    }
  }, [width, height, x_cam, y_cam, z_cam, containerRef])

  return null
}

export default RocketBox