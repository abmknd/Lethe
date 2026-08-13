import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Halftone-dithered Sisyphus scene ported from rebrand.html.
 * Adapted for the staged rebrand: the canvas fills its parent section (not the
 * whole viewport), all three figures are assembled to match the Figma hero-art,
 * and scroll drives a gentle parallax as the hero leaves the viewport.
 */

const vertexShader = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uScroll;
  uniform float uSeed;
  uniform float uKind;
  uniform vec3 uWhite;
  uniform vec3 uBlue;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32 + uSeed);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
      mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 r = mat2(1.62, -1.18, 1.18, 1.62);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = r * p + 11.7;
      a *= 0.52;
    }
    return v;
  }
  float bayer4(vec2 p) {
    int x = int(mod(p.x, 4.0));
    int y = int(mod(p.y, 4.0));
    int index = x + y * 4;
    float v = 0.0;
    if (index == 0) v = 0.0; if (index == 1) v = 8.0; if (index == 2) v = 2.0; if (index == 3) v = 10.0;
    if (index == 4) v = 12.0; if (index == 5) v = 4.0; if (index == 6) v = 14.0; if (index == 7) v = 6.0;
    if (index == 8) v = 3.0; if (index == 9) v = 11.0; if (index == 10) v = 1.0; if (index == 11) v = 9.0;
    if (index == 12) v = 15.0; if (index == 13) v = 7.0; if (index == 14) v = 13.0; if (index == 15) v = 5.0;
    return (v + 0.5) / 16.0;
  }
  float topographic(vec3 p, vec3 n) {
    float polar = atan(p.z, p.x);
    float radial = length(p.xz);
    float elevation = p.y * 0.62 + fbm(vec2(polar * 1.4, radial * 0.55 + uScroll * 2.8)) * 0.9;
    float bands = abs(fract(elevation * 9.5 - uScroll * 3.5) - 0.5);
    float lines = smoothstep(0.055, 0.006, bands);
    float facets = smoothstep(0.84, 0.96, abs(sin(polar * 7.0 + fbm(p.xz) * 3.0)));
    float rim = pow(1.0 - max(dot(n, normalize(vec3(0.0, 0.35, 1.0))), 0.0), 2.2);
    return clamp(lines * 0.82 + facets * 0.35 + rim * 0.5, 0.0, 1.0);
  }
  float figureDensity(vec3 p, vec3 n) {
    vec3 light = normalize(vec3(-0.35, 0.72, 0.62));
    float lambert = max(dot(n, light), 0.0);
    float muscle = fbm(p.xy * 8.0 + vec2(uTime * 0.3, 0.0));
    float contour = smoothstep(0.03, 0.0, abs(fract((p.y + muscle * 0.18) * 16.0) - 0.5));
    return clamp(lambert * 0.72 + contour * 0.35 + pow(1.0 - abs(n.z), 3.0) * 0.45, 0.0, 1.0);
  }
  float networkDensity(vec3 p) {
    float r = length(p.xy);
    float a = atan(p.y, p.x);
    float rings = smoothstep(0.025, 0.0, abs(fract(r * 10.0 - uTime * 0.03) - 0.5));
    float spokes = smoothstep(0.018, 0.0, abs(fract(a * 4.0 / 6.28318) - 0.5));
    float guilloche = smoothstep(0.02, 0.0, abs(sin(42.0 * r + 9.0 * sin(a * 3.0))));
    return clamp(rings * 0.55 + spokes * 0.28 + guilloche * 0.22, 0.0, 1.0);
  }
  void main() {
    float base = uKind < 0.5 ? topographic(vWorld, normalize(vNormal)) :
                 uKind < 1.5 ? figureDensity(vWorld, normalize(vNormal)) :
                 networkDensity(vWorld);
    vec2 cell = floor(gl_FragCoord.xy / 2.0);
    vec2 local = fract(gl_FragCoord.xy / 2.0) - 0.5;
    float dotShape = smoothstep(0.42, 0.12, length(local));
    float threshold = bayer4(cell) * 0.86 + hash(cell + uSeed) * 0.14;
    float ink = step(threshold, base) * dotShape;
    if (ink < 0.08) discard;
    gl_FragColor = vec4(uWhite, ink);
  }
