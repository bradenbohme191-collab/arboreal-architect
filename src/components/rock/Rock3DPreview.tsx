/**
 * Rock 3D Preview - Procedural rock rendering with Three.js
 */
import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';

// Simple seeded noise for procedural displacement
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function generateRockGeometry(params: ReturnType<typeof useProRockLayout>['rockParams'], seed: number): THREE.BufferGeometry {
  const { shape, surface, geology } = params;
  const rng = seededRandom(seed);
  
  const seg = Math.max(8, Math.floor(shape.tessellation));
  const geo = new THREE.SphereGeometry(1, seg, seg);
  const positions = geo.attributes.position;
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    let sx = x * shape.width * 0.5;
    let sy = y * shape.height * 0.5;
    let sz = z * shape.depth * 0.5;
    
    if (shape.angularity > 0) {
      const factor = shape.angularity * 0.3;
      const nx = Math.sign(sx) * Math.pow(Math.abs(x), 1 - factor) * shape.width * 0.5;
      const nz = Math.sign(sz) * Math.pow(Math.abs(z), 1 - factor) * shape.depth * 0.5;
      sx = sx * (1 - shape.angularity) + nx * shape.angularity;
      sz = sz * (1 - shape.angularity) + nz * shape.angularity;
    }
    
    const heightFactor = (y + 1) * 0.5;
    const taperScale = 1 - (heightFactor * shape.taperTop + (1 - heightFactor) * shape.taperBottom) * 0.3;
    sx *= taperScale;
    sz *= taperScale;
    
    const noiseAmp = shape.noiseDisplacement * surface.displacement * 0.2;
    const freq = surface.noiseFrequency;
    const nx1 = Math.sin(x * freq * 3.7 + seed) * Math.cos(z * freq * 2.3 + seed * 0.7);
    const ny1 = Math.sin(y * freq * 4.1 + seed * 1.3) * Math.cos(x * freq * 1.9 + seed * 0.3);
    const nz1 = Math.sin(z * freq * 2.9 + seed * 0.5) * Math.cos(y * freq * 3.3 + seed * 1.1);
    
    let displacement = 0;
    let amp = noiseAmp;
    let f = freq;
    for (let o = 0; o < Math.min(surface.noiseOctaves, 6); o++) {
      displacement += Math.sin(x * f + y * f * 0.7 + seed + o * 17) * amp;
      amp *= surface.noisePersistence;
      f *= surface.noiseLacunarity;
    }
    
    const asymOffset = shape.asymmetry * 0.15 * Math.sin(y * 2.1 + seed * 0.3);
    
    sx += nx1 * noiseAmp + asymOffset;
    sy += ny1 * noiseAmp * 0.5 + displacement;
    sz += nz1 * noiseAmp;
    
    if (geology.stratification > 0) {
      const layerEffect = Math.sin(sy / (geology.layerThickness + 0.01) * Math.PI + geology.layerAngle * 0.017) * geology.stratification * 0.05;
      sx += layerEffect * (1 + geology.layerDistortion * rng());
      sz += layerEffect * 0.5;
    }
    
    positions.setXYZ(i, sx, sy, sz);
  }
  
  geo.computeVertexNormals();
  return geo;
}

export default function Rock3DPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rockMeshRef = useRef<THREE.Mesh | null>(null);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const rotRef = useRef({ x: 0.3, y: 0 });
  const zoomRef = useRef(5);
  
  const { rockParams, seed, viewportSettings } = useProRockLayout();

  const initScene = useCallback(() => {
    if (!containerRef.current) return;
    
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = viewportSettings.enableShadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = viewportSettings.exposure;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(viewportSettings.backgroundColor);
    if (viewportSettings.fogEnabled) {
      scene.fog = new THREE.Fog(viewportSettings.fogColor, viewportSettings.fogNear, viewportSettings.fogFar);
    }
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 200);
    camera.position.set(0, 1, 5);
    cameraRef.current = camera;
    
    // Lights
    const ambient = new THREE.AmbientLight(viewportSettings.ambientColor, viewportSettings.ambientIntensity);
    scene.add(ambient);
    
    const mainLight = new THREE.DirectionalLight(viewportSettings.mainLightColor, viewportSettings.mainLightIntensity);
    mainLight.position.set(...viewportSettings.mainLightPosition);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(1024, 1024);
    scene.add(mainLight);
    
    const hemi = new THREE.HemisphereLight(viewportSettings.hemiSkyColor, viewportSettings.hemiGroundColor, viewportSettings.hemiIntensity);
    scene.add(hemi);
    
    // Ground
    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const grid = new THREE.GridHelper(20, 40, 0x222222, 0x181818);
    scene.add(grid);
  }, [viewportSettings]);

  const updateRock = useCallback(() => {
    if (!sceneRef.current) return;
    if (rockMeshRef.current) {
      rockMeshRef.current.geometry.dispose();
      (rockMeshRef.current.material as THREE.Material).dispose();
      sceneRef.current.remove(rockMeshRef.current);
    }
    const geo = generateRockGeometry(rockParams, seed);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(rockParams.color.baseColor),
      roughness: rockParams.surface.roughness,
      metalness: rockParams.surface.glossiness * 0.3,
      flatShading: rockParams.surface.roughness > 0.7,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.y = rockParams.shape.height * 0.5 * (1 - rockParams.environment.groundEmbedding);
    sceneRef.current.add(mesh);
    rockMeshRef.current = mesh;
  }, [rockParams, seed]);

  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    const cam = cameraRef.current;
    const dist = zoomRef.current;
    cam.position.x = Math.sin(rotRef.current.y) * Math.cos(rotRef.current.x) * dist;
    cam.position.y = Math.sin(rotRef.current.x) * dist + 1;
    cam.position.z = Math.cos(rotRef.current.y) * Math.cos(rotRef.current.x) * dist;
    cam.lookAt(0, rockParams.shape.height * 0.3, 0);
    rendererRef.current.render(sceneRef.current, cam);
    frameRef.current = requestAnimationFrame(animate);
  }, [rockParams.shape.height]);

  useEffect(() => {
    initScene();
    updateRock();
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current) { rendererRef.current.dispose(); rendererRef.current.domElement.remove(); }
    };
  }, []);

  useEffect(() => { updateRock(); }, [rockParams, seed]);

  // Mouse controls
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onDown = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY, isDown: true }; };
    const onUp = () => { mouseRef.current.isDown = false; };
    const onMove = (e: MouseEvent) => {
      if (!mouseRef.current.isDown) return;
      const dx = e.clientX - mouseRef.current.x;
      const dy = e.clientY - mouseRef.current.y;
      rotRef.current.y += dx * 0.005;
      rotRef.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotRef.current.x + dy * 0.005));
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); zoomRef.current = Math.max(2, Math.min(30, zoomRef.current + e.deltaY * 0.01)); };
    const onResize = () => {
      if (!rendererRef.current || !cameraRef.current || !el) return;
      const w = el.clientWidth, h = el.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full viewport-glow cursor-grab active:cursor-grabbing" />
  );
}
