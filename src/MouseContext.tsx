import { createContext, Dispatch, SetStateAction, ReactNode, useState } from "react";

export interface MouseContextInterface {
  mouseX: number,
  setMouseX: Dispatch<SetStateAction<number>>
  // y: number,
  // setY: Dispatch<SetStateAction<number>>
}

const defaultState = {
  mouseX: 0,
  setMouseX: (n: number) => {}
} as MouseContextInterface;

export const MouseContext = createContext(defaultState);

type MouseProviderProps = {
  children: ReactNode,
}

const MouseContextProvider = ({children}: MouseProviderProps) => {
  const [mouseX, setMouseX] = useState<number>(0);

  return (
    <MouseContext.Provider value={{mouseX, setMouseX}}>
      {children}
    </MouseContext.Provider>
  )
}

export default MouseContextProvider;