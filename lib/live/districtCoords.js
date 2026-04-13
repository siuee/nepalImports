import coords from "@/data/districtCoords.json";

export const COORDS_BY_ID = Object.fromEntries(coords.map((c) => [c.id, c]));
