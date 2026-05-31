import { useState } from "react";
import hero from "@/assets/hero-shawarma.png";
import { ArrowRight, Sparkles, Star, Clock, MessageCircle } from "lucide-react";
import { useSettings } from "@/lib/settings";

export function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { settings } = useSettings();

  return (
    <section id="home" className="relative w-full overflow-hidden pt-24 pb-10 md:pt-32 md:pb-24" aria-label="Hero">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-[300px] w-[300px] sm:h-[420px] sm:w-[420px] rounded-full bg-gold/15 blur-3xl animate-blob" />
        <div className="absolute top-20 right-0 h-[250px] w-[250px] sm:h-[380px] sm:w-[380px] rounded-full bg-amber/10 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <div className="mb-4 inline-flex animate-fade-in items-center gap-2 rounded-full glass px-3 py-1 text-[10px] sm:text-xs font-semibold tracking-wide text-amber shadow-soft">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Always Fresh & Delicious
          </div>

          <h1 className="animate-fade-up max-w-4xl text-balance text-4xl sm:text-5xl font-black leading-[1.05] md:text-6xl lg:text-[5.4rem]">
            <span className="inline-block animate-fade-up stagger-1">{settings.name.split(' ')[0]}</span>{" "}
            <span className="text-gradient-primary italic inline-block animate-fade-up stagger-2">{settings.name.substring(settings.name.indexOf(' ') + 1)}</span>{" "}
            <span className="inline-block animate-fade-up stagger-3">Made</span><br />
            <span className="inline-block animate-fade-up stagger-4">Fresh</span>{" "}
            <span className="text-gradient-gold inline-block animate-fade-up stagger-5">Every Day</span>.
          </h1>

          <p
            className="mt-4 sm:mt-6 max-w-xl animate-fade-up text-sm text-foreground/70 sm:text-base md:text-lg"
            style={{ animationDelay: "0.15s" }}
          >
            {settings.tagline || `Serving fresh shawarma, burgers, sandwiches, pizza and snacks in Nanded. Made with the freshest ingredients and authentic spices.`}
          </p>

          <div
            className="mt-6 flex animate-fade-up flex-wrap items-center gap-2 sm:gap-3 sm:mt-8"
            style={{ animationDelay: "0.3s" }}
          >
            <a
              href="#menu"
              className="group inline-flex items-center gap-2 rounded-full gradient-primary px-5 py-3 sm:px-7 sm:py-4 text-xs sm:text-sm font-semibold text-white btn-glow"
            >
              View Menu
              <ArrowRight className="h-3.5 w-3.5 transition duration-300 group-hover:translate-x-1.5" />
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\s/g, "")}?text=Hello,%20I%20would%20like%20to%20place%20an%20order`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 sm:px-7 sm:py-4 text-xs sm:text-sm font-semibold text-foreground shadow-soft btn-secondary"
            >
              <MessageCircle className="h-3.5 w-3.5 text-amber animate-glow" /> Order on WhatsApp
            </a>
          </div>

          <div
            className="mt-5 flex animate-fade-up flex-wrap items-center gap-2 text-[10px] sm:text-xs text-foreground/65 sm:mt-8"
            style={{ animationDelay: "0.45s" }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-soft transition-all hover:scale-105 hover:shadow-glow cursor-default">
              <Clock className="h-3 w-3 text-amber" /> {settings.opening_hours}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-soft transition-all hover:scale-105 hover:shadow-glow cursor-default">
              <Star className="h-3 w-3 fill-gold text-gold" /> 4.9 ★ · Loved by Nanded
            </span>
          </div>

          <div
            className="mt-6 grid w-full max-w-lg animate-fade-up grid-cols-3 gap-2 sm:gap-3 sm:mt-10"
            style={{ animationDelay: "0.6s" }}
          >
            {[
              { v: "5K+", l: "Happy Customers", d: "0.6s" },
              { v: "4.9★", l: "Avg. Rating", d: "0.7s" },
              { v: "₹60", l: "Starting Price", d: "0.8s" },
            ].map((s) => (
              <div key={s.l} className="animate-fade-up rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 text-center shadow-soft transition-all duration-500 hover:shadow-elegant hover:-translate-y-1.5" style={{ animationDelay: s.d }}>
                <div className="text-xl sm:text-2xl font-bold text-gradient-primary md:text-3xl">{s.v}</div>
                <div className="mt-1 text-[9px] uppercase tracking-wider text-foreground/55 md:text-[10px]">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-2 lg:col-span-5 lg:mt-0">
          <div className="relative mx-auto w-[240px] sm:w-full sm:max-w-[500px]">
            <div className="relative w-full overflow-hidden rounded-full bg-white shadow-pop ring-1 ring-white/10" style={{ aspectRatio: "1 / 1" }}>
              <div className={`h-full w-full animate-spin-slow transition-all duration-1000 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <img
                  src={hero}
                  alt="Fresh shawarma wrap served at Tawa Shawarma Nanded"
                  onLoad={() => setIsLoaded(true)}
                  className="h-full w-full object-cover"
                  width={520}
                  height={520}
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              {!isLoaded && (
                <div className="absolute inset-0 rounded-full bg-muted/20 animate-pulse" />
              )}
            </div>
            <div className="absolute -inset-4 -z-10 rounded-full bg-gradient-to-tr from-gold/30 via-amber/20 to-brown/20 blur-xl sm:blur-2xl opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
}
