import { Hero } from "@/components/site/Hero";
import { MenuSection } from "@/components/site/MenuSection";
import { WhyChooseUs } from "@/components/site/BestSellers";
import { GallerySection } from "@/components/site/GallerySection";
import { AboutSection } from "@/components/site/AboutSection";
import { ReviewsSection } from "@/components/site/ReviewsSection";
import { ContactSection } from "@/components/site/ContactSection";
import { FAQSection } from "@/components/site/FAQSection";
import { OfferTicker } from "@/components/site/Floating";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useHashScroll } from "@/hooks/use-hash-scroll";

export default function HomePage() {
  const { ref } = useScrollReveal();
  useHashScroll();

  return (
    <div ref={ref} className="bg-atmosphere min-h-screen text-foreground">
      <main>
        <Hero />
        <OfferTicker />
        <MenuSection />
        <WhyChooseUs />
        <GallerySection />
        <AboutSection />
        <ReviewsSection />
        <FAQSection />
        <ContactSection />
      </main>
    </div>
  );
}
