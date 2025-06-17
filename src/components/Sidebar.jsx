import React, { useContext } from "react";
import { assets }        from "../assets/assets";
import { useNavigate }   from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";

const Sidebar = () => {
  const navigate            = useNavigate();
  const { searchTerm, setSearchTerm } = useContext(PlayerContext);

  return (
    <div className="w-[25%] h-full p-2 flex-col gap-2 text-white hidden lg:flex">
      {/* Top nav */}
      <div className="bg-[#121212] rounded p-4 space-y-4">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img className="w-6" src={assets.home_icon} alt="Home" />
          <p className="font-bold">Home</p>
        </div>

        <div className="flex items-center gap-3">
          <img className="w-6" src={assets.search_icon} alt="Search" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search songs or albums..."
            className="flex-1 px-3 py-1 rounded bg-[#242424] text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Library + CTA cards */}
      <div className="bg-[#121212] h-full rounded mt-4 flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img className="w-8" src={assets.stack_icon} alt="Library" />
            <p className="font-semibold">Your Library</p>
          </div>
          <div className="flex items-center gap-3">
            <img className="w-5" src={assets.arrow_icon} alt="Arrow" />
            <img className="w-5" src={assets.plus_icon} alt="Add" />
          </div>
        </div>

        <div className="p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col gap-1">
          <h1>Create your first playlist</h1>
          <p className="font-light">It's easy — we'll help you</p>
          <button className="px-4 py-1.5 bg-white text-black rounded-full mt-4">
            Create Playlist
          </button>
        </div>

        <div className="p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col gap-1 mt-4">
          <h1>Let's find some podcasts to follow</h1>
          <p className="font-light">We'll keep you updated on new episodes</p>
          <button className="px-4 py-1.5 bg-white text-black rounded-full mt-4">
            Browse Podcasts
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
