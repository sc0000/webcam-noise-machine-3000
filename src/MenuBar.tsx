import { FC } from "react";

import CLOSEWINDOW from "./assets/close-window.png";
import MAXIMIZEWINDOW from "./assets/maximize-window.png";
import MINIMIZEWINDOW from "./assets/minimize-window.png";

import "./menuBar.css";

const MenuBar: FC = () => {
  const handleMinimizeClick = () => {
    console.log("handleMinimizeClick called");
    window.electron.ipcRenderer.send("minimizeWindow");
  };
  
  const handleMaximizeClick = () => {
    console.log("handleMaximizeClick called");
    window.electron.ipcRenderer.send("maximizeWindow");
  };

  const handleCloseClick = () => {
    window.electron.ipcRenderer.send("closeWindow");
  };

  return (
    <div className="menubar">
      <div style={{ float: "right" }}>
        <img
          src={MINIMIZEWINDOW}
          alt=""
          className="btn-menubar"
          onKeyDown={() => {}}
          onClick={handleMinimizeClick}
        />
        <img
          src={MAXIMIZEWINDOW}
          alt=""
          className="btn-menubar"
          onKeyDown={() => {}}
          onClick={handleMaximizeClick}
        />
        <img
          src={CLOSEWINDOW}
          alt=""
          className="btn-menubar btn-menubar-exit"
          onKeyDown={() => {}}
          onClick={handleCloseClick}
        />
      </div>
    </div>
  );
};

export default MenuBar;