import { useRef, useState, useEffect, useContext, useCallback, FC, MouseEvent } from 'react'
import './slider.css'

import audio from './Audio'
import { EFFECTS_PARAMETERS } from './Audio'
import { scale, mapLinearToLogarithmicScale } from './utils'
import { MouseContext } from './MouseContext';
import { ControlProps } from './ControlLayer';

//--------------------------------------------------

interface SliderProps {
  id: number;
  mapping: string; // what parameter the slider is mapped to.
  recorded?: boolean;
  sendCentWiseDeviation?: (cents: number) => void
  sendFxParameterValue?: (val: number, mapping: string) => void
  lastFxParameterValue?: number
}

//--------------------------------------------------   

const Slider: FC<SliderProps & ControlProps> = ({
  id, mapping, recorded, sendCentWiseDeviation, 
  sendFxParameterValue, lastFxParameterValue, 
  activeUIElement, sendActiveUIElementToParent
}) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const sizeAndBoundaries = useCallback(() => {
    const left = innerRef.current?.getBoundingClientRect().left;
    const right = innerRef.current?.getBoundingClientRect().right;
    const width = right && left ? (right - left) : null;
    // height...

    return {
      left: left,
      right: right,
      width: width,
    }
    
  }, [innerRef]);

  useEffect(() => {
    if (typeof(lastFxParameterValue) === 'number') {
      console.log(`${mapping}: ${lastFxParameterValue}`);
      const {width} = sizeAndBoundaries();

      const newHandleX = width ?
        scale(lastFxParameterValue, 0, 1, 0, width) : null;

      if (newHandleX) setHandlePosition(newHandleX);
    }
      
  }, [lastFxParameterValue]);

  // Set Player default volume to recorded level
  useEffect(() => {
    if (mapping === 'player-volume' || mapping === 'cent-wise-deviation') {
      const {width} = sizeAndBoundaries();

      if (width) setHandlePosition(width / 2);
    }
  }, [mapping, sizeAndBoundaries]);

  const [handlePosition, setHandlePosition] = useState(0);

  const {mouseX} = useContext(MouseContext);

  useEffect(() => {
    if (activeUIElement === id) {
      const {left, width} = sizeAndBoundaries();

      if (left && width) {
        const handleX = mouseX - left;

        // Cent-wise deviation sliders have a different handle
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
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouseX]);

  const handleDown = (e: MouseEvent<HTMLElement>) => {
    if (typeof(recorded) !== 'undefined' && recorded === false) return;

    const {left} = sizeAndBoundaries();

    const x = left ? e.clientX - left
      : null;
    if (x) setHandlePosition(x);
    sendActiveUIElementToParent(id);
  }

  // TODO: Consolidate with context useEffect!
  useEffect(() => {

//--------------------------------------------------   
// AUDIO PARAMETER MAPPING
//--------------------------------------------------     


    const {width} = sizeAndBoundaries();
    
    if (width) {
      if (mapping === 'player-volume' && audio.players[id - 30]) {
        const logVol = mapLinearToLogarithmicScale(handlePosition, 0, width, 0.001, 24) - 12;
        audio.players[id - 30].volume.value = logVol;
      }
  
      else if (mapping === 'microtonal-spread') {
          audio.microtonalSpread = scale(handlePosition, 0, width, 0, 1);
      }
  
      // This value has to be sent upstairs because it is printed to the screen
      else if (mapping === 'cent-wise-deviation' && sendCentWiseDeviation) {
        sendCentWiseDeviation(scale(handlePosition, 6, width - 6, -50, 50));
      }
  
      // This value has to be sent upstairs because it might be shared between several oscillators
      else if (EFFECTS_PARAMETERS.includes(mapping) && sendFxParameterValue) {
        let newValue = scale(handlePosition, 0, width, 0, 1);
        
        if (newValue < 0) newValue = 0;
        else if (newValue > 1) newValue = 1;

        sendFxParameterValue(newValue, mapping);
      }
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