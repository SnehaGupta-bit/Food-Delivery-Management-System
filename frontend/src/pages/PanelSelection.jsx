import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/panel-styles.css";

const PanelSelection = () => {
  const navigate = useNavigate();

  const panels = [
    {
      id: "customer",
      title: "Customer Panel",
      description: "Order delicious food from your favorite restaurants",
      icon: "🛒",
      color: "from-blue-500 to-blue-600",
      hoverColor: "from-blue-600 to-blue-700",
      features: [
        "Browse restaurants & menus",
        "Real-time order tracking",
        "AI-powered recommendations",
        "Multiple payment options"
      ],
      route: "/",
      buttonText: "Start Ordering"
    },
    {
      id: "vendor",
      title: "Vendor Panel",
      description: "Manage your restaurant and grow your business",
      icon: "🍽️",
      color: "from-orange-500 to-red-600",
      hoverColor: "from-orange-600 to-red-700",
      features: [
        "Manage menu items",
        "Track orders in real-time",
        "View analytics & reports",
        "Update restaurant settings"
      ],
      route: "/vendor/login",
      buttonText: "Vendor Login"
    },
    {
      id: "delivery",
      title: "Delivery Partner Panel",
      description: "Earn money by delivering food to customers",
      icon: "🏍️",
      color: "from-green-500 to-green-600",
      hoverColor: "from-green-600 to-green-700",
      features: [
        "Accept delivery orders",
        "Real-time navigation",
        "Track your earnings",
        "Flexible working hours"
      ],
      route: "/delivery/login",
      buttonText: "Partner Login"
    },
    {
      id: "admin",
      title: "Admin Panel",
      description: "Manage the entire platform and operations",
      icon: "👨‍💼",
      color: "from-purple-500 to-purple-600",
      hoverColor: "from-purple-600 to-purple-700",
      features: [
        "Verify vendors & partners",
        "Manage all users",
        "Track payments & payouts",
        "Platform analytics"
      ],
      route: "/admin/login",
      buttonText: "Admin Login"
    }
  ];

  return (
    <div className="panel-selection-page">
      <div className="panel-selection-container">
        {/* Header */}
        <div className="panel-selection-header fade-in-up">
          <h1 className="panel-selection-title">🍕 QuickBite</h1>
          <p className="panel-selection-subtitle">
            Choose your panel to access the complete food delivery experience. 
            Each panel is designed for specific users with tailored features and functionality.
          </p>
        </div>

        {/* Panels Grid */}
        <div className="panel-grid">
          {panels.map((panel, index) => (
            <motion.a
              key={panel.id}
              href={panel.route}
              onClick={(e) => {
                e.preventDefault();
                navigate(panel.route);
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`panel-card ${panel.id} fade-in-up stagger-animation`}
              style={{ '--delay': `${index * 0.1}s` }}
            >
              <div className="panel-card-icon">{panel.icon}</div>
              <h2 className="panel-card-title">{panel.title}</h2>
              <p className="panel-card-description">{panel.description}</p>
              
              <ul className="panel-card-features">
                {panel.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>

              <div className="panel-card-button">
                {panel.buttonText} →
              </div>
            </motion.a>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="panel-card mt-6 text-center"
        >
          <h2 className="panel-card-title">🚀 Why Choose QuickBite?</h2>
          <div className="panel-grid mt-4">
            <div className="text-center">
              <div className="panel-card-icon">⚡</div>
              <h3 className="font-semibold text-gray-800 mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Get your food delivered in 30 minutes or less
              </p>
            </div>
            <div className="text-center">
              <div className="panel-card-icon">🤖</div>
              <h3 className="font-semibold text-gray-800 mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">
                Smart recommendations based on your mood and preferences
              </p>
            </div>
            <div className="text-center">
              <div className="panel-card-icon">🔒</div>
              <h3 className="font-semibold text-gray-800 mb-2">Secure Payments</h3>
              <p className="text-gray-600 text-sm">
                Multiple payment options with 100% secure transactions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">Need help? Contact us:</p>
          <div className="flex justify-center gap-6 flex-wrap">
            <a href="mailto:support@quickbite.com" className="text-red-500 hover:text-red-600 font-semibold">
              📧 support@quickbite.com
            </a>
            <a href="tel:+911234567890" className="text-red-500 hover:text-red-600 font-semibold">
              📞 +91 123-456-7890
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelSelection;
