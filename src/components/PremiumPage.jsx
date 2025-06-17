import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
const url = 'http://localhost:4000';
const PremiumPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) navigate("/");
      else setUser(currentUser);
    });
    return unsubscribe;
  }, [navigate]);

  const subscribe = async () => {
    if (!user) {
      toast.error("Please login before subscribing for premium");
      return;
    }

    setLoading(true);
    try {
      // 1) Hit our backend to create an order
      const resp = await axios.post(
        `${url}/api/payment/create-order`,
        { amount: 100 }, // 100 paise = ₹1
        { headers: { "Content-Type": "application/json" } }
      );

      if (resp.status !== 200) {
        console.error("Create-order failed:", resp.status, resp.statusText);
        toast.error(`Order creation failed (${resp.status})`);
        setLoading(false);
        return;
      }

      const order = resp.data; // <— your actual order object
      setOrderData(order);

      // 2) Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        toast.error("Failed to load payment SDK");
        setLoading(false);
        return;
      }

      // 3) Open Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "MyApp Premium",
        order_id: order.id,
        handler: () => {
          localStorage.setItem("isPremium", "true");
          toast.success("Subscription successful!");
          navigate("/");
        },
        prefill: {
          name: user.displayName,
          email: user.email,
        },
        theme: { color: "#F37254" },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      console.error("Network or JSON error:", err);
      toast.error("Network error – please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black-100 p-4">
      <ToastContainer position="top-center" />

      <h1 className="text-2xl text-white font-bold mb-6">Go Premium</h1>
      <p className="mb-6 text-white ">Enjoy ad-free, unlimited access for just ₹1.</p>

      {orderData && (
        <div className="mb-4 p-3 bg-white text-black rounded shadow">
          <p>
            <strong>Order ID:</strong> {orderData.id}
          </p>
          <p>
            <strong>Amount:</strong> ₹{(orderData.amount / 100).toFixed(2)}
          </p>
          <p>
            <strong>Currency:</strong> {orderData.currency}
          </p>
        </div>
      )}

      <button
        onClick={subscribe}
        disabled={loading}
        className={`px-6 py-2 rounded-full font-semibold transition ${
          loading
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-yellow-400 text-black hover:brightness-90"
        }`}
      >
        {loading ? "Processing…" : "Subscribe for ₹1"}
      </button>
    </div>
  );
};

export default PremiumPage;