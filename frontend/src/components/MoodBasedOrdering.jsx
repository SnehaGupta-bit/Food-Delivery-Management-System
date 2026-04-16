import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext.jsx";
import "../styles/customer-panel.css";

const MoodBasedOrdering = ({ isOpen, onClose }) => {
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedMood, setSelectedMood] = useState("");
  const { addToCart } = useCart();

  const sampleMoods = [
    { emoji: "😫", text: "Stressed after work", mood: "stressed and tired after long work day" },
    { emoji: "😊", text: "Happy & celebrating", mood: "happy and celebrating with friends" },
    { emoji: "😢", text: "Sad, need comfort", mood: "sad and need comfort food" },
    { emoji: "💪", text: "Post-workout energy", mood: "energetic after workout session" },
    { emoji: "😴", text: "Tired, need quick food", mood: "tired and need something quick" },
    { emoji: "💕", text: "Romantic dinner mood", mood: "romantic dinner mood" },
    { emoji: "🤒", text: "Feeling sick", mood: "sick and need something light" },
    { emoji: "🎉", text: "Party time!", mood: "party mood and want to celebrate" }
  ];

  const analyzeMood = async (moodText) => {
    setLoading(true);
    setSelectedMood(moodText);
    
    try {
      const response = await fetch(
        `http://localhost:3000/api/ai-advanced/mood-food?mood=${encodeURIComponent(moodText)}&limit=8`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        toast.success(`Found ${data.foods.length} foods perfect for your mood! 🎯`);
      } else {
        toast.error(data.message || "Failed to analyze mood");
        setResults(null);
      }
    } catch (error) {
      console.error("Mood analysis error:", error);
      toast.error("Failed to analyze mood. Please try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomMoodSubmit = (e) => {
    e.preventDefault();
    if (mood.trim()) {
      analyzeMood(mood.trim());
    }
  };

  const handleAddToCart = (food) => {
    addToCart({
      _id: food._id,
      name: food.name,
      price: food.price,
      image: food.image,
      restaurant: food.restaurant
    });
    toast.success(`${food.name} added to cart! 🛒`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              maxWidth: '72rem',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(139, 92, 246, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            padding: '1.5rem',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  🤖 AI Mood-Based Food Ordering
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
                  Tell us how you're feeling, and we'll find the perfect food for your mood
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  transition: 'opacity 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                ✕
              </button>
            </div>
          </div>

          <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
            {!results ? (
              <div>
                {/* Custom Mood Input */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                    How are you feeling right now?
                  </h3>
                  <form onSubmit={handleCustomMoodSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      placeholder="e.g., I'm feeling stressed and need comfort food..."
                      style={{
                        flex: 1,
                        padding: '0.875rem 1rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8b5cf6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !mood.trim()}
                      style={{
                        padding: '0.875rem 1.5rem',
                        background: loading || !mood.trim() ? '#cbd5e1' : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                        color: 'white',
                        borderRadius: '0.75rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: loading || !mood.trim() ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading && mood.trim()) {
                          e.target.style.background = 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading && mood.trim()) {
                          e.target.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
                        }
                      }}
                    >
                      {loading ? "🤖 Analyzing..." : "Analyze Mood"}
                    </button>
                  </form>
                </div>

                {/* Quick Mood Selection */}
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                    Or choose a quick mood:
                  </h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '0.75rem' 
                  }}>
                    {sampleMoods.map((sample, index) => (
                      <motion.button
                        key={index}
                        onClick={() => analyzeMood(sample.mood)}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          padding: '1rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          background: 'white',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: loading ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.borderColor = '#a78bfa';
                            e.currentTarget.style.background = '#faf5ff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.background = 'white';
                          }
                        }}
                      >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{sample.emoji}</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                          {sample.text}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {loading && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      padding: '0.875rem 1.5rem', 
                      background: '#faf5ff', 
                      borderRadius: '0.75rem',
                      border: '1px solid #e9d5ff'
                    }}>
                      <div className="customer-loading-spinner"></div>
                      <span style={{ color: '#7c3aed', fontWeight: 500 }}>
                        AI is analyzing your mood and finding perfect foods...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Results Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                      Perfect Foods for Your Mood
                    </h3>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                      Mood: "{selectedMood}" • Found {results.foods.length} matches
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {results.moodTags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#f3e8ff',
                            color: '#7c3aed',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setResults(null);
                      setMood("");
                      setSelectedMood("");
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#6b7280',
                      color: 'white',
                      borderRadius: '0.75rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'background 0.3s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                    onMouseLeave={(e) => e.target.style.background = '#6b7280'}
                  >
                    🔄 Try Another Mood
                  </button>
                </div>

                {/* Food Results */}
                {results.foods.length > 0 ? (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                    gap: '1rem' 
                  }}>
                    {results.foods.map((food, index) => (
                      <motion.div
                        key={food._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          padding: '1rem',
                          background: 'white',
                          transition: 'box-shadow 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
                              {food.name}
                            </h4>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                              {food.restaurant}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ef4444' }}>
                                ₹{food.price}
                              </span>
                              {food.originalPrice && (
                                <span style={{ fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                                  ₹{food.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              ⭐ {food.rating}
                            </div>
                            {food.moodRelevanceScore > 0 && (
                              <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 500, marginTop: '0.25rem' }}>
                                🎯 {food.moodRelevanceScore} mood match
                              </div>
                            )}
                          </div>
                        </div>

                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {food.description}
                        </p>

                        {food.matchedTags && food.matchedTags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                            {food.matchedTags.map((tag, i) => (
                              <span
                                key={i}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  background: '#d1fae5',
                                  color: '#065f46',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.75rem'
                                }}
                              >
                                ✓ {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => handleAddToCart(food)}
                          style={{
                            width: '100%',
                            padding: '0.625rem 1rem',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                            color: 'white',
                            borderRadius: '0.75rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          Add to Cart
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😔</div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                      No Perfect Matches Found
                    </h3>
                    <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                      We couldn't find foods that match your specific mood, but don't worry!
                    </p>
                    <button
                      onClick={() => {
                        setResults(null);
                        setMood("");
                        setSelectedMood("");
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#8b5cf6',
                        color: 'white',
                        borderRadius: '0.75rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'background 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#7c3aed'}
                      onMouseLeave={(e) => e.target.style.background = '#8b5cf6'}
                    >
                      Try a Different Mood
                    </button>
                  </div>
                )}

                {/* AI Analysis Info */}
                {results.aiAnalysis && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.75rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      <strong>AI Analysis:</strong> Powered by {results.aiAnalysis.model} • 
                      {results.aiAnalysis.cached ? " Cached result" : " Fresh analysis"} • 
                      Search type: {results.searchType}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MoodBasedOrdering;