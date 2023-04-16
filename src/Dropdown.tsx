import { useState, useEffect, FC } from 'react'
import { ToneOscillatorType } from 'tone';
import audio from './Audio'
import { WAVEFORMS } from './Audio';
import { randomInt } from './utils';

//--------------------------------------------------

interface DropdownProps {
  iterator: number;
  activeUIElement: number;
  lastWaveform: string;
  newWaveform: string;
  sendActiveUIElementToParent: (i: number) => void;
  sendLastWaveform: (s: string) => void;
  sendNewWaveform: (s: string) => void;
  assignmentMode: string;
  randomize: boolean;
}

//--------------------------------------------------

const Dropdown: FC<DropdownProps> = (
  {iterator, activeUIElement, lastWaveform, 
    newWaveform, sendActiveUIElementToParent, 
    sendLastWaveform, sendNewWaveform, 
    assignmentMode, randomize}
  ) => {
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState("btn btn-controls dd");
  const [activeWaveform, setActiveWaveform] = useState(WAVEFORMS[randomInt(0, 3)]);

  useEffect(() => {
    audio.oscillators[iterator].type = activeWaveform as ToneOscillatorType;
   
// CONNECT OSCILLATOR TO EFFECTS DEPENDING ON WAVEFORM
    audio.oscillators[iterator]?.disconnect();

    WAVEFORMS.forEach((w, i) => {          
      if (activeWaveform === w)
        audio.oscillators[iterator]
          .connect(audio.reverbs[i])
          .connect(audio.tremolos[i])
          .connect(audio.recorder)
          .toDestination();
    })

    setOpen(false);
  }, [activeWaveform]);

  useEffect(() => {
    if (activeUIElement === iterator) 
      setOpen(true);
    else 
      setOpen(false);
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
      setActiveWaveform(WAVEFORMS[randomInt(0, 3)]);
  }, [randomize]);

  useEffect(() => {
    if (open) setClassName("btn btn-controls btn-controls-active dd");
    else setClassName("btn btn-controls dd");
  }, [open]);

  // TODO: GET RID OF INLINE CSS!

  const createSelector = (): JSX.Element => {
    return (<div className="shapes shapes-create">
              <div style={{paddingBottom: "3px", display: "grid", }}>
                {WAVEFORMS.map((w) => {
                    return (
                        <div key={w} onKeyDown={()=>{}} onMouseDown={async (event: React.MouseEvent) => {                        
                          await sendLastWaveform(activeWaveform);
                          await setActiveWaveform(w);
                          await sendNewWaveform(w);
                          await sendActiveUIElementToParent(99);
                        }}

                          className={activeWaveform === w ? "btn btn-controls btn-controls-active dd" : "btn btn-controls dd"}
                          style={{margin: "3px"}}
                          >{w.substring(0, 3)}
                        </div>
                    );
                })}
              </div>
            </div>);
  }

//--------------------------------------------------  

  return (
    <div className="dropdown" onKeyUp={()=>{}} onMouseLeave={() => sendLastWaveform("")}>
        <div style={{padding: "0.3rem", fontSize: "0.4rem", margin: "0.3rem"}} 
          className={className} onKeyDown={()=>{}}
          onMouseEnter={() => {
            sendLastWaveform(activeWaveform);
          }}
          
          onMouseDown={async (event) => {
            if (open) {
              event.stopPropagation();
              sendActiveUIElementToParent(99);
            } else {
                event.stopPropagation();
                sendActiveUIElementToParent(iterator);
            }
          }}>
            {activeWaveform.substring(0, 3)}
        </div>

        {open && createSelector()}
    </div>
  )
}

export default Dropdown;