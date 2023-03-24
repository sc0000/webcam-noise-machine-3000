import { useRef, useState, useEffect, useContext, useCallback, FC, MouseEvent } from 'react'
import './slider.css'

import audio from './Audio'
import { scale, mapLinearToLogarithmicScale } from './utils'
import { MouseContext } from './MouseContext';
import { ControlProps } from './ControlLayer';

//--------------------------------------------------

interface SliderProps {
  id: number;
  mapping: string; // what parameter the slider is mapped to.
  recorded?: boolean;
}

//--------------------------------------------------   

const Slider: FC<SliderProps & ControlProps> = ({id, mapping, recorded, activeUIElement, sendActiveUIElementToParent}) => {
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
    if (mapping === 'player-volume' || mapping === 'cent-wise-deviation') {
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
      
    if (mapping === 'player-volume' && audio.players[id - 22]) {
      const logVol = mapLinearToLogarithmicScale(handlePosition, 0, width, 0.001, 24) - 12;
      audio.players[id - 22].volume.value = logVol;
    }

    if (mapping === 'microtonal-spread') {
        audio.microtonalSpread = scale(handlePosition, 0, width, 0, 1);
    }

    console.log(handlePosition);
  }, [handlePosition, id, mapping, sizeAndBoundaries]);

  // TODO: Tidy up inline CSS with dedicated class for cent-wise-deviation slider!

  return (
    <div  className={mapping === "player-volume" && !recorded ? "slider-outer slider-outer-disabled" : "slider-outer"} 
          onMouseDown={mapping !== "player-volume" || mapping === "player-volume" && recorded ? handleDown : ()=>{}}
          style={mapping === "cent-wise-deviation" ? {width: "100px", marginLeft: "8px", border: "3px solid var(--color-1)"} : {}}>
        <div  className={mapping === "player-volume" && !recorded ? "slider-inner slider-inner-disabled" : "slider-inner"} 
              ref={innerRef}
              style={mapping === "cent-wise-deviation" ? 
                {
                  backgroundImage: "url(./)",
                  overflow: "hidden",
                  background: "linear-gradient(var(--color-3), var(--color-3)) repeat-x center",
                  backgroundSize: "3px 3px"
                } : {}}>
            <div className={mapping === "player-volume" && !recorded ? "slider-handle slider-handle-disabled" : "slider-handle"} 
                ref={handleRef}
                style={mapping !== "cent-wise-deviation" ? 
                  {width: `${handlePosition}px`} :
                  {
                    position: "relative",
                    backgroundColor: "var(--color-3)",
                    left: `${handlePosition - 8}px`
                  }}
            />
        </div>
    </div>
  )
}

export default Slider