/**
 * HYPER-REALISTIC VEGETATION ENGINE
 * Main 3D Preview Component - Now wired to ProVegLayoutContext
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { generateHyperTree, updateHyperTreeWind, HyperTreeResult } from '@/lib/hyperTree';
import type { HyperTreeParams } from '@/types/hyperParams';

export default function HyperTree3DPreview({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const treeMeshRef = useRef<THREE.Mesh | null>(null);
  const treeResultRef = useRef<HyperTreeResult | null>(null);
  const frameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  const [containerReady, setContainerReady] = useState(false);
  const [stats, setStats] = useState({ verts: 0, tris: 0, branches: 0, leaves: 0 });
  const [webglError, setWebglError] = useState<string | null>(null);

  // Read from context
  const { treeParams, seed, isPlaying } = useProVegLayout();
  const vp = treeParams.viewport;
  
  // Container resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerReady(true);
          if (rendererRef.current && cameraRef.current) {
            rendererRef.current.setSize(width, height);
            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
          }
        }
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  
  // Three.js setup
  useEffect(() => {
    if (!containerReady || !containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(vp.backgroundColor);
    if (vp.fogEnabled) scene.fog = new THREE.Fog(vp.fogColor, vp.fogNear, vp.fogFar);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 4, 0);
    cameraRef.current = camera;
    
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); }
    catch { setWebglError('WebGL not available'); return; }
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = vp.enableShadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = vp.exposure;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 4, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.update();
    controlsRef.current = controls;
    
    // Lighting
    scene.add(new THREE.AmbientLight(vp.ambientColor, vp.ambientIntensity));
    const mainLight = new THREE.DirectionalLight(vp.mainLightColor, vp.mainLightIntensity);
    mainLight.position.set(...vp.mainLightPosition);
    mainLight.castShadow = vp.enableShadows;
    mainLight.shadow.mapSize.set(vp.shadowMapSize, vp.shadowMapSize);
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -5;
    scene.add(mainLight);
    scene.add(new THREE.DirectionalLight(vp.fillLightColor, vp.fillLightIntensity));
    scene.add(new THREE.HemisphereLight(vp.hemiSkyColor, vp.hemiGroundColor, vp.hemiIntensity));
    
    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: '#2a3a1e', roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const grid = new THREE.GridHelper(50, 50, 0x333344, 0x222233);
    grid.position.y = 0.01;
    scene.add(grid);
    
    lastTimeRef.current = performance.now() * 0.001;
    function animate() {
      frameIdRef.current = requestAnimationFrame(animate);
      const now = performance.now() * 0.001;
      const dt = Math.min(0.05, now - lastTimeRef.current);
      lastTimeRef.current = now;
      controls.update();
      if (treeResultRef.current && treeMeshRef.current) {
        updateHyperTreeWind(treeResultRef.current, treeResultRef.current._params, dt);
        const posAttr = treeMeshRef.current.geometry.getAttribute('position');
        (posAttr.array as Float32Array).set(treeResultRef.current.positions);
        posAttr.needsUpdate = true;
        treeMeshRef.current.geometry.computeVertexNormals();
      }
      renderer.render(scene, camera);
    }
    animate();
    
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [containerReady]);
  
  // Generate tree when params or seed change
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    if (treeMeshRef.current) {
      scene.remove(treeMeshRef.current);
      treeMeshRef.current.geometry.dispose();
      (treeMeshRef.current.material as THREE.Material).dispose();
    }
    
    const result = generateHyperTree(treeParams, seed);
    (result as any)._params = treeParams; // stash for wind updates
    treeResultRef.current = result;
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(result.positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(result.normals, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(result.colors, 3));
    geometry.setIndex(new THREE.BufferAttribute(result.indices, 1));
    geometry.computeBoundingSphere();
    
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.8, metalness: 0, side: THREE.DoubleSide,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    treeMeshRef.current = mesh;
    
    setStats({
      verts: result.meta.vertexCount,
      tris: result.meta.triangleCount,
      branches: result.meta.branchCount,
      leaves: result.meta.leafCount,
    });
    
    if (controlsRef.current) controlsRef.current.target.set(0, result.meta.height * 0.4, 0);
  }, [treeParams, seed]);
  
  if (webglError) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-background ${className}`}>
        <div className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">3D Preview Unavailable</h3>
          <p className="text-sm text-muted-foreground">{webglError}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="absolute inset-0 bg-background" />
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur rounded-lg px-3 py-2">
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-primary">{stats.verts.toLocaleString()}</span> verts
          <span className="text-primary">{stats.tris.toLocaleString()}</span> tris
          <span className="text-primary">{stats.branches}</span> branches
          <span className="text-primary">{stats.leaves}</span> leaves
        </div>
      </div>
      {isPlaying && (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-mono text-primary">
          <span>🌬️ WIND</span>
        </div>
      )}
    </div>
  );
}
