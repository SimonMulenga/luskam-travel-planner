import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { generateHotels } from "@/data/hotels";
import { Star, MapPin } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createBooking, generateReference } from "@/lib/bookings";

const HotelsPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dest = params.get("dest") || "Lusaka, Zambia";
  const checkIn = params.get("in") || format(new Date(), "yyyy-MM-dd");
  const checkOut = params.get("out") || format(new Date(), "yyyy-MM-dd");
  const adults = parseInt(params.get("adults") || "2");
  const rooms = parseInt(params.get("rooms") || "1");

  const nights = Math.max(1, differenceInDays(parseISO(checkOut), parseISO(checkIn)));
  const hotels = useMemo(() => generateHotels(dest), [dest]);

  const book = async (id: string, name: string, price: number, city: string) => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      toast.info("Please sign in to reserve a hotel");
      navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    try {
      const total = price * nights * rooms;
      const ref = generateReference("HT");
      await createBooking({
        type: "hotel",
        reference: ref,
        total_amount: total,
        travel_date: checkIn,
        details: { hotelId: id, name, city, nights, rooms, adults, checkIn, checkOut, pricePerNight: price },
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
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Hotels in {dest}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {format(parseISO(checkIn), "dd MMM")} – {format(parseISO(checkOut), "dd MMM yyyy")} · {nights} {nights === 1 ? "night" : "nights"} · {adults} guests · {rooms} {rooms === 1 ? "room" : "rooms"}
        </p>

        <div className="mt-6 space-y-4">
          {hotels.map((h) => (
            <article key={h.id} className="grid grid-cols-1 gap-4 rounded-lg bg-card p-4 ring-1 ring-border md:grid-cols-[220px_1fr_200px]">
              <img src={h.image} alt={h.name} className="h-44 w-full rounded-md object-cover md:h-full" loading="lazy" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">{h.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {h.area}, {h.city}
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-current text-primary" />
                  <span className="font-semibold text-foreground">{h.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({h.reviews.toLocaleString()} reviews)</span>
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {h.amenities.map((a) => <li key={a}>· {a}</li>)}
                </ul>
              </div>
              <div className="flex flex-col items-end justify-between">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{nights} {nights === 1 ? "night" : "nights"}, {rooms} {rooms === 1 ? "room" : "rooms"}</div>
                  <div className="text-2xl font-semibold text-foreground">${h.pricePerNight * nights * rooms}</div>
                  <div className="text-xs text-muted-foreground">Includes taxes & fees</div>
                </div>
                <button
                  onClick={() => book(h.id, h.name, h.pricePerNight, h.city)}
                  className="mt-3 w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-[hsl(var(--primary-hover))]"
                >
                  Reserve
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HotelsPage;
