import { useState, useRef, FC, MouseEvent } from 'react'
import { useEffect } from 'react';
import './slider.css'
import audio from './Audio'
import { scale, logScale, mapLinearToLogarithmicScale } from './utils'

// TODO: Solve: releasing mouse outside of component

interface Slider {
  micro?: boolean;
  iterator?: number;
}

const Slider: FC<Slider> = ({micro, iterator}) => {
    let innerRef = useRef<HTMLDivElement>(null);
    let handleRef = useRef<HTMLDivElement>(null);
    const [hold, setHold] = useState(false);
    const [offset, setOffset] = useState(0);
    const [startX, setStartX] = useState(0);

    const handleDown = (e: MouseEvent<HTMLElement>) => {
        setHold(true);
    }

    useEffect(() => {
        if (hold && handleRef.current !== null) 
          setStartX(handleRef.current.offsetLeft +  15);
    }, [hold]);

    const handleMove = (e: MouseEvent<HTMLElement>) => {
        if (hold) setOffset(e.pageX - startX);
    }

    const handleUp = (e: MouseEvent<HTMLElement>) => {
        setOffset(0);
        setHold(false);
    }

    useEffect(() => {
      if (handleRef.current !== null && innerRef.current !== null) {
        const currentX = startX + offset;
        const minX = handleRef.current.offsetLeft + handleRef.current.clientWidth - 3
        const maxX = handleRef.current.offsetLeft + innerRef.current.clientWidth + 3;;
      
        if (hold && 
          (currentX > minX) &&
          (currentX < maxX)) {
          handleRef.current.style.transform = `translateX(${offset}px)`;

          if (iterator && audio.players[iterator]) {
              audio.players[iterator].volume.value = scale(currentX, [minX, maxX], [-12, 12]);
          }

          if (micro) {
              // TODO: Find a WAY better way to do this! (Get the log scaling right!)
              audio.microtonalSpread = 1000 - mapLinearToLogarithmicScale(currentX, minX, maxX, 0.1, 1000);
              console.log(audio.microtonalSpread);
          }
        }
      }
    }, [offset]);

  return (
    <div className="slider-outer" onMouseDown={handleDown} onMouseUp={handleUp} onMouseMove={handleMove}>
        <div className="slider-inner" ref={innerRef}>
            <div className="slider-handle" 
                ref={handleRef}
                />
        </div>
    </div>
  )
}

export default Slider