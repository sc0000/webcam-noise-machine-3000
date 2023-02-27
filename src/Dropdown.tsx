import { useState, useEffect, FC } from 'react'
import { ToneOscillatorType } from 'tone';
import audio from './Audio'
import './'
import { randomInt } from './utils';

interface Dropdown {
  iterator: number;
  activeDropdown: number;
  lastWaveform: string;
  newWaveform: string;
  sendActivation: (i: number) => void;
  sendLastWaveform: (s: string) => void;
  sendNewWaveform: (s: string) => void;
  assignmentMode: string;
  randomize: boolean;
}

const Dropdown: FC<Dropdown> = (
  {iterator, activeDropdown, lastWaveform, 
    newWaveform, sendActivation, sendLastWaveform, 
    sendNewWaveform, assignmentMode, randomize}
  ) => {
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState("btn btn-controls");
  const waveforms = ['square', 'sine', 'triangle', 'sawtooth'];
  const [activeWaveform, setActiveWaveform] = useState(waveforms[randomInt(0, 3)]);

  useEffect(() => {
    audio.oscillators[iterator].type = activeWaveform as ToneOscillatorType;
    setOpen(false);
  }, [activeWaveform]);

  useEffect(() => {
    if (activeDropdown !== iterator) setOpen(false);
  }, [activeDropdown]);

  useEffect(() => {
    if ((lastWaveform === activeWaveform && assignmentMode === "all of type") ||
        (lastWaveform !== "" && assignmentMode === "all")) {
          setClassName("btn btn-controls btn-controls-active");
        }

    else if (lastWaveform === "") setClassName("btn btn-controls");
  }, [lastWaveform]);

  useEffect(() => {
    if ((assignmentMode === "all of type" && activeWaveform === lastWaveform) ||
        (assignmentMode === "all"))
          setActiveWaveform(newWaveform);
  }, [newWaveform]);

  useEffect(() => {
    if (randomize)
      setActiveWaveform(waveforms[randomInt(0, 3)]);
  }, [randomize]);

  useEffect(() => {
    if (open) {
      sendActivation(iterator);
      setClassName("btn btn-controls btn-controls-active");
    }

    else setClassName("btn btn-controls");
  }, [open]);

  const createSelector = () => {
    return (<div className="shapes" style={{position: "absolute", width: "max-content", backgroundColor: "#101820ff", zIndex: "999"}}>
              {waveforms.map((s) => {
                  return (
                      <div key={s} onKeyDown={()=>{}} onClick={() => {
                        sendLastWaveform(activeWaveform);
                        setActiveWaveform(s);
                        sendNewWaveform(s);
                      }} 
                        className={activeWaveform === s ? "btn btn-controls btn-controls-active" : "btn btn-controls"}
                        style={{margin: "3px"}}
                        >{s.substring(0, 3)}
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
          
          // className={open ? "btn btn-controls btn-controls-active" : "btn btn-controls"}
          className={className}
          onKeyDown={()=>{}}
          onMouseEnter={() => sendLastWaveform(activeWaveform)}
          
          onClick={() => setOpen(!open)}  
          >{activeWaveform.substring(0, 3)}
        </div>

        {open && createSelector()}
    </div>
    
  )
}

export default Dropdown