import React, { useRef, useContext } from "react";
import Navbar from "./Navbar";
import { assets } from '../assets/assets';
import AlbumItem from "./AlbumItem";
import SongItem from "./SongItem";
import { PlayerContext } from "../context/PlayerContext";

const DisplayHome = () => {
  const { songsData, albumsData, searchTerm, playWithId } =
    useContext(PlayerContext);

  // refs for the two scroll containers
  const albumsScrollRef = useRef(null);
  const songsScrollRef  = useRef(null);

  // generic scroll function
  const scroll = (ref, distance = 300) => {
    if (ref.current) {
      ref.current.scrollBy({ left: distance, behavior: "smooth" });
    }
  };

  const filterByName = (item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase());

  const filteredAlbums = albumsData.filter(filterByName);
  const filteredSongs  = songsData.filter(filterByName);

  return (
    <>
      <Navbar />

      {/* Featured Charts */}
      <section className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="my-5 font-bold text-2xl">Featured Charts</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll(albumsScrollRef, -300)}>
              <img
                className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
                src={assets.arrow_left}
                alt="Scroll left"
              />
            </button>
            <button onClick={() => scroll(albumsScrollRef, 300)}>
              <img
                className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
                src={assets.arrow_right}
                alt="Scroll right"
              />
            </button>
          </div>
        </div>
        <div
          ref={albumsScrollRef}
          className="flex overflow-auto scrollbar-hide space-x-4"
        >
          {filteredAlbums.map((album) => (
            <AlbumItem
              key={album._id}
              name={album.name}
              desc={album.desc}
              id={album._id}
              image={album.image}
            />
          ))}
          {filteredAlbums.length === 0 && (
            <p className="text-gray-400 px-4">No albums found.</p>
          )}
        </div>
      </section>

      {/* Today's Biggest Hits */}
      <section className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="my-5 font-bold text-2xl">Today's Biggest Hits</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll(songsScrollRef, -300)}>
              <img
                className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
                src={assets.arrow_left}
                alt="Scroll left"
              />
            </button>
            <button onClick={() => scroll(songsScrollRef, 300)}>
              <img
                className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
                src={assets.arrow_right}
                alt="Scroll right"
              />
            </button>
          </div>
        </div>
        <div
          ref={songsScrollRef}
          className="flex overflow-auto scrollbar-hide space-x-4"
        >
          {filteredSongs.map((song) => (
            <SongItem
              key={song._id}
              name={song.name}
              desc={song.desc}
              id={song._id}
              image={song.image}
              onClick={() => playWithId(song._id)}
            />
          ))}
          {filteredSongs.length === 0 && (
            <p className="text-gray-400 px-4">No songs found.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default DisplayHome;