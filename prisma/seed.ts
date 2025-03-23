import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting to seed database...")

  // Create restaurants
  const restaurant1 = await prisma.restaurant.create({
    data: {
      name: "Pasta Paradise",
      description: "Authentic Italian cuisine with a modern twist",
      address: "123 Main St, Anytown, USA",
      phone: "555-123-4567",
      email: "info@pastaparadise.com",
      image_url: "/placeholder.svg?height=200&width=300",
      cuisine: "Italian",
    },
  })

  const restaurant2 = await prisma.restaurant.create({
    data: {
      name: "Sushi Sensation",
      description: "Fresh and delicious Japanese cuisine",
      address: "456 Oak Ave, Anytown, USA",
      phone: "555-987-6543",
      email: "info@sushisensation.com",
      image_url: "/placeholder.svg?height=200&width=300",
      cuisine: "Japanese",
    },
  })

  console.log("Created restaurants")

  // Create tables for restaurant 1
  const tables1 = await Promise.all(
    [1, 2, 3, 4, 5].map((num) =>
      prisma.table.create({
        data: {
          restaurant_id: restaurant1.id,
          number: num,
          capacity: num === 5 ? 8 : 4,
          status: "AVAILABLE",
        },
      }),
    ),
  )

  // Create tables for restaurant 2
  const tables2 = await Promise.all(
    [1, 2, 3, 4].map((num) =>
      prisma.table.create({
        data: {
          restaurant_id: restaurant2.id,
          number: num,
          capacity: 4,
          status: "AVAILABLE",
        },
      }),
    ),
  )

  console.log("Created tables")

  // Create menu for restaurant 1
  const menu1 = await prisma.menu.create({
    data: {
      name: "Main Menu",
      restaurant_id: restaurant1.id,
      is_active: true,
    },
  })

  // Create menu categories for restaurant 1
  const appetizers1 = await prisma.menuCategory.create({
    data: {
      name: "Appetizers",
      menu_id: menu1.id,
      display_order: 1,
    },
  })

  const pasta1 = await prisma.menuCategory.create({
    data: {
      name: "Pasta",
      menu_id: menu1.id,
      display_order: 2,
    },
  })

  const desserts1 = await prisma.menuCategory.create({
    data: {
      name: "Desserts",
      menu_id: menu1.id,
      display_order: 3,
    },
  })

  // Create menu items for restaurant 1
  const menuItems1 = [
    // Appetizers
    await prisma.menuItem.create({
      data: {
        name: "Bruschetta",
        description: "Toasted bread topped with tomatoes, garlic, and basil",
        price: 8.99,
        category_id: appetizers1.id,
        is_available: true,
        display_order: 1,
        image_url: "/placeholder.svg?height=100&width=100",
      },
    }),
    await prisma.menuItem.create({
      data: {
        name: "Calamari",
        description: "Fried squid served with marinara sauce",
        price: 10.99,
        category_id: appetizers1.id,
        is_available: true,
        display_order: 2,
        image_url: "/placeholder.svg?height=100&width=100",
      },
    }),
    // Pasta
    await prisma.menuItem.create({
      data: {
        name: "Spaghetti Carbonara",
        description: "Spaghetti with pancetta, eggs, Parmesan, and black pepper",
        price: 15.99,
        category_id: pasta1.id,
        is_available: true,
        display_order: 1,
        image_url: "/placeholder.svg?height=100&width=100",
      },
    }),
    await prisma.menuItem.create({
      data: {
        name: "Fettuccine Alfredo",
        description: "Fettuccine pasta in a rich, creamy Parmesan sauce",
        price: 14.99,
        category_id: pasta1.id,
        is_available: true,
        display_order: 2,
        image_url: "/placeholder.svg?height=100&width=100",
      },
    }),
    // Desserts
    await prisma.menuItem.create({
      data: {
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
        price: 7.99,
        category_id: desserts1.id,
        is_available: true,
        display_order: 1,
        image_url: "/placeholder.svg?height=100&width=100",
      },
    }),
  ]

  // Create menu for restaurant 2
  const menu2 = await prisma.menu.create({
    data: {
      name: "Main Menu",
      restaurant_id: restaurant2.id,
      is_active: true,
    },
  })

  // Create menu categories for restaurant 2
  const appetizers2 = await prisma.menuCategory.create({
    data: {
      name: "Appetizers",
      menu_id: menu2.id,
      display_order: 1,
    },
  })

  const sushi2 = await prisma.menuCategory.create({
    data: {                 
      name: "Sushi",
      menu_id: menu2.id,
      display_order: 2,
    },
  })

  // Create menu items for restaurant 2
  const menuItems2 = [
    // Appetizers
    await prisma.menuItem.create({
      data: {
        name: "Edamame",
        description: "Steamed soybeans with sea salt",
        price: 5.99,
        category_id: appetizers2.id,
        is_available: true,
        display_order: 1,
        image_url: "/placeholder.svg?height=100&width=100",
      },
    }),
    await prisma.menuItem.create({
      data: {
        name: "Gyoza",
        description: "Pan-fried dumplings filled with pork and vegetables",
        price: 7.99,
        category_id: appetizers2.id,
        is_available: true,
        display_order: 2,
        image_url: "/placeholder.svg?height=100&width=100",
      },
    }),
    // Sushi
    await prisma.menuItem.create({
      data: {
        name: "California Roll",
        description: "Crab, avocado, and cucumber roll",
        price: 8.99,
        category_id: sushi2.id,
        is_available: true,
        display_order: 1,
        image_url: "/placeholder.svg?height=100&width=100",
      },
    }),
    await prisma.menuItem.create({
      data: {
        name: "Spicy Tuna Roll",
        description: "Spicy tuna and cucumber roll",
        price: 9.99,
        category_id: sushi2.id,
        is_available: true,
        display_order: 2,
        image_url: "/placeholder.svg?height=100&width=100",
      },
    }),
  ]

  console.log("Created menus and menu items")

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

