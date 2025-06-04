import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv-flow";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Seed menu items with categories and imagePaths
  const menuItems = [
    {
      name: "Classic Cheeseburger",
      price: 9.99,
      imagePath: "/public/menuIcons/cheeseburger.png",
      description: "Juicy beef patty with melted cheese, lettuce, tomato, and special sauce",
      category: "Burgers"
    },
    {
      name: "Deluxe Hotdog",
      price: 7.99,
      imagePath: "/public/menuIcons/hotdog.png",
      description: "Premium beef hotdog with mustard, ketchup, and relish",
      category: "Sandwiches"
    },
    {
      name: "Crispy French Fries",
      price: 4.99,
      imagePath: "/public/menuIcons/fries.png",
      description: "Golden crispy french fries with sea salt",
      category: "Sides"
    },
    {
      name: "Pepperoni Pizza",
      price: 14.99,
      imagePath: "/public/menuIcons/pizza.png",
      description: "Hand-tossed pizza with pepperoni, mozzarella, and tomato sauce",
      category: "Pizza"
    },
    {
      name: "Grilled Chicken",
      price: 12.99,
      imagePath: "/public/menuIcons/chicken.png",
      description: "Herb-marinated grilled chicken breast with vegetables",
      category: "Main Courses"
    },
    {
      name: "Premium Steak",
      price: 24.99,
      imagePath: "/public/menuIcons/steak.png",
      description: "Prime cut steak cooked to perfection",
      category: "Main Courses"
    },
    {
      name: "Steak and Cheese Sandwich",
      price: 13.99,
      imagePath: "/public/menuIcons/steakAndCheese.png",
      description: "Thinly sliced steak with melted cheese on a toasted roll",
      category: "Sandwiches"
    },
    {
      name: "Beef Tacos",
      price: 10.99,
      imagePath: "/public/menuIcons/taco.png",
      description: "Three soft tacos with seasoned beef, lettuce, cheese, and salsa",
      category: "Mexican"
    },
    {
      name: "Chocolate Dipped Donut",
      price: 3.99,
      imagePath: "/public/menuIcons/chocolateDippedDonut.png",
      description: "Fluffy donut dipped in rich chocolate glaze",
      category: "Desserts"
    },
    {
      name: "Maple Dipped Donut with Sprinkles",
      price: 4.29,
      imagePath: "/public/menuIcons/mapleDippedWithSprinklesDonut.png",
      description: "Donut with maple glaze and colorful sprinkles",
      category: "Desserts"
    },
    {
      name: "Buttery Croissant",
      price: 3.49,
      imagePath: "/public/menuIcons/croissant.png",
      description: "Flaky, buttery croissant baked to golden perfection",
      category: "Bakery"
    },
    {
      name: "Cherry Pie",
      price: 5.99,
      imagePath: "/public/menuIcons/cherryPie.png",
      description: "Sweet cherry filling in a flaky crust",
      category: "Desserts"
    },
    {
      name: "Asian Noodles",
      price: 11.99,
      imagePath: "/public/menuIcons/noodles.png",
      description: "Stir-fried noodles with vegetables and choice of protein",
      category: "Asian"
    }
  ];

  console.log("Seeding menu items...");

  // Use createMany for bulk insertion
  await prisma.menuItem.createMany({
    data: menuItems,
    skipDuplicates: true // Skip if a record with the same unique fields already exists
  });

  console.log("Seeding menu items completed successfully");

  // Get all menu items for order creation
  const allMenuItems = await prisma.menuItem.findMany();

  // Create 15 orders with different statuses and types
  console.log("Seeding orders...");

  // Define possible statuses and types
  const statuses = ["Pending", "Preparing", "Ready", "Delivered", "Cancelled"];
  const types = ["Delivery", "Pickup", "Dine-in"];

  // Sample addresses
  const addresses = [
    "123 Main St, New York, NY 10001",
    "456 Elm St, Los Angeles, CA 90001",
    "789 Oak St, Chicago, IL 60007",
    "321 Pine St, San Francisco, CA 94101",
    "654 Maple Ave, Boston, MA 02108",
    "987 Cedar Rd, Miami, FL 33101",
    "741 Birch Ln, Seattle, WA 98101",
    "852 Walnut Dr, Austin, TX 78701",
    "963 Cherry Blvd, Denver, CO 80201",
    "159 Spruce Ct, Atlanta, GA 30301"
  ];

  // Sample customer names
  const customers = [
    "John Smith",
    "Emma Johnson",
    "Michael Williams",
    "Sophia Brown",
    "James Jones",
    "Olivia Davis",
    "Robert Miller",
    "Ava Wilson",
    "William Moore",
    "Isabella Taylor"
  ];

  // Create orders
  for (let i = 0; i < 25; i++) {
    // Select random status, type, address, and customer
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const address = addresses[Math.floor(Math.random() * addresses.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];

    // Create between 1 and 5 order items
    const numItems = Math.floor(Math.random() * 5) + 1;
    const orderItems: Array<{ menuItemId: number; quantity: number; price: number }> = [];
    let total = 0;

    // Create unique set of menu items for this order
    const selectedMenuItemIndices: number[] = [];
    while (selectedMenuItemIndices.length < numItems) {
      const randomIndex = Math.floor(Math.random() * allMenuItems.length);
      if (!selectedMenuItemIndices.includes(randomIndex)) {
        selectedMenuItemIndices.push(randomIndex);
      }
    }

    // Create order items
    for (const index of selectedMenuItemIndices) {
      const menuItem = allMenuItems[index];
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
      const price = Number(menuItem.price);

      orderItems.push({
        menuItemId: menuItem.id,
        quantity,
        price
      });

      total += price * quantity;
    }

    // Add delivery fee for delivery orders
    let deliveryFee: number | null = null;
    if (type === "Delivery") {
      deliveryFee = 3.99;
      total += deliveryFee;
    }

    // Create a date between 1 and 14 days ago
    const daysAgo = Math.floor(Math.random() * 14) + 1;
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - daysAgo);

    // Create the order
    await prisma.order.create({
      data: {
        customer,
        address,
        status,
        type,
        total,
        deliveryFee,
        time: orderDate,
        createdAt: orderDate,
        updatedAt: orderDate,
        orderItems: {
          create: orderItems.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            menuItemId: item.menuItemId
          }))
        }
      }
    });
  }

  console.log("Seeding orders completed successfully");
  console.log("All seeding completed successfully");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma client connection
    await prisma.$disconnect();
  });
