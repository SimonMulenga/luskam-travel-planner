import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createBooking, generateReference } from "@/lib/bookings";

const COUNTRIES = [
  "United Arab Emirates", "United Kingdom", "United States", "Schengen Area", "China",
  "South Africa", "Kenya", "India", "Turkey", "Canada", "Australia", "Qatar",
];

const VISA_TYPES = ["Tourist", "Business", "Transit", "Student", "Work"];

const WHATSAPP_NUMBERS = [
  { label: "773 918 145", number: "260773918145" },
  { label: "976 652 877", number: "260976652877" },
];

const buildWhatsappMessage = (ref: string, form: Record<string, string>) =>
  [
    `*New Visa Application* (Ref: ${ref})`,
    "",
    `Destination: ${form.country}`,
    `Visa type: ${form.visaType}`,
    `Travel date: ${form.travelDate}`,
    `Duration: ${form.duration} days`,
    "",
    `Name: ${form.firstName} ${form.lastName}`,
    `Date of birth: ${form.dob}`,
    `Nationality: ${form.nationality}`,
    `Passport: ${form.passport} (expires ${form.passportExpiry})`,
    "",
    `Email: ${form.email}`,
    `Phone: ${form.phone}`,
    form.address ? `Address: ${form.address}` : "",
    form.notes ? `Notes: ${form.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

const whatsappLink = (number: string, message: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

const VisaPage = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [form, setForm] = useState({
    country: "United Arab Emirates",
    visaType: "Tourist",
    travelDate: "",
    duration: "30",
    firstName: "",
    lastName: "",
    dob: "",
    nationality: "",
    passport: "",
    passportExpiry: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["travelDate", "firstName", "lastName", "dob", "nationality", "passport", "passportExpiry", "email", "phone"];
    if (required.some((k) => !(form as Record<string, string>)[k])) {
      toast.error("Please complete all required fields");
      return;
    }
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      toast.info("Please sign in to submit your application");
      navigate("/auth?next=/visa");
      return;
    }
    try {
      const ref = generateReference("VA");
      await createBooking({
        type: "visa",
        reference: ref,
        total_amount: 0,
        travel_date: form.travelDate,
        status: "pending",
        payment_status: "pending",
        details: { ...form },
      });
      const message = buildWhatsappMessage(ref, form);
      WHATSAPP_NUMBERS.forEach((n, i) => {
        setTimeout(() => window.open(whatsappLink(n.number, message), "_blank", "noopener,noreferrer"), i * 600);
      });
      setSubmitted(ref);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit application");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16">
          <div className="mx-auto max-w-2xl rounded-lg bg-card p-8 ring-1 ring-border">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Application received</h1>
                <p className="mt-1 text-sm text-muted-foreground">Our visa team will contact you within 24 hours at {form.email}.</p>
              </div>
            </div>
            <div className="mt-6 rounded-md bg-surface p-4 ring-1 ring-border">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Application reference</div>
              <div className="mt-1 font-mono text-xl font-semibold text-foreground">{submitted}</div>
            </div>
            <div className="mt-6 rounded-md bg-surface p-4 ring-1 ring-border">
              <div className="text-sm font-semibold text-foreground">Send your application on WhatsApp</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Two WhatsApp chats should have opened automatically. If not, tap a number below to send your details.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                {WHATSAPP_NUMBERS.map((n) => (
                  <a
                    key={n.number}
                    href={whatsappLink(n.number, buildWhatsappMessage(submitted, form))}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-md bg-[#25D366] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#1ebe5d]"
                  >
                    WhatsApp {n.label}
                  </a>
                ))}
              </div>
            </div>
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
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Visa application</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Complete the form below and our visa team will guide you through document submission, embassy fees and processing timelines.
        </p>

        <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Section title="Trip details">
              <Select label="Destination country" value={form.country} onChange={(v) => update("country", v)} options={COUNTRIES} />
              <Select label="Visa type" value={form.visaType} onChange={(v) => update("visaType", v)} options={VISA_TYPES} />
              <Field label="Intended travel date" type="date" value={form.travelDate} onChange={(v) => update("travelDate", v)} required />
              <Field label="Duration of stay (days)" type="number" value={form.duration} onChange={(v) => update("duration", v)} required />
            </Section>

            <Section title="Applicant details">
              <Field label="First name" value={form.firstName} onChange={(v) => update("firstName", v)} required />
              <Field label="Last name" value={form.lastName} onChange={(v) => update("lastName", v)} required />
              <Field label="Date of birth" type="date" value={form.dob} onChange={(v) => update("dob", v)} required />
              <Field label="Nationality" value={form.nationality} onChange={(v) => update("nationality", v)} required />
              <Field label="Passport number" value={form.passport} onChange={(v) => update("passport", v)} required />
              <Field label="Passport expiry" type="date" value={form.passportExpiry} onChange={(v) => update("passportExpiry", v)} required />
            </Section>

            <Section title="Contact & address">
              <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required />
              <Field label="Phone" type="tel" value={form.phone} onChange={(v) => update("phone", v)} required />
              <div className="sm:col-span-2">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Residential address</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Additional notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </Section>
          </div>

          <aside className="self-start rounded-lg bg-card p-6 ring-1 ring-border lg:sticky lg:top-20">
            <h2 className="text-base font-semibold text-foreground">What happens next</h2>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><span className="font-semibold text-foreground">1.</span> We review your application within 24 hours.</li>
              <li><span className="font-semibold text-foreground">2.</span> You receive a document checklist for your destination.</li>
              <li><span className="font-semibold text-foreground">3.</span> We submit your application and track approval.</li>
              <li><span className="font-semibold text-foreground">4.</span> Visa is delivered to your registered address or email.</li>
            </ol>
            <button type="submit" className="mt-6 w-full rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-[hsl(var(--accent-hover))]">
              Submit application
            </button>
            <p className="mt-3 text-[11px] text-muted-foreground">Service fees are confirmed before any payment is collected.</p>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-lg bg-card p-6 ring-1 ring-border">
    <h2 className="text-base font-semibold text-foreground">{title}</h2>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  </section>
);

const Field = ({
  label, type = "text", value, onChange, required,
}: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean }) => (
  <div>
    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}{required && " *"}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  </div>
);

const Select = ({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
  <div>
    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </div>
);

export default VisaPage;
