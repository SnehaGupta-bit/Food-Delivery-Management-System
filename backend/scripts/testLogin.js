import fetch from 'node-fetch';

const testLogin = async () => {
  console.log("🧪 Testing login API for admin user...");

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@demo.com',
        password: 'admin123'
      }),
    });

    const data = await response.json();

    console.log("📊 Response Status:", response.status);
    console.log("📋 Response Data:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("✅ Login successful!");
      console.log("👤 User Role:", data.user.role);
      console.log("🔑 Token received:", data.token ? "Yes" : "No");
    } else {
      console.log("❌ Login failed:", data.message);
    }

  } catch (error) {
    console.log("❌ Network error:", error.message);
  }
};

testLogin();