import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Model URL to product type mapping
const MODEL_CONFIG: Record<string, { scale: number; yOffset: number }> = {
  '/models/tshirt_webshop.glb': { scale: 3.5, yOffset: -1.2 },
  '/models/hoodie-webshop.glb': { scale: 3.2, yOffset: -1.2 },
  '/models/cap_webshop.glb': { scale: 0.8, yOffset: 0.2 },
  '/models/bottle-webshop.glb': { scale: 7, yOffset: -0.5 },
};

const RotatingModel = ({ modelUrl }: { modelUrl: string }) => {
  const { scene } = useGLTF(modelUrl);
  const groupRef = useRef<THREE.Group>(null);
  const config = MODEL_CONFIG[modelUrl] || { scale: 3, yOffset: 0 };

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        const name = m.name.toLowerCase();
        if (!name.includes('print')) {
          if (m.material) {
            const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial;
            m.material = mat.clone();
            (m.material as THREE.MeshStandardMaterial).color.set('#231f20');
            (m.material as THREE.MeshStandardMaterial).roughness = 0.85;
            (m.material as THREE.MeshStandardMaterial).metalness = 0.05;
          }
        } else {
          // Hide print areas for clean look
          m.visible = false;
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef} scale={config.scale} position={[0, config.yOffset, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
};

interface Product3DCardProps {
  name: string;
  price: number;
  modelUrl: string;
  slug: string;
  badge?: string | null;
  index?: number;
}

export const Product3DCard = ({ name, price, modelUrl, slug, badge, index = 0 }: Product3DCardProps) => {
  const badgeClass = badge === 'new' ? 'badge-new'
    : badge === 'bestseller' ? 'badge-bestseller'
    : badge === 'vintage' ? 'badge-vintage' : '';

  return (
    <Link to={`/shop?product=${slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted border border-border hover:border-primary/30 transition-all duration-300">
        <Canvas camera={{ position: [0, 0, 6], fov: 35 }} dpr={[1, 1.5]} gl={{ alpha: true }} style={{ background: 'transparent' }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={0.6} />
            <Environment preset="city" />
            <RotatingModel modelUrl={modelUrl} />
          </Suspense>
        </Canvas>
        {badge && (
          <span className={`absolute top-3 left-3 ${badgeClass}`}>
            {badge === 'new' ? 'New' : badge === 'bestseller' ? 'Best Seller' : 'Vintage'}
          </span>
        )}
      </div>
      <div className="pt-4">
        <h3 className="font-display uppercase text-sm tracking-wider">{name}</h3>
        <p className="text-muted-foreground text-sm mt-1 font-body">€{price.toFixed(2)}</p>
      </div>
    </Link>
  );
};

export const Product3DGrid = ({ items, columns = 4 }: { items: Product3DCardProps[]; columns?: number }) => {
  const colClass = columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  return (
    <div className={`grid ${colClass} gap-5 md:gap-8`}>
      {items.map((product, i) => (
        <motion.div
          key={product.slug}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <Product3DCard {...product} index={i} />
        </motion.div>
      ))}
    </div>
  );
};

// Tiny inline thumbnail for admin tables
export const Product3DThumbnail = ({ modelUrl }: { modelUrl: string }) => {
  return (
    <div className="w-12 h-12 overflow-hidden bg-white/10">
      <Canvas camera={{ position: [0, 0, 6], fov: 35 }} dpr={[1, 1]} gl={{ alpha: true }} style={{ background: 'transparent' }}>
        <Suspense fallback={null}>
          <ambientLight intensity={1} />
          <Environment preset="city" />
          <RotatingModel modelUrl={modelUrl} />
        </Suspense>
      </Canvas>
    </div>
  );
};

// Preload all models
['/models/hoodie-webshop.glb', '/models/cap_webshop.glb', '/models/tshirt_webshop.glb', '/models/bottle-webshop.glb'].forEach(url => useGLTF.preload(url));
