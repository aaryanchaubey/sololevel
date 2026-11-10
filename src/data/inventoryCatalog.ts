import type { Category, InventoryItem } from "../types";

export type ShopProduct = {
  id: string;
  label: string;
  description: string;
  effect: string;
  section: "challenge-support" | "mission-boosters";
  kind: InventoryItem["kind"];
  target: InventoryItem["target"];
  price: number;
};

const categoryBoost = (category: Category, label: string): ShopProduct => ({
  id: `${category}-booster`,
  label,
  description: `Prepare a bonus for your next newly completed ${category} mission.`,
  effect: "One use · +50% mission XP · no rank or challenge effect",
  section: "mission-boosters",
  kind: "booster",
  target: category,
  price: 1200,
});

/** XP-only product catalog. Prices remain at or above the player's 1,000 XP floor. */
export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "recovery-skip",
    label: "Recovery Skip",
    description:
      "Excuse one mission already marked missed inside an active 21-day challenge.",
    effect:
      "One use · removes that mission from the challenge denominator · never counts as complete",
    section: "challenge-support",
    kind: "recovery_skip",
    target: "any",
    price: 1200,
  },
  categoryBoost("fitness", "Fitness Booster"),
  categoryBoost("study", "Study Booster"),
  categoryBoost("career", "Career Booster"),
  categoryBoost("discipline", "Discipline Booster"),
  {
    id: "mission-booster",
    label: "Universal Mission Booster",
    description:
      "Use a bonus on the next newly completed mission in any category.",
    effect: "One use · +50% mission XP · no rank or challenge effect",
    section: "mission-boosters",
    kind: "booster",
    target: "any",
    price: 1800,
  },
];
