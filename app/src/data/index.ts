import type { DataService } from "./DataService";
import { mockDataService } from "./mockDataService";
import { appsScriptDataService } from "./appsScriptDataService";

/**
 * Env-driven toggle between the in-memory mock and the real Sheets-backed
 * client (spec §3/§5). Mock is the DEFAULT unless VITE_USE_MOCK is
 * explicitly set to "false" — keeps `npm run dev` working out of the box
 * for anyone without a deployed backend / .env.local yet.
 */
export const dataService: DataService =
  import.meta.env.VITE_USE_MOCK !== "false" ? mockDataService : appsScriptDataService;

export type { DataService } from "./DataService";
export * from "./types";
export * from "./categories";
