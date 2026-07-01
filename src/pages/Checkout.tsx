import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { generateFlights, airportLabel } from "@/data/flights";
import { format, parseISO } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createBooking, generateReference } from "@/lib/bookings";

const Checkout = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const from = params.get("from") || "LUN";
  const to = params.get("to") || "JNB";
  const depart = params.get("depart") || format(new Date(), "yyyy-MM-dd");
  const cabin = params.get("cabin") || "Economy";
  const adults = parseInt(params.get("adults") || "1");
  const children = parseInt(params.get("children") || "0");
  const infants = parseInt(params.get("infants") || "0");
  const totalPax = adults + children + infants;
  const offerId = params.get("offer") || "";

  const offer = useMemo(() => generateFlights(from, to, depart, cabin).find((o) => o.id === offerId), [from, to, depart, cabin, offerId]);

  const [pax, setPax] = useState(
    Array.from({ length: totalPax }, (_, i) => ({
      type: i < adults ? "Adult" : i < adults + children ? "Child" : "Infant",
      title: "Mr",
      firstName: "",
      lastName: "",
      dob: "",
      passport: "",
      nationality: "",
    }))
  );
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [confirmed, setConfirmed] = useState<string | null>(null);

  if (!offer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <p className="text-muted-foreground">Offer not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-primary underline">Go back</button>
        </main>
      </div>
    );
  }

  const subtotal = offer.price * totalPax;
  const taxes = Math.round(subtotal * 0.18);
  const total = subtotal + taxes;

  const update = (i: number, k: string, v: string) =>
    setPax((p) => p.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.email || pax.some((p) => !p.firstName || !p.lastName)) {
      toast.error("Please complete all traveler details");
      return;
    }
    const ref = "LK" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setConfirmed(ref);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16">
          <div className="mx-auto max-w-2xl rounded-lg bg-card p-8 ring-1 ring-border">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Booking confirmed</h1>
                <p className="mt-1 text-sm text-muted-foreground">A confirmation email has been sent to {contact.email}.</p>
              </div>
            </div>
            <div className="mt-6 rounded-md bg-surface p-4 ring-1 ring-border">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Booking reference</div>
              <div className="mt-1 font-mono text-xl font-semibold text-foreground">{confirmed}</div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-muted-foreground">Route</dt><dd className="font-medium text-foreground">{airportLabel(from)} → {airportLabel(to)}</dd></div>
              <div><dt className="text-muted-foreground">Departure</dt><dd className="font-medium text-foreground">{format(parseISO(depart), "dd MMM yyyy")}</dd></div>
              <div><dt className="text-muted-foreground">Airline</dt><dd className="font-medium text-foreground">{offer.airline} {offer.code}</dd></div>
              <div><dt className="text-muted-foreground">Travelers</dt><dd className="font-medium text-foreground">{totalPax}</dd></div>
              <div><dt className="text-muted-foreground">Total paid</dt><dd className="font-semibold text-foreground">${total}</dd></div>
            </dl>
            <button onClick={() => navigate("/")} className="mt-8 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-[hsl(var(--primary-hover))]">Back to home</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-primary">← Back to results</button>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Complete your booking</h1>

        <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-lg bg-card p-6 ring-1 ring-border">
              <h2 className="text-base font-semibold text-foreground">Contact details</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Email" type="email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} required />
                <Input label="Phone" type="tel" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} required />
              </div>
            </section>

            {pax.map((p, i) => (
              <section key={i} className="rounded-lg bg-card p-6 ring-1 ring-border">
                <h2 className="text-base font-semibold text-foreground">Traveler {i + 1} <span className="text-sm font-normal text-muted-foreground">· {p.type}</span></h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Title</label>
                    <select value={p.title} onChange={(e) => update(i, "title", e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                      <option>Mr</option><option>Mrs</option><option>Ms</option><option>Dr</option>
                    </select>
                  </div>
                  <Input label="First name" value={p.firstName} onChange={(v) => update(i, "firstName", v)} required />
                  <Input label="Last name" value={p.lastName} onChange={(v) => update(i, "lastName", v)} required />
                  <Input label="Date of birth" type="date" value={p.dob} onChange={(v) => update(i, "dob", v)} required />
                  <Input label="Passport number" value={p.passport} onChange={(v) => update(i, "passport", v)} required />
                  <Input label="Nationality" value={p.nationality} onChange={(v) => update(i, "nationality", v)} required />
                </div>
              </section>
            ))}

            <section className="rounded-lg bg-card p-6 ring-1 ring-border">
              <h2 className="text-base font-semibold text-foreground">Payment</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><Input label="Cardholder name" required /></div>
                <div className="sm:col-span-2"><Input label="Card number" placeholder="1234 5678 9012 3456" required /></div>
                <Input label="Expiry (MM/YY)" required />
                <Input label="CVV" required />
              </div>
            </section>
          </div>

          <aside className="self-start rounded-lg bg-card p-6 ring-1 ring-border lg:sticky lg:top-20">
            <h2 className="text-base font-semibold text-foreground">Trip summary</h2>
            <div className="mt-4 space-y-1 text-sm">
              <div className="font-semibold text-foreground">{offer.airline} {offer.code}</div>
              <div className="text-muted-foreground">{airportLabel(from)} → {airportLabel(to)}</div>
              <div className="text-muted-foreground">{format(parseISO(depart), "EEE, dd MMM yyyy")}</div>
              <div className="text-muted-foreground">{offer.depart} – {offer.arrive} · {offer.duration} · {offer.stops}</div>
              <div className="text-muted-foreground">{offer.fareType}</div>
            </div>
            <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Fare × {totalPax}</dt><dd className="text-foreground">${subtotal}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Taxes & fees</dt><dd className="text-foreground">${taxes}</dd></div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt className="text-foreground">Total</dt><dd className="text-foreground">${total}</dd></div>
            </dl>
            <button type="submit" className="mt-6 w-full rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-[hsl(var(--accent-hover))]">
              Confirm and pay ${total}
            </button>
            <p className="mt-3 text-[11px] text-muted-foreground">By confirming you agree to Luskam Travel Agents' terms of service.</p>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
};

const Input = ({
  label, type = "text", value, onChange, placeholder, required,
}: {
  label: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <div>
    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      required={required}
      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  </div>
);

export default Checkout;
