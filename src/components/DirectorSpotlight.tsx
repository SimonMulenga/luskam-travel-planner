import director from "@/assets/director-annie.jpg";

export const DirectorSpotlight = () => {
  return (
    <section className="border-t border-border bg-background py-16">
      <div className="container grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-lg border border-border">
            <img
              src={director}
              alt="Annie Mutashi, Director of Luskam Travel Agents"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            A message from the Director
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-primary sm:text-3xl">Annie Mutashi</h2>
          <p className="mt-1 text-sm text-muted-foreground">Director, Luskam Travel Agents</p>
          <blockquote className="mt-6 border-l-2 border-accent pl-5 text-base leading-relaxed text-foreground">
            “At Luskam Travel Agents we don’t just sell tickets. We coordinate every detail of your
            journey, from visas and flights to lodging and ground transport, so you arrive ready
            for what really matters.”
          </blockquote>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Annie leads the agency from our Lusaka office, working directly with airlines, hotels
            and embassy partners across Africa, the Middle East and Europe. She also oversees the
            Kakande Ministries travel programme, which arranges monthly group trips for pilgrims.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-md border border-border bg-surface p-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Direct line</dt>
              <dd className="mt-1 font-semibold text-foreground">+260 773 918 145</dd>
            </div>
            <div className="rounded-md border border-border bg-surface p-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Office</dt>
              <dd className="mt-1 font-semibold text-foreground">Lusaka, Zambia</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};
