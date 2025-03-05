// Copyright 2025 Sebastian Cyliax

import ControlLayer from './ControlLayer';
import MouseContextProvider from './MouseContext';

const App = () => {
  return (
    <MouseContextProvider>
      <ControlLayer />
    </MouseContextProvider>
  )
}

export default App
