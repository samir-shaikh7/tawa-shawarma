import { useState, useMemo, useEffect } from "react";
import { Search, Star, Flame, Plus, Minus, Loader2 } from "lucide-react";
import { SITE as FALLBACK_SITE } from "@/lib/menu-data";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";

import wrapImg from "@/assets/gallery-wrap.png";
import burgerImg from "@/assets/gallery-burger.png";
import platterImg from "@/assets/gallery-platter.png";
import shawarmaImg from "@/assets/hero-shawarma.png";
import friesImg from "@/assets/gallery-grill.png";

const CATEGORY_IMAGES: Record<string, string> = {
  shawarma: wrapImg,
  "bun-shawarma": shawarmaImg,
  burgers: burgerImg,
  sandwiches: wrapImg,
  pizza: platterImg,
  fries: friesImg,
};

const CATEGORY_ICONS: Record<string, string> = {
  "Shawarma": "🌯",
  "Burgers": "🍔",
  "Sandwiches": "🥪",
  "Pizza": "🍕",
  "Fries": "🍟",
};

function MenuItemCard({ item, catId, whatsappNumber }: { item: any; catId: string; whatsappNumber: string }) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const variants = item.variants || [{ name: "Regular", price: item.price || 0 }];

  // Find fallback image key using category name (lowercase)
  const catKey = item.category_name?.toLowerCase() || catId;
  const imageToUse = item.image_url || CATEGORY_IMAGES[catKey] || wrapImg;

  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-black/5 shadow-card transition-all duration-500 hover:shadow-elegant ${item.is_out_of_stock ? 'opacity-60 grayscale' : ''}`}>
      {/* Image Header */}
      <div className="relative h-40 sm:h-48 w-full overflow-hidden">
        <img 
          src={imageToUse} 
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent via-transparent" />
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-charcoal shadow-sm sm:top-3 sm:right-3 sm:px-2.5 sm:text-xs">
          <Star className="h-3 w-3 fill-gold text-gold" />
          {item.rating || "4.9"}
        </div>
        
        {item.is_out_of_stock && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold px-4 py-2 rounded-full text-sm uppercase tracking-widest shadow-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 pt-1 sm:p-5 sm:pt-2">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h4 className="text-[15px] sm:text-lg font-bold uppercase leading-tight group-hover:text-amber transition-colors duration-300">
            {item.name}
          </h4>
          {/* Veg/Non-Veg Icon */}
          <div className="mt-0.5 shrink-0">
            {item.is_veg ? (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-3.5 sm:h-3.5">
                <rect x="0.5" y="0.5" width="15" height="15" stroke="#4CAF50" strokeWidth="1"/>
                <circle cx="8" cy="8" r="4" fill="#4CAF50"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-3.5 sm:h-3.5">
                <rect x="0.5" y="0.5" width="15" height="15" stroke="#E53935" strokeWidth="1"/>
                <circle cx="8" cy="8" r="4" fill="#E53935"/>
              </svg>
            )}
          </div>
        </div>

        <p className="mb-3 line-clamp-2 text-xs sm:text-[13px] leading-relaxed text-foreground/60">
          {item.description}
        </p>

        {/* Flame Icons */}
        <div className="mb-3 flex items-center gap-0.5 text-amber opacity-60">
          <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
          <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
          <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-transparent text-foreground/20 stroke-current" />
        </div>

        {/* Variants List */}
        <div className="mt-auto space-y-2 sm:space-y-3">
          {variants.length > 1 && !item.is_out_of_stock && (
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-foreground/40">
              Select Option
            </div>
          )}
          <div className="flex flex-col gap-2">
            {!item.is_out_of_stock && variants.map((v: any) => {
              const cartItem = items.find((i) => i.productId === item.id && i.variant === v.name);
              return (
                <div key={v.name} className="flex items-center justify-between rounded-xl sm:rounded-2xl border border-black/5 bg-white py-2 px-3 shadow-sm transition hover:border-amber/20 hover:shadow-soft">
                  <div>
                    <div className="text-xs font-bold text-foreground">{v.name}</div>
                    <div className="text-xs font-bold text-amber mt-0.5">₹ {formatPrice(v.price)}</div>
                  </div>
                  {cartItem ? (
                    <div className="flex items-center gap-3 sm:gap-4 rounded-full bg-gold/15 px-3 py-1 sm:px-4">
                      <button 
                        onClick={() => {
                          if (cartItem.quantity === 1) removeItem(item.id, v.name);
                          else updateQuantity(item.id, v.name, -1);
                        }}
                        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white shadow-sm text-amber transition hover:scale-110 active:scale-95"
                      >
                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <span className="w-6 text-center text-xs sm:text-sm font-bold text-amber">{cartItem.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, v.name, 1)}
                        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white shadow-sm text-amber transition hover:scale-110 active:scale-95"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        addItem({
                          productId: item.id,
                          name: item.name,
                          variant: v.name,
                          price: v.price,
                          quantity: 1,
                        });
                      }}
                      className="flex h-8 items-center justify-center gap-1 rounded-full bg-amber px-4 text-xs font-bold text-white shadow-soft transition hover:scale-[1.02] hover:bg-amber/90 active:scale-95 cursor-pointer sm:h-9 sm:px-5 sm:text-sm"
                    >
                      Add <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}

export function MenuSection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [active, setActive] = useState<string>("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState(FALLBACK_SITE.contact.whatsapp);

  useEffect(() => {
    async function fetchMenuData() {
      setLoading(true);
      try {
        const [catRes, itemRes, settingsRes] = await Promise.all([
          supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('menu_items').select('*, item_variants(*)').eq('is_active', true).order('sort_order'),
          supabase.from('settings').select('*').eq('key', 'business_info')
        ]);

        if (settingsRes.data && settingsRes.data.length > 0) {
          const businessInfo = settingsRes.data[0].value;
          if (businessInfo?.phone) setWhatsappNumber(businessInfo.phone);
        }

        if (catRes.data && itemRes.data) {
          const formattedCats = catRes.data.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            icon: CATEGORY_ICONS[cat.name] || "🍽️",
            items: itemRes.data
              .filter((item: any) => item.category_id === cat.id)
              .map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                image_url: item.image_url,
                is_veg: item.is_veg,
                is_out_of_stock: item.is_out_of_stock,
                category_name: cat.name,
                variants: item.item_variants
                  ?.filter((v: any) => v.is_active)
                  .sort((a: any, b: any) => a.price - b.price)
                  .map((v: any) => ({
                    name: v.name,
                    price: v.price
                  })) || []
              }))
          })).filter((cat: any) => cat.items.length > 0);

          setCategories(formattedCats);
          if (formattedCats.length > 0) setActive(formattedCats[0].id);
        }
      } catch (err) {
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMenuData();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!q) return categories;
    return categories.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item: any) =>
          item.name.toLowerCase().includes(q.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(q.toLowerCase()))
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [categories, q]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
    }
  };

  return (
    <section id="menu" className="relative bg-atmosphere scroll-mt-24 pb-10 md:pb-20" aria-label="Menu">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 md:py-16 text-center">
        <div className="mb-3 inline-block rounded-full bg-gold/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber">
          Full Menu
        </div>
        <h2 className="text-4xl font-semibold md:text-6xl">
          Everything <span className="text-gradient-primary italic">Delicious</span>
        </h2>

        <div className="relative mx-auto mt-6 md:mt-10 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search shawarma, burgers, pizza..."
            className="w-full rounded-full bg-white py-3.5 pl-11 pr-4 text-sm shadow-soft outline-none focus:ring-2 focus:ring-amber/40 md:py-4"
            aria-label="Search menu"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-amber" />
        </div>
      ) : (
        <>
          <div className="relative z-10 border-b border-white/10 pb-4 pt-2 md:py-6">
            <div className="mx-auto max-w-7xl px-4">
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3" role="tablist">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActive(c.id);
                      scrollToSection(c.id);
                    }}
                    role="tab"
                    aria-selected={active === c.id}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 md:px-5 md:py-2.5 md:text-sm ${
                      active === c.id
                        ? "gradient-primary text-white shadow-soft scale-105"
                        : "bg-white text-foreground/60 shadow-sm border border-black/5 hover:border-amber/30 hover:text-amber"
                    }`}
                  >
                    <span className="mr-1.5 md:mr-2">{c.icon}</span>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 md:mt-12 max-w-7xl px-4">
            <div className="space-y-10 md:space-y-16">
              {filteredCategories.map((cat) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  key={cat.id}
                  id={cat.id}
                  className="menu-section scroll-mt-24 transform-gpu"
                >
                  <div className="mb-6 flex items-center gap-4">
                    <h3 className="text-xl font-bold md:text-3xl">{cat.name}</h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-amber/20 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                    {cat.items.map((item: any) => (
                      <MenuItemCard 
                        key={item.id} 
                        item={item} 
                        catId={cat.id} 
                        whatsappNumber={whatsappNumber} 
                      />
                    ))}
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {filteredCategories.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-xl font-semibold">No dishes found</h3>
                    <p className="mt-2 text-foreground/55">Try searching for something else.</p>
                    <button onClick={() => setQ("")} className="mt-6 rounded-full bg-white px-6 py-2 shadow-soft hover:text-amber transition">
                      Clear Search
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
