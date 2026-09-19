import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowLeft, Search, Navigation } from 'lucide-react';

interface CityPoint {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

// Key nodes matching the surveillance dots across North America, Atlantic, Pacific, and Europe
const NOTABLE_CITIES: CityPoint[] = [
  // North America & Arctic (prominently shown in Image 2)
  { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.006 },
  { name: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298 },
  { name: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
  { name: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207 },
  { name: 'Nuuk', country: 'Greenland', lat: 64.1814, lng: -51.6941 },
  // Atlantic & Europe
  { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lng: -21.9426 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
  { name: 'Azores Relay', country: 'Atlantic Node', lat: 38.7223, lng: -27.2119 },
  // Pacific (shown in Image 1)
  { name: 'Hawaii Pacific Hub', country: 'Pacific Node', lat: 21.3069, lng: -157.8583 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'Midway Relay', country: 'Pacific Grid', lat: 28.2072, lng: -177.3735 },
  // Additional Global Hubs
  { name: 'Delhi', country: 'India', lat: 28.6139, lng: 77.209 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 }
];

interface EarthGlobeViewProps {
  onBack: () => void;
  onSelectCity?: (city: string) => void;
}

// High-detail procedural Earth texture generator (matches Image 1 & 2 with bright Arctic ice cap & continents)
function createProceduralEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Deep oceanic blue gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#0c2340');
  oceanGrad.addColorStop(0.25, '#0e3158');
  oceanGrad.addColorStop(0.5, '#103d6d');
  oceanGrad.addColorStop(0.75, '#0e3158');
  oceanGrad.addColorStop(1, '#0a1d36');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const toX = (lng: number) => ((lng + 180) / 360) * canvas.width;
  const toY = (lat: number) => ((90 - lat) / 180) * canvas.height;

  const drawPolygon = (points: [number, number][], fill: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    points.forEach(([lat, lng], i) => {
      const x = toX(lng);
      const y = toY(lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  };

  // 1. Bright Arctic Ice Cap (pure white ice matching top of globe in Image 2)
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 45, canvas.width / 2, 70, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Greenland Ice Island (pure white ice sheet prominently visible in Image 2)
  drawPolygon(
    [
      [83, -30], [81, -20], [76, -18], [70, -22], [60, -43], [60, -48],
      [65, -52], [72, -56], [78, -68], [82, -50], [83, -30]
    ],
    '#ffffff'
  );

  // 3. North America & Canada (prominently seen in Image 2)
  // Canada northern snow & tundra
  drawPolygon(
    [
      [72, -155], [68, -135], [69, -125], [74, -95], [76, -85], [70, -68],
      [60, -64], [55, -55], [52, -56], [58, -65], [62, -75], [55, -80],
      [58, -95], [65, -110], [64, -135], [70, -160], [72, -155]
    ],
    '#e2e8f0'
  );
  // United States & Southern Canada
  drawPolygon(
    [
      [49, -124], [48, -90], [47, -70], [44, -66], [41, -71], [35, -75],
      [28, -80], [25, -80], [29, -89], [26, -97], [22, -97], [32, -117],
      [38, -123], [46, -124], [49, -124]
    ],
    '#5c4a30' // earth brown/olive
  );
  // US Midwest & Forests
  drawPolygon(
    [
      [48, -95], [45, -75], [38, -75], [30, -85], [30, -95], [40, -100], [48, -95]
    ],
    '#365314' // forest green
  );

  // 4. Europe (visible on upper right in Image 2)
  drawPolygon(
    [
      [71, 28], [60, 20], [55, 12], [54, 8], [48, -4], [43, -9], [36, -9],
      [36, 1], [44, 12], [41, 29], [45, 28], [55, 37], [65, 35], [71, 28]
    ],
    '#3f6212'
  );
  // United Kingdom & Ireland
  drawPolygon(
    [[58, -5], [55, -2], [50, 1], [50, -5], [55, -6], [58, -5]],
    '#4d7c0f'
  );

  // 5. Eurasia, Africa, and South America
  drawPolygon(
    [
      [36, -6], [32, -9], [21, -17], [15, -17], [5, -9], [2, 10], [-15, 12],
      [-34, 18], [-34, 26], [-15, 40], [12, 51], [22, 38], [31, 33], [36, -6]
    ],
    '#854d0e'
  );
  drawPolygon(
    [
      [12, -75], [-5, -80], [-20, -70], [-55, -68], [-52, -65], [-35, -55],
      [-5, -35], [5, -52], [12, -72]
    ],
    '#1e3a1e'
  );

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Generates the horizontal translucent elliptical cloud discs seen in Image 1 & 2
function createTranslucentEllipticalCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw smooth horizontal translucent ellipses matching Image 1 & Image 2
  const ellipses = [
    // Upper Northern Hemisphere band (across Arctic & North America)
    { cx: 350, cy: 260, rx: 240, ry: 75, opacity: 0.38 },
    { cx: 900, cy: 240, rx: 260, ry: 80, opacity: 0.35 },
    { cx: 1550, cy: 250, rx: 250, ry: 75, opacity: 0.36 },
    // Mid-Northern latitudes (across USA, Atlantic, Europe)
    { cx: 200, cy: 390, rx: 280, ry: 85, opacity: 0.34 },
    { cx: 750, cy: 380, rx: 310, ry: 90, opacity: 0.38 },
    { cx: 1350, cy: 400, rx: 290, ry: 85, opacity: 0.35 },
    { cx: 1900, cy: 390, rx: 260, ry: 80, opacity: 0.32 },
    // Equatorial & Sub-tropical band
    { cx: 450, cy: 540, rx: 320, ry: 90, opacity: 0.36 },
    { cx: 1100, cy: 530, rx: 340, ry: 95, opacity: 0.40 },
    { cx: 1750, cy: 550, rx: 300, ry: 88, opacity: 0.35 },
    // Southern mid-latitudes
    { cx: 300, cy: 700, rx: 280, ry: 85, opacity: 0.32 },
    { cx: 950, cy: 710, rx: 300, ry: 90, opacity: 0.35 },
    { cx: 1600, cy: 690, rx: 270, ry: 80, opacity: 0.34 }
  ];

  ellipses.forEach(({ cx, cy, rx, ry, opacity }) => {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    grad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    grad.addColorStop(0.65, `rgba(240, 245, 255, ${opacity * 0.8})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export const EarthGlobeView: React.FC<EarthGlobeViewProps> = ({ onBack, onSelectCity }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<CityPoint[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCityLabel, setActiveCityLabel] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);

  // Rotation & Drag control
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0.0012 });
  const targetRotation = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera (tuned distance so Globe fills viewport exactly as in images)
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    // Globe spans comfortably between top search bar and bottom badge
    camera.position.set(0, 0, 2.3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // 2. Starfield (crisp stars in deep space background)
    const starsCount = 2800;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 30 + Math.random() * 50;

      const sinPhi = Math.sin(phi);
      starPositions[i * 3] = r * sinPhi * Math.cos(theta);
      starPositions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const b = 0.85 + Math.random() * 0.15;
      starColors[i * 3] = b * 0.95;
      starColors[i * 3 + 1] = b * 0.98;
      starColors[i * 3 + 2] = b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.032,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 3. 3D Globe with Glossy Clearcoat Sheen (matching the bright sheen in Image 2)
    const earthRadius = 1.02;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const proceduralTexture = createProceduralEarthTexture();

    const earthMaterial = new THREE.MeshPhysicalMaterial({
      map: proceduralTexture,
      roughness: 0.32,
      metalness: 0.08,
      clearcoat: 0.85,
      clearcoatRoughness: 0.18
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    // Initial orientation: North America, Greenland, Arctic view tilted toward camera matching Image 2!
    earthMesh.rotation.x = 0.52;
    earthMesh.rotation.y = -1.42;
    scene.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // Load High-Res NASA Earth Satellite Map
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        earthMaterial.map = loadedTexture;
        earthMaterial.needsUpdate = true;
      },
      undefined,
      () => {
        textureLoader.load(
          'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_atmos_2048.jpg',
          (fallback) => {
            fallback.colorSpace = THREE.SRGBColorSpace;
            earthMaterial.map = fallback;
            earthMaterial.needsUpdate = true;
          }
        );
      }
    );

    // 4. Translucent Horizontal Oval Cloud Bands (matches Image 1 & 2 exactly)
    const cloudGeometry = new THREE.SphereGeometry(earthRadius * 1.012, 48, 48);
    const cloudTexture = createTranslucentEllipticalCloudTexture();
    const cloudMaterial = new THREE.MeshBasicMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.88,
      blending: THREE.NormalBlending,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // 5. Atmospheric Cyan Halo Rim (thin blue atmospheric glow visible around perimeter)
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.048, 48, 48);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
          gl_FragColor = vec4(0.2, 0.65, 1.0, 1.0) * intensity * 1.8;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // 6. Lighting (creates the realistic day-night curve and glossy reflection)
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.2);
    sunLight.position.set(2.2, 2.0, 2.8);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x1a2e4a, 0.7);
    scene.add(ambientLight);

    // 7. Glowing Cyan Node Dots (matches the light-blue dots on globe in Image 1 & 2)
    const cityGroup = new THREE.Group();
    NOTABLE_CITIES.forEach((city) => {
      const latRad = (city.lat * Math.PI) / 180;
      const lngRad = (-city.lng * Math.PI) / 180;

      const r = earthRadius * 1.018;
      const x = r * Math.cos(latRad) * Math.sin(lngRad);
      const y = r * Math.sin(latRad);
      const z = r * Math.cos(latRad) * Math.cos(lngRad);

      // Cyan circular node with subtle glow
      const dotGeo = new THREE.SphereGeometry(0.016, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0x7dd3fc
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, y, z);
      dot.userData = { city };
      cityGroup.add(dot);
    });
    earthMesh.add(cityGroup);

    // 8. Animation loop
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Clouds rotate gently in sync with atmosphere
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0007;
      }

      if (earthMeshRef.current) {
        if (targetRotation.current) {
          earthMeshRef.current.rotation.y += (targetRotation.current.y - earthMeshRef.current.rotation.y) * 0.06;
          earthMeshRef.current.rotation.x += (targetRotation.current.x - earthMeshRef.current.rotation.x) * 0.06;
          if (
            Math.abs(targetRotation.current.y - earthMeshRef.current.rotation.y) < 0.001 &&
            Math.abs(targetRotation.current.x - earthMeshRef.current.rotation.x) < 0.001
          ) {
            targetRotation.current = null;
          }
        } else if (!isDraggingRef.current) {
          earthMeshRef.current.rotation.y += rotationVelocity.current.y;
          earthMeshRef.current.rotation.x += rotationVelocity.current.x;
          rotationVelocity.current.x *= 0.96;
          rotationVelocity.current.y = rotationVelocity.current.y * 0.98 + 0.0008 * 0.02;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
    };
  }, []);

  // Mouse & Touch interaction for dragging/rotating Earth
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
    targetRotation.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !earthMeshRef.current) return;

    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    earthMeshRef.current.rotation.y += deltaX * 0.005;
    earthMeshRef.current.rotation.x = Math.max(
      -1.3,
      Math.min(1.3, earthMeshRef.current.rotation.x + deltaY * 0.005)
    );

    rotationVelocity.current = {
      x: deltaY * 0.0015,
      y: deltaX * 0.0015
    };

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      targetRotation.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !earthMeshRef.current || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

    earthMeshRef.current.rotation.y += deltaX * 0.005;
    earthMeshRef.current.rotation.x = Math.max(
      -1.3,
      Math.min(1.3, earthMeshRef.current.rotation.x + deltaY * 0.005)
    );

    previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 0) {
      const q = val.toLowerCase();
      const matches = NOTABLE_CITIES.filter(
        (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
      );
      setFilteredCities(matches);
      setIsSearching(true);
    } else {
      setFilteredCities([]);
      setIsSearching(false);
    }
  };

  const rotateToCity = (city: CityPoint) => {
    setSearchQuery(city.name);
    setIsSearching(false);
    setActiveCityLabel(`${city.name}, ${city.country}`);

    const targetY = -((city.lng * Math.PI) / 180) + Math.PI / 2;
    const targetX = (city.lat * Math.PI) / 180 * 0.6;
    targetRotation.current = { x: targetX, y: targetY };
  };

  const handleGlobeAnalysisClick = () => {
    if (onSelectCity) {
      onSelectCity(activeCityLabel || 'Central Surveillance Node');
    }
    onBack();
  };

  return (
    <div
      ref={containerRef}
      id="earth-globe-view"
      className="relative w-full h-full min-h-screen bg-black text-white select-none overflow-hidden font-sans flex flex-col justify-between"
    >
      {/* 3D WebGL Canvas for Earth & Stars */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleGlobeAnalysisClick}
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing block"
      />

      {/* TOP HEADER BAR (Matching user screenshots 1 & 2) */}
      <div className="relative z-20 pt-4 px-4 sm:px-6 w-full max-w-6xl mx-auto flex items-center gap-3">
        {/* "< Back" Button matching screenshot */}
        <button
          id="globe-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/95 hover:bg-white active:scale-95 text-slate-800 font-semibold text-sm shadow-xl transition-all cursor-pointer shrink-0"
          title="Return to Surveillance Feed"
        >
          <ArrowLeft className="w-4 h-4 text-slate-800 stroke-[2.5]" />
          <span>Back</span>
        </button>

        {/* Search Bar matching screenshot */}
        <div className="relative flex-1 max-w-3xl">
          <div className="relative flex items-center w-full bg-white/95 rounded-full shadow-xl px-4 py-1.5 sm:py-2 border border-white/50">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearching(true)}
              placeholder="Search a location..."
              className="w-full bg-transparent text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none px-2"
            />
            {/* Blue search circle icon on the right matching Image 2 */}
            <button
              onClick={() => {
                if (filteredCities.length > 0) {
                  rotateToCity(filteredCities[0]);
                }
              }}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center shrink-0 shadow-md transition-all cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4 text-white stroke-[2.5]" />
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearching && filteredCities.length > 0 && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden z-30 border border-slate-200 divide-y divide-slate-100">
              {filteredCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => rotateToCity(city)}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center justify-between text-slate-800 text-sm cursor-pointer"
                >
                  <span className="font-semibold">{city.name}</span>
                  <span className="text-xs text-slate-500">{city.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Focused City Indicator */}
      {activeCityLabel && (
        <div className="relative z-10 mx-auto px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-mono shadow-xl flex items-center gap-2 animate-in fade-in">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span>Focused: {activeCityLabel}</span>
        </div>
      )}

      {/* BOTTOM BANNER (Matching user screenshots 1 & 2) */}
      <div className="relative z-20 pb-8 px-4 flex justify-center pointer-events-auto">
        <button
          id="globe-analysis-badge-btn"
          onClick={handleGlobeAnalysisClick}
          className="px-6 py-2.5 rounded-full bg-white/95 hover:bg-white active:scale-95 text-slate-800 text-sm font-medium shadow-2xl transition-all cursor-pointer border border-white/40"
        >
          Click on the globe or a city to begin analysis.
        </button>
      </div>
    </div>
  );
};
