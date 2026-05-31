import chef from "@/assets/gallery-chef.png";
import interior from "@/assets/gallery-interior.png";

const STATS = [
  { v: "5+", l: "Years of mastery" },
  { v: "5K+", l: "Happy customers" },
  { v: "100%", l: "Fresh & hygienic" },
  { v: "15 min", l: "Avg. service" },
];

export function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-24 py-6 md:py-16" aria-label="About Us">
      <div className="mx-auto grid max-w-7xl gap-8 md:gap-10 px-4 md:grid-cols-2 md:items-center">
        {/* Bento gallery */}
        <div className="relative grid grid-cols-2 gap-3">
          <div className="overflow-hidden rounded-[2rem] shadow-pop row-span-2 aspect-[3/4]">
            <img src={chef} alt="Tawa Shawarma Chef slicing fresh shawarma" className="h-full w-full object-cover" loading="lazy" width={400} height={533} />
          </div>
          <div className="overflow-hidden rounded-3xl shadow-soft aspect-square">
            <img src={interior} alt="Tawa Shawarma restaurant interior in Nanded" className="h-full w-full object-cover" loading="lazy" width={400} height={400} />
          </div>
          <div className="rounded-3xl gradient-primary p-5 text-white shadow-pop aspect-square flex flex-col justify-between">
            <span className="text-3xl">🌯</span>
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-xs uppercase tracking-widest">Fresh, made to order</div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 inline-block rounded-full bg-gold/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber">
            About Tawa Shawarma
          </div>
          <h2 className="text-4xl font-semibold md:text-5xl">
            Crafted with <span className="text-gradient-primary italic">passion</span>,
            served with <span className="text-gradient-gold italic">love</span>
          </h2>
          <p className="mt-5 text-foreground/70">
            Tawa Shawarma was created with a simple mission — serve fresh, delicious and affordable food with consistent quality.
          </p>
          <p className="mt-3 text-foreground/60">
            Located at Necklace Road, Barkat Complex, Nanded, we focus on fresh ingredients, authentic flavors, hygienic preparation and customer satisfaction.
          </p>
          <p className="mt-3 text-foreground/60">
            From shawarmas and burgers to sandwiches, pizza and fries, every item is prepared with care to deliver a memorable food experience.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {STATS.map((s) => (
              <div key={s.l} className="rounded-2xl bg-white px-4 py-5 shadow-soft">
                <div className="text-3xl font-bold text-gradient-primary">{s.v}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-foreground/55">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
