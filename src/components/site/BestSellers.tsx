import { Leaf, ChefHat, ShieldCheck, IndianRupee, Clock } from "lucide-react";
import { SITE } from "@/lib/menu-data";

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Leaf,
  ChefHat,
  ShieldCheck,
  IndianRupee,
  Clock,
};

export function WhyChooseUs() {
  const features = SITE.features || [];

  return (
    <section className="scroll-mt-24 py-6 md:py-16" aria-label="Why Choose Us">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 md:mb-12 text-center">
          <div className="mb-3 inline-block rounded-full bg-gold/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber">
            Why Choose Us
          </div>
          <h2 className="text-4xl font-semibold md:text-5xl">
            What makes us <span className="text-gradient-primary italic">different</span>
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((item) => {
            const Icon = ICON_MAP[item.icon] || Leaf;
            return (
              <article
                key={item.title}
                className="group rounded-3xl bg-white border border-black/5 p-5 shadow-card transition-all duration-500 hover:shadow-elegant hover:-translate-y-2"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold leading-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
