import { useState, useEffect, useContext, FC } from "react";

import MenuBar from "./MenuBar";
import Hand from "./Hand";
import Controls from "./Controls";
import { MouseContext } from "./MouseContext";

const ControlLayer: FC = () => {
  const {setMouseX} = useContext(MouseContext);

  const [activeUIElement, setActiveUIElement] = useState(99);
  // ? UI element Ids are hardcoded as of yet... 

  

  useEffect(() => {
    console.log(`Active UI Element: ${activeUIElement}`);
  }, [activeUIElement]);

  const sendActiveUIElementToControlLayer = (i: number): void => {
    setActiveUIElement(i);
  }

  // TODO: make mouse events depend on target class/type?, not UI element index!!!

  return (
    <div  style={{
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
    }}
          onKeyDown={()=>{}} 
          onMouseDown={(event: React.MouseEvent) => {
            const target = event.target as Element;
            const className = target.getAttribute("class");
  
            if (className !== "btn btn-controls dd" && 
              className !== "btn btn-controls btn-controls-active dd" && 
              activeUIElement !== 99) {
              setActiveUIElement(99);
            }
          }}
          
          onMouseUp={() => {
            if (activeUIElement > 20)
              setActiveUIElement(99);
          }}

          onMouseMove={(event: React.MouseEvent) => {
            if (activeUIElement > 20 && activeUIElement !== 99)
              setMouseX(event.clientX);
          }}>

        <MenuBar/>
        <div style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
        }}>    
          <Hand/>
          <Controls 
            activeUIElement={activeUIElement}
            sendActiveUIElementToControlLayer={sendActiveUIElementToControlLayer}/>
        </div>
    </div>
  )
}

export default ControlLayer;