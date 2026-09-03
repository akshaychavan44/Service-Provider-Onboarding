import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ProgressOrb3D({
  percentage = 0,
  status = 'Draft',
  size = 180,
  className = '',
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 4.8;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Determine colors based on percentage & status
    let primaryColor = 0x6366f1; // Indigo
    let glowColor = 0xa5b4fc;
    if (status === 'Approved' || percentage >= 90) {
      primaryColor = 0x10b981; // Emerald
      glowColor = 0x6ee7b7;
    } else if (status === 'Rejected') {
      primaryColor = 0xf43f5e; // Rose
      glowColor = 0xfda4af;
    } else if (percentage >= 50) {
      primaryColor = 0x0ea5e9; // Cyan
      glowColor = 0x7dd3fc;
    }

    // Central Morphing Core
    const coreGeo = new THREE.DodecahedronGeometry(1.2, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: 0.2,
      metalness: 0.7,
      wireframe: false,
      flatShading: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Outer wireframe shell
    const shellGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const shellMat = new THREE.MeshBasicMaterial({
      color: glowColor,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    group.add(shell);

    // Dynamic Ring reflecting completion ratio
    const ringGeo = new THREE.TorusGeometry(1.9, 0.04, 16, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.75,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    group.add(ring);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(3, 4, 5);
    scene.add(dirLight);

    // Animation
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      const speedFactor = 0.5 + (percentage / 100) * 1.5;

      core.rotation.y = elapsed * 0.4 * speedFactor;
      core.rotation.x = elapsed * 0.3 * speedFactor;

      shell.rotation.y = -elapsed * 0.25 * speedFactor;
      shell.rotation.z = elapsed * 0.2;

      ring.rotation.z = elapsed * 0.6 * speedFactor;

      // Pulse
      const scale = 1 + Math.sin(elapsed * 2) * 0.05;
      core.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      shellGeo.dispose();
      shellMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [percentage, status, size]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
    />
  );
}
