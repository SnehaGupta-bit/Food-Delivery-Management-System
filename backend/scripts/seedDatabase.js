import mongoose from "mongoose";
import dotenv from "dotenv";
import Food from "../models/Food.js";
import User from "../models/User.js";
import DeliveryAgent from "../models/DeliveryAgent.js";

dotenv.config();

const foods = [
  {
    name: "Margherita Pizza",
    price: 299,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
    category: "Pizza",
    description: "Fresh basil, mozzarella, tomato sauce",
    rating: 4.8,
    isAvailable: true,
    isVeg: true,
    isPopular: true
  },
  {
    name: "Pepperoni Pizza",
    price: 349,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e",
    category: "Pizza",
    description: "Classic pepperoni with rich tomato base",
    rating: 4.7,
    isAvailable: true,
    isVeg: false,
    isPopular: true
  },
  {
    name: "Classic Smash Burger",
    price: 349,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    category: "Burgers",
    description: "Double patty, cheddar, caramelised onion",
    rating: 4.9,
    isAvailable: true,
    isVeg: false,
    isPopular: true
  },
  {
    name: "BBQ Bacon Burger",
    price: 399,
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b",
    category: "Burgers",
    description: "Smoky BBQ sauce, crispy bacon, pickles",
    rating: 4.8,
    isAvailable: true,
    isVeg: false,
    isPopular: false
  },
  {
    name: "Salmon Sushi Platter",
    price: 599,
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351",
    category: "Sushi",
    description: "12 pieces, soy sauce & wasabi",
    rating: 4.7,
    isAvailable: true,
    isVeg: false,
    isPopular: false
  },
  {
    name: "Tuna Roll",
    price: 449,
    image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56",
    category: "Sushi",
    description: "Fresh tuna, cucumber, sesame",
    rating: 4.6,
    isAvailable: true,
    isVeg: false,
    isPopular: false
  },
  {
    name: "Spicy Ramen Bowl",
    price: 389,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
    category: "Noodles",
    description: "Pork broth, soft egg, nori, bamboo shoots",
    rating: 4.8,
    isAvailable: true,
    isVeg: false,
    isPopular: true
  },
  {
    name: "Pad Thai Noodles",
    price: 329,
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e",
    category: "Noodles",
    description: "Rice noodles, peanuts, tofu or chicken",
    rating: 4.6,
    isAvailable: true,
    isVeg: true,
    isPopular: false
  },
  {
    name: "Street Tacos (3 pcs)",
    price: 259,
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47",
    category: "Tacos",
    description: "Grilled chicken, salsa, guacamole",
    rating: 4.6,
    isAvailable: true,
    isVeg: false,
    isPopular: true
  },
  {
    name: "Beef Burrito",
    price: 299,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f",
    category: "Tacos",
    description: "Slow-cooked beef, rice, beans, cheese",
    rating: 4.5,
    isAvailable: true,
    isVeg: false,
    isPopular: false
  },
  {
    name: "Caesar Salad",
    price: 229,
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1",
    category: "Salads",
    description: "Romaine, croutons, parmesan, dressing",
    rating: 4.4,
    isAvailable: true,
    isVeg: true,
    isPopular: false
  },
  {
    name: "Greek Salad",
    price: 219,
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
    category: "Salads",
    description: "Olives, feta, tomato, cucumber, oregano",
    rating: 4.5,
    isAvailable: true,
    isVeg: true,
    isPopular: false
  },
  {
    name: "Tiramisu Slice",
    price: 199,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
    category: "Desserts",
    description: "Mascarpone, espresso, cocoa dusting",
    rating: 4.9,
    isAvailable: true,
    isVeg: true,
    isPopular: true
  },
  {
    name: "Chocolate Lava Cake",
    price: 229,
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51",
    category: "Desserts",
    description: "Warm molten centre, vanilla ice cream",
    rating: 4.8,
    isAvailable: true,
    isVeg: true,
    isPopular: true
  },
  {
    name: "Mango Lassi",
    price: 129,
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4",
    category: "Drinks",
    description: "Creamy yoghurt, fresh mango, cardamom",
    rating: 4.7,
    isAvailable: true,
    isVeg: true,
    isPopular: false
  },
  {
    name: "Cold Brew Coffee",
    price: 149,
    image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7",
    category: "Drinks",
    description: "Smooth 24hr cold brew, optional milk",
    rating: 4.6,
    isAvailable: true,
    isVeg: true,
    isPopular: false
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Food.deleteMany({});
    await User.deleteMany({ role: { $in: ["admin", "agent"] } });
    await DeliveryAgent.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Insert foods
    const insertedFoods = await Food.insertMany(foods);
    console.log(`✅ Inserted ${insertedFoods.length} food items`);

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@quickbite.com",
      password: "admin123",
      role: "admin"
    });
    console.log("✅ Created admin user (email: admin@quickbite.com, password: admin123)");

    // Create delivery agents
    const agents = [];
    for (let i = 1; i <= 5; i++) {
      const agentUser = await User.create({
        name: `Agent ${i}`,
        email: `agent${i}@quickbite.com`,
        password: "agent123",
        role: "agent",
        phone: `98765432${i}0`
      });

      const agent = await DeliveryAgent.create({
        userId: agentUser._id,
        name: `Agent ${i}`,
        phone: `98765432${i}0`,
        vehicleNumber: `MH01AB${1000 + i}`,
        vehicleType: i % 3 === 0 ? "Car" : i % 2 === 0 ? "Scooter" : "Bike",
        currentLocation: {
          lat: 19.0760 + (Math.random() * 0.1),
          lng: 72.8777 + (Math.random() * 0.1)
        },
        isAvailable: true
      });

      agents.push(agent);
    }
    console.log(`✅ Created ${agents.length} delivery agents`);

    // Create test customer
    const customer = await User.create({
      name: "Test Customer",
      email: "customer@test.com",
      password: "test123",
      role: "customer",
      phone: "9876543210"
    });
    console.log("✅ Created test customer (email: customer@test.com, password: test123)");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📝 Test Accounts:");
    console.log("   Admin: admin@quickbite.com / admin123");
    console.log("   Customer: customer@test.com / test123");
    console.log("   Agent: agent1@quickbite.com / agent123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
