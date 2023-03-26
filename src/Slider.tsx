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
  sendCentWiseDeviation?: (cents: number) => void
}

//--------------------------------------------------   

const Slider: FC<SliderProps & ControlProps> = (
  {id, mapping, recorded, sendCentWiseDeviation, activeUIElement, sendActiveUIElementToParent}
) => {
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

      if (mapping !== "cent-wise-deviation") {
        if (handleX > 0 && handleX < width) {
          setHandlePosition(handleX);
        } else if (handleX < 0) {
          setHandlePosition(0);
        } else setHandlePosition(width);
      }
      
      else {
        if (handleX > 6 && handleX < width - 6) {
          setHandlePosition(handleX);
        } else if (handleX < 6) {
          setHandlePosition(6);
        } else setHandlePosition(width - 6);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouseX]);

  const handleDown = (e: MouseEvent<HTMLElement>) => {
    if (typeof(recorded) !== 'undefined' && recorded === false) return;

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
      
    if (mapping === 'player-volume' && audio.players[id - 30]) {
      const logVol = mapLinearToLogarithmicScale(handlePosition, 0, width, 0.001, 24) - 12;
      audio.players[id - 30].volume.value = logVol;
    }

    else if (mapping === 'microtonal-spread') {
        audio.microtonalSpread = scale(handlePosition, 0, width, 0, 1);
    }

    else if (mapping === 'cent-wise-deviation' && sendCentWiseDeviation) {
      sendCentWiseDeviation(scale(handlePosition, 6, width - 6, -50, 50));
    }
  }, [handlePosition, id, mapping, sizeAndBoundaries]);

  const innerClassName = useCallback((): string => {
    if (mapping === "cent-wise-deviation") return "slider-inner slider-inner-hand";
    if (mapping === "player-volume" && !recorded) return "slider-inner slider-inner-disabled";
    else return "slider-inner";
  }, [mapping, recorded]);

//--------------------------------------------------

  // TODO: Tidy up inline CSS with dedicated class for cent-wise-deviation slider!

  return (
    <div  className={mapping === "player-volume" && !recorded ? "slider-outer slider-outer-disabled" : "slider-outer"} 
          onMouseDown={handleDown}
          // ? CSS parameter width is still hardcoded...
          style={mapping === "cent-wise-deviation" ? {width: "93px", border: "3px solid var(--color-1)"} : {}}>
        <div  className={innerClassName()} 
              ref={innerRef}>
            <div className={mapping === "player-volume" && !recorded ? "slider-handle slider-handle-disabled" : "slider-handle"} 
                ref={handleRef}
                style={mapping !== "cent-wise-deviation" ? 
                  {width: `${handlePosition}px`} :
                  {
                    position: "relative",
                    backgroundColor: "var(--color-3)",
                    left: `${handlePosition - 6}px`
                  }}
            />
        </div>
    </div>
  )
}

export default Slider