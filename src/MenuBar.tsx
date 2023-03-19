import { FC } from "react";
// import { ipcRenderer } from "electron";

import CLOSEWINDOW from './assets/close-window.png'
import MAXIMIZEWINDOW from './assets/maximize-window.png'
import MINIMIZEWINDOW from './assets/minimize-window.png'

import './menuBar.css'

const MenuBar:FC = () => {
  return(
        <div className="menubar">
          {/* <div style={{float: "left"}}>
            <div className="btn-menubar">
              File
            </div>
          </div> */}
          <div style={{float: "right"}}>
            <img src={MINIMIZEWINDOW} alt="" className="btn-menubar" onKeyDown={()=>{}} onMouseDown={() => {
              // ipcRenderer.send('minimize-window');
            }}/>
            <img src={MAXIMIZEWINDOW} alt="" className="btn-menubar"/>
            <img src={CLOSEWINDOW} alt="" className="btn-menubar" onKeyDown={()=>{}} onMouseDown={() => {
              window.close();
            }}/>
  
          </div>
        </div>
  )
}

export default MenuBar;