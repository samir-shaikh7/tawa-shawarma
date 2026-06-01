import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import { useSettings } from "@/lib/settings";

export function ContactSection() {
  const { settings } = useSettings();

  return (
    <section id="contact" className="scroll-mt-24 py-6 md:py-16" aria-label="Contact Us">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 md:mb-10 text-center">
          <div className="mb-3 inline-block rounded-full bg-gold/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber">
            Visit · Order · Connect
          </div>
          <h2 className="text-4xl font-semibold md:text-6xl">
            Hungry yet? <span className="text-gradient-primary italic">Reach out.</span>
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {[
              { icon: MapPin, title: "Our Restaurant", text: settings.address },
              { icon: Phone, title: "Call us", text: settings.phone },
              { icon: Clock, title: "Opening Hours", text: settings.opening_hours },
              { icon: MessageCircle, title: "WhatsApp", text: "Chat with us to place an order" },
            ].map((c) => (
              <div key={c.title} className="flex items-start gap-4 rounded-2xl bg-white border border-black/5 p-5 shadow-soft">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl gradient-primary text-white shadow-soft">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-sm text-foreground/65">{c.text}</div>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\s/g, "")}?text=Hello,%20I%20would%20like%20to%20place%20an%20order`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3 font-semibold text-white btn-glow"
              >
                <MessageCircle className="h-4 w-4" /> Order via WhatsApp
              </a>
              <a
                href={`tel:${settings.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold shadow-soft hover:shadow-elegant transition"
              >
                <Phone className="h-4 w-4" /> Call
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] shadow-pop">
            <iframe
              title="Tawa Shawarma Location on Google Maps"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.4237198759556!2d77.3021943!3d19.1604167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd1d6a655555555%3A0x1234567890abcdef!2sBarkat%20Complex%2C%20Necklace%20Rd%2C%20Nanded!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              className="h-full min-h-80 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
