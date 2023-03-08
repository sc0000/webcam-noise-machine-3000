import {useState, useEffect} from 'react'

import Hand from './Hand'
import Controls from './Controls'

const App = () => {
  const [activeUIElement, setActiveUIElement] = useState(99);
  // ? UI element Ids are hardcoded as of yet... 

  useEffect(() => {
    console.log(`Active UI Element: ${activeUIElement}`);
  }, [activeUIElement]);

  const sendActiveUIElementToApp = (i: number): void => {
    setActiveUIElement(i);
  }

  // TODO: make mouse events depend on target class/type?, not UI element index!
  
  return (
    <div  onKeyDown={()=>{}} 
          onMouseDown={(event: React.MouseEvent) => {
            // ???
            if (activeUIElement !== 99)
              setActiveUIElement(99);
          }}
          
          onMouseUp={() => {
            if (activeUIElement > 20)
              setActiveUIElement(99);
          }}>
        <Hand/>
        <Controls 
          activeUIElement={activeUIElement}
          sendActiveUIElementToApp={sendActiveUIElementToApp}/>
    </div>
  )
}

export default App