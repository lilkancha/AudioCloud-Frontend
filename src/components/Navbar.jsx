import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PREMIUM_EMAILS_KEY = 'premiumEmails';
const IS_PREMIUM_KEY = 'isPremium';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // helper to add a newly-subscribed email
  const addPremiumEmail = (email) => {
    const list = JSON.parse(localStorage.getItem(PREMIUM_EMAILS_KEY) || '[]');
    if (!list.includes(email)) {
      list.push(email);
      localStorage.setItem(PREMIUM_EMAILS_KEY, JSON.stringify(list));
    }
    localStorage.setItem(IS_PREMIUM_KEY, 'true');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // check if they've ever subscribed
        const list = JSON.parse(localStorage.getItem(PREMIUM_EMAILS_KEY) || '[]');
        const premium = list.includes(currentUser.email);
        localStorage.setItem(IS_PREMIUM_KEY, premium.toString());
      } else {
        // no user: forcibly clear premium flag
        localStorage.setItem(IS_PREMIUM_KEY, 'false');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will pick up the new user and set isPremium
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // clear premium flag on logout
      localStorage.setItem(IS_PREMIUM_KEY, 'false');
      setUser(null);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const handleExplorePremium = () => {
    if (!user) {
      toast.error('Please login before subscribing for premium');
    } else {
      // Here you’d normally kick off your real subscription flow.
      // Once they’re confirmed as paid, call addPremiumEmail(user.email).
      // For demo purposes, let’s mark them premium immediately:
      addPremiumEmail(user.email);
      navigate('/premium');
    }
  };

  const isPremium = localStorage.getItem(IS_PREMIUM_KEY) === 'true';

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="w-full flex justify-between items-center font-semibold">
        <div className="flex items-center gap-2">
          <img
            onClick={() => navigate(-1)}
            className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
            src={assets.arrow_left}
            alt="Back"
          />
          <img
            onClick={() => navigate(1)}
            className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
            src={assets.arrow_right}
            alt="Forward"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExplorePremium}
            className="bg-white text-black text-[15px] px-4 py-1 rounded-2xl cursor-pointer"
          >
            Explore Premium
          </button>

          {user ? (
            <div
              onClick={handleLogout}
              className={`relative cursor-pointer ${isPremium ? 'ring-2 ring-yellow-400 rounded-full' : ''}`}
              title={isPremium ? 'Premium User: Click to logout' : 'Click to logout'}
            >
              <img
                src={user.photoURL || ''}
                alt="profile"
                className="w-8 h-8 rounded-full"
              />
              {isPremium && (
                <span className="absolute bottom-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-1 rounded-full">
                  ★
                </span>
              )}
            </div>
          ) : (
            <button
              className="bg-white text-black w-20 h-8 px-4 py-1 rounded-2xl flex items-center justify-center cursor-pointer"
              onClick={handleLogin}
            >
              Login
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <p className="bg-white text-black px-4 py-1 rounded-2xl cursor-pointer">All</p>
        <p className="bg-black text-white px-4 py-1 rounded-2xl cursor-pointer">Music</p>
        <p className="bg-black text-white px-4 py-1 rounded-2xl cursor-pointer">Podcasts</p>
      </div>
    </>
  );
};

export default Navbar;
