// Provider configuration. The active provider is chosen server-side via the
// FLIGHT_PROVIDER env var, so connecting a real booking provider later means
// registering it here and flipping the variable — no frontend change.
import type { FlightProvider } from "./types.ts";
import { AviationstackProvider } from "./aviationstack.ts";
import { NotConnectedBookingProvider } from "./notConnected.ts";

const registry: Record<string, () => FlightProvider> = {
  aviationstack: () => new AviationstackProvider(),
  none: () => new NotConnectedBookingProvider(),
  // Future: apg: () => new ApgProvider(), travelport: () => new TravelportProvider(),
};

/** Provider used for aviation data / search. */
export function getDataProvider(): FlightProvider {
  const name = (Deno.env.get("FLIGHT_PROVIDER") ?? "aviationstack").toLowerCase();
  return (registry[name] ?? registry.aviationstack)();
}

/**
 * Provider able to sell, book and ticket. Only set FLIGHT_BOOKING_PROVIDER once
 * a real inventory provider has been registered above.
 */
export function getBookingProvider(): FlightProvider {
  const name = (Deno.env.get("FLIGHT_BOOKING_PROVIDER") ?? "none").toLowerCase();
  const provider = (registry[name] ?? registry.none)();
  return provider.capabilities.booking ? provider : new NotConnectedBookingProvider();
}

export function bookingProviderConnected(): boolean {
  return getBookingProvider().capabilities.booking;
}
