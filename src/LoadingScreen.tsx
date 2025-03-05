// Copyright 2025 Sebastian Cyliax

import { useState, useEffect, FC } from "react";

import './loadingScreen.css'

const LoadingScreen: FC = () => {
  const [text, setText] = useState("Loading   ");

  useEffect(() => {
    const interval = setInterval(() => {
      setText((prevText) => {
        switch (prevText) {
          case "Loading   ":
            return "Loading.  ";
          case "Loading.  ":
            return "Loading.. ";
          case "Loading.. ":
            return "Loading...";
          case "Loading...":
            return "Loading   ";
          default:
            return "Loading   ";
        }
      });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="loading-screen">
      {text}
    </div>
  );
}

export default LoadingScreen;
