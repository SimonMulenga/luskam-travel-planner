import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "sonner";

interface Booking {
  id: string;
  reference: string;
  type: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  travel_date: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

interface Profile { full_name: string | null; phone: string | null }

const TYPE_LABEL: Record<string, string> = {
  flight: "Flight", hotel: "Hotel", car: "Car rental", visa: "Visa application",
  kakande: "Kakande Ministries trip", package: "Package", transfer: "Airport transfer", insurance: "Travel insurance",
};

const STATUS_COLOR: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const AccountPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile>({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth?next=/account", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [b, p] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("full_name,phone").eq("id", user.id).maybeSingle(),
      ]);
      if (b.data) setBookings(b.data as Booking[]);
      if (p.data) setProfile({ full_name: p.data.full_name ?? "", phone: p.data.phone ?? "" });
    })();
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, full_name: profile.full_name, phone: profile.phone,
    });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background"><Header /><main className="container py-16 text-center text-sm text-muted-foreground">Loading…</main></div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">My account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Sign out
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-lg bg-card p-6 ring-1 ring-border">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Your bookings</h2>
              <Link to="/" className="text-sm font-medium text-primary hover:underline">+ New booking</Link>
            </div>
            {bookings.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">You have no bookings yet. Start by searching a flight, hotel or car on the home page.</p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {bookings.map((b) => (
                  <li key={b.id} className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[110px_1fr_auto] sm:items-center">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{TYPE_LABEL[b.type] ?? b.type}</div>
                      <div className="font-mono text-sm font-semibold text-foreground">{b.reference}</div>
                    </div>
                    <div className="text-sm text-foreground">
                      <Summary booking={b} />
                      <div className="mt-1 text-xs text-muted-foreground">
                        {b.travel_date ? `Travel ${format(new Date(b.travel_date), "dd MMM yyyy")} · ` : ""}
                        Created {format(new Date(b.created_at), "dd MMM yyyy")}
                      </div>
                      {b.payment_status === "pending" && b.status !== "cancelled" && (
                        <div className="mt-2 rounded-md bg-primary/5 px-3 py-2 text-[11px] text-foreground ring-1 ring-primary/20">
                          Pay to <strong>+260 979 450 446</strong> (MTN/Airtel) using reference <strong>{b.reference}</strong>.{" "}
                          <a
                            href={`https://wa.me/260773918145?text=${encodeURIComponent(`Hello, booking ${b.reference} for ${b.currency} ${Number(b.total_amount).toFixed(2)} — I'd like to pay.`)}`}
                            target="_blank" rel="noreferrer"
                            className="font-semibold text-primary hover:underline"
                          >
                            WhatsApp to pay →
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-sm font-semibold text-foreground">{b.currency} {Number(b.total_amount).toFixed(2)}</div>
                      <div className="flex gap-1.5">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ${STATUS_COLOR[b.status] ?? "bg-muted text-foreground ring-border"}`}>{b.status}</span>
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ${STATUS_COLOR[b.payment_status] ?? "bg-muted text-foreground ring-border"}`}>{b.payment_status}</span>
                      </div>
                      {b.status !== "cancelled" && b.status !== "completed" && b.payment_status !== "paid" && (
                        <button
                          onClick={async () => {
                            if (!confirm(`Cancel booking ${b.reference}?`)) return;
                            const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", b.id);
                            if (error) return toast.error(error.message);
                            toast.success("Booking cancelled");
                            setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: "cancelled" } : x)));
                          }}
                          className="text-[11px] font-medium text-destructive hover:underline"
                        >
                          Cancel booking
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="self-start rounded-lg bg-card p-6 ring-1 ring-border">
            <h2 className="text-base font-semibold text-foreground">Profile</h2>
            <form onSubmit={saveProfile} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Full name</label>
                <input value={profile.full_name ?? ""} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</label>
                <input value={profile.phone ?? ""} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <button disabled={saving} className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-[hsl(var(--primary-hover))] disabled:opacity-60">
                {saving ? "Saving…" : "Save profile"}
              </button>
            </form>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Summary = ({ booking }: { booking: Booking }) => {
  const d = booking.details as Record<string, string | number | undefined>;
  switch (booking.type) {
    case "flight":
      return <span>{d.airline} {d.code} · {d.from} → {d.to}</span>;
    case "hotel":
      return <span>{d.name} · {d.city} · {d.nights} nights</span>;
    case "car":
      return <span>{d.brand} {d.model} · {d.pickup} → {d.dropoff}</span>;
    case "visa":
      return <span>{d.country} · {d.visaType} visa</span>;
    case "kakande":
      return <span>{d.trip} · {d.mode}</span>;
    default:
      return <span>{JSON.stringify(d)}</span>;
  }
};

export default AccountPage;
