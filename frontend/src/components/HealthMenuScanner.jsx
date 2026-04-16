import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import "../styles/customer-panel.css";

const HealthMenuScanner = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [userProfile, setUserProfile] = useState({
    condition: "None",
    goal: "General Health"
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const healthConditions = [
    'None', 'Diabetic', 'Heart Disease', 'High Blood Pressure', 
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Low Sodium', 'Low Fat'
  ];

  const healthGoals = [
    'General Health', 'Weight Loss', 'Weight Gain', 'Muscle Building',
    'Heart Health', 'Blood Sugar Control', 'Athletic Performance'
  ];

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanMenu = async () => {
    if (!selectedImage) {
      toast.error("Please select a menu image first");
      return;
    }

    if (!userProfile.condition) {
      toast.error("Please select your health condition");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('menuImage', selectedImage);
      formData.append('userProfile', JSON.stringify(userProfile));

      const response = await fetch("http://localhost:3000/api/ai-advanced/scan-menu", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
        toast.success(`Successfully analyzed ${data.healthStats.totalItems} menu items! 🔍`);
      } else {
        toast.error(data.message || "Failed to analyze menu");
        setResults(null);
      }
    } catch (error) {
      console.error("Menu scan error:", error);
      toast.error("Failed to scan menu. Please try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const getSuitabilityColor = (suitability) => {
    switch (suitability) {
      case 'Safe': return 'text-green-600 bg-green-100';
      case 'Caution': return 'text-yellow-600 bg-yellow-100';
      case 'Avoid': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSuitabilityIcon = (suitability) => {
    switch (suitability) {
      case 'Safe': return '✅';
      case 'Caution': return '⚠️';
      case 'Avoid': return '❌';
      default: return '❓';
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
              boxShadow: '0 25px 50px rgba(16, 185, 129, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            padding: '1.5rem',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  🔍 Smart Health Menu Scanner
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
                  Upload a menu image and get personalized health recommendations
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Health Profile Setup */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                      Health Condition
                    </label>
                    <select
                      value={userProfile.condition}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, condition: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        background: 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981';
                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {healthConditions.map(condition => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                      Health Goal
                    </label>
                    <select
                      value={userProfile.goal}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, goal: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        background: 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981';
                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {healthGoals.map(goal => (
                        <option key={goal} value={goal}>
                          {goal}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                    Upload Menu Image
                  </label>
                  <div style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    textAlign: 'center',
                    transition: 'border-color 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                  >
                    {imagePreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <img
                          src={imagePreview}
                          alt="Menu preview"
                          style={{ maxWidth: '100%', maxHeight: '16rem', margin: '0 auto', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#6b7280',
                              color: 'white',
                              borderRadius: '0.75rem',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 500,
                              transition: 'background 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                            onMouseLeave={(e) => e.target.style.background = '#6b7280'}
                          >
                            Change Image
                          </button>
                          <button
                            onClick={resetScanner}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#ef4444',
                              color: 'white',
                              borderRadius: '0.75rem',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 500,
                              transition: 'background 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                            onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ fontSize: '3rem' }}>📸</div>
                        <div>
                          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                            Click to upload a menu image or drag and drop
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                            Supports JPG, PNG, GIF, WebP (max 10MB)
                          </p>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: '#10b981',
                            color: 'white',
                            borderRadius: '0.75rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'background 0.3s ease',
                            margin: '0 auto'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#059669'}
                          onMouseLeave={(e) => e.target.style.background = '#10b981'}
                        >
                          Select Menu Image
                        </button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                {/* Current Profile Display */}
                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #bfdbfe' }}>
                  <h3 style={{ fontWeight: 600, color: '#1e40af', marginBottom: '0.5rem' }}>Your Health Profile</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ color: '#3b82f6' }}>Condition:</span>
                      <span style={{ marginLeft: '0.5rem', fontWeight: 500 }}>{userProfile.condition}</span>
                    </div>
                    <div>
                      <span style={{ color: '#3b82f6' }}>Goal:</span>
                      <span style={{ marginLeft: '0.5rem', fontWeight: 500 }}>{userProfile.goal}</span>
                    </div>
                  </div>
                </div>

                {/* Scan Button */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleScanMenu}
                    disabled={loading || !selectedImage}
                    style={{
                      padding: '1rem 2rem',
                      background: loading || !selectedImage ? '#cbd5e1' : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                      color: 'white',
                      borderRadius: '0.75rem',
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      border: 'none',
                      cursor: loading || !selectedImage ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading && selectedImage) {
                        e.target.style.background = 'linear-gradient(135deg, #059669 0%, #2563eb 100%)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading && selectedImage) {
                        e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)';
                      }
                    }}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                        <div className="customer-loading-spinner"></div>
                        🤖 AI Analyzing Menu...
                      </span>
                    ) : (
                      "🔍 Scan Menu for Health Analysis"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Results Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                      Health Analysis Results
                    </h3>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                      Profile: {results.userProfile.condition} • Goal: {results.userProfile.goal}
                    </p>
                  </div>
                  <button
                    onClick={resetScanner}
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
                    🔄 Scan Another Menu
                  </button>
                </div>

                {/* Health Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>
                      {results.healthStats.safeItems}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#15803d' }}>Safe Options</div>
                  </div>
                  <div style={{ background: '#fefce8', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center', border: '1px solid #fde047' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ca8a04' }}>
                      {results.healthStats.cautionItems}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#a16207' }}>Caution Items</div>
                  </div>
                  <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center', border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>
                      {results.healthStats.avoidItems}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#b91c1c' }}>Avoid Items</div>
                  </div>
                  <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>
                      {results.healthStats.averageCalories}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#1e40af' }}>Avg Calories</div>
                  </div>
                </div>

                {/* Health Summary */}
                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #bfdbfe' }}>
                  <h4 style={{ fontWeight: 600, color: '#1e40af', marginBottom: '0.5rem' }}>Health Summary</h4>
                  <p style={{ color: '#1e40af' }}>{results.healthSummary}</p>
                </div>

                {/* Menu Analysis */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b' }}>
                    Menu Items Analysis ({results.menuAnalysis.length} items)
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    {results.menuAnalysis.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          padding: '1rem',
                          background: 'white',
                          transition: 'box-shadow 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h5 style={{ fontWeight: 600, color: '#1e293b', flex: 1 }}>
                            {item.itemName}
                          </h5>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            ...(item.suitability === 'Safe' ? { color: '#16a34a', background: '#dcfce7' } :
                               item.suitability === 'Caution' ? { color: '#ca8a04', background: '#fef9c3' } :
                               item.suitability === 'Avoid' ? { color: '#dc2626', background: '#fee2e2' } :
                               { color: '#6b7280', background: '#f3f4f6' })
                          }}>
                            {item.suitability === 'Safe' ? '✅' : item.suitability === 'Caution' ? '⚠️' : item.suitability === 'Avoid' ? '❌' : '❓'} {item.suitability}
                          </span>
                        </div>
                        
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 500 }}>Calories:</span> ~{item.estimatedCalories}
                        </div>
                        
                        <p style={{ fontSize: '0.875rem', color: '#374151', background: '#f9fafb', padding: '0.5rem', borderRadius: '0.375rem' }}>
                          {item.reasoning}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {(results.recommendations.bestChoices.length > 0 || results.recommendations.itemsToAvoid.length > 0) && (
                  <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {results.recommendations.bestChoices.length > 0 && (
                      <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
                        <h4 style={{ fontWeight: 600, color: '#15803d', marginBottom: '0.75rem' }}>
                          ✅ Best Choices for You
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {results.recommendations.bestChoices.map((item, index) => (
                            <div key={index} style={{ fontSize: '0.875rem' }}>
                              <span style={{ fontWeight: 500, color: '#15803d' }}>{item.itemName}</span>
                              <span style={{ color: '#16a34a', marginLeft: '0.5rem' }}>({item.estimatedCalories} cal)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {results.recommendations.itemsToAvoid.length > 0 && (
                      <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #fecaca' }}>
                        <h4 style={{ fontWeight: 600, color: '#b91c1c', marginBottom: '0.75rem' }}>
                          ❌ Items to Avoid
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {results.recommendations.itemsToAvoid.map((item, index) => (
                            <div key={index} style={{ fontSize: '0.875rem' }}>
                              <span style={{ fontWeight: 500, color: '#b91c1c' }}>{item.itemName}</span>
                              <span style={{ color: '#dc2626', marginLeft: '0.5rem' }}>({item.estimatedCalories} cal)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Analysis Info */}
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    <strong>AI Analysis:</strong> Powered by {results.aiAnalysis.model} • 
                    Image size: {Math.round(results.aiAnalysis.imageSize / 1024)}KB • 
                    Analyzed {results.menuAnalysis.length} menu items
                  </div>
                </div>
              </div>
            )}
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HealthMenuScanner;