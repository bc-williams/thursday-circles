export const cityOptions = [
    { name: "Raleigh-Durham", slug: "raleigh-durham" },
    { name: "London", slug: "london" },
    { name: "New York City", slug: "new-york-city" },
  ] as const;
  
  export type CitySlug = (typeof cityOptions)[number]["slug"];