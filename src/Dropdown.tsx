import { useState, useEffect, FC } from 'react'
import { ToneOscillatorType } from 'tone';
import audio from './Audio'
import './'
import { randomInt } from './utils';

//--------------------------------------------------

interface Dropdown {
  iterator: number;
  activeUIElement: number;
  lastWaveform: string;
  newWaveform: string;
  sendActivation: (i: number) => void;
  sendLastWaveform: (s: string) => void;
  sendNewWaveform: (s: string) => void;
  assignmentMode: string;
  randomize: boolean;
}

const waveforms = ['square', 'sine', 'triangle', 'sawtooth'];

//--------------------------------------------------

const Dropdown: FC<Dropdown> = (
  {iterator, activeUIElement, lastWaveform, 
    newWaveform, sendActivation, sendLastWaveform, 
    sendNewWaveform, assignmentMode, randomize}
  ) => {
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState("btn btn-controls dd");
  const [activeWaveform, setActiveWaveform] = useState(waveforms[randomInt(0, 3)]);

  useEffect(() => {
    audio.oscillators[iterator].type = activeWaveform as ToneOscillatorType;
    setOpen(false);
  }, [activeWaveform]);

  useEffect(() => {
    if (activeUIElement !== iterator) setOpen(false);
    else setOpen(true);
  }, [activeUIElement]);

  useEffect(() => {
    if ((lastWaveform === activeWaveform && assignmentMode === "all of type") ||
        (lastWaveform !== "" && assignmentMode === "all")) {
          setClassName("btn btn-controls btn-controls-active dd");
        }

    else if (lastWaveform !== activeWaveform) setClassName("btn btn-controls dd");
  }, [lastWaveform]);

  useEffect(() => {
    if ((assignmentMode === "all of type" && activeWaveform === lastWaveform) ||
        (assignmentMode === "all"))
          setActiveWaveform(newWaveform);
          setClassName("btn btn-controls dd");
  }, [newWaveform]);

  useEffect(() => {
    if (randomize)
      setActiveWaveform(waveforms[randomInt(0, 3)]);
  }, [randomize]);

  useEffect(() => {
    if (open) setClassName("btn btn-controls btn-controls-active dd");
    else setClassName("btn btn-controls dd");
  }, [open]);

  const createSelector = (): JSX.Element => {
    return (<div className="shapes" style={{position: "absolute", width: "max-content", backgroundColor: "#101820ff", zIndex: "999"}}>
              {waveforms.map((w) => {
                  return (
                      <div key={w} onKeyDown={()=>{}} onClick={() => {
                        sendLastWaveform(activeWaveform);
                        setActiveWaveform(w);
                        sendNewWaveform(w);
                      }}

                        className={activeWaveform === w ? "btn btn-controls btn-controls-active dd" : "btn btn-controls dd"}
                        style={{margin: "3px"}}
                        >{w.substring(0, 3)}
                      </div>
                  );
              })}
            </div>)
  }

  return (
    <div className="dropdown" onKeyUp={()=>{}} onMouseLeave={() => sendLastWaveform("")}>
        <div style={{
            padding: "0.3rem",
            fontSize: "0.4rem",
            margin: "0.3rem",
          }} 
          
          className={className}
          onKeyDown={()=>{}}
          onMouseEnter={() => sendLastWaveform(activeWaveform)}
          
          onClick={async (e) => {
            if (open) {
              e.stopPropagation();
              sendActivation(99);
            } else {
                e.stopPropagation();
                await sendActivation(99);
                sendActivation(iterator);
            }
          }
        }>{activeWaveform.substring(0, 3)}
        </div>

        {open && createSelector()}
    </div>
  )
}

export default Dropdown;