/**
 * HYPER-REALISTIC VEGETATION ENGINE
 * Main 3D Preview Component
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { 
  generateHyperTree, updateHyperTreeWind, HyperTreeResult 
} from '@/lib/hyperTree';
import type { HyperTreeParams } from '@/types/hyperParams';
import { DEFAULT_HYPER_TREE_PARAMS, applySpeciesPreset } from '@/types/hyperParams';

interface HyperTree3DPreviewProps {
  params?: Partial<HyperTreeParams>;
  seed?: number;
  isPlaying?: boolean;
  className?: string;
}

export default function HyperTree3DPreview({
  params: propsParams,
  seed: propsSeed = 1337,
  isPlaying: propsIsPlaying = true,
  className = '',
}: HyperTree3DPreviewProps) {
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
  
  // Merge params with defaults
  const fullParams: HyperTreeParams = {
    ...DEFAULT_HYPER_TREE_PARAMS,
    ...propsParams,
  };
  
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
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(fullParams.viewport.backgroundColor);
    if (fullParams.viewport.fogEnabled) {
      scene.fog = new THREE.Fog(
        fullParams.viewport.fogColor,
        fullParams.viewport.fogNear,
        fullParams.viewport.fogFar
      );
    }
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 4, 0);
    cameraRef.current = camera;
    
    // Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch (e) {
      setWebglError('WebGL not available');
      return;
    }
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = fullParams.viewport.enableShadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = fullParams.viewport.exposure;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 4, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.update();
    controlsRef.current = controls;
    
    // Lighting
    scene.add(new THREE.AmbientLight(fullParams.viewport.ambientColor, fullParams.viewport.ambientIntensity));
    
    const mainLight = new THREE.DirectionalLight(fullParams.viewport.mainLightColor, fullParams.viewport.mainLightIntensity);
    mainLight.position.set(...fullParams.viewport.mainLightPosition);
    mainLight.castShadow = fullParams.viewport.enableShadows;
    mainLight.shadow.mapSize.set(2048, 2048);
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -5;
    scene.add(mainLight);
    
    scene.add(new THREE.DirectionalLight(fullParams.viewport.fillLightColor, fullParams.viewport.fillLightIntensity));
    scene.add(new THREE.HemisphereLight(fullParams.viewport.hemiSkyColor, fullParams.viewport.hemiGroundColor, fullParams.viewport.hemiIntensity));
    
    // Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ color: '#2a3a1e', roughness: 0.95 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Grid
    const grid = new THREE.GridHelper(50, 50, 0x333344, 0x222233);
    grid.position.y = 0.01;
    scene.add(grid);
    
    // Animation loop
    lastTimeRef.current = performance.now() * 0.001;
    
    function animate() {
      frameIdRef.current = requestAnimationFrame(animate);
      
      const now = performance.now() * 0.001;
      const dt = Math.min(0.05, now - lastTimeRef.current);
      lastTimeRef.current = now;
      
      controls.update();
      
      // Wind animation
      if (propsIsPlaying && treeResultRef.current && treeMeshRef.current) {
        updateHyperTreeWind(treeResultRef.current, fullParams, dt);
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
  
  // Generate tree
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    
    // Remove old tree
    if (treeMeshRef.current) {
      scene.remove(treeMeshRef.current);
      treeMeshRef.current.geometry.dispose();
      (treeMeshRef.current.material as THREE.Material).dispose();
    }
    
    // Generate new tree
    const result = generateHyperTree(fullParams, propsSeed);
    treeResultRef.current = result;
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(result.positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(result.normals, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(result.colors, 3));
    geometry.setIndex(new THREE.BufferAttribute(result.indices, 1));
    geometry.computeBoundingSphere();
    
    // Material
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.8,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    treeMeshRef.current = mesh;
    
    // Update stats
    setStats({
      verts: result.meta.vertexCount,
      tris: result.meta.triangleCount,
      branches: result.meta.branchCount,
      leaves: result.meta.leafCount,
    });
    
    // Update camera target
    if (controlsRef.current) {
      controlsRef.current.target.set(0, result.meta.height * 0.4, 0);
    }
  }, [fullParams, propsSeed]);
  
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
      
      {propsIsPlaying && (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-mono text-primary">
          <span>🌬️ WIND</span>
        </div>
      )}
    </div>
  );
}
