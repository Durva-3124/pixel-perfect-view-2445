export type RoleId = "volunteer" | "coordinator" | "supplier" | "auditor";

export const ROLES: { id: RoleId; label: string; short: string }[] = [
  { id: "volunteer", label: "Volunteer PWA", short: "Volunteer" },
  { id: "coordinator", label: "District Coordinator", short: "Coordinator" },
  { id: "supplier", label: "NGO Supplier", short: "Supplier" },
  { id: "auditor", label: "Auditor", short: "Auditor" },
];

export const DISASTER_EVENTS = [
  "Pune District Monsoon Flood 2026",
  "Konkan Coastal Cyclone 2026",
  "Nashik Riverine Flood 2025",
];

export const CATEGORIES = [
  { id: "food", label: "Food Rations", unit: "packs" },
  { id: "hygiene", label: "Hygiene Kits", unit: "kits" },
  { id: "water", label: "Clean Water", unit: "cans" },
  { id: "medical", label: "Medical Supplies", unit: "boxes" },
  { id: "tarpaulin", label: "Tarpaulins", unit: "sheets" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

export type QueuedRequest = {
  id: string;
  categoryId: CategoryId;
  quantity: number;
  priority: Priority;
  note: string;
  photoName: string | null;
  evidenceHash: string | null;
  gps: string;
  capturedAt: string;
  deviceSignature: string;
  synced: boolean;
};

/** Deterministic pseudo SHA-256 style hex string (demo only, not cryptographic). */
export function simulatedHash(seed: string, length = 64): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < seed.length; i++) {
    h1 = (h1 ^ seed.charCodeAt(i)) >>> 0;
    h1 = (h1 * 0x01000193) >>> 0;
    h2 = (h2 + seed.charCodeAt(i) * (i + 7)) >>> 0;
    h2 = (h2 ^ (h2 << 5)) >>> 0;
  }
  let out = "";
  let a = h1 || 1;
  let b = h2 || 2;
  while (out.length < length) {
    a = (a * 1664525 + 1013904223) >>> 0;
    b = (b ^ (a >>> 7)) >>> 0;
    out += ((a ^ b) >>> 0).toString(16).padStart(8, "0");
  }
  return out.slice(0, length);
}

export function shortHash(hash: string) {
  return `#${hash.slice(0, 4)}...${hash.slice(-2)}`;
}

export const METRICS = [
  { label: "Total Active Requests", value: 142, delta: "+18 in last 6h", tone: "primary" },
  { label: "Unmet Immediate Needs", value: 38, delta: "12 marked critical", tone: "warning" },
  { label: "Dispatched Consignments", value: 85, delta: "9 in transit", tone: "success" },
  { label: "Flagged Discrepancy Alerts", value: 3, delta: "2 awaiting review", tone: "destructive" },
] as const;

export type DuplicateCandidate = {
  pairId: string;
  confidence: number;
  reason: string;
  a: { id: string; camp: string; summary: string; by: string; at: string };
  b: { id: string; camp: string; summary: string; by: string; at: string };
};

export const DUPLICATE_CANDIDATES: DuplicateCandidate[] = [
  {
    pairId: "DUP-01",
    confidence: 92,
    reason: "Same camp + same category within 11 minutes, GPS delta 40 m",
    a: {
      id: "#RC-1049",
      camp: "Camp Alpha, Khadakwasla",
      summary: "120 Hygiene Kits · Critical",
      by: "Volunteer A. Deshmukh",
      at: "Today 08:12",
    },
    b: {
      id: "#RC-1053",
      camp: "Camp Alpha, Khadakwasla",
      summary: "115 Hygiene Kits · Critical",
      by: "Volunteer S. Patil",
      at: "Today 08:23",
    },
  },
  {
    pairId: "DUP-02",
    confidence: 78,
    reason: "Overlapping consignment description, same requesting NGO desk",
    a: {
      id: "#RC-1061",
      camp: "Camp Delta, Sinhagad Road",
      summary: "300 Water Cans · High",
      by: "Volunteer R. Kale",
      at: "Today 09:40",
    },
    b: {
      id: "#RC-1067",
      camp: "Camp Delta, Sinhagad Road",
      summary: "280 Water Cans · High",
      by: "NGO Desk — Jeevan Trust",
      at: "Today 09:58",
    },
  },
];

export type CampNeed = {
  id: string;
  camp: string;
  need: string;
  quantity: number;
  category: string;
  priority: Priority;
  unmetSince: string;
  people: number;
};

