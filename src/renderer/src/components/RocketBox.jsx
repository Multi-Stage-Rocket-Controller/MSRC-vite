import React, { useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import RedRocket from '../assets/red_rocket.glb'

const RocketBox = ({
  width = 300,
  height = 300,
  x_cam = 0,
  y_cam = 0,
  z_cam = 150,
  roll = 0,
  pitch = 0,
  yaw = 0,
  data = [],
  current = 0,
  containerRef
}) => {
  useEffect(() => {
    const totalYaw = data.map((data) => data.Yaw_Radians)
    const totalPitch = data.map((data) => data.Pitch_Radians)
    const totalRoll = data.map((data) => data.Roll_Radians)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)

    // Append renderer to the container div
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement)
    }

    // Lighting - need all for full illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 10)
    scene.add(ambientLight)
    const strongLight = new THREE.DirectionalLight(0xffffff, 5)
    strongLight.position.set(0, 100, 100).normalize()
    scene.add(strongLight)
    const strongLight2 = new THREE.DirectionalLight(0xffffff, 5)
    strongLight2.position.set(100, 0, 100).normalize()
    scene.add(strongLight2)
    const strongLight3 = new THREE.DirectionalLight(0xffffff, 5)
    strongLight3.position.set(100, 100, 0).normalize()
    scene.add(strongLight3)
    const strongLight4 = new THREE.DirectionalLight(0xffffff, 5)
    strongLight4.position.set(0, 100, 0).normalize()
    scene.add(strongLight4)

    // Create planes -- helper function
    // const createPlane = (color, position, rotation) => {
    //   const planeGeometry = new THREE.PlaneGeometry(200, 200) // Adjust size as needed
    //   const planeMaterial = new THREE.MeshBasicMaterial({
    //     color: color,
    //     side: THREE.DoubleSide,
    //     transparent: true,
    //     opacity: 0.5
    //   }) // Make planes transparent
    //   const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    //   plane.position.set(...position)
    //   plane.rotation.set(...rotation)
    //   scene.add(plane)
    // }
    // createPlane(0xff0000, [0, 0, 0], [Math.PI / 2, 0, 0]) // Red plane (X-Y)
    // createPlane(0x00ff00, [0, 0, 0], [0, 0, 0]) // Green plane (Y-Z)
    // createPlane(0xffff00, [0, 0, 0], [0, Math.PI / 2, 0]) // Yellow plane (X-Z)

    // Position the camera
    camera.position.set(x_cam, y_cam, z_cam)
    camera.lookAt(0, 0, 0) // Ensure the camera is always looking at the center of the scene

    let rocketModel
    const loader = new GLTFLoader()
    loader.load(
      RedRocket,
      (gltf) => {
        const model = gltf.scene
        rocketModel = model

        // Adjust scale and position
        model.scale.set(5, 5, 5)
        // Center the model
        const bbox2 = new THREE.Box3().setFromObject(model)
        const center = bbox2.getCenter(new THREE.Vector3())
        model.position.set(-center.x, -center.y, -center.z)

        // Apply initial rotation using props
        model.rotation.x = totalPitch[current]; // Pitch rotation
        model.rotation.y = totalYaw[current];   // Yaw rotation
        model.rotation.z = totalRoll[current];   // Roll rotation

        // Apply MeshBasicMaterial to all child meshes
        model.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ color: 0xffffff })
          }
        })

        // Bounding Box - Helper
        // const bbox = new THREE.Box3().setFromObject(model)
        // const bboxHelper = new THREE.BoxHelper(model, 0xff0000)
        // scene.add(bboxHelper)
        // console.log('Model bounding box:', bbox)

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

    const animate = () => {
      requestAnimationFrame(animate)

      // Slowly rotate the rocket model along the x-axis if it's loaded
      // if (rocketModel) {
      //   rocketModel.rotation.y += 0.001
      // }
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
  }, [width, height, x_cam, y_cam, z_cam, roll, pitch, yaw,, current, containerRef])

  return null
}

export default RocketBox
