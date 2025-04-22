import bcrypt from "bcryptjs";

import {
  type OrderStatus,
  PrismaClient,
  type TableStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to seed database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);

  // Upsert to avoid duplicates
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      bio: "bio",
      image: "/menuThumb1_1.png",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log({ admin });

  // Create a regular user
  const userPassword = await bcrypt.hash("user123", 10);

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Regular User",
      email: "user@example.com",
      password: userPassword,
      bio: "bio",
      image: "/menuThumb1_1.png",
      role: "CUSTOMER",
      emailVerified: new Date(),
    },
  });

  console.log({ user });

  // Add restaurants for testing
  const restaurant1 = await prisma.restaurant.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Pasta Paradise",
      description: "Authentic Italian cuisine",
      address: "123 Main St, Anytown, USA",
      phone: "555-123-4567",
      email: "info@pastaparadise.com",
      imageUrl: "/restaurant_1.png",
      cuisine: "Italian",
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      name: "Burger Bistro",
      description: "Gourmet burgers and sides",
      address: "456 Oak Ave, Anytown, USA",
      phone: "555-987-6543",
      email: "info@burgerbistro.com",
      imageUrl: "/restaurant_2.png",
      cuisine: "American",
    },
  });

  const restaurant3 = await prisma.restaurant.create({
    data: {
      name: "Sushi Sensation",
      description: "Fresh and delicious Japanese cuisine",
      address: "789 Pine St, Anytown, USA",
      phone: "555-456-7890",
      email: "info@sushisensation.com",
      imageUrl: "/restaurant_3.png",
      cuisine: "Japanese",
    },
  });

  console.log("Created restaurants");

  // Create tables for restaurant 1
  const tables1 = await Promise.all(
    [1, 2, 3, 4, 5].map((num) =>
      prisma.table.create({
        data: {
          restaurantId: restaurant1.id,
          number: num,
          capacity: num === 5 ? 8 : 4,
          status: "AVAILABLE" as TableStatus,
        },
      })
    )
  );

  // Create tables for restaurant 2
  const tables2 = await Promise.all(
    [1, 2, 3, 4].map((num) =>
      prisma.table.create({
        data: {
          restaurantId: restaurant2.id,
          number: num,
          capacity: 4,
          status: "AVAILABLE" as TableStatus,
        },
      })
    )
  );

  console.log("Created tables");

  // Create menu categories for restaurant 1
  const appetizers1 = await prisma.category.create({
    data: {
      name: "Appetizers",
      displayOrder: 1,
      imageUrl: "/menuIcon1_1.png",
      restaurantId: restaurant1.id,
    },
  });

  const pasta1 = await prisma.category.create({
    data: {
      name: "Pasta",
      displayOrder: 2,
      imageUrl: "/menuIcon1_2.png",
      restaurantId: restaurant1.id,
    },
  });

  const desserts1 = await prisma.category.create({
    data: {
      name: "Desserts",
      displayOrder: 3,
      imageUrl: "/menuIcon1_3.png",
      restaurantId: restaurant1.id,
    },
  });

  // Create menu items for restaurant 1
  const menuItems1 = [
    // Appetizers
    await prisma.menuItem.create({
      data: {
        name: "Bruschetta",
        description: "Toasted bread topped with tomatoes, garlic, and basil",
        price: 8.99,
        categoryId: appetizers1.id,
        restaurantId: restaurant1.id,
        isAvailable: true,
        displayOrder: 1,
        imageUrl: "/menuThumb1_1.png",
      },
    }),
    await prisma.menuItem.create({
      data: {
        name: "Calamari",
        description: "Fried squid served with marinara sauce",
        price: 10.99,
        categoryId: appetizers1.id,
        restaurantId: restaurant1.id,
        isAvailable: true,
        displayOrder: 2,
        imageUrl: "/menuThumb1_2.png",
      },
    }),
    // Pasta
    await prisma.menuItem.create({
      data: {
        name: "Spaghetti Carbonara",
        description:
          "Spaghetti with pancetta, eggs, Parmesan, and black pepper",
        price: 15.99,
        categoryId: pasta1.id,
        restaurantId: restaurant1.id,
        isAvailable: true,
        displayOrder: 1,
        imageUrl: "/menuThumb1_3.png",
      },
    }),
    await prisma.menuItem.create({
      data: {
        name: "Fettuccine Alfredo",
        description: "Fettuccine pasta in a rich, creamy Parmesan sauce",
        price: 14.99,
        categoryId: pasta1.id,
        restaurantId: restaurant1.id,
        isAvailable: true,
        displayOrder: 2,
        imageUrl: "/menuThumb1_4.png",
      },
    }),
    // Desserts
    await prisma.menuItem.create({
      data: {
        name: "Tiramisu",
        description:
          "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
        price: 7.99,
        categoryId: desserts1.id,
        restaurantId: restaurant1.id,
        isAvailable: true,
        displayOrder: 1,
        imageUrl: "/menuThumb1_5.png",
      },
    }),
  ];

  // Create menu categories for restaurant 2
  const appetizers2 = await prisma.category.create({
    data: {
      name: "Appetizers",
      displayOrder: 1,
      imageUrl: "/menuIcon1_2.png",
      restaurantId: restaurant2.id,
    },
  });

  const burgers2 = await prisma.category.create({
    data: {
      name: "Burgers",
      restaurantId: restaurant2.id,
      displayOrder: 2,
      imageUrl: "/menuIcon1_3.png",
    },
  });

  // Create menu items for restaurant 2
  const menuItems2 = [
    // Appetizers
    await prisma.menuItem.create({
      data: {
        name: "Onion Rings",
        description: "Crispy battered onion rings with dipping sauce",
        price: 5.99,
        categoryId: appetizers2.id,
        restaurantId: restaurant2.id,
        isAvailable: true,
        displayOrder: 1,
        imageUrl: "/menuThumb1_6.png",
      },
    }),
    await prisma.menuItem.create({
      data: {
        name: "Loaded Fries",
        description: "French fries topped with cheese, bacon, and green onions",
        price: 7.99,
        categoryId: appetizers2.id,
        restaurantId: restaurant2.id,
        isAvailable: true,
        displayOrder: 2,
        imageUrl: "/menuThumb1_7.png",
      },
    }),
    // Burgers
    await prisma.menuItem.create({
      data: {
        name: "Classic Burger",
        description:
          "Beef patty with lettuce, tomato, onion, and special sauce",
        price: 12.99,
        categoryId: burgers2.id,
        restaurantId: restaurant2.id,
        isAvailable: true,
        displayOrder: 1,
        imageUrl: "/menuThumb1_8.png",
      },
    }),
    await prisma.menuItem.create({
      data: {
        name: "Cheese Burger",
        description:
          "Beef patty with cheddar cheese, lettuce, tomato, and onion",
        price: 13.99,
        categoryId: burgers2.id,
        restaurantId: restaurant2.id,
        isAvailable: true,
        displayOrder: 2,
        imageUrl: "/menuThumb1_9.png",
      },
    }),
  ];

  // Create menu categories for restaurant 3
  const appetizers3 = await prisma.category.create({
    data: {
      name: "Appetizers",
      displayOrder: 1,
      imageUrl: "/menuIcon1_1.png",
      restaurantId: restaurant3.id,
    },
  });

  const sushi3 = await prisma.category.create({
    data: {
      name: "Sushi",
      restaurantId: restaurant3.id,
      displayOrder: 2,
      imageUrl: "/menuIcon1_4.png",
    },
  });

  // Create menu items for restaurant 3
  const menuItems3 = [
    // Appetizers
    await prisma.menuItem.create({
      data: {
        name: "Edamame",
        description: "Steamed soybeans with sea salt",
        price: 5.99,
        categoryId: appetizers3.id,
        restaurantId: restaurant3.id,
        isAvailable: true,
        displayOrder: 1,
        imageUrl: "/menuThumb1_2.png",
      },
    }),
    await prisma.menuItem.create({
      data: {
        name: "Gyoza",
        description: "Pan-fried dumplings filled with pork and vegetables",
        price: 7.99,
        categoryId: appetizers3.id,
        restaurantId: restaurant3.id,
        isAvailable: true,
        displayOrder: 2,
        imageUrl: "/menuThumb1_3.png",
      },
    }),
    // Sushi
    await prisma.menuItem.create({
      data: {
        name: "California Roll",
        description: "Crab, avocado, and cucumber roll",
        price: 8.99,
        categoryId: sushi3.id,
        restaurantId: restaurant3.id,
        isAvailable: true,
        displayOrder: 1,
        imageUrl: "/menuThumb1_4.png",
      },
    }),
    await prisma.menuItem.create({
      data: {
        name: "Spicy Tuna Roll",
        description: "Spicy tuna and cucumber roll",
        price: 9.99,
        categoryId: sushi3.id,
        restaurantId: restaurant3.id,
        isAvailable: true,
        displayOrder: 2,
        imageUrl: "/menuThumb1_5.png",
      },
    }),
  ];

  console.log("Created menu categories and items");

  // Create menu item options
  const menuOptions = await Promise.all([
    prisma.menuItemOption.create({
      data: {
        name: "Size",
        isRequired: true,
        priceAdjustment: 0, // Using camelCase to match schema
        menuItemId: menuItems1[0].id, // Connect to Bruschetta
        optionChoices: {
          create: [
            { name: "Small", priceAdjustment: 0 }, // Using camelCase
            { name: "Medium", priceAdjustment: 2.0 }, // Using camelCase
            { name: "Large", priceAdjustment: 4.0 }, // Using camelCase
          ],
        },
      },
    }),
    prisma.menuItemOption.create({
      data: {
        name: "Toppings",
        isRequired: false,
        priceAdjustment: 0, // Using camelCase
        menuItemId: menuItems1[0].id, // Connect to Calamari
        optionChoices: {
          create: [
            { name: "Cheese", priceAdjustment: 1.0 }, // Using camelCase
            { name: "Pepperoni", priceAdjustment: 1.5 }, // Using camelCase
            { name: "Mushrooms", priceAdjustment: 1.0 }, // Using camelCase
            { name: "Olives", priceAdjustment: 0.75 }, // Using camelCase
          ],
        },
      },
    }),
    prisma.menuItemOption.create({
      data: {
        name: "Toppings",
        isRequired: false,
        priceAdjustment: 0, // Using camelCase
        menuItemId: menuItems1[1].id, // Connect to Calamari
        optionChoices: {
          create: [
            { name: "Cheese", priceAdjustment: 1.0 }, // Using camelCase
            { name: "Pepperoni", priceAdjustment: 1.5 }, // Using camelCase
            { name: "Mushrooms", priceAdjustment: 1.0 }, // Using camelCase
            { name: "Olives", priceAdjustment: 0.75 }, // Using camelCase
          ],
        },
      },
    }),
    prisma.menuItemOption.create({
      data: {
        name: "Sauce",
        isRequired: true,
        priceAdjustment: 0, // Using camelCase
        menuItemId: menuItems1[2].id, // Connect to Spaghetti Carbonara
        optionChoices: {
          create: [
            { name: "Regular", priceAdjustment: 0 }, // Using camelCase
            { name: "Extra", priceAdjustment: 1.0 }, // Using camelCase
            { name: "On the side", priceAdjustment: 0 }, // Using camelCase
          ],
        },
      },
    }),
  ]);

  console.log("Created menu item options");

  // Create Orders
  await Promise.all([
    prisma.order.create({
      data: {
        tableId: tables1[2].id,
        restaurantId: restaurant1.id,
        userId: user.id,
        status: "NEW" as OrderStatus,
        totalAmount: 45.99,
        createdAt: new Date(),
        orderItems: {
          // Changed from order_items to orderItems
          create: [
            {
              menuItemId: menuItems1[0].id,
              quantity: 2,
              unitPrice: menuItems1[0].price,
              notes: "Extra crispy",
            },
            {
              menuItemId: menuItems1[2].id,
              quantity: 1,
              unitPrice: menuItems1[2].price,
              notes: "Light sauce",
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        tableId: tables1[0].id,
        restaurantId: restaurant1.id,
        userId: user.id,
        status: "COMPLETED" as OrderStatus,
        totalAmount: 23.5,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
    }),
    prisma.order.create({
      data: {
        tableId: tables1[4].id,
        restaurantId: restaurant1.id,
        userId: user.id,
        status: "PREPARING" as OrderStatus,
        totalAmount: 78.25,
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        orderItems: {
          // Changed from order_items to orderItems
          create: [
            {
              menuItemId: menuItems1[0].id,
              quantity: 2,
              unitPrice: menuItems1[0].price,
              notes: "No garlic",
            },
            {
              menuItemId: menuItems1[1].id,
              quantity: 1,
              unitPrice: menuItems1[1].price,
              notes: "Extra crispy",
            },
          ],
        },
      },
    }),
  ]);

  console.log("Created orders");
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
