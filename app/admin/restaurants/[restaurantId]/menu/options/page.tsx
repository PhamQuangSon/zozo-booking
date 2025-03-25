import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"

export default async function MenuOptionsPage({ params }: { params: { restaurantId: string } }) {
  // Fetch restaurant details
  const { success, data: restaurant, error } = await getRestaurantById(params.restaurantId)

  if (!success || !restaurant) {
    notFound()
  }

  // Mock menu options data
  const menuOptions = [
    {
      id: "1",
      name: "Size",
      required: true,
      multiSelect: false,
      choices: [
        { id: "1", name: "Small", price: 0 },
        { id: "2", name: "Medium", price: 2.0 },
        { id: "3", name: "Large", price: 4.0 },
      ],
    },
    {
      id: "2",
      name: "Toppings",
      required: false,
      multiSelect: true,
      choices: [
        { id: "4", name: "Cheese", price: 1.0 },
        { id: "5", name: "Pepperoni", price: 1.5 },
        { id: "6", name: "Mushrooms", price: 1.0 },
        { id: "7", name: "Olives", price: 0.75 },
      ],
    },
    {
      id: "3",
      name: "Dressing",
      required: true,
      multiSelect: false,
      choices: [
        { id: "8", name: "Ranch", price: 0 },
        { id: "9", name: "Italian", price: 0 },
        { id: "10", name: "Balsamic", price: 0 },
      ],
    },
  ]

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Menu Options</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Option Group
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Option Groups</CardTitle>
            <CardDescription>Manage option groups for menu items</CardDescription>
          </CardHeader>
          <CardContent>
            {menuOptions.length > 0 ? (
              <div className="space-y-6">
                {menuOptions.map((option) => (
                  <div key={option.id} className="rounded-md border">
                    <div className="flex items-center justify-between border-b p-4">
                      <div>
                        <h3 className="font-medium">{option.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {option.required ? "Required" : "Optional"} • {option.multiSelect ? "Multiple" : "Single"}{" "}
                          selection
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="mb-2 text-sm font-medium">Choices</h4>
                      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                        {option.choices.map((choice) => (
                          <div key={choice.id} className="rounded-md border p-2">
                            <div className="font-medium">{choice.name}</div>
                            {choice.price > 0 && (
                              <div className="text-sm text-muted-foreground">+${choice.price.toFixed(2)}</div>
                            )}
                          </div>
                        ))}
                        <Button variant="outline" className="flex h-auto items-center justify-center p-2" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Choice
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="mb-4 text-muted-foreground">No option groups found</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Option Group
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

