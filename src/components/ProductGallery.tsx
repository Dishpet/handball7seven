import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ProductGalleryImage {
  src: string;
  alt?: string;
}

interface ProductGalleryProps {
  images: ProductGalleryImage[];
  label?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, label = 'Gallery' }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const openLightbox = useCallback((idx: number) => setLightboxIndex(idx), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    setLightboxIndex(prev => (prev !== null ? (prev + 1) % images.length : null));
  }, [images.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex(prev => (prev !== null ? (prev - 1 + images.length) % images.length : null));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [lightboxIndex]);

  if (!images.length) return null;

  return (
    <>
      {/* Thumbnail strip */}
      <div className="w-full">
        <p className="text-[10px] md:text-xs font-display uppercase tracking-widest text-white/50 mb-2 px-1">
          {label}
        </p>
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto w-full custom-scrollbar touch-pan-x pb-1"
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => openLightbox(idx)}
              className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0 border-2 border-transparent overflow-hidden bg-background/10 transition-all transform hover:scale-105 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <img
                src={img.src}
                alt={img.alt || `Photo ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 z-10 text-white/50 text-sm font-display tracking-widest">
              {lightboxIndex + 1} / {images.length}
            </div>

            {/* Previous */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 p-2 text-white/60 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 p-2 text-white/60 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt || `Photo ${lightboxIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain select-none"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />

            {/* Thumbnail strip in lightbox */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
              <div className="flex gap-1.5 overflow-x-auto max-w-[90vw] custom-scrollbar touch-pan-x pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                    className={`w-12 h-12 md:w-16 md:h-16 flex-shrink-0 overflow-hidden transition-all border-2 ${
                      idx === lightboxIndex
                        ? 'border-white ring-1 ring-white/40 scale-105'
                        : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt || `Thumb ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductGallery;