`;

export default function HeroCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor('#0000F2', 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0000F2');

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 80);
    camera.position.set(0, 0.5, 10.6);

    const sharedUniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uSeed: { value: 37.113 },
      uWhite: { value: new THREE.Color('#FFFFFF') },
      uBlue: { value: new THREE.Color('#0000F2') },
    };

    const makeMaterial = (kind: number) =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { ...sharedUniforms, uKind: { value: kind } },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

    const domeMaterial = makeMaterial(0);
    const figureMaterial = makeMaterial(1);
    const networkMaterial = makeMaterial(2);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(4.65, 192, 96, 0, Math.PI * 2, 0, Math.PI * 0.58),
      domeMaterial,
    );
    dome.rotation.x = Math.PI;
    dome.scale.set(1.52, 1.03, 0.42);
    dome.position.set(0, -0.28, -0.7);
    scene.add(dome);

    const ground = new THREE.Mesh(
      new THREE.RingGeometry(1.2, 8.8, 220, 32),
      domeMaterial,
    );
    ground.rotation.x = -Math.PI * 0.52;
    ground.position.set(0, -2.1, -0.25);
    ground.scale.set(1.25, 0.42, 1);
    scene.add(ground);

    const networks: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const net = new THREE.Mesh(
        new THREE.RingGeometry(1.1 + i * 0.08, 2.65 + i * 0.16, 180, 10),
        networkMaterial,
      );
      net.position.set(i === 0 ? 0 : i === 1 ? -3.75 : 3.75, 1.45 + (i ? -0.25 : 0.28), -1.35);
      net.scale.set(i === 0 ? 1.35 : 0.84, i === 0 ? 1.35 : 0.84, 1);
      scene.add(net);
      networks.push(net);
    }

    const capsule = (radius: number, length: number, position: [number, number, number], rotation: [number, number, number] = [0, 0, 0]) => {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 10, 18), figureMaterial);
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      return mesh;
    };

    const makeFigure = (x: number, side: number) => {
      const g = new THREE.Group();
      g.position.set(x, -1.78, 0.86);
      g.scale.setScalar(0.62);
      g.add(capsule(0.24, 0.84, [0, 0.78, 0], [0.12, 0, 0]));
      g.add(capsule(0.3, 0.42, [0, 0.24, 0.02], [0.06, 0, 0]));
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 16), figureMaterial);
      head.position.set(0, 1.39, 0.02);
      g.add(head);
      g.add(capsule(0.08, 0.74, [-0.36, 1.04, 0.05], [0.2, 0, -0.7]));
      g.add(capsule(0.08, 0.64, [0.36, 1.04, 0.05], [0.2, 0, 0.7]));
      g.add(capsule(0.09, 0.78, [-0.24, -0.35, 0.02], [-0.12, 0, 0.22]));
      g.add(capsule(0.09, 0.78, [0.24, -0.35, 0.02], [-0.12, 0, -0.22]));
      g.userData = { baseX: x, side, phase: Math.abs(x) * 1.7 };
      return g;
    };

    // All three figures assembled from the start (matches the Figma hero-art).
    const figures = [makeFigure(0, 0), makeFigure(-2.0, -1), makeFigure(2.0, 1)];
    figures.forEach((f) => scene.add(f));

    let dampedScroll = 0;
    let targetScroll = 0;
    let isVisible = true;
    let rafId = 0;
    const clock = new THREE.Clock();

    const onScroll = () => {
      const rect = host.getBoundingClientRect();
      const h = rect.height || window.innerHeight;
      targetScroll = Math.min(1, Math.max(0, -rect.top / h));
    };

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();
    onScroll();

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !rafId) render();
      },
      { threshold: 0.01 },
    );
    visibilityObserver.observe(host);
    window.addEventListener('scroll', onScroll, { passive: true });

    const updateFigures = (t: number, p: number) => {
      figures.forEach((figure) => {
        const side = figure.userData.side as number;
        const phase = t * (1.5 + p * 3.0) + (figure.userData.phase as number);
        const stride = Math.sin(phase) * 0.06;
        const strain = Math.sin(phase * 1.7) * 0.04;
        figure.position.x = (figure.userData.baseX as number) + stride * side;
        figure.position.y = -1.78 + Math.abs(Math.sin(phase)) * 0.03;
        figure.rotation.z = side * -0.1 + strain;
        figure.rotation.x = -0.18 - p * 0.12;
        figure.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.rotation.y += Math.sin(phase + child.id) * 0.0012;
          }
        });
      });
    };

    function render() {
      rafId = 0;
      if (!isVisible) return;
      const t = clock.getElapsedTime();
      dampedScroll += (targetScroll - dampedScroll) * 0.08;

      sharedUniforms.uTime.value = t;
      sharedUniforms.uScroll.value = dampedScroll;

      dome.rotation.z = dampedScroll * -0.42;
      dome.position.y = -0.28 + dampedScroll * 0.36;
      ground.rotation.z = dampedScroll * 0.25;

      networks.forEach((net, i) => {
        net.rotation.z = t * (0.025 + i * 0.01) + dampedScroll * (0.35 - i * 0.1);
      });

      camera.position.x = Math.sin(dampedScroll * Math.PI) * 0.2;
      camera.position.y = 0.5 + dampedScroll * 0.42;
      camera.position.z = 10.6 - dampedScroll * 1.05;
      camera.lookAt(0, -0.12 + dampedScroll * 0.22, -0.35);

      updateFigures(t, dampedScroll);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
