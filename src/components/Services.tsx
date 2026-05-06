import { Plane, Hotel, Car, FileCheck, Briefcase, LifeBuoy } from "lucide-react";

const services = [
  { icon: Plane, title: "Flight Bookings", desc: "Worldwide ticketing across major airlines and routes." },
  { icon: Hotel, title: "Hotel & Holiday Packages", desc: "Curated stays and full holiday packages." },
  { icon: Car, title: "Car Rentals", desc: "Reliable pick-up at airports and major cities." },
  { icon: FileCheck, title: "Visa Applications", desc: "Guided processing for tourist and business visas." },
  { icon: Briefcase, title: "Corporate Travel", desc: "Managed travel for organisations and teams." },
  { icon: LifeBuoy, title: "24/7 Support", desc: "Real assistance from booking to return." },
];

export const Services = () => {
  return (
    <section id="about" className="bg-surface py-16">
      <div className="container">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Travel services</h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Affordable, reliable, stress-free travel. Everything you need from a single travel partner.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-border ring-1 ring-border sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="bg-card p-6">
              <s.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-base font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
