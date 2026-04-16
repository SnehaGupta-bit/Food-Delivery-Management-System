import { useState, useEffect } from "react";
import AddFoodForm from "../components/AddFoodForm.jsx";
import toast from "react-hot-toast";
import "../styles/vendor-panel.css";

const FoodManagement = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/food");
      const data = await response.json();
      setFoods(data);
    } catch (error) {
      console.error("Error fetching foods:", error);
      toast.error("Failed to load food items");
    } finally {
      setLoading(false);
    }
  };

  const handleFoodAdded = (newFood) => {
    setFoods(prev => [...prev, newFood]);
    setShowAddForm(false);
  };

  const handleDeleteFood = async (id, foodName) => {
    // Create a custom confirmation using toast
    const toastId = toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <strong>Delete Food Item?</strong>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Are you sure you want to delete "{foodName}"? This action cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              toast.error("Delete cancelled");
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const response = await fetch(`http://localhost:3000/api/food/${id}`, {
                  method: "DELETE",
                });

                if (response.ok) {
                  setFoods(prev => prev.filter(food => food._id !== id));
                  toast.success("Food item deleted successfully! 🗑️");
                } else {
                  toast.error("Failed to delete food item");
                }
              } catch (error) {
                console.error("Error deleting food:", error);
                toast.error("Network error");
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      position: 'top-center',
    });
  };

  const seedDatabase = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/food/seed", {
        method: "POST",
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Database seeded with ${data.count} items!`);
        fetchFoods();
      } else {
        toast.error("Failed to seed database");
      }
    } catch (error) {
      console.error("Error seeding database:", error);
      toast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fdba74 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="vendor-loading-spinner" style={{ 
            width: '4rem', 
            height: '4rem', 
            margin: '0 auto',
            borderWidth: '4px'
          }}></div>
          <p style={{ 
            marginTop: '1.5rem', 
            color: '#44403c', 
            fontSize: '1.125rem', 
            fontWeight: 600 
          }}>Loading food items...</p>
          <p style={{ 
            marginTop: '0.5rem', 
            color: '#78716c' 
          }}>Please wait while we fetch your menu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        {/* Header */}
        <div className="vendor-dashboard-header" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 className="vendor-dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  🍽️ Food Management
                </h1>
                <p className="vendor-dashboard-subtitle">
                  Manage your restaurant's menu items with ease
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={seedDatabase}
                  className="vendor-btn-secondary"
                  style={{ 
                    padding: '0.75rem 1.5rem',
                    background: 'white',
                    color: 'var(--vendor-primary)',
                    fontWeight: 600
                  }}
                >
                  🌱 Seed Database
                </button>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="vendor-btn-primary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  {showAddForm ? "❌ Cancel" : "➕ Add New Item"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div style={{ marginBottom: '2rem' }}>
            <AddFoodForm onFoodAdded={handleFoodAdded} />
          </div>
        )}

        {/* Stats */}
        <div className="vendor-stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="vendor-stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Items</h3>
                <p className="vendor-stat-number">{foods.length}</p>
              </div>
              <div style={{ fontSize: '3rem' }}>🍽️</div>
            </div>
          </div>
          <div className="vendor-stat-card" style={{ borderLeftColor: '#22c55e' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available</h3>
                <p className="vendor-stat-number" style={{ color: '#22c55e' }}>
                  {foods.filter(f => f.isAvailable !== false).length}
                </p>
              </div>
              <div style={{ fontSize: '3rem' }}>✅</div>
            </div>
          </div>
          <div className="vendor-stat-card" style={{ borderLeftColor: '#eab308' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vegetarian</h3>
                <p className="vendor-stat-number" style={{ color: '#eab308' }}>
                  {foods.filter(f => f.isVeg).length}
                </p>
              </div>
              <div style={{ fontSize: '3rem' }}>🥗</div>
            </div>
          </div>
          <div className="vendor-stat-card" style={{ borderLeftColor: '#f97316' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categories</h3>
                <p className="vendor-stat-number">
                  {new Set(foods.map(f => f.category)).size}
                </p>
              </div>
              <div style={{ fontSize: '3rem' }}>📂</div>
            </div>
          </div>
        </div>

        {/* Food Items Grid */}
        <div className="vendor-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--vendor-primary) 0%, var(--vendor-secondary) 100%)',
            padding: '1.5rem',
            color: 'white'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📋 All Food Items
            </h2>
          </div>
          
          {foods.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
              <p style={{ color: '#78716c', fontSize: '1.25rem', fontWeight: 600 }}>No food items found</p>
              <p style={{ color: '#a8a29e', marginTop: '0.5rem' }}>Add some items or seed the database to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="vendor-btn-primary"
                style={{ marginTop: '1.5rem' }}
              >
                ➕ Add Your First Item
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Item
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Category
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Price
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Rating
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Status
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{ background: 'white' }}>
                  {foods.map((food, index) => (
                    <tr key={food._id} style={{ 
                      borderTop: index > 0 ? '1px solid #e7e5e4' : 'none',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: '2rem', marginRight: '0.75rem' }}>{food.emoji}</span>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1c1917' }}>
                              {food.name}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#78716c' }}>
                              {food.restaurant}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          borderRadius: '9999px', 
                          background: 'linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%)', 
                          color: '#b91c1c',
                          display: 'inline-block'
                        }}>
                          {food.category}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '1.125rem' }}>₹{food.price}</span>
                          {food.originalPrice && (
                            <span style={{ color: '#a8a29e', textDecoration: 'line-through', fontSize: '0.75rem' }}>
                              ₹{food.originalPrice}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: 600, color: '#eab308' }}>
                        ⭐ {food.rating || 4.0}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            borderRadius: '9999px',
                            background: food.isAvailable !== false ? '#dcfce7' : '#fee2e2',
                            color: food.isAvailable !== false ? '#166534' : '#991b1b',
                            display: 'inline-block'
                          }}>
                            {food.isAvailable !== false ? '✅ Available' : '❌ Unavailable'}
                          </span>
                          {food.isVeg && (
                            <span style={{ 
                              padding: '0.25rem 0.75rem', 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              borderRadius: '9999px',
                              background: '#dcfce7',
                              color: '#166534',
                              display: 'inline-block'
                            }}>
                              🥗 Veg
                            </span>
                          )}
                          {food.badge && (
                            <span style={{ 
                              padding: '0.25rem 0.75rem', 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              borderRadius: '9999px',
                              background: 'linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%)',
                              color: '#b91c1c',
                              display: 'inline-block'
                            }}>
                              🔥 {food.badge}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: 500 }}>
                        <button
                          onClick={() => handleDeleteFood(food._id, food.name)}
                          className="vendor-btn-delete"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodManagement;