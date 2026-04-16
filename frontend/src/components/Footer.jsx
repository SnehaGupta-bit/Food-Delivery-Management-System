export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">🍕 QuickBite<span className="logo-dot" style={{ marginLeft: 4 }} /></div>
          <p className="footer-desc">
            Premium food delivery powered by AI. Mood-based ordering,
            group dining, and lightning-fast delivery at your fingertips.
          </p>
        </div>
        <div>
          <div className="footer-title">Explore</div>
          <ul className="footer-links">
            <li><a href="/menu">Full Menu</a></li>
            <li><a href="/mood">Mood Order</a></li>
            <li><a href="/group">Group Order</a></li>
            <li><a href="/orders">My Orders</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-title">Support</div>
          <ul className="footer-links">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-title">Connect</div>
          <ul className="footer-links">
            <li><a href="#">Instagram</a></li>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">LinkedIn</a></li>
            <li><a href="#">GitHub</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 QuickBite. All rights reserved.</span>
        <span>Made with ❤️ and AI</span>
      </div>
    </footer>
  );
}
