import { Link } from "react-router-dom";
import heroImg from "@/assets/photo-cabin.jpg";
import { SearchModule } from "./SearchModule";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="container grid grid-cols-1 gap-10 py-12 lg:grid-cols-2 lg:gap-12 lg:py-20">
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-semibold leading-tight text-primary sm:text-5xl">
            Book Flights, Hotels & Travel Services
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Search and compare flights, hotels, car rentals and visa applications from one trusted travel partner.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#search"
              className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-[hsl(var(--accent-hover))]"
            >
              Search Flights
            </a>
            <Link
              to="/visa"
              className="inline-flex items-center justify-center rounded-md border border-primary/20 bg-background px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              Apply for Visa
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl shadow-md lg:aspect-auto lg:h-full">
            <img
              src={heroImg}
              alt="Family travelling comfortably in airline cabin"
              width={1920}
              height={1280}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div id="search" className="container -mt-2 pb-16 lg:-mt-16">
        <SearchModule />
      </div>
    </section>
  );
};
