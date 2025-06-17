import React, { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";

export const PlayerContext = createContext();

const PlayerContextProvider = ({ children }) => {

  const audioRef  = useRef(null);
  const seekBg    = useRef(null);
  const seekBar   = useRef(null);
  const volumeBg  = useRef(null);
  const volumeBar = useRef(null);


  const [songsData,  setSongsData]  = useState([]);
  const [albumsData, setAlbumsData] = useState([]);
  const [track,      setTrack]      = useState(null);
  const [playStatus, setPlayStatus] = useState(false);

  const [volume,     setVolume]     = useState(1);   // 0–1
  const [prevVolume, setPrevVolume] = useState(1);   // remembers last non-zero

  const [time, setTime] = useState({
    currentTime: { second: 0, minute: 0 },
    totalTime:   { second: 0, minute: 0 },
  });

  const [searchTerm, setSearchTerm] = useState("");

  const url = "https://audio-cloud-backend.vercel.app/";


  const getSongsData = async () => {
    try {
      const { data } = await axios.get(`${url}/api/song/list`);
      setSongsData(data.songs);
      setTrack(data.songs[0]);
    } catch (err) {
      console.error("Failed to load songs:", err);
    }
  };

  const getAlbumsData = async () => {
    try {
      const { data } = await axios.get(`${url}/api/album/list`);
      setAlbumsData(data.albums);
    } catch (err) {
      console.error("Failed to load albums:", err);
    }
  };


  const play  = () => { audioRef.current?.play();  setPlayStatus(true);  };
  const pause = () => { audioRef.current?.pause(); setPlayStatus(false); };
  const playWithId = id => {
    if (!audioRef.current) return;
    const song = songsData.find(s => s._id === id);
    if (!song) return;

    
    audioRef.current.pause();


    audioRef.current.src = song.audioUrl;
    audioRef.current.load();

    const doPlay = () => {
      audioRef.current.play().catch(err => console.warn("play() rejected", err));
      audioRef.current.removeEventListener("loadedmetadata", doPlay);
    };
    audioRef.current.addEventListener("loadedmetadata", doPlay);

    setTrack(song);
    setPlayStatus(true);
  };

   const previous = () => {
    if (!track) return;
    const idx = songsData.findIndex(s => s._id === track._id);
    if (idx > 0) {
      playWithId(songsData[idx - 1]._id);
    }
  };

  const next = () => {
    if (!track) return;
    const idx = songsData.findIndex(s => s._id === track._id);
    if (idx !== -1 && idx < songsData.length - 1) {
      playWithId(songsData[idx + 1]._id);
    }
  };

  const seekSong = e => {
    const pct = e.nativeEvent.offsetX / seekBg.current.offsetWidth;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };


  const clamp = v => Math.min(1, Math.max(0, v));

  const setVol = v => setVolume(clamp(v));

  const changeVolume = e => {
    const pct = e.nativeEvent.offsetX / volumeBg.current.offsetWidth;
    setVol(pct);
  };

  const scrollVolume = deltaY => {
    const step = 0.05;                        
    setVol(volume + (deltaY < 0 ? step : -step));
  };

  const toggleMute = () => {
    if (volume === 0)    setVol(prevVolume || 1);
    else { setPrevVolume(volume); setVol(0); }
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    if (volumeBar.current)
      volumeBar.current.style.width = `${Math.floor(volume * 100)}%`;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    const h = () => {
      const cur = audioRef.current.currentTime;
      const tot = audioRef.current.duration || 0;
      if (seekBar.current && tot)
        seekBar.current.style.width = `${Math.floor((cur / tot) * 100)}%`;
      setTime({
        currentTime: { second: Math.floor(cur % 60), minute: Math.floor(cur / 60) },
        totalTime:   { second: Math.floor(tot % 60), minute: Math.floor(tot / 60) },
      });
    };
    audioRef.current.addEventListener("timeupdate", h);
    return () => audioRef.current.removeEventListener("timeupdate", h);
  }, [track]);

  useEffect(() => { getSongsData(); getAlbumsData(); }, []);

  const ctx = {
    audioRef, seekBg, seekBar, volumeBg, volumeBar,
    track, playStatus, time, songsData, albumsData, volume,
    play, pause, previous, next, seekSong,
    changeVolume, toggleMute, scrollVolume,            
    searchTerm, setSearchTerm, setVol,playWithId                 
  };

  return <PlayerContext.Provider value={ctx}>{children}</PlayerContext.Provider>;
};

export default PlayerContextProvider;