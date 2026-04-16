import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

const createDemoUsers = async () => {
  console.log("🚀 Creating demo users via API...");

  const demoUsers = [
    {
      name: "Demo Customer",
      email: "customer@demo.com",
      password: "customer123",
      role: "customer"
    },
    {
      name: "Demo Vendor",
      email: "vendor@demo.com",
      password: "vendor123",
      role: "vendor",
      restaurantName: "Demo Restaurant"
    },
    {
      name: "Demo Delivery Partner",
      email: "delivery@demo.com",
      password: "delivery123",
      role: "delivery_partner",
      vehicleType: "bike"
    },
    {
      name: "Demo Admin",
      email: "admin@demo.com",
      password: "admin123",
      role: "admin"
    }
  ];

  for (const user of demoUsers) {
    try {
      console.log(`📝 Creating ${user.role}: ${user.email}`);
      
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ Created ${user.role}: ${user.email}`);
      } else {
        if (result.message && result.message.includes('already exists')) {
          console.log(`ℹ️  ${user.role} already exists: ${user.email}`);
        } else {
          console.log(`❌ Failed to create ${user.role}: ${result.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error creating ${user.role}: ${error.message}`);
    }
  }

  console.log("\n🎉 Demo user creation completed!");
  console.log("\n📋 Login Credentials:");
  console.log("┌─────────────────┬─────────────────────┬─────────────────┐");
  console.log("│ Panel           │ Email               │ Password        │");
  console.log("├─────────────────┼─────────────────────┼─────────────────┤");
  console.log("│ Customer        │ customer@demo.com   │ customer123     │");
  console.log("│ Vendor          │ vendor@demo.com     │ vendor123       │");
  console.log("│ Delivery        │ delivery@demo.com   │ delivery123     │");
  console.log("│ Admin           │ admin@demo.com      │ admin123        │");
  console.log("└─────────────────┴─────────────────────┴─────────────────┘");

  console.log("\n🌐 Panel URLs:");
  console.log("• Customer Panel:  http://localhost:5173/");
  console.log("• Vendor Panel:    http://localhost:5173/vendor/login");
  console.log("• Delivery Panel:  http://localhost:5173/delivery/login");
  console.log("• Admin Panel:     http://localhost:5173/admin/login");
  console.log("• Panel Selection: http://localhost:5173/panels");

  console.log("\n💡 You can now login to any panel using the credentials above!");
};

createDemoUsers();