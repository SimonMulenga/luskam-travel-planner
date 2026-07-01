import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CARS } from "@/data/cars";
import { Users, Briefcase, Settings, Snowflake } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createBooking, generateReference } from "@/lib/bookings";

const CarsPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const pickup = params.get("pickup") || "Lusaka";
  const dropoff = params.get("dropoff") || pickup;
  const pdate = params.get("pdate") || format(new Date(), "yyyy-MM-dd");
  const ddate = params.get("ddate") || format(new Date(), "yyyy-MM-dd");
  const ptime = params.get("ptime") || "10:00";
  const dtime = params.get("dtime") || "10:00";

  const days = Math.max(1, differenceInDays(parseISO(ddate), parseISO(pdate)) || 1);

  const book = async (carId: string, brand: string, model: string, total: number) => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      toast.info("Please sign in to reserve a car");
      navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    try {
      const ref = generateReference("CR");
      await createBooking({
        type: "car",
        reference: ref,
        total_amount: total,
        travel_date: pdate,
        details: { carId, brand, model, pickup, dropoff, pdate, ddate, ptime, dtime, days },
      });
      toast.success(`Reserved · ${ref}`);
      setTimeout(() => navigate("/account"), 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save reservation");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-primary">← Modify search</button>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Car rentals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pickup} · {format(parseISO(pdate), "dd MMM")} {ptime} → {dropoff} · {format(parseISO(ddate), "dd MMM yyyy")} {dtime} · {days} {days === 1 ? "day" : "days"}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {CARS.map((c) => {
            const total = c.pricePerDay * days;
            return (
              <article key={c.id} className="rounded-lg bg-card p-5 ring-1 ring-border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.category}</div>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">{c.brand} {c.model}</h3>
                    <div className="text-xs text-muted-foreground">or similar · supplied by {c.supplier}</div>
                  </div>
                  <img src={c.image} alt={`${c.brand} ${c.model}`} className="h-20 w-32 rounded-md object-cover" loading="lazy" />
                </div>
                <ul className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-foreground">
                  <li className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> {c.seats} seats</li>
                  <li className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /> {c.bags} bags</li>
                  <li className="flex items-center gap-2"><Settings className="h-4 w-4 text-muted-foreground" /> {c.transmission}</li>
                  <li className="flex items-center gap-2"><Snowflake className="h-4 w-4 text-muted-foreground" /> {c.airCon ? "Air conditioning" : "No A/C"}</li>
                </ul>
                <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                  <div>
                    <div className="text-xs text-muted-foreground">${c.pricePerDay} / day</div>
                    <div className="text-2xl font-semibold text-foreground">${total}</div>
                  </div>
                  <button
                    onClick={() => book(c.id, c.brand, c.model, total)}
                    className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-[hsl(var(--primary-hover))]"
                  >
                    Reserve
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CarsPage;
