import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { REVIEWS as FALLBACK_REVIEWS } from "@/lib/menu-data";

export function ReviewsSection() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    async function loadReviews() {
      try {
        const { data } = await supabase
          .from('reviews')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        
        if (data && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(FALLBACK_REVIEWS.map(r => ({ customer_name: r.name, comment: r.text, rating: r.rating })));
        }
      } catch (err) {
        setReviews(FALLBACK_REVIEWS.map(r => ({ customer_name: r.name, comment: r.text, rating: r.rating })));
      }
    }
    loadReviews();
  }, []);

  // Duplicate items for continuous marquee effect if there are only a few reviews
  const items = [...reviews, ...reviews, ...reviews].slice(0, 12);

  if (items.length === 0) return null;

  return (
    <section id="reviews" className="scroll-mt-24 overflow-hidden py-6 md:py-16" aria-label="Customer Reviews">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 md:mb-10 text-center">
          <div className="mb-3 inline-block rounded-full bg-gold/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber">
            Reviews
          </div>
          <h2 className="text-4xl font-semibold md:text-6xl">
            Loved by <span className="text-gradient-primary italic">thousands</span>
          </h2>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-foreground/70 shadow-soft">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" />
              ))}
            </div>
            4.9 average · 10,000+ reviews
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused] [will-change:transform]">
          {items.map((r, i) => (
            <article
              key={i}
              className="w-80 shrink-0 rounded-3xl bg-white border border-black/5 p-6 shadow-card transition-all duration-500 hover:shadow-elegant hover:scale-[1.02]"
            >
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: r.rating || 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80 italic">"{r.comment}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white shadow-soft">
                  {(r.customer_name || "A").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold">{r.customer_name}</div>
                  <div className="text-[11px] text-foreground/55">Verified Customer</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
