export interface Hotel {
  id: string;
  name: string;
  city: string;
  area: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  image: string;
  amenities: string[];
}

const IMG = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=70";
const IMG2 = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=70";
const IMG3 = "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=70";
const IMG4 = "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=70";

export function generateHotels(dest: string): Hotel[] {
  const city = dest.split(",")[0].trim() || "Lusaka";
  return [
    { id: "h1", name: `Radisson Blu ${city}`, city, area: "City Centre", rating: 4.6, reviews: 1820, pricePerNight: 189, image: IMG, amenities: ["Free WiFi", "Pool", "Breakfast"] },
    { id: "h2", name: `Protea Hotel ${city}`, city, area: "Airport District", rating: 4.3, reviews: 942, pricePerNight: 142, image: IMG2, amenities: ["Free WiFi", "Airport shuttle"] },
    { id: "h3", name: `Southern Sun ${city}`, city, area: "Business District", rating: 4.5, reviews: 2305, pricePerNight: 168, image: IMG3, amenities: ["Free WiFi", "Gym", "Parking"] },
    { id: "h4", name: `Taj ${city} Boutique`, city, area: "Old Town", rating: 4.7, reviews: 612, pricePerNight: 224, image: IMG4, amenities: ["Free WiFi", "Spa", "Restaurant"] },
    { id: "h5", name: `City Lodge ${city}`, city, area: "Suburb", rating: 4.1, reviews: 488, pricePerNight: 98, image: IMG, amenities: ["Free WiFi", "Parking"] },
  ];
}
