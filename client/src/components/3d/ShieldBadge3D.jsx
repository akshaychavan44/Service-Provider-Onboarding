import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ShieldBadge3D({
  status = 'Approved',
  size = 140,
  className = '',
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 4.6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Dynamic colors based on verification status
    let hexColor = 0x10b981; // Emerald
    let specColor = 0x6ee7b7;
    if (status === 'Rejected') {
      hexColor = 0xf43f5e; // Rose
      specColor = 0xfecdd3;
    } else if (status === 'Draft') {
      hexColor = 0x64748b; // Slate
      specColor = 0xcbd5e1;
    } else if (status === 'Submitted' || status === 'Under Review') {
      hexColor = 0xf59e0b; // Amber
      specColor = 0xfde68a;
    }

    // 3D Faceted Diamond Shield
    const shieldGeo = new THREE.OctahedronGeometry(1.3, 0);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: hexColor,
      roughness: 0.15,
      metalness: 0.85,
      flatShading: true,
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.scale.set(1, 1.3, 0.7);
    group.add(shield);

    // Orbiting Golden Halo Ring
    const haloGeo = new THREE.TorusGeometry(1.7, 0.035, 16, 60);
    const haloMat = new THREE.MeshBasicMaterial({
      color: specColor,
      transparent: true,
      opacity: 0.7,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 3;
    group.add(halo);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2.5, 30);
    pointLight.position.set(4, 5, 4);
    scene.add(pointLight);

    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      shield.rotation.y = elapsed * 0.7;
      halo.rotation.z = elapsed * 0.9;
      halo.rotation.y = Math.sin(elapsed * 0.5) * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      shieldGeo.dispose();
      shieldMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      renderer.dispose();
    };
  }, [status, size]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
    />
  );
}
