import "dotenv/config";
import { PrismaClient, RSVPStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type CitySlug = "raleigh-durham" | "london" | "new-york-city";
type ActivitySlug =
  | "pickleball"
  | "boardgames"
  | "trivia"
  | "coworking"
  | "volunteering"
  | "runclub";

type UserSeed = {
  name: string;
  phoneNumber: string;
  homeCitySlug: CitySlug;
  photoUrl?: string;
};

type EventSeed = {
  key: string;
  citySlug: CitySlug;
  activitySlug: ActivitySlug;
  title: string;
  startTime: string;
  locationName: string;
  hostName: string;
  travelerNames?: string[];
};

const citySeed = [
  { name: "Raleigh-Durham", slug: "raleigh-durham" as const },
  { name: "London", slug: "london" as const },
  { name: "New York City", slug: "new-york-city" as const },
];

const activitySeed = [
  { name: "Pickleball", slug: "pickleball" as const, iconPath: "/icons/pickleball-icon.png" },
  { name: "Board Games", slug: "boardgames" as const, iconPath: "/icons/boardgames-icon.png" },
  { name: "Trivia", slug: "trivia" as const, iconPath: "/icons/trivia-icon.png" },
  { name: "Coworking", slug: "coworking" as const, iconPath: "/icons/coworking-icon.png" },
  { name: "Volunteering", slug: "volunteering" as const, iconPath: "/icons/volunteering-icon.png" },
  { name: "Run Club", slug: "runclub" as const, iconPath: "/icons/runclub-icon.png" },
];

const userSeed: UserSeed[] = [
  // Raleigh-Durham
  { name: "Britt Williams", phoneNumber: "+19195550101", homeCitySlug: "raleigh-durham", photoUrl: "/hosts/britt.jpg" },
  { name: "Jake Carter", phoneNumber: "+19195550102", homeCitySlug: "raleigh-durham", photoUrl: "/hosts/jake.jpg" },
  { name: "Manny Alvarez", phoneNumber: "+19195550103", homeCitySlug: "raleigh-durham", photoUrl: "/hosts/manny-alvarez.jpg" },
  { name: "Leah Bennett", phoneNumber: "+19195550104", homeCitySlug: "raleigh-durham", photoUrl: "/hosts/leah.jpg" },
  { name: "Hannah Cole", phoneNumber: "+19195550105", homeCitySlug: "raleigh-durham", photoUrl: "/hosts/hannah.jpg" },
  { name: "Abbey Lawson", phoneNumber: "+19195550106", homeCitySlug: "raleigh-durham", photoUrl: "/hosts/abbey.jpg" },
  { name: "Julia Hayes", phoneNumber: "+19845550107", homeCitySlug: "raleigh-durham", photoUrl: "/hosts/julia.jpg" },
  { name: "Cole Matthews", phoneNumber: "+19845550108", homeCitySlug: "raleigh-durham" },
  { name: "Madeline Brooks", phoneNumber: "+19845550109", homeCitySlug: "raleigh-durham" },
  { name: "Justin Walker", phoneNumber: "+19845550110", homeCitySlug: "raleigh-durham" },
  { name: "Kelsey Turner", phoneNumber: "+19845550111", homeCitySlug: "raleigh-durham", photoUrl: "/hosts/kelsey.jpg" },
  { name: "Brock Daniels", phoneNumber: "+19845550112", homeCitySlug: "raleigh-durham" },
  { name: "New User", phoneNumber: "+19845550113", homeCitySlug: "raleigh-durham" },

  // London
  { name: "Francesca Hart", phoneNumber: "+447700900101", homeCitySlug: "london", photoUrl: "/hosts/francesca.jpg" },
  { name: "Lauren Shaw", phoneNumber: "+447700900102", homeCitySlug: "london", photoUrl: "/hosts/lauren.jpg" },
  { name: "Simon Clarke", phoneNumber: "+447700900103", homeCitySlug: "london", photoUrl: "/hosts/simon.jpg" },
  { name: "Will Harrington", phoneNumber: "+447700900104", homeCitySlug: "london", photoUrl: "/hosts/will.jpg" },
  { name: "Jon Patel", phoneNumber: "+447700900105", homeCitySlug: "london", photoUrl: "/hosts/jon.jpg" },
  { name: "James Rowe", phoneNumber: "+447700900106", homeCitySlug: "london" },
  { name: "Emily Foster", phoneNumber: "+447700900107", homeCitySlug: "london", photoUrl: "/hosts/emily.jpg" },
  { name: "Daniel Hughes", phoneNumber: "+447700900108", homeCitySlug: "london" },
  { name: "Sophie Bennett", phoneNumber: "+447700900109", homeCitySlug: "london" },

  // NYC
  { name: "Sara Kim", phoneNumber: "+19175550201", homeCitySlug: "new-york-city", photoUrl: "/hosts/sara.jpg" },
  { name: "Marcos Rivera", phoneNumber: "+19175550202", homeCitySlug: "new-york-city", photoUrl: "/hosts/marcos.jpg" },
  { name: "Sean Donnelly", phoneNumber: "+19175550203", homeCitySlug: "new-york-city", photoUrl: "/hosts/sean.jpg" },
  { name: "Alex Chen", phoneNumber: "+16465550204", homeCitySlug: "new-york-city", photoUrl: "/hosts/alex.jpg" },
  { name: "Celia Martinez", phoneNumber: "+16465550205", homeCitySlug: "new-york-city", photoUrl: "/hosts/celia.jpg" },
  { name: "Shannon O'Connor", phoneNumber: "+16465550206", homeCitySlug: "new-york-city", photoUrl: "/hosts/shannon.jpg" },
  { name: "Hunter Blake", phoneNumber: "+12125550207", homeCitySlug: "new-york-city", photoUrl: "/hosts/hunter.jpg" },
  { name: "Aubrey Collins", phoneNumber: "+12125550208", homeCitySlug: "new-york-city" },
  { name: "Kevin Park", phoneNumber: "+12125550209", homeCitySlug: "new-york-city" },
  { name: "Manny Rosario", phoneNumber: "+12125550210", homeCitySlug: "new-york-city", photoUrl: "/hosts/manny-rosario.jpg" },
];

const membershipSeed: Record<string, ActivitySlug[]> = {
  "Britt Williams": ["coworking", "pickleball", "trivia", "volunteering"],
  "Jake Carter": ["runclub", "trivia"],
  "Manny Alvarez": ["pickleball", "coworking"],
  "Leah Bennett": ["trivia", "runclub"],
  "Hannah Cole": ["boardgames", "volunteering", "coworking"],
  "Abbey Lawson": ["volunteering", "runclub", "pickleball"],
  "Julia Hayes": ["boardgames", "trivia"],
  "Cole Matthews": ["boardgames", "trivia"],
  "Madeline Brooks": ["coworking"],
  "Justin Walker": ["coworking", "runclub"],
  "Kelsey Turner": ["pickleball", "trivia"],
  "Brock Daniels": ["runclub", "pickleball"],

  "Francesca Hart": ["trivia", "volunteering", "coworking"],
  "Lauren Shaw": ["runclub", "trivia"],
  "Simon Clarke": ["coworking", "boardgames"],
  "Will Harrington": ["pickleball", "runclub", "coworking"],
  "Jon Patel": ["boardgames", "coworking"],
  "James Rowe": ["trivia", "runclub"],
  "Emily Foster": ["coworking", "volunteering", "trivia"],
  "Daniel Hughes": ["trivia", "pickleball"],
  "Sophie Bennett": ["boardgames", "coworking", "trivia"],

  "Sara Kim": ["trivia", "volunteering"],
  "Marcos Rivera": ["pickleball", "coworking", "trivia"],
  "Sean Donnelly": ["runclub", "trivia"],
  "Alex Chen": ["coworking", "boardgames"],
  "Celia Martinez": ["boardgames", "coworking"],
  "Shannon O'Connor": ["volunteering", "trivia"],
  "Hunter Blake": ["pickleball", "runclub"],
  "Aubrey Collins": ["trivia", "coworking"],
  "Kevin Park": ["runclub", "boardgames"],
  "Manny Rosario": ["pickleball", "coworking"],
};

const eventSeed: EventSeed[] = [
  // Raleigh-Durham - Pickleball
  {
    key: "rdu-pickleball-upcoming-1",
    citySlug: "raleigh-durham",
    activitySlug: "pickleball",
    title: "Saturday Pickleball Social",
    startTime: "2026-03-14T11:00:00",
    locationName: "Method Road Pickleball Courts, Raleigh",
    hostName: "Manny Alvarez",
    travelerNames: ["Marcos Rivera"],
  },
  {
    key: "rdu-pickleball-upcoming-2",
    citySlug: "raleigh-durham",
    activitySlug: "pickleball",
    title: "After-Work Pickleball Rally",
    startTime: "2026-03-19T18:30:00",
    locationName: "Bethesda Park, Durham",
    hostName: "Britt Williams",
    travelerNames: ["Sean Donnelly"],
  },
  {
    key: "rdu-pickleball-past-1",
    citySlug: "raleigh-durham",
    activitySlug: "pickleball",
    title: "Saturday Pickleball Social",
    startTime: "2026-02-21T11:00:00",
    locationName: "Method Road Pickleball Courts, Raleigh",
    hostName: "Manny Alvarez",
  },

  // Raleigh-Durham - Coworking
  {
    key: "rdu-coworking-upcoming-1",
    citySlug: "raleigh-durham",
    activitySlug: "coworking",
    title: "Friday Coworking at Frontier",
    startTime: "2026-03-13T10:00:00",
    locationName: "Frontier RTP, Research Triangle Park",
    hostName: "Britt Williams",
    travelerNames: ["Sean Donnelly"],
  },
  {
    key: "rdu-coworking-upcoming-2",
    citySlug: "raleigh-durham",
    activitySlug: "coworking",
    title: "Tuesday Work Session at Heirloom",
    startTime: "2026-03-17T13:00:00",
    locationName: "Heirloom Brewshop, Raleigh",
    hostName: "Hannah Cole",
  },
  {
    key: "rdu-coworking-upcoming-3",
    citySlug: "raleigh-durham",
    activitySlug: "coworking",
    title: "Sunday Planning Session",
    startTime: "2026-03-22T11:00:00",
    locationName: "Jubala Coffee, Durham",
    hostName: "Britt Williams",
    travelerNames: ["Francesca Hart"],
  },
  {
    key: "rdu-coworking-past-1",
    citySlug: "raleigh-durham",
    activitySlug: "coworking",
    title: "Friday Coworking at Frontier",
    startTime: "2026-03-06T10:00:00",
    locationName: "Frontier RTP, Research Triangle Park",
    hostName: "Britt Williams",
  },

  // Raleigh-Durham - Trivia
  {
    key: "rdu-trivia-upcoming-1",
    citySlug: "raleigh-durham",
    activitySlug: "trivia",
    title: "Bull McCabe's Trivia Night",
    startTime: "2026-03-18T19:00:00",
    locationName: "Bull McCabe's, Durham",
    hostName: "Leah Bennett",
    travelerNames: ["Sean Donnelly"],
  },
  {
    key: "rdu-trivia-upcoming-2",
    citySlug: "raleigh-durham",
    activitySlug: "trivia",
    title: "Flying Saucer Trivia",
    startTime: "2026-03-24T19:30:00",
    locationName: "Flying Saucer, Raleigh",
    hostName: "Britt Williams",
    travelerNames: ["Francesca Hart"],
  },
  {
    key: "rdu-trivia-past-1",
    citySlug: "raleigh-durham",
    activitySlug: "trivia",
    title: "Bull McCabe's Trivia Night",
    startTime: "2026-03-04T19:00:00",
    locationName: "Bull McCabe's, Durham",
    hostName: "Leah Bennett",
  },

  // Raleigh-Durham - Run Club
  {
    key: "rdu-runclub-upcoming-1",
    citySlug: "raleigh-durham",
    activitySlug: "runclub",
    title: "Saturday Morning Run Club",
    startTime: "2026-03-14T09:00:00",
    locationName: "Dorothea Dix Park, Raleigh",
    hostName: "Jake Carter",
    travelerNames: ["Sean Donnelly"],
  },
  {
    key: "rdu-runclub-upcoming-2",
    citySlug: "raleigh-durham",
    activitySlug: "runclub",
    title: "Wednesday Sunset Social Run",
    startTime: "2026-03-18T18:30:00",
    locationName: "American Tobacco Trail, Durham",
    hostName: "Abbey Lawson",
    travelerNames: ["Marcos Rivera"],
  },
  {
    key: "rdu-runclub-past-1",
    citySlug: "raleigh-durham",
    activitySlug: "runclub",
    title: "Saturday Morning Run Club",
    startTime: "2026-03-07T09:00:00",
    locationName: "Dorothea Dix Park, Raleigh",
    hostName: "Jake Carter",
  },

  // Raleigh-Durham - Board Games
  {
    key: "rdu-boardgames-upcoming-1",
    citySlug: "raleigh-durham",
    activitySlug: "boardgames",
    title: "Sunday Board Game Social",
    startTime: "2026-03-15T16:00:00",
    locationName: "Gamers Geekery Tavern, Cary",
    hostName: "Hannah Cole",
    travelerNames: ["Julia Hayes"],
  },
  {
    key: "rdu-boardgames-past-1",
    citySlug: "raleigh-durham",
    activitySlug: "boardgames",
    title: "Strategy Game Night",
    startTime: "2026-02-26T19:00:00",
    locationName: "Atomic Empire, Durham",
    hostName: "Julia Hayes",
  },

  // Raleigh-Durham - Volunteering
  {
    key: "rdu-volunteering-upcoming-1",
    citySlug: "raleigh-durham",
    activitySlug: "volunteering",
    title: "Saturday Food Bank Shift",
    startTime: "2026-03-21T10:00:00",
    locationName: "Food Bank of Central NC",
    hostName: "Abbey Lawson",
    travelerNames: ["Francesca Hart"],
  },
  {
    key: "rdu-volunteering-past-1",
    citySlug: "raleigh-durham",
    activitySlug: "volunteering",
    title: "Community Park Cleanup",
    startTime: "2026-03-01T09:30:00",
    locationName: "Umstead Park, Raleigh",
    hostName: "Hannah Cole",
  },

  // London - Pickleball
  {
    key: "london-pickleball-upcoming-1",
    citySlug: "london",
    activitySlug: "pickleball",
    title: "Clapham Pickleball Social",
    startTime: "2026-03-21T12:00:00",
    locationName: "Clapham Common Courts, London",
    hostName: "Will Harrington",
    travelerNames: ["Britt Williams", "Marcos Rivera"],
  },
  {
    key: "london-pickleball-past-1",
    citySlug: "london",
    activitySlug: "pickleball",
    title: "Battersea Pickleball Rally",
    startTime: "2026-03-01T12:00:00",
    locationName: "Battersea Park, London",
    hostName: "Will Harrington",
  },

  // London - Coworking
  {
    key: "london-coworking-upcoming-1",
    citySlug: "london",
    activitySlug: "coworking",
    title: "Shoreditch Coworking Day",
    startTime: "2026-03-20T10:30:00",
    locationName: "Second Home Spitalfields, London",
    hostName: "Simon Clarke",
    travelerNames: ["Britt Williams"],
  },
  {
    key: "london-coworking-upcoming-2",
    citySlug: "london",
    activitySlug: "coworking",
    title: "Borough Work Session",
    startTime: "2026-03-24T13:00:00",
    locationName: "The Ministry, Borough",
    hostName: "Francesca Hart",
    travelerNames: ["Marcos Rivera"],
  },
  {
    key: "london-coworking-past-1",
    citySlug: "london",
    activitySlug: "coworking",
    title: "Shoreditch Coworking Day",
    startTime: "2026-03-06T10:30:00",
    locationName: "Second Home Spitalfields, London",
    hostName: "Simon Clarke",
  },

  // London - Trivia
  {
    key: "london-trivia-upcoming-1",
    citySlug: "london",
    activitySlug: "trivia",
    title: "Camden Pub Trivia",
    startTime: "2026-03-17T19:30:00",
    locationName: "The Lock Tavern, Camden",
    hostName: "Francesca Hart",
    travelerNames: ["Britt Williams"],
  },
  {
    key: "london-trivia-upcoming-2",
    citySlug: "london",
    activitySlug: "trivia",
    title: "Shoreditch Trivia Social",
    startTime: "2026-03-25T19:00:00",
    locationName: "The Book Club, Shoreditch",
    hostName: "Lauren Shaw",
  },
  {
    key: "london-trivia-upcoming-3",
    citySlug: "london",
    activitySlug: "trivia",
    title: "Soho Pub Quiz Night",
    startTime: "2026-04-01T19:30:00",
    locationName: "The Crown & Two Chairmen, Soho",
    hostName: "Emily Foster",
    travelerNames: ["Marcos Rivera"],
  },
  {
    key: "london-trivia-past-1",
    citySlug: "london",
    activitySlug: "trivia",
    title: "Camden Pub Trivia",
    startTime: "2026-03-03T19:30:00",
    locationName: "The Lock Tavern, Camden",
    hostName: "Francesca Hart",
  },

  // London - Run Club
  {
    key: "london-runclub-upcoming-1",
    citySlug: "london",
    activitySlug: "runclub",
    title: "Saturday Thames Run",
    startTime: "2026-03-14T09:30:00",
    locationName: "South Bank, London",
    hostName: "Lauren Shaw",
    travelerNames: ["Britt Williams"],
  },
  {
    key: "london-runclub-upcoming-2",
    citySlug: "london",
    activitySlug: "runclub",
    title: "Hyde Park Sunset Run",
    startTime: "2026-03-19T18:30:00",
    locationName: "Hyde Park, London",
    hostName: "Will Harrington",
    travelerNames: ["Julia Hayes"],
  },
  {
    key: "london-runclub-past-1",
    citySlug: "london",
    activitySlug: "runclub",
    title: "Saturday Thames Run",
    startTime: "2026-03-07T09:30:00",
    locationName: "South Bank, London",
    hostName: "Lauren Shaw",
  },

  // London - Board Games
  {
    key: "london-boardgames-upcoming-1",
    citySlug: "london",
    activitySlug: "boardgames",
    title: "Loading Bar Game Night",
    startTime: "2026-03-22T17:00:00",
    locationName: "Loading Bar, London",
    hostName: "Jon Patel",
    travelerNames: ["Marcos Rivera"],
  },
  {
    key: "london-boardgames-past-1",
    citySlug: "london",
    activitySlug: "boardgames",
    title: "Waterloo Strategy Night",
    startTime: "2026-02-25T19:30:00",
    locationName: "Draughts Waterloo, London",
    hostName: "Simon Clarke",
  },

  // London - Volunteering
  {
    key: "london-volunteering-upcoming-1",
    citySlug: "london",
    activitySlug: "volunteering",
    title: "Felix Project Food Drive",
    startTime: "2026-03-28T10:00:00",
    locationName: "The Felix Project, London",
    hostName: "Francesca Hart",
    travelerNames: ["Britt Williams"],
  },
  {
    key: "london-volunteering-past-1",
    citySlug: "london",
    activitySlug: "volunteering",
    title: "Community Garden Volunteer Day",
    startTime: "2026-03-08T09:30:00",
    locationName: "Culpeper Community Garden, London",
    hostName: "Emily Foster",
  },

  // NYC - Pickleball
  {
    key: "nyc-pickleball-upcoming-1",
    citySlug: "new-york-city",
    activitySlug: "pickleball",
    title: "Williamsburg Pickleball Social",
    startTime: "2026-03-22T12:00:00",
    locationName: "CityPickle, Brooklyn",
    hostName: "Marcos Rivera",
    travelerNames: ["Britt Williams", "Julia Hayes"],
  },
  {
    key: "nyc-pickleball-upcoming-2",
    citySlug: "new-york-city",
    activitySlug: "pickleball",
    title: "Hudson River Pickleball Rally",
    startTime: "2026-03-26T18:30:00",
    locationName: "Hudson River Park, Manhattan",
    hostName: "Manny Rosario",
  },
  {
    key: "nyc-pickleball-upcoming-3",
    citySlug: "new-york-city",
    activitySlug: "pickleball",
    title: "Sunday Social Doubles",
    startTime: "2026-03-29T14:00:00",
    locationName: "McCarren Park, Brooklyn",
    hostName: "Marcos Rivera",
    travelerNames: ["Britt Williams"],
  },
  {
    key: "nyc-pickleball-past-1",
    citySlug: "new-york-city",
    activitySlug: "pickleball",
    title: "Brooklyn Pickleball Meetup",
    startTime: "2026-03-01T12:00:00",
    locationName: "CityPickle, Brooklyn",
    hostName: "Manny Rosario",
  },

  // NYC - Coworking
  {
    key: "nyc-coworking-upcoming-1",
    citySlug: "new-york-city",
    activitySlug: "coworking",
    title: "Soho Coworking Session",
    startTime: "2026-03-16T11:00:00",
    locationName: "The Malin, Soho",
    hostName: "Alex Chen",
    travelerNames: ["Britt Williams", "Francesca Hart"],
  },
  {
    key: "nyc-coworking-past-1",
    citySlug: "new-york-city",
    activitySlug: "coworking",
    title: "Williamsburg Workday Reset",
    startTime: "2026-03-02T13:00:00",
    locationName: "Devoción, Brooklyn",
    hostName: "Celia Martinez",
  },

  // NYC - Trivia
  {
    key: "nyc-trivia-upcoming-1",
    citySlug: "new-york-city",
    activitySlug: "trivia",
    title: "Williamsburg Trivia Night",
    startTime: "2026-03-17T19:30:00",
    locationName: "Berry Park, Brooklyn",
    hostName: "Sara Kim",
    travelerNames: ["Britt Williams", "Julia Hayes"],
  },
  {
    key: "nyc-trivia-upcoming-2",
    citySlug: "new-york-city",
    activitySlug: "trivia",
    title: "Midtown Trivia Social",
    startTime: "2026-03-25T19:00:00",
    locationName: "The Mean Fiddler, Manhattan",
    hostName: "Shannon O'Connor",
    travelerNames: ["Francesca Hart"],
  },
  {
    key: "nyc-trivia-upcoming-3",
    citySlug: "new-york-city",
    activitySlug: "trivia",
    title: "Sunday Trivia & Drinks",
    startTime: "2026-03-29T18:00:00",
    locationName: "The Three Monkeys, Manhattan",
    hostName: "Marcos Rivera",
  },
  {
    key: "nyc-trivia-past-1",
    citySlug: "new-york-city",
    activitySlug: "trivia",
    title: "Williamsburg Trivia Night",
    startTime: "2026-03-03T19:30:00",
    locationName: "Berry Park, Brooklyn",
    hostName: "Sara Kim",
  },

  // NYC - Run Club
  {
    key: "nyc-runclub-upcoming-1",
    citySlug: "new-york-city",
    activitySlug: "runclub",
    title: "Central Park Saturday Run",
    startTime: "2026-03-14T09:00:00",
    locationName: "Central Park Loop, Manhattan",
    hostName: "Sean Donnelly",
    travelerNames: ["Britt Williams"],
  },
  {
    key: "nyc-runclub-upcoming-2",
    citySlug: "new-york-city",
    activitySlug: "runclub",
    title: "Williamsburg Waterfront Run",
    startTime: "2026-03-18T18:30:00",
    locationName: "Domino Park, Brooklyn",
    hostName: "Hunter Blake",
  },
  {
    key: "nyc-runclub-past-1",
    citySlug: "new-york-city",
    activitySlug: "runclub",
    title: "Hudson River Greenway Run",
    startTime: "2026-03-04T18:30:00",
    locationName: "Hudson River Greenway, Manhattan",
    hostName: "Sean Donnelly",
  },

  // NYC - Board Games
  {
    key: "nyc-boardgames-upcoming-1",
    citySlug: "new-york-city",
    activitySlug: "boardgames",
    title: "Brooklyn Board Game Social",
    startTime: "2026-03-21T18:00:00",
    locationName: "The Uncommons, Brooklyn",
    hostName: "Celia Martinez",
    travelerNames: ["Julia Hayes"],
  },
  {
    key: "nyc-boardgames-past-1",
    citySlug: "new-york-city",
    activitySlug: "boardgames",
    title: "Manhattan Strategy Night",
    startTime: "2026-02-28T19:30:00",
    locationName: "Hex & Co, Manhattan",
    hostName: "Alex Chen",
  },

  // NYC - Volunteering
  {
    key: "nyc-volunteering-upcoming-1",
    citySlug: "new-york-city",
    activitySlug: "volunteering",
    title: "City Harvest Food Pantry Shift",
    startTime: "2026-03-21T10:00:00",
    locationName: "City Harvest, Brooklyn",
    hostName: "Shannon O'Connor",
    travelerNames: ["Francesca Hart"],
  },
  {
    key: "nyc-volunteering-past-1",
    citySlug: "new-york-city",
    activitySlug: "volunteering",
    title: "Riverside Park Cleanup",
    startTime: "2026-03-07T09:30:00",
    locationName: "Riverside Park, Manhattan",
    hostName: "Sara Kim",
  },
];

const localMemberTargets: Record<ActivitySlug, number> = {
  pickleball: 4,
  coworking: 5,
  trivia: 5,
  runclub: 4,
  boardgames: 3,
  volunteering: 3,
};

const pastAttendedTargets: Record<ActivitySlug, number> = {
  pickleball: 3,
  coworking: 4,
  trivia: 4,
  runclub: 4,
  boardgames: 3,
  volunteering: 3,
};

const cancelledEventKeys = new Set([
  "rdu-pickleball-upcoming-2",
  "london-coworking-upcoming-2",
  "nyc-trivia-upcoming-2",
  "rdu-trivia-past-1",
  "nyc-runclub-past-1",
]);

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function relativeDateFromSeed(dateString: string) {
  const seedReferenceDate = new Date("2026-03-16T00:00:00");
  const seededDayStart = startOfDay(new Date());

  const originalDate = new Date(dateString);
  const diffMs = originalDate.getTime() - seedReferenceDate.getTime();

  return new Date(seededDayStart.getTime() + diffMs);
}

function isFutureEvent(date: Date) {
  return date.getTime() >= Date.now();
}

async function main() {
  await prisma.eventRSVPChange.deleteMany();
  await prisma.eventRSVP.deleteMany();
  await prisma.event.deleteMany();
  await prisma.userActivityMembership.deleteMany();
  await prisma.circle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();

  const cities = await Promise.all(
    citySeed.map((city) => prisma.city.create({ data: city }))
  );
  const cityMap = Object.fromEntries(cities.map((city) => [city.slug, city]));

  const activities = await Promise.all(
    activitySeed.map((activity) => prisma.activity.create({ data: activity }))
  );
  const activityMap = Object.fromEntries(
    activities.map((activity) => [activity.slug, activity])
  );

  const users = await Promise.all(
    userSeed.map((user) =>
      prisma.user.create({
        data: {
          name: user.name,
          phoneNumber: user.phoneNumber,
          photoUrl: user.photoUrl,
          homeCityId: cityMap[user.homeCitySlug].id,
        },
      })
    )
  );
  const userMap = Object.fromEntries(users.map((user) => [user.name, user]));

  const circles = [];
  for (const city of cities) {
    for (const activity of activities) {
      const circle = await prisma.circle.create({
        data: {
          cityId: city.id,
          activityId: activity.id,
        },
      });
      circles.push(circle);
    }
  }

  const circleMap = Object.fromEntries(
    circles.map((circle) => {
      const citySlug = cities.find((city) => city.id === circle.cityId)!.slug;
      const activitySlug = activities.find((activity) => activity.id === circle.activityId)!.slug;
      return [`${citySlug}:${activitySlug}`, circle];
    })
  );

  const membershipRows = Object.entries(membershipSeed).flatMap(([userName, activitySlugs]) =>
    activitySlugs.map((activitySlug) => ({
      userId: userMap[userName].id,
      activityId: activityMap[activitySlug].id,
    }))
  );

  await prisma.userActivityMembership.createMany({
    data: membershipRows,
    skipDuplicates: true,
  });

  const resolvedEventDates = Object.fromEntries(
    eventSeed.map((event) => [event.key, relativeDateFromSeed(event.startTime)])
  );

  const createdEvents = await Promise.all(
    eventSeed.map((event) =>
      prisma.event.create({
        data: {
          circleId: circleMap[`${event.citySlug}:${event.activitySlug}`].id,
          title: event.title,
          startTime: resolvedEventDates[event.key],
          locationName: event.locationName,
          hostUserId: userMap[event.hostName].id,
          isCancelled: false,
        },
      })
    )
  );

  const eventMap = Object.fromEntries(
    eventSeed.map((event, index) => [event.key, createdEvents[index]])
  );

  const localMembersByCircle = new Map<string, string[]>();

  for (const city of citySeed) {
    for (const activity of activitySeed) {
      const memberNames = userSeed
        .filter((user) => user.homeCitySlug === city.slug)
        .filter((user) => membershipSeed[user.name]?.includes(activity.slug))
        .map((user) => user.name);

      localMembersByCircle.set(`${city.slug}:${activity.slug}`, memberNames);
    }
  }

  const rsvpRows: {
    eventId: number;
    userId: number;
    status: RSVPStatus;
  }[] = [];

  const rsvpChangeRows: {
    eventId: number;
    userId: number;
    oldStatus: RSVPStatus | null;
    newStatus: RSVPStatus;
  }[] = [];

  for (const event of eventSeed) {
    const eventId = eventMap[event.key].id;
    const eventStartTime = resolvedEventDates[event.key];
    const localMembers =
      localMembersByCircle.get(`${event.citySlug}:${event.activitySlug}`) ?? [];
    const travelerNames = event.travelerNames ?? [];

    const eligibleLocalNames = localMembers.filter(
      (name) => name !== event.hostName && !travelerNames.includes(name)
    );

    if (isFutureEvent(eventStartTime)) {
      const targetCount = localMemberTargets[event.activitySlug];
      const chosenNames = [...travelerNames];

      for (const name of eligibleLocalNames) {
        if (chosenNames.length >= targetCount) break;
        chosenNames.push(name);
      }

      const cancelledName = cancelledEventKeys.has(event.key)
        ? chosenNames[chosenNames.length - 1]
        : null;

      for (const name of chosenNames) {
        const status =
          cancelledName && name === cancelledName
            ? RSVPStatus.cancelled
            : RSVPStatus.going;

        rsvpRows.push({
          eventId,
          userId: userMap[name].id,
          status,
        });

        if (status === RSVPStatus.cancelled) {
          rsvpChangeRows.push({
            eventId,
            userId: userMap[name].id,
            oldStatus: RSVPStatus.going,
            newStatus: RSVPStatus.cancelled,
          });
        }
      }
    } else {
      const targetCount = pastAttendedTargets[event.activitySlug];
      const chosenNames = [...travelerNames];

      for (const name of eligibleLocalNames) {
        if (chosenNames.length >= targetCount) break;
        chosenNames.push(name);
      }

      const cancelledName = cancelledEventKeys.has(event.key)
        ? eligibleLocalNames.find((name) => !chosenNames.includes(name)) ?? null
        : null;

      for (const name of chosenNames) {
        rsvpRows.push({
          eventId,
          userId: userMap[name].id,
          status: RSVPStatus.attended,
        });

        rsvpChangeRows.push({
          eventId,
          userId: userMap[name].id,
          oldStatus: RSVPStatus.going,
          newStatus: RSVPStatus.attended,
        });
      }

      if (cancelledName) {
        rsvpRows.push({
          eventId,
          userId: userMap[cancelledName].id,
          status: RSVPStatus.cancelled,
        });

        rsvpChangeRows.push({
          eventId,
          userId: userMap[cancelledName].id,
          oldStatus: RSVPStatus.going,
          newStatus: RSVPStatus.cancelled,
        });
      }
    }
  }

  await prisma.eventRSVP.createMany({
    data: rsvpRows,
    skipDuplicates: true,
  });

  await prisma.eventRSVPChange.createMany({
    data: rsvpChangeRows.map((row) => ({
      eventId: row.eventId,
      userId: row.userId,
      oldStatus: row.oldStatus ?? undefined,
      newStatus: row.newStatus,
    })),
    skipDuplicates: true,
  });

  console.log("Database seeded successfully 🌱");
  console.log(`Cities: ${cities.length}`);
  console.log(`Activities: ${activities.length}`);
  console.log(`Users: ${users.length}`);
  console.log(`Events: ${createdEvents.length}`);
  console.log(`RSVPs: ${rsvpRows.length}`);
  console.log(
    `Hosts with photos: ${[
      "Britt Williams",
      "Jake Carter",
      "Manny Alvarez",
      "Leah Bennett",
      "Hannah Cole",
      "Abbey Lawson",
      "Francesca Hart",
      "Lauren Shaw",
      "Simon Clarke",
      "Will Harrington",
      "Jon Patel",
      "Sara Kim",
      "Marcos Rivera",
      "Sean Donnelly",
      "Alex Chen",
      "Celia Martinez",
      "Shannon O'Connor",
      "Julia Hayes",
      "Kelsey Turner",
      "Emily Foster",
      "Hunter Blake",
      "Manny Rosario",
    ].length}`
  );
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });