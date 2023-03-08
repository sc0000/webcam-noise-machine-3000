import { useRef, useState, useEffect, FC, MouseEvent } from 'react'
import './slider.css'

import audio from './Audio'
import { scale, logScale, mapLinearToLogarithmicScale } from './utils'

// TODO: Solve: releasing mouse outside of component

interface Slider {
  id: number; // TODO: Make mandatory
  mapping: string; // what parameter the slider is mapped to.
  activeUIElement: number;
  sendActiveUIElementToParent: (id: number) => void;
}

//--------------------------------------------------   

const Slider: FC<Slider> = ({id, mapping, activeUIElement, sendActiveUIElementToParent}) => {
    let innerRef = useRef<HTMLDivElement>(null);
    let handleRef = useRef<HTMLDivElement>(null);

    const [handlePosition, setHandlePosition] = useState(15);
    const [hold, setHold] = useState(false);
    const [startX, setStartX] = useState(0);

    const handleDown = (e: MouseEvent<HTMLElement>) => {
          // const target = e.target as Element;
          const left = innerRef.current?.getBoundingClientRect().left!;
          const x = e.clientX - left;
          setHold(true);
          setHandlePosition(x);
          sendActiveUIElementToParent(id);
        }

    const handleMove = (e: MouseEvent<HTMLElement>) => {
      if (hold) {
        const left = innerRef.current?.getBoundingClientRect().left!;
        const x = e.clientX - left;
        setHandlePosition(x);
      }
    }

    const handleUp = async (e: MouseEvent<HTMLElement>) => {
        setHold(false);
      }

    useEffect(() => {
      if (activeUIElement !== id) setHold(false);
    }, [activeUIElement]);

    useEffect(() => {
      console.log(`handlePos: ${handlePosition}`);

          //
          // Audio parameter mapping
          //  

          const left = innerRef.current?.getBoundingClientRect().left!;
          const right = innerRef.current?.getBoundingClientRect().right!;
        
          // if (handlePosition > right) setHandlePosition(handlePosition - 15);
          
        if (mapping === 'playerVolume' && audio.players[id!]) {
          // const vol = scale(handlePosition, [0, right - left], [-12, 12]);
          const vol = mapLinearToLogarithmicScale(handlePosition, 0, right - left, -12, 12);
          console.log(`vol: ${vol}`);
          audio.players[id!].volume.value = vol;
        }

        if (mapping === 'microtonalSpread') {
            // TODO: Get the log scaling right!
            audio.microtonalSpread = 1000 - mapLinearToLogarithmicScale(handlePosition, 0, right - left, 0.1, 1000);
            // console.log(audio.microtonalSpread);
        }
    }, [handlePosition]);

  return (
    <div className="slider-outer" onMouseDown={handleDown} onMouseUp={handleUp} onMouseMove={handleMove}>
        <div className="slider-inner" ref={innerRef}>
            <div className="slider-handle" 
                ref={handleRef}
                style={{width: `${handlePosition}px`}}/>
        </div>
    </div>
  )
}

export default Slider