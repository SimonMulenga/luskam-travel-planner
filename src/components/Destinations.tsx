import dubai from "@/assets/dest-dubai.jpg";
import coast from "@/assets/dest-coast.jpg";
import vicFalls from "@/assets/dest-victoria-falls.jpg";
import fallsGorge from "@/assets/dest-falls-gorge.jpg";
import desert from "@/assets/dest-desert.jpg";
import mfuwe from "@/assets/dest-mfuwe.jpg";

const items = [
  { img: vicFalls, place: "Victoria Falls", country: "Zambia", note: "Guided walks at Knife Edge Bridge" },
  { img: dubai, place: "Dubai", country: "United Arab Emirates", note: "Museum of the Future & city tours" },
  { img: mfuwe, place: "Mfuwe Lodge", country: "South Luangwa, Zambia", note: "Safari lodge & game drives" },
  { img: desert, place: "Sahara Desert", country: "Morocco", note: "Sunset camel caravan experience" },
  { img: fallsGorge, place: "Batoka Gorge", country: "Zambia / Zimbabwe", note: "Falls base hike & photography" },
  { img: coast, place: "Mediterranean Coast", country: "Europe", note: "Cliff stairways and snorkelling" },
];

export const Destinations = () => {
  return (
    <section id="destinations" className="border-t border-border bg-background py-16">
      <div className="container">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-primary sm:text-3xl">Popular destinations</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              A selection of trips Luskam Travel Agents books for clients across Africa, the Middle East and Europe.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <article key={d.place} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={d.img}
                  alt={`${d.place}, ${d.country}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold text-foreground">{d.place}</h3>
                  <span className="text-xs text-muted-foreground">{d.country}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{d.note}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
