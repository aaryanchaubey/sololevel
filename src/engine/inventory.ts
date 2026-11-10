import type { ShopProduct } from "../data/inventoryCatalog";
import type { AppData, Category, InventoryItem } from "../types";

export function findMissionBooster(
  inventory: InventoryItem[],
  category: Category | undefined,
) {
  if (category) {
    const targeted = inventory.find(
      (item) =>
        item.kind === "booster" &&
        item.target === category &&
        item.quantity > 0,
    );
    if (targeted) return targeted;
  }
  return inventory.find(
    (item) =>
      item.kind === "booster" && item.target === "any" && item.quantity > 0,
  );
}

export function purchaseInventoryProduct(
  data: AppData,
  product: ShopProduct,
  id = crypto.randomUUID(),
  purchasedAt = new Date().toISOString(),
): AppData {
  if (product.price < 1000)
    throw new Error("Inventory rewards must cost at least 1,000 XP.");

  const availableXp = data.profile.availableXp ?? data.profile.lifetimeXp;
  if (availableXp < product.price)
    throw new Error(
      `You need ${product.price - availableXp} more XP to buy ${product.label}.`,
    );

  const existing = data.inventory.find(
    (item) =>
      item.kind === product.kind &&
      item.target === product.target &&
      item.label === product.label,
  );

  return {
    ...data,
    profile: {
      ...data.profile,
      availableXp: availableXp - product.price,
    },
    inventory: existing
      ? data.inventory.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      : [
          ...data.inventory,
          {
            id,
            kind: product.kind,
            target: product.target,
            label: product.label,
            quantity: 1,
            earnedAt: purchasedAt,
          },
        ],
  };
}
