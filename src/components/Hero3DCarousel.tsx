import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

const PRODUCTS = [
  { id: 'tshirt', url: '/models/tshirt_webshop.glb', scale: 5.5, yOffset: -1.2 },
  { id: 'hoodie', url: '/models/hoodie-webshop.glb', scale: 5.0, yOffset: -1.2 },
  { id: 'cap', url: '/models/cap_webshop.glb', scale: 1.2, yOffset: 0.5 },
  { id: 'bottle', url: '/models/bottle-webshop.glb', scale: 12.0, yOffset: -0.2 },
];

const CYCLE_INTERVAL = 4000;
const GLITCH_DURATION = 0.5; // seconds

// Subtle glitch hologram shaders
const glitchVertexShader = `
  uniform float uGlitch;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position;

    if (uGlitch > 0.01) {
      // Very subtle horizontal slice offset
      float sliceY = floor(pos.z * 12.0 + uTime * 15.0);
      float sliceRand = rand(vec2(sliceY, uTime * 2.0));
      if (sliceRand > 0.85) {
        pos.x += (sliceRand - 0.85) * 0.8 * uGlitch * sin(uTime * 30.0);
      }
      // Tiny vertical jitter
      pos.y += sin(pos.z * 20.0 + uTime * 10.0) * 0.005 * uGlitch;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const glitchFragmentShader = `
  uniform vec3 uColor;
  uniform float uGlitch;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    float lighting = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))) * 0.4 + 0.6;
    vec3 color = uColor * lighting;

    if (uGlitch > 0.01) {
      // Subtle RGB split
      float shift = uGlitch * 0.04;
      color = vec3(color.r + shift, color.g, color.b - shift);

      // Faint scanlines
      float scanline = sin(gl_FragCoord.y * 1.5 + uTime * 8.0) * 0.5 + 0.5;
      scanline = pow(scanline, 12.0) * uGlitch * 0.1;
      color += vec3(scanline);

      // Soft holographic rim
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
      color += vec3(0.2, 0.6, 1.0) * fresnel * uGlitch * 0.2;
    }

    gl_FragColor = vec4(color, uOpacity);
  }
`;

interface GlitchModelProps {
  productIndex: number;
  color: string;
  glitchAmount: number;
  opacity: number;
}

const GlitchModel = ({ productIndex, color, glitchAmount, opacity }: GlitchModelProps) => {
  const product = PRODUCTS[productIndex];
  const { scene } = useGLTF(product.url);
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.ShaderMaterial[]>([]);
  const timeRef = useRef(0);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    const mats: THREE.ShaderMaterial[] = [];

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        const name = m.name.toLowerCase();

        if (name.includes('print')) {
          m.visible = false;
          return;
        }

        const mat = new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: new THREE.Color(color) },
            uGlitch: { value: glitchAmount },
            uTime: { value: 0 },
            uOpacity: { value: opacity },
          },
          vertexShader: glitchVertexShader,
          fragmentShader: glitchFragmentShader,
          transparent: true,
        });

        const origMat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial;
        if (origMat?.name?.toLowerCase().includes('blackring')) {
          mat.uniforms.uColor.value = new THREE.Color('#000000');
        }

        m.material = mat;
        mats.push(mat);
      }
    });

    materialsRef.current = mats;
    return clone;
  }, [scene, productIndex]);

  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      if (!mat.uniforms.uColor.value.equals?.(new THREE.Color('#000000'))) {
        mat.uniforms.uColor.value.set(color);
      }
    });
  }, [color]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
    materialsRef.current.forEach((mat) => {
      mat.uniforms.uGlitch.value = glitchAmount;
      mat.uniforms.uOpacity.value = opacity;
      mat.uniforms.uTime.value = timeRef.current;
    });
  });

  return (
    <group ref={groupRef} scale={product.scale} position={[0, product.yOffset, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
};

export interface HeroCarouselConfig {
  productAllowedColors?: Record<string, string[]>;
}

const HeroCarouselScene = ({ productAllowedColors }: HeroCarouselConfig) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [glitch, setGlitch] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [displayColor, setDisplayColor] = useState('#231f20');

  // Pick a random color from the current product's allowed list
  const pickColor = (productIdx: number): string => {
    const productId = PRODUCTS[productIdx].id;
    const allowed = productAllowedColors?.[productId];
    if (allowed && allowed.length > 0) {
      return allowed[Math.floor(Math.random() * allowed.length)];
    }
    return '#231f20';
  };

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const cycle = () => {
      // Start subtle glitch
      setGlitch(1);
      setOpacity(0.85);

      // Mid-transition: swap product + color
      setTimeout(() => {
        const nextProduct = (currentIndex + 1) % PRODUCTS.length;
        setCurrentIndex(nextProduct);
        setDisplayIndex(nextProduct);
        setDisplayColor(pickColor(nextProduct));
      }, GLITCH_DURATION * 500);

      // End glitch
      setTimeout(() => {
        setGlitch(0);
        setOpacity(1);
      }, GLITCH_DURATION * 1000);

      timeout = setTimeout(cycle, CYCLE_INTERVAL);
    };

    timeout = setTimeout(cycle, CYCLE_INTERVAL);
    return () => clearTimeout(timeout);
  }, [currentIndex, productAllowedColors]);

  return (
    <>
      <ambientLight intensity={0.9} />
      <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={0.6} />
      <Environment preset="city" />
      <group position={[0, -0.5, 0]}>
        <GlitchModel
          productIndex={displayIndex}
          color={displayColor}
          glitchAmount={glitch}
          opacity={opacity}
        />
      </group>
    </>
  );
};

const Hero3DCarousel = ({ productAllowedColors }: HeroCarouselConfig) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <HeroCarouselScene productAllowedColors={productAllowedColors} />
        </Suspense>
      </Canvas>
    </div>
  );
};

PRODUCTS.forEach((p) => useGLTF.preload(p.url));

export default Hero3DCarousel;
