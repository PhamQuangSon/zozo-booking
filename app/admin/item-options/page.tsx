import { getItemOptions } from "@/actions/item-option-actions";
import { ItemOptionsClient } from "@/components/admin/item-options-client";

export default async function ItemOptionsPage() {
  const { data: itemOptions = [], success } = await getItemOptions();

  if (!success) {
    return <div>Failed to load item options</div>;
  }

  // Prepare data for client component without functions
  const preparedItemOptions = itemOptions.map((option) => ({
    ...option,
    // Pre-format any data needed by the client
    menuItemName: option.menuItem?.name || "No Menu Item",
    restaurantName: option.menuItem?.restaurant?.name || "No Restaurant",
    choicesCount: option.optionChoices?.length || 0,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Item Options</h1>
      <ItemOptionsClient itemOptions={preparedItemOptions} />
    </div>
  );
}
