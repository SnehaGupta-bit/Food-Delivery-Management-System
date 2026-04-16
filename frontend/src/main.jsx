import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "placeholder_add_to_env";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <App />
            <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 2500,
              style: {
                background: "#222236",
                color: "#f0f0f5",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                fontSize: "14px",
                fontFamily: "'Inter', sans-serif",
              },
            }}
            />
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);