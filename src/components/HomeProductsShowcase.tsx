import React, { useRef, useMemo, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { useShopConfig } from '@/hooks/useShopConfig';
import { useDesignCollections, resolveDesignVariant } from '@/hooks/useDesignCollections';

// Fallback design imports (used only if DB has no designs)
// @ts-ignore
const fallbackLogoDesigns = import.meta.glob('/src/assets/design-collections/logo/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
// @ts-ignore
const fallbackClassicDesigns = import.meta.glob('/src/assets/design-collections/classic/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });

const STATIC_FRONT_LOGO = (Object.values(fallbackLogoDesigns)[0] as string) || '';
const STATIC_BACK_DESIGN = (Object.values(fallbackClassicDesigns)[0] as string) || '';

// Transparent pixel fallback
const TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// Texture UV config per product (matching ShopScene/HeroCarousel exactly)
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

// Product base configurations
interface ProductDef {
  id: 'bottle' | 'tshirt' | 'hoodie' | 'cap';
  url: string;
  scale: number;
  yOffset: number;
  xPos: number;
  fromLeft: boolean;
  keepTextures: boolean;
  frontRotation: number;
  hasFrontPrint: boolean;
  hasBackPrint: boolean;
  showBack: boolean;
  backCollection?: 'classic' | 'vintage' | 'street';
  // Mobile overrides for 2x2 grid layout
  mobileXPos: number;
  mobileYOffset: number;
  mobileScale: number;
}

const PRODUCTS: ProductDef[] = [
  {
    id: 'bottle',
    url: '/models/bottle-webshop.glb',
    scale: 10.0,
    yOffset: 0.2,
    xPos: -4.2,
    fromLeft: true,
    keepTextures: false,
    frontRotation: 0,
    hasFrontPrint: true,
    hasBackPrint: false,
    showBack: false,
    // Mobile: bottom-left
    mobileXPos: -1.8,
    mobileYOffset: -2.2,
    mobileScale: 7.5,
  },
  {
    id: 'tshirt',
    url: '/models/tshirt_webshop.glb',
    scale: 4.5,
    yOffset: -1.0,
    xPos: -1.4,
    fromLeft: true,
    backCollection: 'vintage' as const,
    keepTextures: false,
    frontRotation: 0,
    hasFrontPrint: true,
    hasBackPrint: true,
    showBack: true,
    // Mobile: top-left
    mobileXPos: -1.8,
    mobileYOffset: 0.8,
    mobileScale: 3.2,
  },
  {
    id: 'hoodie',
    url: '/models/hoodie-webshop.glb',
    scale: 4.2,
    yOffset: -1.0,
    xPos: 1.4,
    fromLeft: false,
    backCollection: 'street' as const,
    keepTextures: false,
    frontRotation: 0,
    hasFrontPrint: true,
    hasBackPrint: true,
    showBack: true,
    // Mobile: bottom-right
    mobileXPos: 1.5,
    mobileYOffset: -1.8,
    mobileScale: 3.0,
  },
  {
    id: 'cap',
    url: '/models/cap_webshop.glb',
    scale: 1.0,
    yOffset: 0.8,
    xPos: 4.2,
    fromLeft: false,
    keepTextures: true,
    frontRotation: 0,
    hasFrontPrint: true,
    hasBackPrint: false,
    showBack: false,
    // Mobile: top-right
    mobileXPos: 2.2,
    mobileYOffset: 2.0,
    mobileScale: 0.8,
  },
];

// How many full rotations each product does while spinning in
const SPIN_REVOLUTIONS = 3;

// Context to share scroll progress with Three.js scene
const ScrollContext = React.createContext<{ progress: number }>({ progress: 0 });

interface SpinningProductProps {
  product: ProductDef;
  color: string;
  frontDesignUrl: string;
  backDesignUrl: string;
  isMobile: boolean;
}

const SpinningProduct = ({ product, color, frontDesignUrl, backDesignUrl, isMobile }: SpinningProductProps) => {
  const { scene } = useGLTF(product.url);
  const groupRef = useRef<THREE.Group>(null);
  const scrollCtx = React.useContext(ScrollContext);

  // Load design textures
  const frontTex = useTexture(frontDesignUrl || TRANSPARENT_PIXEL) as THREE.Texture;
  const backTex = useTexture(backDesignUrl || TRANSPARENT_PIXEL) as THREE.Texture;

  const clonedScene = useMemo(() => {
    const clone = scene.clone();

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
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
            } else if (product.keepTextures) {
              // Cap: keep original textures/maps, just tint color
              std.color.set(color);
              std.roughness = 0.85;
              std.metalness = 0.05;
            } else {
              // Strip texture for clean solid color
              std.color.set(color);
              std.map = null;
              std.roughness = 0.85;
              std.metalness = 0.05;
            }
            // Match HeroCarousel: alphaTest for materials with texture/alpha maps
            std.opacity = 1;
            std.transparent = false;
            std.depthWrite = true;
            std.alphaTest = (std.map || std.alphaMap) ? 0.5 : 0;
            std.needsUpdate = true;
            return std;
          };

          if (Array.isArray(m.material)) {
            m.material = m.material.map(processMat);
          } else if (m.material) {
            m.material = processMat(m.material);
          }
        } else {
          // Print area — set up material for texture application
          const isBack = name.includes('back');
          m.renderOrder = 1;

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
          mat.side = THREE.FrontSide; // Prevent design bleeding through back
          mat.alphaTest = 0.01;

          // Apply the design texture
          const hasFront = frontDesignUrl && frontDesignUrl !== TRANSPARENT_PIXEL;
          const hasBack = backDesignUrl && backDesignUrl !== TRANSPARENT_PIXEL;

          if (isBack && product.hasBackPrint && hasBack) {
            const tex = backTex.clone();
            applyTextureConfig(tex, product.id, 'back');
            mat.map = tex;
            m.visible = true;
          } else if (!isBack && product.hasFrontPrint && hasFront) {
            const tex = frontTex.clone();
            applyTextureConfig(tex, product.id, 'front');
            mat.map = tex;
            m.visible = true;
          } else {
            m.visible = false;
          }

          mat.needsUpdate = true;
          m.material = mat;
        }
      }
    });
    return clone;
  }, [scene, product.id, color, frontTex, backTex, frontDesignUrl, backDesignUrl]);

  // Calculate the final Y rotation
  const finalRotation = useMemo(() => {
    // Start from the model's known "front" rotation
    let rot = product.frontRotation;
    // If we want to show the back, add PI
    if (product.showBack) rot += Math.PI;
    return rot;
  }, [product]);

  useFrame(() => {
    if (!groupRef.current) return;
    const progress = scrollCtx.progress;

    // Clamp progress 0-1
    const p = Math.max(0, Math.min(1, progress));

    // Eased progress for smooth deceleration
    const eased = 1 - Math.pow(1 - p, 3);

    // Position depends on mobile vs desktop
    const targetX = isMobile ? product.mobileXPos : product.xPos;
    const targetY = isMobile ? product.mobileYOffset : product.yOffset;
    const targetScale = isMobile ? product.mobileScale : product.scale;

    // Spin: full revolutions that decelerate to the final rotation
    const totalSpin = SPIN_REVOLUTIONS * Math.PI * 2;
    const direction = product.fromLeft ? 1 : -1;
    const spinRemaining = direction * totalSpin * (1 - eased);
    groupRef.current.rotation.y = finalRotation + spinRemaining;

    // Slide in from off-screen
    const slideDistance = isMobile ? 5 : 8;
    const slideOffset = product.fromLeft ? -slideDistance : slideDistance;
    const xStart = targetX + slideOffset;
    const x = xStart + (targetX - xStart) * eased;
    groupRef.current.position.x = x;

    // Slight vertical bounce
    const bounce = Math.sin(eased * Math.PI) * 0.3;
    groupRef.current.position.y = targetY + bounce * (1 - eased);

    // Scale entrance
    const scale = targetScale * (0.3 + 0.7 * eased);
    groupRef.current.scale.setScalar(scale);

    // Opacity via material
    const opacity = Math.min(1, eased * 2);
    const isFading = opacity < 0.99;
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        const isPrintArea = m.name.toLowerCase().includes('print');
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        mats.forEach((mat) => {
          const std = mat as THREE.MeshStandardMaterial;
          if (isPrintArea) {
            std.transparent = true;
            std.opacity = opacity;
          } else {
            const nextTransparent = isFading;
            const nextAlphaTest = isFading ? 0 : ((std.map || std.alphaMap) ? 0.5 : 0);
            if (std.transparent !== nextTransparent || std.alphaTest !== nextAlphaTest) {
              std.transparent = nextTransparent;
              std.depthWrite = true;
              std.alphaTest = nextAlphaTest;
              std.needsUpdate = true;
            }
            std.opacity = isFading ? opacity : 1;
          }
        });
      }
    });
  });

  return (
    <group ref={groupRef} position={[product.xPos, product.yOffset, 0]} scale={product.scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

interface HomeSceneProps {
  scrollProgress: number;
  productColors: Record<string, string>;
  productFrontDesigns: Record<string, string>;
  productBackDesigns: Record<string, string>;
}

const HomeScene = ({ scrollProgress, productColors, productFrontDesigns, productBackDesigns }: HomeSceneProps) => {
  const { viewport } = useThree();
  const isMobile = viewport.width < 8; // roughly corresponds to ~768px screen width at fov 35

  return (
    <ScrollContext.Provider value={{ progress: scrollProgress }}>
      <ambientLight intensity={0.9} />
      <spotLight position={[5, 8, 5]} angle={0.35} penumbra={1} intensity={0.7} />
      <spotLight position={[-5, 5, 5]} angle={0.35} penumbra={1} intensity={0.4} />
      <Environment preset="city" />
      <group position={[0, isMobile ? 0 : -0.5, 0]}>
        <Suspense fallback={null}>
          {PRODUCTS.map((product) => (
            <SpinningProduct
              key={product.id}
              product={product}
              color={productColors[product.id] || '#231f20'}
              frontDesignUrl={productFrontDesigns[product.id] || TRANSPARENT_PIXEL}
              backDesignUrl={productBackDesigns[product.id] || TRANSPARENT_PIXEL}
              isMobile={isMobile}
            />
          ))}
        </Suspense>
      </group>
    </ScrollContext.Provider>
  );
};

const HomeProductsShowcase = () => {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Pull config from dashboard
  const { config: shopConfig } = useShopConfig();
  const { collections: dbDesignCollections } = useDesignCollections();

  // Resolve product colors from dashboard (first allowed color per product)
  const productColors = useMemo(() => ({
    bottle: shopConfig?.bottle?.allowed_colors?.[1] || '#ffffff',   // 2nd color (white) or fallback
    tshirt: shopConfig?.tshirt?.allowed_colors?.[3] || '#C8AD7F',  // 4th color (beige/tan) or fallback
    hoodie: shopConfig?.hoodie?.allowed_colors?.[2] || '#808080',  // 3rd color (grey) or fallback
    cap: shopConfig?.cap?.allowed_colors?.[0] || '#111111',        // 1st color (black) or fallback
  }), [shopConfig]);

  // Resolve front logo from dashboard (front_logo collection)
  const frontLogoUrl = useMemo(() => {
    const dbLogo = dbDesignCollections.front_logo?.[0];
    if (!dbLogo) return STATIC_FRONT_LOGO;
    // For each product, resolve design variant based on product color
    return dbLogo.url;
  }, [dbDesignCollections]);

  // Resolve front logo per product (light/dark variant based on color)
  const productFrontDesigns = useMemo(() => {
    const dbLogoAsset = dbDesignCollections.front_logo?.[0];
    const result: Record<string, string> = {};
    for (const product of PRODUCTS) {
      if (product.hasFrontPrint) {
        if (dbLogoAsset) {
          result[product.id] = resolveDesignVariant(dbLogoAsset, productColors[product.id]);
        } else {
          result[product.id] = STATIC_FRONT_LOGO;
        }
      }
    }
    return result;
  }, [dbDesignCollections, productColors]);

  // Resolve back design per product from their assigned collection
  const productBackDesigns = useMemo(() => {
    const result: Record<string, string> = {};
    for (const product of PRODUCTS) {
      if (product.hasBackPrint && product.backCollection) {
        const collection = dbDesignCollections[product.backCollection];
        const firstDesign = collection?.[0];
        if (firstDesign) {
          result[product.id] = resolveDesignVariant(firstDesign, productColors[product.id]);
        } else {
          result[product.id] = STATIC_BACK_DESIGN;
        }
      }
    }
    return result;
  }, [dbDesignCollections, productColors]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollProgress(latest);
  });

  return (
    <section ref={sectionRef} className="relative bg-background overflow-hidden">
      {/* Header */}
      <div className="px-5 md:px-12 lg:px-20 pt-12 md:pt-24 pb-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-xl sm:text-2xl md:text-4xl font-display uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-4"
        >
          {t("bestsellers.title")}
        </motion.h2>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh]">
        <Canvas
          camera={{ position: [0, 0, 12], fov: 35 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <HomeScene
              scrollProgress={scrollProgress}
              productColors={productColors}
              productFrontDesigns={productFrontDesigns}
              productBackDesigns={productBackDesigns}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Shop Now Button */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="pointer-events-auto"
        >
          <Link to="/shop">
            <Button
              size="lg"
              className="font-display uppercase tracking-[0.2em] text-sm md:text-base px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl border border-primary/20"
            >
              <ShoppingBag className="w-5 h-5 mr-3" />
              {t('hero.shop')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// Preload models
PRODUCTS.forEach((p) => useGLTF.preload(p.url));

export default HomeProductsShowcase;
