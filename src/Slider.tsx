import { useRef, useState, useEffect, useContext, useCallback, FC, MouseEvent } from 'react'
import './slider.css'

import audio from './Audio'
import { scale, mapLinearToLogarithmicScale } from './utils'
import { MouseContext } from './MouseContext';

//--------------------------------------------------

interface SliderProps {
  id: number;

  mapping: string; // what parameter the slider is mapped to.
  recorded?: boolean;
  
  activeUIElement: number;
  sendActiveUIElementToParent: (id: number) => void;
}

//--------------------------------------------------   

const Slider: FC<SliderProps> = ({id, mapping, recorded, activeUIElement, sendActiveUIElementToParent}) => {
  let innerRef = useRef<HTMLDivElement>(null);
  let handleRef = useRef<HTMLDivElement>(null);

  const sizeAndBoundaries = useCallback(() => {
    const left = innerRef.current?.getBoundingClientRect().left!;
    const right = innerRef.current?.getBoundingClientRect().right!;
    const width = right - left;
    // height...

    return {
      left: left,
      right: right,
      width: width,
    }
    
  }, [innerRef]);

  // Set Player default volume to recorded level
  useEffect(() => {
    if (mapping === 'playerVolume') {
      setHandlePosition(sizeAndBoundaries().width / 2);
    }
  }, [mapping, sizeAndBoundaries]);

  const [handlePosition, setHandlePosition] = useState(0);

  const {mouseX} = useContext(MouseContext);

  useEffect(() => {
    if (activeUIElement === id) {
      const {left, width} = sizeAndBoundaries();

      const handleX = mouseX - left;
      if (handleX > 0 && handleX < width) {
        setHandlePosition(handleX);
      } else if (handleX < 0) {
        setHandlePosition(0);
      } else setHandlePosition(width);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const {width} = sizeAndBoundaries();
      
    if (mapping === 'playerVolume' && audio.players[id - 22]) {
      const logVol = mapLinearToLogarithmicScale(handlePosition, 0, width, 0.001, 24) - 12;
      audio.players[id - 22].volume.value = logVol;
    }

    if (mapping === 'microtonalSpread') {
        audio.microtonalSpread = scale(handlePosition, 0, width, 0, 1);
    }


  }, [handlePosition, id, mapping, sizeAndBoundaries]);

  return (
    <div className={mapping === "playerVolume" && !recorded ? "slider-outer slider-outer-disabled" : "slider-outer"} onMouseDown={handleDown}>
        <div  className={mapping === "playerVolume" && !recorded ? "slider-inner slider-inner-disabled" : "slider-inner"} ref={innerRef}>
            <div className={mapping === "playerVolume" && !recorded ? "slider-handle slider-handle-disabled" : "slider-handle"} 
                ref={handleRef}
                style={{width: `${handlePosition}px`}}/>
        </div>
    </div>
  )
}

export default Slider