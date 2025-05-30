import { getCategories } from "@/actions/category-actions";
import type { Restaurant } from "@/actions/restaurant-actions";
import { getRestaurants } from "@/actions/restaurant-actions";
import { CategoriesClient } from "@/components/admin/categories-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CategoriesPage() {
  // Fetch data using server actions
  const categoriesResult = await getCategories();
  const restaurantsResult = await getRestaurants();

  const categories = categoriesResult.success ? categoriesResult.data : [];
  const restaurants: Restaurant[] = restaurantsResult.success
    ? restaurantsResult.data
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Categories</CardTitle>
        <CardDescription>
          Manage menu categories across all restaurants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CategoriesClient
          initialCategories={categories}
          restaurants={restaurants}
        />
      </CardContent>
    </Card>
  );
}
