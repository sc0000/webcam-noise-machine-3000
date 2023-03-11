import { useRef, useState, useEffect, useContext, useCallback, FC, MouseEvent } from 'react'
import './slider.css'

import audio from './Audio'
import { scale, logScale, mapLinearToLogarithmicScale } from './utils'
import { MouseContext } from './MouseContext';

//--------------------------------------------------

interface SliderProps {
  id: number;
  mapping: string; // what parameter the slider is mapped to.
  activeUIElement: number;
  sendActiveUIElementToParent: (id: number) => void;
}

//--------------------------------------------------   

const Slider: FC<SliderProps> = ({id, mapping, activeUIElement, sendActiveUIElementToParent}) => {
    let innerRef = useRef<HTMLDivElement>(null);
    let handleRef = useRef<HTMLDivElement>(null);

    const sizeAndBoundaries = useCallback(() => {
      const left = innerRef.current?.getBoundingClientRect().left!;
      const right = innerRef.current?.getBoundingClientRect().right!;
      const width = right - left + 1;
      // height...

      return {
        left: left,
        right: right,
        width: width,
      }
     
    }, [innerRef]);

    const [handlePosition, setHandlePosition] = useState(15);

    const {mouseX} = useContext(MouseContext);

    useEffect(() => {
      if (activeUIElement === id) {
        const {left, width} = sizeAndBoundaries();

        const handleX = mouseX - left;
        if (handleX > 0 && handleX < width) {
          setHandlePosition(handleX);
          console.log(width);
        } else if (handleX < 0) {
          setHandlePosition(0);
        } else setHandlePosition(width);

        console.log(`handlePos: ${handlePosition}\nhandleX: ${handleX}`);
      }
    }, [mouseX]);

    const handleDown = (e: MouseEvent<HTMLElement>) => {
          const x = e.clientX - sizeAndBoundaries().left;
          setHandlePosition(x);
          sendActiveUIElementToParent(id);
        }

    // TODO: Consolidate with context useEffect!
    useEffect(() => {
      //
      // Audio parameter mapping
      //  

      const {left, right} = sizeAndBoundaries();
        
      if (mapping === 'playerVolume' && audio.players[id]) {
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
    <div className="slider-outer" onMouseDown={handleDown}>
        <div className="slider-inner" ref={innerRef}>
            <div className="slider-handle" 
                ref={handleRef}
                style={{width: `${handlePosition}px`}}/>
        </div>
    </div>
  )
}

export default Slider