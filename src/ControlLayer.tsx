// Copyright 2025 Sebastian Cyliax

import { useState, useContext, FC } from "react";

import MenuBar from "./MenuBar";
import Hand from "./Hand";
import Controls from "./Controls";
import { MouseContext } from "./MouseContext";

//--------------------------------------------------

export interface ControlProps {
  activeUIElement: number;
  sendActiveUIElementToParent: (i: number) => void;
}

//--------------------------------------------------

const ControlLayer: FC = () => {
  const { setMouseX } = useContext(MouseContext);

  const [activeUIElement, setActiveUIElement] = useState(99);
  // ? UI element Ids are hardcoded as of yet... 

  const sendActiveUIElementToControlLayer = (i: number): void => {
    setActiveUIElement(i);
  }

  //--------------------------------------------------

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
    }}
      onKeyDown={() => { }}
      onMouseDown={async (event: React.MouseEvent) => {
        const target = event.target as Element;
        const className = target.getAttribute("class");

        // TODO: FIND A BETTER WAY TO DO THIS!
        if (className !== "btn btn-controls dd" &&
          className !== "btn btn-controls btn-controls-active dd" &&
          className !== "effects-settings" &&
          className !== "slider-inner" &&
          className !== "slider-handle" &&
          activeUIElement !== 99) {
          setActiveUIElement(99);
        }
      }}

      onMouseUp={async () => {
        if (activeUIElement > 20)
          setActiveUIElement(99);
      }}

      onMouseMove={(event: React.MouseEvent) => {
        if (activeUIElement > 20 && activeUIElement !== 99)
          setMouseX(event.clientX);
      }}>

      <MenuBar />
      <div style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
      }}>
        <Hand
          activeUIElement={activeUIElement}
          sendActiveUIElementToParent={sendActiveUIElementToControlLayer} />
        <Controls
          activeUIElement={activeUIElement}
          sendActiveUIElementToParent={sendActiveUIElementToControlLayer} />
      </div>
    </div>
  )
}

export default ControlLayer;
