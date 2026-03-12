import React, { Suspense, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';

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
  transitionProgress: number; // 0 = fully visible, 1 = fully glitched out
}

const HeroModel = ({ product, color, frontDesignUrl, backDesignUrl, transitionProgress }: HeroModelProps) => {
  const { scene } = useGLTF(product.url);
  const groupRef = useRef<THREE.Group>(null);
  const bodyMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const frontMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const backMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Load textures
  const frontTex = useTexture(frontDesignUrl || TRANSPARENT_PIXEL) as THREE.Texture;
  const backTex = useTexture(backDesignUrl || TRANSPARENT_PIXEL) as THREE.Texture;

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    bodyMatsRef.current = [];
    frontMatsRef.current = [];
    backMatsRef.current = [];

    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const m = child as THREE.Mesh;
      const name = m.name.toLowerCase();
      const isPrint = name.includes('print');

      if (!isPrint) {
        // Body material
        const processMat = (mat: THREE.Material) => {
          const std = (mat as THREE.MeshStandardMaterial).clone();
          const matName = std.name.toLowerCase();
          if (matName.includes('blackring')) {
            std.color.set('#000000');
            std.roughness = 0.5;
            std.metalness = 0;
          } else {
            std.color.set(color);
            std.map = null;
            std.roughness = 0.85;
            std.metalness = 0.05;
          }
          std.transparent = true;
          std.opacity = 1;
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

  // Transition opacity + glitch effect
  useEffect(() => {
    const opacity = 1 - transitionProgress;
    bodyMatsRef.current.forEach(mat => { mat.opacity = opacity; });
    frontMatsRef.current.forEach(mat => { mat.opacity = opacity; });
    backMatsRef.current.forEach(mat => { mat.opacity = opacity; });
  }, [transitionProgress]);

  // Rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
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
  const [transition, setTransition] = useState(0); // 0=showing current, 1=fully transitioned
  const transitionRef = useRef(0);
  const isTransitioning = useRef(false);
  const nextProductIdx = useRef(1);

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = nextProductIdx.current;
      nextProductIdx.current = (idx + 1) % PRODUCTS.length;
      const nextState = pickForProduct(idx);
      setNext(nextState);
      isTransitioning.current = true;
      transitionRef.current = 0;

      // Fade out current
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
        {/* Current product fading out */}
        <Suspense fallback={null}>
          <HeroModel
            product={PRODUCTS[current.productIndex]}
            color={current.color}
            frontDesignUrl={current.frontDesign || TRANSPARENT_PIXEL}
            backDesignUrl={current.backDesign || TRANSPARENT_PIXEL}
            transitionProgress={next ? transition : 0}
          />
        </Suspense>
        {/* Next product fading in */}
        {next && (
          <Suspense fallback={null}>
            <HeroModel
              product={PRODUCTS[next.productIndex]}
              color={next.color}
              frontDesignUrl={next.frontDesign || TRANSPARENT_PIXEL}
              backDesignUrl={next.backDesign || TRANSPARENT_PIXEL}
              transitionProgress={1 - transition}
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
