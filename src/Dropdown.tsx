import { useState, useEffect, FC } from 'react'
import { ToneOscillatorType } from 'tone';
import audio from './Audio'
import { randomInt } from './utils';
import Slider from './Slider';

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

const waveforms = ['square', 'sine', 'triangle', 'sawtooth'];

//--------------------------------------------------

const Dropdown: FC<DropdownProps> = (
  {iterator, activeUIElement, lastWaveform, 
    newWaveform, sendActiveUIElementToParent, sendLastWaveform, 
    sendNewWaveform, assignmentMode, randomize}
  ) => {
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState("btn btn-controls dd");
  const [activeWaveform, setActiveWaveform] = useState(waveforms[randomInt(0, 3)]);
  const [effectsOpen, setEffectsOpen] = useState(false);

// ? -----------------------------------------------

  const [tremoloFrequency, setTremoloFrequency] = useState(0);
  const [tremoloDepth, setTremoloDepth] = useState(0);
  const [reverbDecay, setReverbDecay] = useState(0);
  const [reverbMix, setReverbMix] = useState(0);
 
// ? -----------------------------------------------


  useEffect(() => {
    audio.oscillators[iterator].type = activeWaveform as ToneOscillatorType;
    setOpen(false);
  }, [activeWaveform]);

  useEffect(() => {
    const a = [60, 61, 62, 63]; // ? all effects sliders share the same IDs, also still hard-coded -.-
    if ((activeUIElement === iterator) ||
        (effectsOpen && a.includes(activeUIElement))) 
        setOpen(true);
    else {
      setEffectsOpen(false);
      setOpen(false);
    };
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

  // TODO: GET RID OF INLINE CSS!

  const createSelector = (): JSX.Element => {
    return (<div className="shapes" style={{
                position: "absolute", 
                width: "max-content", 
                backgroundColor: "#101820ff", 
                zIndex: "999", 
                paddingBottom: "1px", 
                border: "2px solid var(--color-2)"}}>
              <div style={{paddingBottom: "3px", display: "grid", }}>
                {waveforms.map((w) => {
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
              <div style={{borderTop: "3px solid var(--color-1)", paddingTop: "3px"}}>
                <div  className="btn btn-controls dd"
                      style={{margin: "3px", whiteSpace: "pre-wrap"}}
                      onKeyDown={()=>{}} onClick={() => setEffectsOpen(!effectsOpen)}>
                        FX!
                </div>
                {effectsOpen && createFxMenu()}
              </div>
            </div>);
  }

  // TODO: PREVENT MULTIPLE CALLS!
  const createFxMenu = () => {
    return (
      <div className= "effects-settings" style={{
            position: "absolute", 
            width: "400px", 
            height: "241px", 
            backgroundColor: "var(--color-2)", 
            zIndex: "999", 
            right: "calc(100% + 1px)", 
            top: "0",
            padding: "3px",
            border: "3px solid var(--color-1)",
            }}>
        <div style={{margin: "6px", display: "flex", height: "20%"}}>
          <div style={{width: "40%", display:"flex", alignItems: "center"}}>
            Tremolo Depth
          </div>
          <Slider id={60} mapping="tremolo-depth" activeUIElement={activeUIElement} sendActiveUIElementToParent={sendActiveUIElementToParent}/>
        </div>
        <div style={{margin: "6px", display: "flex", height: "20%"}}>
          <div style={{width: "40%", display:"flex", alignItems: "center"}}>
            Tremolo Freq
          </div>
          <Slider id={61} mapping="tremolo-depth" activeUIElement={activeUIElement} sendActiveUIElementToParent={sendActiveUIElementToParent}/>
        </div>
        <div style={{margin: "6px", display: "flex", height: "20%"}}>
          <div style={{width: "40%", display:"flex", alignItems: "center"}}>
            Reverb Decay
          </div>
          <Slider id={62} mapping="tremolo-depth" activeUIElement={activeUIElement} sendActiveUIElementToParent={sendActiveUIElementToParent}/>
        </div>
        <div style={{margin: "6px", display: "flex", height: "20%"}}>
          <div style={{width: "40%", display:"flex", alignItems: "center"}}>
            Reverb Mix
          </div>
          <Slider id={63} mapping="tremolo-depth" activeUIElement={activeUIElement} sendActiveUIElementToParent={sendActiveUIElementToParent}/>
        </div>
      
      </div>
    )
  }

//--------------------------------------------------  

  return (
    <div className="dropdown" onKeyUp={()=>{}} onMouseLeave={() => sendLastWaveform("")}>
        <div style={{
            padding: "0.3rem",
            fontSize: "0.4rem",
            margin: "0.3rem",
          }} 
          
          className={className}
          onKeyDown={()=>{}}
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