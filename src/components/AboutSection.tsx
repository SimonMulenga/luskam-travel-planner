import team from "@/assets/photo-team.jpg";
import group from "@/assets/photo-group.jpg";

export const AboutSection = () => {
  return (
    <section id="about" className="border-t border-border bg-surface py-16">
      <div className="container grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="grid grid-cols-2 gap-4">
          <img
            src={team}
            alt="Luskam Travel Agents staff at the office"
            loading="lazy"
            className="aspect-[3/4] w-full rounded-lg object-cover"
          />
          <img
            src={group}
            alt="Group of travellers at sunset"
            loading="lazy"
            className="aspect-[3/4] w-full rounded-lg object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-primary sm:text-3xl">About Luskam Travel Agents</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Luskam Travel Agents is a Zambian travel company based in Lusaka, helping individuals,
            families and corporate clients book flights, accommodation, ground transport and visa
            services across Africa and beyond.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Our team works directly with airlines, hotels and embassies to confirm reservations,
            process documentation and support travellers through every stage of their journey.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-md border border-border bg-background p-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Phone</dt>
              <dd className="mt-1 font-semibold text-foreground">+260 773 918 145</dd>
            </div>
            <div className="rounded-md border border-border bg-background p-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Based in</dt>
              <dd className="mt-1 font-semibold text-foreground">Lusaka, Zambia</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};
