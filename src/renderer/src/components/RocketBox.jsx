import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const style = {
  border: "2px solid green",
  borderRadius: "10px",
  width: "200px",
  height: "240px",
  display: "inline-grid",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Orbitron, sans-serif",
  backgroundColor: "#375237",
};

const TitleStyle = {
  color: "white",
  fontFamily: "Orbitron, sans-serif",
  margin: "0",
};

const RocketBox = ({ label, cameraPosition }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const rocketRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;

    // Create a camera for this RocketBox
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(...cameraPosition);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(150, 150);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const light = new THREE.AmbientLight(0x404040);
    scene.add(light);

    // Request the GLB model from the main process
    window.electronAPI.loadModel('./../../dist/assets/models/red_rocket.glb').then((modelData) => {
      if (modelData) {
        const blob = new Blob([Buffer.from(modelData, 'base64')], { type: 'model/gltf-binary' });
        const url = URL.createObjectURL(blob);

        const loader = new GLTFLoader();
        loader.load(
          url,
          (gltf) => {
            const rocket = gltf.scene;
            rocketRef.current = rocket;
            rocket.position.set(0, 0, 0); // Adjust the model's position if needed
            scene.add(rocket); // Add the model to the scene
          },
          undefined,
          (error) => {
            console.error("Error loading GLB model:", error);
          }
        );
      }
    });

    const animate = () => {
      requestAnimationFrame(animate);
      
      if (rocketRef.current) {
        rocketRef.current.rotation.x += 0.001;
        rocketRef.current.rotation.y += 0.001;
      }

      renderer.render(scene, camera);
    };

    animate();
    return () => {
      if (renderer && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [cameraPosition]);

  return (
    <div style={style}>
      <p style={TitleStyle}>{label}</p>
      <div ref={mountRef} />
    </div>
  );
};

export default RocketBox;