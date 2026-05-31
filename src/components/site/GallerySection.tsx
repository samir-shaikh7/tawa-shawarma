import { useState } from "react";
import platter from "@/assets/gallery-platter.png";
import wrap from "@/assets/gallery-wrap.png";
import chef from "@/assets/gallery-chef.png";
import interior from "@/assets/gallery-interior.png";
import grill from "@/assets/gallery-grill.png";
import burger from "@/assets/gallery-burger.png";
import drinks from "@/assets/gallery-drinks.png";
import hero from "@/assets/hero-shawarma.png";
import { X } from "lucide-react";

const IMAGES = [
  { src: platter, alt: "Premium shawarma platter with hummus and salad" },
  { src: wrap, alt: "Fresh chicken shawarma wrap cut in half" },
  { src: chef, alt: "Chef slicing shawarma from rotisserie" },
  { src: grill, alt: "Marinated chicken grilling on charcoal" },
];

export function GallerySection() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section id="gallery" className="scroll-mt-24 py-6 md:py-16" aria-label="Gallery">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 md:mb-10 text-center">
          <div className="mb-3 inline-block rounded-full bg-gold/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber">
            Gallery
          </div>
          <h2 className="text-4xl font-semibold md:text-6xl">
            A taste of our <span className="text-gradient-primary italic">kitchen</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {IMAGES.map((img, i) => (
            <figure
              key={i}
              className="group relative overflow-hidden rounded-3xl shadow-card transition-all duration-500 hover:shadow-elegant cursor-pointer aspect-square"
              onClick={() => setLightbox(i)}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110 group-hover:brightness-90"
                loading="lazy"
                decoding="async"
                width={400}
                height={400}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <figcaption className="absolute bottom-0 left-0 right-0 translate-y-4 p-5 text-sm font-semibold text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="flex items-center gap-2">
                  <span className="h-px w-4 bg-gold" />
                  {img.alt}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={IMAGES[lightbox].src}
            alt={IMAGES[lightbox].alt}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
