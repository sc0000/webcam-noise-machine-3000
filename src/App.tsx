import {useState, useEffect} from 'react'

import Hand from './Hand'
import Controls from './Controls'

const App = () => {
  const [activeUIElement, setActiveUIElement] = useState(99);

  useEffect(() => {
    console.log(activeUIElement);
  }, [activeUIElement]);

  const sendActivationGlobally = (i: number): void => {
    setActiveUIElement(i);
  }
  
  return (
    <div onKeyDown={()=>{}} onClick={(event: React.MouseEvent) => {
      setActiveUIElement(99); 
    }}>
        <Hand/>
        <Controls 
          activeUIElement={activeUIElement}
          sendActivationGlobally={sendActivationGlobally}/>
    </div>
  )
}

export default App