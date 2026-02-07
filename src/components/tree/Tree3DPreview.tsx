/**
 * CODEX5.3TREES - Tree 3D Preview Component
 * 
 * Three.js viewport with procedural tree rendering, wind animation,
 * and LOD management. Central viewport for the ProVeg Studio.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { generateTreeGeometry, type TreeGeometryResult } from '@/lib/treeGenerator';
import type { TreeParams, LODLevel } from '@/types/treeParams';
import { getPN, getPB, getPS } from '@/types/treeParams';

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface Tree3DPreviewProps {
  params?: TreeParams;
  seed?: number;
  isPlaying?: boolean;
  groundLayer?: 'simple' | 'quick-grass';
  className?: string;
  showOverlay?: boolean;
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function Tree3DPreview({
  params: propsParams,
  seed: propsSeed,
  isPlaying: propsIsPlaying,
  groundLayer: propsGroundLayer,
  className = '',
  showOverlay = true,
}: Tree3DPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const treeMeshRef = useRef<THREE.Mesh | null>(null);
  const groundMeshRef = useRef<THREE.Mesh | null>(null);
  const frameIdRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const geometryResultRef = useRef<TreeGeometryResult | null>(null);
  
  const [containerReady, setContainerReady] = useState(false);
  const [lodLevel, setLodLevel] = useState<LODLevel>('near');
  const [stats, setStats] = useState({ verts: 0, tris: 0, branches: 0, leaves: 0 });
  
  // Get context values, fallback to props
  const context = useProVegLayout();
  const params = propsParams || context.treeParams;
  const seed = propsSeed ?? context.seed;
  const isPlaying = propsIsPlaying ?? context.isPlaying;
  const groundLayer = propsGroundLayer ?? context.groundLayer;
  const { viewportSettings, windMode, showStats } = context;
  
  // ─── CONTAINER RESIZE OBSERVER ──────────────────────────────────────────
  
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
  
  // ─── THREE.JS SETUP ─────────────────────────────────────────────────────
  
  useEffect(() => {
    if (!containerReady || !containerRef.current) return;
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(viewportSettings.backgroundColor);
    sceneRef.current = scene;
    
    // Fog
    if (viewportSettings.fogEnabled) {
      scene.fog = new THREE.Fog(
        viewportSettings.fogColor,
        viewportSettings.fogNear,
        viewportSettings.fogFar
      );
    }
    
    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 5, 0);
    cameraRef.current = camera;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = viewportSettings.enableShadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = viewportSettings.exposure;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 5, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI * 0.95;
    controls.update();
    controlsRef.current = controls;
    
    // ─── Lighting ─────────────────────────────────────────────────────────
    
    // Ambient
    const ambient = new THREE.AmbientLight(
      viewportSettings.ambientLightColor,
      viewportSettings.ambientLightIntensity
    );
    scene.add(ambient);
    
    // Main directional light (sun)
    const mainLight = new THREE.DirectionalLight(
      viewportSettings.mainLightColor,
      viewportSettings.mainLightIntensity
    );
    mainLight.position.set(
      viewportSettings.mainLightPosition[0],
      viewportSettings.mainLightPosition[1],
      viewportSettings.mainLightPosition[2]
    );
    mainLight.castShadow = viewportSettings.enableShadows;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    mainLight.shadow.bias = -0.0005;
    scene.add(mainLight);
    
    // Fill light
    const fillLight = new THREE.DirectionalLight(
      viewportSettings.fillLightColor,
      viewportSettings.fillLightIntensity
    );
    fillLight.position.set(
      viewportSettings.fillLightPosition[0],
      viewportSettings.fillLightPosition[1],
      viewportSettings.fillLightPosition[2]
    );
    scene.add(fillLight);
    
    // Hemisphere light
    const hemiLight = new THREE.HemisphereLight(
      viewportSettings.hemiSkyColor,
      viewportSettings.hemiGroundColor,
      viewportSettings.hemiIntensity
    );
    scene.add(hemiLight);
    
    // ─── Ground plane ─────────────────────────────────────────────────────
    
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2a1a,
      roughness: 0.9,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
    groundMeshRef.current = ground;
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(50, 50, 0x333344, 0x222233);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
    
    // ─── Animation loop ───────────────────────────────────────────────────
    
    function animate() {
      frameIdRef.current = requestAnimationFrame(animate);
      
      controls.update();
      
      // Wind animation
      if (isPlaying && treeMeshRef.current && geometryResultRef.current) {
        timeRef.current += 0.016;
        applyWindAnimation(treeMeshRef.current, geometryResultRef.current, timeRef.current);
      }
      
      // LOD based on camera distance
      const distance = camera.position.distanceTo(controls.target);
      const nearRadius = getPN(params, 'nearRadius_m', 'vegetation.lod.distance.nearRadius_m', 15);
      const midRadius = getPN(params, 'midRadius_m', 'vegetation.lod.distance.midRadius_m', 40);
      const farRadius = getPN(params, 'farRadius_m', 'vegetation.lod.distance.farRadius_m', 100);
      
      let newLod: LODLevel = 'near';
      if (distance > farRadius) newLod = 'ultra';
      else if (distance > midRadius) newLod = 'far';
      else if (distance > nearRadius) newLod = 'mid';
      
      if (newLod !== lodLevel) {
        setLodLevel(newLod);
      }
      
      renderer.render(scene, camera);
    }
    
    animate();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [containerReady]);
  
  // ─── VIEWPORT SETTINGS UPDATE ───────────────────────────────────────────
  
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;
    
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    
    scene.background = new THREE.Color(viewportSettings.backgroundColor);
    
    if (viewportSettings.fogEnabled) {
      scene.fog = new THREE.Fog(
        viewportSettings.fogColor,
        viewportSettings.fogNear,
        viewportSettings.fogFar
      );
    } else {
      scene.fog = null;
    }
    
    renderer.shadowMap.enabled = viewportSettings.enableShadows;
    renderer.toneMappingExposure = viewportSettings.exposure;
  }, [viewportSettings]);
  
  // ─── TREE GEOMETRY GENERATION ───────────────────────────────────────────
  
  useEffect(() => {
    if (!sceneRef.current || !params) return;
    
    const scene = sceneRef.current;
    
    // Remove old tree
    if (treeMeshRef.current) {
      scene.remove(treeMeshRef.current);
      treeMeshRef.current.geometry.dispose();
      if (Array.isArray(treeMeshRef.current.material)) {
        treeMeshRef.current.material.forEach(m => m.dispose());
      } else {
        treeMeshRef.current.material.dispose();
      }
    }
    
    // Generate new geometry
    const result = generateTreeGeometry(params, seed, { lod: lodLevel });
    geometryResultRef.current = result;
    
    // Create Three.js geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(result.positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(result.normals, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(result.colors, 3));
    geometry.setIndex(new THREE.BufferAttribute(result.indices, 1));
    
    // Store original positions for wind animation
    geometry.setAttribute('originalPosition', new THREE.BufferAttribute(result.positions.slice(), 3));
    geometry.setAttribute('windData', new THREE.BufferAttribute(result.windData, 4));
    
    geometry.computeBoundingSphere();
    
    // Material with vertex colors
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.8,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    treeMeshRef.current = mesh;
    
    // Update stats
    setStats({
      verts: result.meta.vertCount,
      tris: result.meta.triCount,
      branches: result.meta.branchCount,
      leaves: result.meta.leafCount,
    });
    
    // Update camera target based on tree height
    if (controlsRef.current) {
      controlsRef.current.target.set(0, result.meta.height * 0.4, 0);
    }
  }, [params, seed, lodLevel]);
  
  // ─── WIND ANIMATION ─────────────────────────────────────────────────────
  
  const applyWindAnimation = useCallback((mesh: THREE.Mesh, result: TreeGeometryResult, time: number) => {
    const geometry = mesh.geometry;
    const positions = geometry.getAttribute('position');
    const originalPositions = geometry.getAttribute('originalPosition');
    const windData = geometry.getAttribute('windData');
    
    if (!positions || !originalPositions || !windData) return;
    
    const windStrength = getPN(params, 'windStrength', 'vegetation.wind.gustStrength', 0.5);
    const gustFrequency = getPN(params, 'windGustFrequency', 'vegetation.wind.gustFrequency', 0.8);
    const trunkBend = getPN(params, 'trunkBend', 'vegetation.wind.trunkBend', 0.02);
    const branchBend = getPN(params, 'branchBend', 'vegetation.wind.branchBend', 0.15);
    const twigBend = getPN(params, 'twigBend', 'vegetation.wind.twigBend', 0.4);
    const leafFlutter = getPN(params, 'leafFlutter', 'vegetation.wind.leafFlutter', 0.5);
    
    const windX = Math.sin(time * gustFrequency) * windStrength;
    const windZ = Math.cos(time * gustFrequency * 0.7) * windStrength * 0.5;
    
    for (let i = 0; i < positions.count; i++) {
      const ox = originalPositions.getX(i);
      const oy = originalPositions.getY(i);
      const oz = originalPositions.getZ(i);
      
      const hierarchy = windData.getX(i); // 0-1, 0 = trunk, 1 = leaves
      const order = windData.getY(i);
      const branchHash = windData.getZ(i);
      const rigidity = windData.getW(i);
      
      // Height-based influence (more sway at top)
      const heightFactor = Math.pow(oy / 15, 1.5);
      
      // Per-branch phase offset for natural variation
      const phaseOffset = branchHash * Math.PI * 2;
      
      // Trunk: gentle sway
      let dx = 0, dz = 0;
      if (hierarchy < 0.1) {
        dx = windX * trunkBend * heightFactor;
        dz = windZ * trunkBend * heightFactor;
      }
      // Branches: more movement
      else if (hierarchy < 0.8) {
        const branchWave = Math.sin(time * gustFrequency * 1.5 + phaseOffset);
        dx = windX * branchBend * heightFactor * (0.5 + branchWave * 0.5);
        dz = windZ * branchBend * heightFactor * (0.5 + branchWave * 0.5);
      }
      // Leaves: high flutter
      else {
        const flutter = Math.sin(time * 8 + phaseOffset * 3) * leafFlutter * 0.02;
        dx = windX * twigBend * heightFactor + flutter;
        dz = windZ * twigBend * heightFactor + flutter;
      }
      
      positions.setXYZ(i, ox + dx, oy, oz + dz);
    }
    
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  }, [params]);
  
  // ─── RENDER ─────────────────────────────────────────────────────────────
  
  return (
    <div className={`relative w-full h-full ${className}`}>
      <div 
        ref={containerRef} 
        className="absolute inset-0 bg-proveg-viewport viewport-glow"
      />
      
      {showOverlay && (showStats || true) && (
        <div className="absolute bottom-4 left-4 glass-panel rounded-lg px-3 py-2 animate-fade-in">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className={`lod-indicator lod-${lodLevel}`} />
              <span className="text-muted-foreground uppercase">{lodLevel}</span>
            </div>
            <div className="text-muted-foreground">
              <span className="text-primary">{stats.verts.toLocaleString()}</span> verts
            </div>
            <div className="text-muted-foreground">
              <span className="text-primary">{stats.tris.toLocaleString()}</span> tris
            </div>
            <div className="text-muted-foreground">
              <span className="text-primary">{stats.branches}</span> branches
            </div>
            <div className="text-muted-foreground">
              <span className="text-primary">{stats.leaves}</span> leaves
            </div>
          </div>
        </div>
      )}
      
      {showOverlay && isPlaying && (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-mono text-primary wind-active">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
            <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
            <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
          </svg>
          <span>WIND</span>
        </div>
      )}
    </div>
  );
}
