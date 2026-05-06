import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Hotel, Car, ArrowLeftRight, Search, MapPin } from "lucide-react";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { AirportSelect } from "./search/AirportSelect";
import { DateField } from "./search/DateField";
import { PassengerSelect, type PaxState } from "./search/PassengerSelect";
import { TimeField } from "./search/TimeField";

type Tab = "flights" | "hotels" | "cars";
const tabs: { id: Tab; label: string; icon: typeof Plane }[] = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "cars", label: "Car Rentals", icon: Car },
];

const fmt = (d?: Date) => (d ? format(d, "yyyy-MM-dd") : "");

export const SearchModule = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("flights");
  const [tripType, setTripType] = useState<"return" | "oneway">("return");

  // Flights
  const [from, setFrom] = useState("LUN");
  const [to, setTo] = useState("JNB");
  const [depart, setDepart] = useState<Date | undefined>(addDays(new Date(), 14));
  const [ret, setRet] = useState<Date | undefined>(addDays(new Date(), 21));
  const [pax, setPax] = useState<PaxState>({ adults: 1, children: 0, infants: 0, cabin: "Economy" });

  // Hotels
  const [hotelDest, setHotelDest] = useState("Cape Town, South Africa");
  const [checkIn, setCheckIn] = useState<Date | undefined>(addDays(new Date(), 14));
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 18));
  const [rooms, setRooms] = useState(1);
  const [hotelPax, setHotelPax] = useState<PaxState>({ adults: 2, children: 0, infants: 0, cabin: "Economy" });

  // Cars
  const [pickup, setPickup] = useState("Kenneth Kaunda Intl Airport (LUN)");
  const [dropoffLoc, setDropoffLoc] = useState("");
  const [diffDrop, setDiffDrop] = useState(false);
  const [pickupDate, setPickupDate] = useState<Date | undefined>(addDays(new Date(), 7));
  const [dropoffDate, setDropoffDate] = useState<Date | undefined>(addDays(new Date(), 10));
  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropoffTime, setDropoffTime] = useState("10:00");
  const [driverAge, setDriverAge] = useState(true);

  const swap = () => {
    const a = from;
    setFrom(to);
    setTo(a);
  };

  const submit = () => {
    if (tab === "flights") {
      const params = new URLSearchParams({
        from, to,
        depart: fmt(depart),
        ret: tripType === "return" ? fmt(ret) : "",
        adults: String(pax.adults),
        children: String(pax.children),
        infants: String(pax.infants),
        cabin: pax.cabin,
        trip: tripType,
      });
      navigate(`/flights?${params.toString()}`);
    } else if (tab === "hotels") {
      const params = new URLSearchParams({
        dest: hotelDest,
        in: fmt(checkIn),
        out: fmt(checkOut),
        adults: String(hotelPax.adults),
        children: String(hotelPax.children),
        rooms: String(rooms),
      });
      navigate(`/hotels?${params.toString()}`);
    } else {
      const params = new URLSearchParams({
        pickup,
        dropoff: diffDrop ? dropoffLoc : pickup,
        pdate: fmt(pickupDate),
        ddate: fmt(dropoffDate),
        ptime: pickupTime,
        dtime: dropoffTime,
        age: driverAge ? "1" : "0",
      });
      navigate(`/cars?${params.toString()}`);
    }
  };

  return (
    <section className="w-full">
      <div className="rounded-xl bg-card shadow-lg ring-1 ring-border">
        <div role="tablist" className="flex overflow-x-auto border-b border-border">
          {tabs.map((t) => {
            const active = t.id === tab;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative flex items-center gap-2 whitespace-nowrap px-5 py-3.5 text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {active && <span className="absolute inset-x-3 -bottom-px h-0.5 bg-primary" />}
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-6">
          {tab === "flights" && (
            <>
              <div className="mb-4 flex flex-wrap gap-1 text-sm">
                {([["return", "Return"], ["oneway", "One way"]] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setTripType(id)}
                    className={cn(
                      "rounded-md px-3 py-1.5 font-medium transition-colors",
                      tripType === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="relative md:col-span-3">
                  <AirportSelect label="From" value={from} onChange={setFrom} />
                </div>
                <div className="hidden items-end justify-center md:col-span-1 md:flex">
                  <button
                    onClick={swap}
                    className="mb-2 rounded-full border border-border bg-background p-2 text-muted-foreground hover:text-primary"
                    aria-label="Swap"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="md:col-span-3">
                  <AirportSelect label="To" value={to} onChange={setTo} />
                </div>
                <div className="md:col-span-2">
                  <DateField label="Departure" value={depart} onChange={setDepart} />
                </div>
                <div className="md:col-span-2">
                  <DateField
                    label="Return"
                    value={ret}
                    onChange={setRet}
                    minDate={depart}
                    disabled={tripType === "oneway"}
                  />
                </div>
                <div className="md:col-span-12">
                  <PassengerSelect value={pax} onChange={setPax} />
                </div>
              </div>
            </>
          )}

          {tab === "hotels" && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="md:col-span-5">
                <label className="block rounded-md bg-surface px-3.5 py-2.5 ring-1 ring-border focus-within:ring-2 focus-within:ring-primary/40">
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Destination</span>
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      value={hotelDest}
                      onChange={(e) => setHotelDest(e.target.value)}
                      placeholder="City, hotel, area"
                      className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                </label>
              </div>
              <div className="md:col-span-2">
                <DateField label="Check-in" value={checkIn} onChange={setCheckIn} />
              </div>
              <div className="md:col-span-2">
                <DateField label="Check-out" value={checkOut} onChange={setCheckOut} minDate={checkIn} />
              </div>
              <div className="md:col-span-3">
                <PassengerSelect
                  label="Guests & rooms"
                  value={hotelPax}
                  onChange={setHotelPax}
                  showCabin={false}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block rounded-md bg-surface px-3.5 py-2.5 ring-1 ring-border">
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Rooms</span>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={rooms}
                    onChange={(e) => setRooms(Math.max(1, parseInt(e.target.value) || 1))}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none"
                  />
                </label>
              </div>
            </div>
          )}

          {tab === "cars" && (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-12">
                  <label className="block rounded-md bg-surface px-3.5 py-2.5 ring-1 ring-border focus-within:ring-2 focus-within:ring-primary/40">
                    <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Pick-up location</span>
                    <div className="mt-1 flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <input
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="Airport, city or station"
                        className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none"
                      />
                    </div>
                  </label>
                </div>
                {diffDrop && (
                  <div className="md:col-span-12">
                    <label className="block rounded-md bg-surface px-3.5 py-2.5 ring-1 ring-border focus-within:ring-2 focus-within:ring-primary/40">
                      <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Drop-off location</span>
                      <div className="mt-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <input
                          value={dropoffLoc}
                          onChange={(e) => setDropoffLoc(e.target.value)}
                          placeholder="Airport, city or station"
                          className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none"
                        />
                      </div>
                    </label>
                  </div>
                )}
                <div className="md:col-span-4">
                  <DateField label="Pick-up date" value={pickupDate} onChange={setPickupDate} />
                </div>
                <div className="md:col-span-2">
                  <TimeField label="Time" value={pickupTime} onChange={setPickupTime} />
                </div>
                <div className="md:col-span-4">
                  <DateField label="Drop-off date" value={dropoffDate} onChange={setDropoffDate} minDate={pickupDate} />
                </div>
                <div className="md:col-span-2">
                  <TimeField label="Time" value={dropoffTime} onChange={setDropoffTime} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <label className="flex items-center gap-2 text-foreground">
                  <input type="checkbox" checked={diffDrop} onChange={(e) => setDiffDrop(e.target.checked)} className="h-4 w-4 rounded border-border" />
                  Drop car off at different location
                </label>
                <label className="flex items-center gap-2 text-foreground">
                  <input type="checkbox" checked={driverAge} onChange={(e) => setDriverAge(e.target.checked)} className="h-4 w-4 rounded border-border" />
                  Driver aged between 30 – 65?
                </label>
              </div>
            </>
          )}

          <div className="mt-5 flex justify-end">
            <button
              onClick={submit}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-[hsl(var(--accent-hover))]"
            >
              <Search className="h-4 w-4" />
              {tab === "flights" ? "Search Flights" : tab === "hotels" ? "Search Hotels" : "Search Cars"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