export const CAMP_NEEDS: CampNeed[] = [
  {
    id: "NEED-118",
    camp: "Camp Alpha",
    need: "120 Hygiene Kits",
    quantity: 120,
    category: "Hygiene Kits",
    priority: "Critical",
    unmetSince: "6h 20m",
    people: 480,
  },
  {
    id: "NEED-121",
    camp: "Camp Delta",
    need: "300 Water Cans",
    quantity: 300,
    category: "Clean Water",
    priority: "High",
    unmetSince: "3h 05m",
    people: 910,
  },
  {
    id: "NEED-126",
    camp: "Camp Ganga",
    need: "80 Tarpaulins",
    quantity: 80,
    category: "Tarpaulins",
    priority: "Medium",
    unmetSince: "11h 40m",
    people: 260,
  },
];

export type SupplyMatch = {
  needId: string;
  supplier: string;
  available: number;
  unitLabel: string;
  distanceKm: number;
  etaMinutes: number;
  expiryNote: string;
  reasons: string[];
  score: number;
};

export const SUPPLY_MATCHES: SupplyMatch[] = [
  {
    needId: "NEED-118",
    supplier: "NGO Hope Foundation",
    available: 150,
    unitLabel: "Kits Available",
    distanceKm: 4.2,
    etaMinutes: 35,
    expiryNote: "42 kits expiring in 9 days",
    reasons: ["Critical Urgency", "Closest Radius", "Expiring Inventory Priority"],
    score: 94,
  },
  {
    needId: "NEED-121",
    supplier: "Jeevan Trust Water Depot",
    available: 420,
    unitLabel: "Cans Available",
    distanceKm: 7.8,
    etaMinutes: 52,
    expiryNote: "Full stock within shelf life",
    reasons: ["High Urgency", "Sufficient Volume", "Verified Supplier History"],
    score: 88,
  },
  {
    needId: "NEED-126",
    supplier: "Sahyadri Relief Collective",
    available: 95,
    unitLabel: "Sheets Available",
    distanceKm: 12.4,
    etaMinutes: 70,
    expiryNote: "Monsoon-grade stock, no expiry",
    reasons: ["Longest Unmet Duration", "Only Supplier In Range"],
    score: 73,
  },
];

export type LedgerStatus = "Signed on Ledger" | "Pending Signature";
export type DeliveryStatus =
  | "Pending"
  | "Dispatched"
  | "Partial Delivery"
  | "Verified";

export type AuditStep = {
  title: string;
  actor: string;
  at: string;
  signature: string;
  tone: "neutral" | "success" | "warning" | "destructive";
  detail?: string;
};

export type Consignment = {
  id: string;
  origin: string;
  destination: string;
  summary: string;
  status: DeliveryStatus;
  statusDetail: string;
  ledger: LedgerStatus;
  updatedAt: string;
  steps: AuditStep[];
};

function sig(seed: string) {
  return simulatedHash(seed, 40);
}

