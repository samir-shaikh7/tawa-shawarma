import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const FAQS = [
  {
    q: "What type of food does Tawa Shawarma serve?",
    a: "We specialize in premium shawarma wraps, bun shawarma, chicken burgers, sandwiches, pizza, and fries. Everything is made fresh to order."
  },
  {
    q: "Do you deliver in Nanded?",
    a: "Yes! We deliver across Nanded. You can order directly via WhatsApp for the fastest service."
  },
  {
    q: "Are your ingredients fresh?",
    a: "Absolutely. We use only fresh, never-frozen ingredients. Our chicken is marinated daily with our signature spice blend."
  },
  {
    q: "How can I place an order?",
    a: "The easiest way is via WhatsApp! Just click the 'Order on WhatsApp' button on our website, browse the menu, and send us your order. We'll confirm and have it ready."
  },
  {
    q: "Where is Tawa Shawarma located?",
    a: "We are located at Necklace Road, Barkat Complex in Nanded. Feel free to dine-in or takeaway!"
  }
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="scroll-mt-24 py-6 md:py-16 bg-white/50" aria-label="Frequently Asked Questions">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6 md:mb-12 text-center">
          <div className="mb-3 inline-block rounded-full bg-gold/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber">
            Got Questions?
          </div>
          <h2 className="text-4xl font-semibold md:text-5xl">
            Frequently Asked <span className="text-gradient-primary italic">Questions</span>
          </h2>
          <p className="mt-4 text-foreground/60">
            Everything you need to know about Tawa Shawarma Nanded.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="group rounded-3xl bg-white p-2 shadow-sm transition-all duration-300 hover:shadow-soft"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between p-4 text-left"
                aria-expanded={open === i}
              >
                <span className="font-bold text-foreground/80 md:text-lg">{faq.q}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${open === i ? "gradient-primary text-white rotate-180" : "bg-muted text-foreground/30"}`}>
                  {open === i ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
              </button>
              {open === i && (
                <div className="p-4 pt-0 text-foreground/60 leading-relaxed animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": FAQS.map((f) => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": f.a,
                },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
}
