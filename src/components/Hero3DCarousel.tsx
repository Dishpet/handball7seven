import React, { Suspense, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Products that DON'T color-cycle should keep their original texture map
const NO_COLOR_CYCLE = new Set(['cap']);

const PRODUCTS = [
  { id: 'tshirt' as const, url: '/models/tshirt_webshop.glb', scale: 5.5, yOffset: -1.2 },
  { id: 'hoodie' as const, url: '/models/hoodie-webshop.glb', scale: 5.0, yOffset: -1.2 },
  { id: 'cap' as const, url: '/models/cap_webshop.glb', scale: 1.2, yOffset: 0.5 },
  { id: 'bottle' as const, url: '/models/bottle-webshop.glb', scale: 12.0, yOffset: -0.2 },
];

const CYCLE_INTERVAL = 4500;
const TRANSITION_MS = 400;
const TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// Texture UV config per product (matching ShopScene exactly)
const getTextureConfig = (productId: string, zone: 'front' | 'back') => {
  if (zone === 'front') {
    switch (productId) {
      case 'hoodie': return { flipY: false, wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping, repeat: [24.4, 24.4], offset: [0.21, -0.37] };
      case 'cap': return { flipY: false, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping, repeat: [7.28, 7.28], offset: [0, 0.78] };
      case 'tshirt': return { flipY: true, wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping, repeat: [3.4, -3.4], offset: [-1.05, 3.0] };
      case 'bottle': return { flipY: false, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping, repeat: [6.25, 6.25], offset: [-0.3, 0.18] };
      default: return { flipY: true, wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping, repeat: [-1, 1], offset: [0, 0] };
    }
  } else {
    switch (productId) {
      case 'hoodie': return { flipY: false, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping, repeat: [-7.26, 7.26], offset: [-0.28, 1.90] };
      case 'tshirt': return { flipY: false, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping, repeat: [5.31, 5.31], offset: [-0.25, 0.15] };
      default: return { flipY: false, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping, repeat: [-1, 1], offset: [0, 0] };
    }
  }
};

const applyTextureConfig = (tex: THREE.Texture, productId: string, zone: 'front' | 'back') => {
  const cfg = getTextureConfig(productId, zone);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.center.set(0.5, 0.5);
  tex.flipY = cfg.flipY;
  tex.wrapS = cfg.wrapS;
  tex.wrapT = cfg.wrapT;
  tex.repeat.set(cfg.repeat[0], cfg.repeat[1]);
  tex.offset.set(cfg.offset[0], cfg.offset[1]);
  tex.needsUpdate = true;
};

interface HeroModelProps {
  product: typeof PRODUCTS[number];
  color: string;
  frontDesignUrl: string;
  backDesignUrl: string;
  transitionProgress: number;
  rotationRef: React.MutableRefObject<number>;
  isPrimary?: boolean; // only primary model advances the shared rotation
}

const HeroModel = ({ product, color, frontDesignUrl, backDesignUrl, transitionProgress, rotationRef, isPrimary = false }: HeroModelProps) => {
  const { scene } = useGLTF(product.url);
  const groupRef = useRef<THREE.Group>(null);
  const bodyMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const frontMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const backMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const glitchUniformsRef = useRef<{ uGlitch: { value: number }; uTime: { value: number }; uOpacity: { value: number } }[]>([]);
  const timeRef = useRef(0);

  // Load textures
  const frontTex = useTexture(frontDesignUrl || TRANSPARENT_PIXEL) as THREE.Texture;
  const backTex = useTexture(backDesignUrl || TRANSPARENT_PIXEL) as THREE.Texture;

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    bodyMatsRef.current = [];
    frontMatsRef.current = [];
    backMatsRef.current = [];
    glitchUniformsRef.current = [];

    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const m = child as THREE.Mesh;
      const name = m.name.toLowerCase();
      const isPrint = name.includes('print');

      if (!isPrint) {
        // Body material with glitch shader injection
        const processMat = (mat: THREE.Material) => {
          const std = (mat as THREE.MeshStandardMaterial).clone();
          const matName = std.name.toLowerCase();
          if (matName.includes('blackring')) {
            std.color.set('#000000');
            std.roughness = 0.5;
            std.metalness = 0;
          } else if (NO_COLOR_CYCLE.has(product.id)) {
            // Cap etc: keep original texture, just set color
            std.color.set(color);
            std.roughness = 0.85;
            std.metalness = 0.05;
          } else {
            std.color.set(color);
            std.map = null;
            std.roughness = 0.85;
            std.metalness = 0.05;
          }
          std.transparent = true;
          std.opacity = 1;

          // Inject glitch shader via onBeforeCompile
          const uniforms = {
            uGlitch: { value: 0 },
            uTime: { value: 0 },
            uOpacity: { value: 1 },
          };
          glitchUniformsRef.current.push(uniforms);

          std.onBeforeCompile = (shader) => {
            shader.uniforms.uGlitch = uniforms.uGlitch;
            shader.uniforms.uTime = uniforms.uTime;
            shader.uniforms.uOpacity = uniforms.uOpacity;

            // Vertex: subtle slice displacement
            shader.vertexShader = shader.vertexShader.replace(
              '#include <common>',
              `#include <common>
              uniform float uGlitch;
              uniform float uTime;
              float heroRand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }`
            );
            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
              `#include <begin_vertex>
              if (uGlitch > 0.01) {
                float sliceY = floor(transformed.z * 12.0 + uTime * 15.0);
                float sr = heroRand(vec2(sliceY, uTime * 2.0));
                if (sr > 0.85) {
                  transformed.x += (sr - 0.85) * 0.8 * uGlitch * sin(uTime * 30.0);
                }
                transformed.y += sin(transformed.z * 20.0 + uTime * 10.0) * 0.005 * uGlitch;
              }`
            );

            // Fragment: RGB split, scanlines, fresnel glow
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <common>',
              `#include <common>
              uniform float uGlitch;
              uniform float uTime;
              uniform float uOpacity;`
            );
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <dithering_fragment>',
              `#include <dithering_fragment>
              if (uGlitch > 0.01) {
                float shift = uGlitch * 0.05;
                gl_FragColor.r += shift;
                gl_FragColor.b -= shift;
                float scanline = sin(gl_FragCoord.y * 1.5 + uTime * 8.0) * 0.5 + 0.5;
                scanline = pow(scanline, 12.0) * uGlitch * 0.12;
                gl_FragColor.rgb += vec3(scanline);
                gl_FragColor.rgb += vec3(0.15, 0.5, 0.9) * pow(1.0 - abs(dot(vec3(0.0, 0.0, 1.0), vec3(0.0, 0.0, 1.0))), 2.0) * uGlitch * 0.15;
              }
              gl_FragColor.a *= uOpacity;`
            );

            std.userData.shader = shader;
          };

          std.needsUpdate = true;
          bodyMatsRef.current.push(std);
          return std;
        };
        if (Array.isArray(m.material)) {
          m.material = m.material.map(processMat);
        } else if (m.material) {
          m.material = processMat(m.material);
        }
      } else {
        // Print area
        m.visible = true;
        m.renderOrder = 1;
        const isBack = name.includes('back');
        const mat = (m.material as THREE.MeshStandardMaterial).clone();
        mat.color.set('#ffffff');
        mat.transparent = true;
        mat.opacity = 1;
        mat.toneMapped = false;
        mat.roughness = 1;
        mat.metalness = 0;
        mat.polygonOffset = true;
        mat.polygonOffsetFactor = -1;
        mat.polygonOffsetUnits = -1;
        mat.depthWrite = false;
        mat.needsUpdate = true;
        m.material = mat;

        if (isBack) {
          backMatsRef.current.push(mat);
        } else {
          frontMatsRef.current.push(mat);
        }
      }
    });
    return clone;
  }, [scene, product.id]);

  // Apply color changes
  useEffect(() => {
    bodyMatsRef.current.forEach(mat => {
      if (!mat.name.toLowerCase().includes('blackring')) {
        mat.color.set(color);
        mat.needsUpdate = true;
      }
    });
  }, [color]);

  // Apply front texture
  useEffect(() => {
    const tex = frontTex.clone();
    applyTextureConfig(tex, product.id, 'front');
    frontMatsRef.current.forEach(mat => {
      mat.map = tex;
      mat.visible = frontDesignUrl !== TRANSPARENT_PIXEL && !!frontDesignUrl;
      mat.needsUpdate = true;
    });
  }, [frontTex, product.id, frontDesignUrl]);

  // Apply back texture
  useEffect(() => {
    const tex = backTex.clone();
    applyTextureConfig(tex, product.id, 'back');
    backMatsRef.current.forEach(mat => {
      mat.map = tex;
      mat.visible = backDesignUrl !== TRANSPARENT_PIXEL && !!backDesignUrl;
      mat.needsUpdate = true;
    });
  }, [backTex, product.id, backDesignUrl]);

  // Animate glitch + opacity in useFrame
  useFrame((_, delta) => {
    timeRef.current += delta;

    // Update shared rotation
    rotationRef.current += delta * 0.4;
    if (groupRef.current) {
      groupRef.current.rotation.y = rotationRef.current;
    }

    // Drive glitch uniforms from transitionProgress
    const opacity = 1 - transitionProgress;
    glitchUniformsRef.current.forEach(u => {
      u.uGlitch.value = transitionProgress;
      u.uTime.value = timeRef.current;
      u.uOpacity.value = opacity;
    });

    // Also fade print area opacity
    frontMatsRef.current.forEach(mat => { mat.opacity = opacity; });
    backMatsRef.current.forEach(mat => { mat.opacity = opacity; });
  });

  return (
    <group ref={groupRef} scale={product.scale} position={[0, product.yOffset, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
};

export interface HeroCarouselConfig {
  productAllowedColors?: Record<string, string[]>;
  frontDesigns?: Record<string, string[]>; // per product id
  backDesigns?: Record<string, string[]>;  // per product id
  colorToLogoMap?: Record<string, string>;
}

interface CycleState {
  productIndex: number;
  color: string;
  frontDesign: string;
  backDesign: string;
}

const HeroCarouselScene = ({ productAllowedColors, frontDesigns, backDesigns, colorToLogoMap }: HeroCarouselConfig) => {
  const pickForProduct = useCallback((productIdx: number): CycleState => {
    const product = PRODUCTS[productIdx];
    const pid = product.id;

    // Pick color
    const allowed = productAllowedColors?.[pid];
    const color = allowed && allowed.length > 0
      ? allowed[Math.floor(Math.random() * allowed.length)]
      : '#231f20';

    // Pick front design
    const fList = frontDesigns?.[pid] || [];
    let frontDesign = fList.length > 0 ? fList[Math.floor(Math.random() * fList.length)] : '';

    // For hoodie/tshirt: front is always the logo matched to color
    if ((pid === 'hoodie' || pid === 'tshirt') && colorToLogoMap) {
      frontDesign = colorToLogoMap[color] || frontDesign;
    }

    // Pick back design
    const bList = backDesigns?.[pid] || [];
    const backDesign = bList.length > 0 ? bList[Math.floor(Math.random() * bList.length)] : '';

    return { productIndex: productIdx, color, frontDesign, backDesign };
  }, [productAllowedColors, frontDesigns, backDesigns, colorToLogoMap]);

  const [current, setCurrent] = useState<CycleState>(() => pickForProduct(0));
  const [next, setNext] = useState<CycleState | null>(null);
  const [transition, setTransition] = useState(0);
  const transitionRef = useRef(0);
  const isTransitioning = useRef(false);
  const nextProductIdx = useRef(1);
  const sharedRotation = useRef(0); // shared rotation for seamless handoff

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = nextProductIdx.current;
      nextProductIdx.current = (idx + 1) % PRODUCTS.length;
      const nextState = pickForProduct(idx);
      setNext(nextState);
      isTransitioning.current = true;
      transitionRef.current = 0;

      const fadeOut = setTimeout(() => {
        setCurrent(nextState);
        setNext(null);
        isTransitioning.current = false;
        transitionRef.current = 0;
        setTransition(0);
      }, TRANSITION_MS);

      return () => clearTimeout(fadeOut);
    }, CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, [pickForProduct]);

  // Animate transition
  useFrame((_, delta) => {
    if (isTransitioning.current) {
      transitionRef.current = Math.min(1, transitionRef.current + delta / (TRANSITION_MS / 1000));
      setTransition(transitionRef.current);
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={0.6} />
      <Environment preset="city" />
      <group position={[0, -0.5, 0]}>
        <Suspense fallback={null}>
          <HeroModel
            product={PRODUCTS[current.productIndex]}
            color={current.color}
            frontDesignUrl={current.frontDesign || TRANSPARENT_PIXEL}
            backDesignUrl={current.backDesign || TRANSPARENT_PIXEL}
            transitionProgress={next ? transition : 0}
            rotationRef={sharedRotation}
          />
        </Suspense>
        {next && (
          <Suspense fallback={null}>
            <HeroModel
              product={PRODUCTS[next.productIndex]}
              color={next.color}
              frontDesignUrl={next.frontDesign || TRANSPARENT_PIXEL}
              backDesignUrl={next.backDesign || TRANSPARENT_PIXEL}
              transitionProgress={1 - transition}
              rotationRef={sharedRotation}
            />
          </Suspense>
        )}
      </group>
    </>
  );
};

const Hero3DCarousel = ({ productAllowedColors, frontDesigns, backDesigns, colorToLogoMap }: HeroCarouselConfig) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <HeroCarouselScene
            productAllowedColors={productAllowedColors}
            frontDesigns={frontDesigns}
            backDesigns={backDesigns}
            colorToLogoMap={colorToLogoMap}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

PRODUCTS.forEach((p) => useGLTF.preload(p.url));

export default Hero3DCarousel;
