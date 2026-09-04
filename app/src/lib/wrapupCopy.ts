/** Reference price for one wet cat food pouch, THB. A fixed constant so the "N bowls" comparison is deterministic, not randomized per view. */
export const WET_FOOD_POUCH_PRICE_THB = 35;

export function savedBowlsOfCatFood(savedAmount: number): number {
  return Math.floor(Math.max(0, savedAmount) / WET_FOOD_POUCH_PRICE_THB);
}