export const CONSIGNMENTS: Consignment[] = [
  {
    id: "#RC-1049",
    origin: "NGO Hope Foundation",
    destination: "Camp Alpha, Khadakwasla",
    summary: "120 Hygiene Kits · 4 pallets",
    status: "Partial Delivery",
    statusDetail: "Partial Receipt - 8 Kit Shortage",
    ledger: "Signed on Ledger",
    updatedAt: "Today 14:22",
    steps: [
      {
        title: "Request Logged (Signed Hash)",
        actor: "Volunteer A. Deshmukh · Device PWA-77",
        at: "Today 08:12:41 IST",
        signature: sig("RC-1049-1"),
        tone: "neutral",
        detail: "Captured offline, synced at 08:31 with GPS 18.4529° N, 73.7695° E",
      },
      {
        title: "Allocation Approved",
        actor: "District Coordinator M. Rane",
        at: "Today 09:05:02 IST",
        signature: sig("RC-1049-2"),
        tone: "success",
        detail: "Matched to NGO Hope Foundation (150 kits available)",
      },
      {
        title: "Dispatched by NGO",
        actor: "NGO Hope Foundation · Vehicle MH-12-AF-4410",
        at: "Today 10:48:19 IST",
        signature: sig("RC-1049-3"),
        tone: "neutral",
        detail: "120 kits sealed, 4 pallets, manifest co-signed by driver",
      },
      {
        title: "Partial Delivery Flagged at Camp",
        actor: "Camp Alpha Receiving Desk",
        at: "Today 13:57:36 IST",
        signature: sig("RC-1049-4"),
        tone: "destructive",
        detail: "112 kits received, 8 kit shortage recorded with photo evidence",
      },
      {
        title: "Discrepancy Resolution Logged",
        actor: "Auditor P. Iyer",
        at: "Today 14:22:10 IST",
        signature: sig("RC-1049-5"),
        tone: "warning",
        detail: "Shortage attributed to transit damage; replacement batch queued",
      },
    ],
  },
  {
    id: "#RC-1053",
    origin: "Jeevan Trust Water Depot",
    destination: "Camp Delta, Sinhagad Road",
    summary: "300 Water Cans · 20 L each",
    status: "Dispatched",
    statusDetail: "In transit - ETA 52 min",
    ledger: "Signed on Ledger",
    updatedAt: "Today 13:10",
    steps: [
      {
        title: "Request Logged (Signed Hash)",
        actor: "Volunteer S. Patil · Device PWA-12",
        at: "Today 09:40:11 IST",
        signature: sig("RC-1053-1"),
        tone: "neutral",
      },
      {
        title: "Allocation Approved",
        actor: "District Coordinator M. Rane",
        at: "Today 11:02:44 IST",
        signature: sig("RC-1053-2"),
        tone: "success",
      },
      {
        title: "Dispatched by NGO",
        actor: "Jeevan Trust · Vehicle MH-14-KL-9080",
        at: "Today 13:10:05 IST",
        signature: sig("RC-1053-3"),
        tone: "neutral",
      },
    ],
  },
  {
    id: "#RC-1061",
    origin: "State Warehouse Hadapsar",
    destination: "Camp Ganga, Baner",
    summary: "80 Tarpaulins · monsoon grade",
    status: "Verified",
    statusDetail: "Full receipt verified at camp",
    ledger: "Signed on Ledger",
    updatedAt: "Yesterday 19:44",
    steps: [
      {
        title: "Request Logged (Signed Hash)",
        actor: "Volunteer R. Kale · Device PWA-31",
        at: "Yesterday 12:18:02 IST",
        signature: sig("RC-1061-1"),
        tone: "neutral",
      },
      {
        title: "Allocation Approved",
        actor: "District Coordinator M. Rane",
        at: "Yesterday 14:00:31 IST",
        signature: sig("RC-1061-2"),
        tone: "success",
      },
      {
        title: "Dispatched by NGO",
        actor: "Sahyadri Relief Collective",
        at: "Yesterday 16:22:58 IST",
        signature: sig("RC-1061-3"),
        tone: "neutral",
      },
      {
        title: "Full Delivery Verified at Camp",
        actor: "Camp Ganga Receiving Desk",
        at: "Yesterday 19:44:09 IST",
        signature: sig("RC-1061-4"),
        tone: "success",
      },
    ],
  },
  {
    id: "#RC-1067",
    origin: "Pending allocation",
    destination: "Camp Bhima, Wagholi",
    summary: "60 Medical Supply Boxes",
    status: "Pending",
    statusDetail: "Awaiting coordinator allocation",
    ledger: "Pending Signature",
    updatedAt: "Today 15:02",
    steps: [
      {
        title: "Request Logged (Signed Hash)",
        actor: "Volunteer N. Shaikh · Device PWA-05",
        at: "Today 15:02:27 IST",
        signature: sig("RC-1067-1"),
        tone: "neutral",
        detail: "Queued offline for 42 minutes before sync",
      },
    ],
  },
  {
    id: "#RC-1072",
    origin: "NGO Hope Foundation",
    destination: "Camp Alpha, Khadakwasla",
    summary: "8 Hygiene Kits · shortage replacement",
    status: "Dispatched",
    statusDetail: "Replacement batch dispatched",
    ledger: "Signed on Ledger",
    updatedAt: "Today 15:40",
    steps: [
      {
        title: "Replacement Raised",
        actor: "Auditor P. Iyer",
        at: "Today 14:30:00 IST",
        signature: sig("RC-1072-1"),
        tone: "warning",
      },
      {
        title: "Dispatched by NGO",
        actor: "NGO Hope Foundation",
        at: "Today 15:40:12 IST",
        signature: sig("RC-1072-2"),
        tone: "neutral",
      },
    ],
  },
];

export type SupplierStock = {
  item: string;
  available: number;
  committed: number;
  expiringDays: number | null;
};

export const SUPPLIER_STOCK: SupplierStock[] = [
  { item: "Hygiene Kits", available: 150, committed: 120, expiringDays: 9 },
  { item: "Food Ration Packs", available: 640, committed: 280, expiringDays: 21 },
  { item: "Clean Water Cans", available: 420, committed: 300, expiringDays: null },
  { item: "Medical Supply Boxes", available: 95, committed: 60, expiringDays: 5 },
  { item: "Tarpaulins", available: 95, committed: 0, expiringDays: null },
];

export const SUPPLIER_TASKS = [
  {
    id: "#RC-1049",
    destination: "Camp Alpha, Khadakwasla",
    ask: "120 Hygiene Kits",
    due: "Today 16:00",
    state: "Shortage reported",
  },
  {
    id: "#RC-1053",
    destination: "Camp Delta, Sinhagad Road",
    ask: "300 Water Cans",
    due: "Today 17:30",
    state: "In transit",
  },
  {
    id: "#RC-1067",
    destination: "Camp Bhima, Wagholi",
    ask: "60 Medical Supply Boxes",
    due: "Today 20:00",
    state: "Awaiting acceptance",
  },
];
