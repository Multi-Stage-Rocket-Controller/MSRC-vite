import React, { useEffect } from 'react';
import * as THREE from 'three';

const CubeRenderer = () => {
  useEffect(() => {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Aspect ratio 1 to start as square
    const renderer = new THREE.WebGLRenderer();
    document.body.appendChild(renderer.domElement);

    // Create a geometry and a basic material and combine them into a mesh
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    // Function to resize the canvas to always be a square
    const resizeRenderer = () => {
      const size = Math.min(window.innerWidth, window.innerHeight); // Get the smaller of width/height
      renderer.setSize(size, size);
      camera.aspect = 1; // Always keep the camera aspect ratio square
      camera.updateProjectionMatrix();
    };

    // Initial resize on load
    resizeRenderer();

    // Add window resize listener
    window.addEventListener('resize', resizeRenderer);

    // Animation loop
    const animate = function () {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Clean up on component unmount
    return () => {
      renderer.dispose();
      document.body.removeChild(renderer.domElement);
      window.removeEventListener('resize', resizeRenderer);
    };
  }, []);

  return null;
};

export default CubeRenderer;