import { useState, FC, useEffect } from 'react'
import Player from './Player'
import audio from './Audio'
import { WAVEFORMS, EFFECTS_PARAMETERS } from './Audio'
import './controls.css'
import Dropdown from './Dropdown'
import Slider from './Slider'
import { ControlProps } from './ControlLayer'
import { scale } from './utils'

//--------------------------------------------------

const ASSIGNMENT_MODES = ["single", "all of type", "all"];

//--------------------------------------------------

const Controls: FC<ControlProps> = ({
  activeUIElement, sendActiveUIElementToParent
}) => {
  
  // Waveforms
  const [lastWaveform, setLastWaveform] = useState("");
  const [newWaveform, setNewWaveform] = useState("sine");
  const [assignmentMode, setAssignmentMode] = useState("single");
  const [randomize, setRandomize] = useState(false);

  const [fxUpdateWaveform, setFxUpdateWaveform] = useState("sine");

// ? -----------------------------------------------

  const [lastFxParameterState, setLastFxParameterState] = useState([0, 0, 0, 0, 0.5]);

  const [tremoloFrequency, setTremoloFrequency] = useState(scale(audio.tremolos[0].frequency.value as number, 0, 30, 0, 1));
  const [tremoloDepth, setTremoloDepth] = useState(audio.tremolos[0].depth.value);
  const [reverbDecay, setReverbDecay] = useState(scale(audio.reverbs[0].decay as number, 0, 4, 0, 1));
  const [reverbMix, setReverbMix] = useState(audio.reverbs[0].wet.value);
  const [volume, setVolume] = useState(scale(audio.volumeModifiers[fxUpdateWaveform], audio.maxVolumeMaster, Math.abs(audio.maxVolumeMaster) - 6, 0, 1));

  const sendParameterValue = (val: number, mapping: string) => {
    if (mapping === "tremolo-frequency") setTremoloFrequency(val);
    else if (mapping === "tremolo-depth") setTremoloDepth(val);
    else if (mapping === "reverb-decay") setReverbDecay(val);
    else if (mapping === "reverb-mix") setReverbMix(val);
    else if (mapping === "volume") setVolume(val);
  }

  useEffect(() => {
    WAVEFORMS.forEach((w, i) => {
      if (fxUpdateWaveform === w) {
        audio.tremolos[i].set({
          frequency: tremoloFrequency * 30, // replace with log scaling
          depth: tremoloDepth
        });

        audio.reverbs[i].set({
          decay: scale(reverbDecay, 0, 1, 0.001, 4), // replace with log scaling
          wet: reverbMix > 1 ? 1 : reverbMix,
        });
      }

      audio.volumeModifiers[fxUpdateWaveform] = scale(volume, 0, 1, audio.maxVolumeMaster, Math.abs(audio.maxVolumeMaster) - 6);
    });
  }, [tremoloFrequency, tremoloDepth, reverbDecay, reverbMix, volume]);

  useEffect(() => {
    // Use Log scaling in frequency (and decay?)!

    let tf = 0;
    let td = 0;
    let rd = 0;
    let rm = 0;
    let vl = 0;

    WAVEFORMS.forEach((w, i) => {
      if (fxUpdateWaveform === w) {
        tf = audio.tremolos[i].frequency.value as number / 30 + 0.001;
        td = audio.tremolos[i].depth.value + 0.001;
        rd = scale(audio.reverbs[i].decay as number, 0.001, 4, 0, 1) + 0.001;
        rm = audio.reverbs[i].wet.value + 0.001;
        vl = scale(audio.volumeModifiers[fxUpdateWaveform], audio.maxVolumeMaster, Math.abs(audio.maxVolumeMaster) - 6, 0, 1);
      }
    });

    setLastFxParameterState([tf, td, rd, rm, vl]);
  }, [fxUpdateWaveform]);

  // useEffect(() => {
  //   console.log(lastFxParameterState);
  // }, [lastFxParameterState]);

// ? -----------------------------------------------

  const sendLastWaveform = (s: string) => {
    setLastWaveform(s);
  }

  const sendNewWaveform = async (s: string) => {
    await setNewWaveform("");
    await setNewWaveform(s);
  }

  const sendActiveUIElementToControls = (i: number): void => {
    sendActiveUIElementToParent(i);
  }

  const createNodes = (firstIterator: number): JSX.Element[] => {
    const nodes = [];

    for (let i = 0; i < 4; ++i) {
      nodes.push(
        <Dropdown key={i}
          iterator={firstIterator - i}
          activeUIElement={activeUIElement}
          lastWaveform={lastWaveform}
          newWaveform={newWaveform}
          sendActiveUIElementToParent={sendActiveUIElementToControls}
          sendLastWaveform={sendLastWaveform}
          sendNewWaveform={sendNewWaveform}
          assignmentMode={assignmentMode}
          randomize={randomize}
          />
      );
    }

    return nodes;
  }

  // Record and play back
  // ? Turn into a callback ?
  const createPlayers = (n: number): JSX.Element[] => {
    const players = [];

    for (let i = 0; i < n; ++i) {
      players.push(
        <Player key={i} i={i} activeUIElement={activeUIElement} 
          sendActiveUIElementToParent={sendActiveUIElementToControls}/>
      )
    }

    return players;
  }

  //--------------------------------------------------

  return (
    <section id="controls">
        <div className="control-buttons">

         
          

          <div className="shapes-options-outer" style={{display: "flex", justifyContent: "center"}}>
            <div className="shapes-options">
              {ASSIGNMENT_MODES.map((m) => {
                return (
                  <div key={m} className={assignmentMode === m ? "btn btn-controls btn-controls-active" : "btn btn-controls"}
                    onKeyDown={()=>{}} onClick={() => setAssignmentMode(m)}
                    >{m}
                  </div>
                )
              })}

              <div className="btn btn-controls" onKeyDown={()=>{}}
                onClick={() => {
                  setRandomize(true);
                  setTimeout(() => setRandomize(false), 0)}}
                  >rand</div>
            </div>
          </div>

          <div className="shapes shapes-all" onKeyDown={()=>{}} >
              <div className="fingers">
                <div className="shapes shapes-thumb">
                  {createNodes(4)}
                </div>

                <div className="shapes shapes-index">
                  {createNodes(8)}
                </div>

                <div className="shapes shapes-middle">
                  {createNodes(12)}
                  
                  {/* Palm landmark: */}
                  <div style={{marginTop: "7rem"}}>
                    <Dropdown 
                    iterator={0}
                    activeUIElement={activeUIElement}
                    lastWaveform={lastWaveform}
                    newWaveform={newWaveform}
                    sendActiveUIElementToParent={sendActiveUIElementToControls}
                    sendLastWaveform={sendLastWaveform}
                    sendNewWaveform={sendNewWaveform}
                    assignmentMode={assignmentMode}
                    randomize={randomize} />
                  </div>

                </div>

                <div className="shapes shapes-ring">
                  {createNodes(16)}
                </div>

                <div className="shapes shapes-pinky">
                  {createNodes(20)}
                </div>

              </div>
          </div>

          <div className="fx-update">
            <div className="fx-update-options">
              {WAVEFORMS.map((w) => {
                return (
                  <div key={w} className={fxUpdateWaveform === w ? "btn btn-controls btn-controls-active" : "btn btn-controls"}
                    onKeyDown={()=>{}} onClick={() => setFxUpdateWaveform(w)}
                    >{w.substring(0, 3)}
                  </div>
                )
              })}
            </div>

            <div className="fx-update-sliders" style={{height: "max-content"}}>
              {EFFECTS_PARAMETERS.map((ep, i) => {
                return (
                  <div key={i+1} style={{margin: "6px", display: "flex", height: "20px"}}>
                    <div className="control-label">
                      {ep.replace("-", " ")}
                    </div>
                    {/* TODO: FIX CSS */}
                    <div style={{width: "67%", marginLeft: "6px"}}>
                      <Slider 
                        id={60 + i}
                        mapping={ep}
                        activeUIElement={activeUIElement}
                        sendActiveUIElementToParent={sendActiveUIElementToControls}
                        sendParameterValue={sendParameterValue}
                        lastFxParameterValue={lastFxParameterState[i] as number}
                      />
                    </div>
                    
                  </div>
                )
              })}
            </div>
          </div>

           {/* Microtonal slider */}
           <div className="microtonal">
            <div style={{display: "flex", width: "100%", height: "26px", padding: "3px"}}>
              <div className="control-label">no hand pitch</div>
              <div style={{width: "67%", marginLeft: "6px"}}>
                <Slider 
                  id={71} 
                  mapping={"no-hand-pitch"} 
                  activeUIElement={activeUIElement} 
                  sendActiveUIElementToParent={sendActiveUIElementToControls}/>
              </div>
            </div>

            <div style={{display: "flex", width: "100%", height: "26px", padding: "3px"}}>
              <div className="control-label">microt. amount</div>
              <div style={{width: "67%", marginLeft: "6px"}}>
                <Slider 
                  id={72} 
                  mapping={"microtonal-spread"} 
                  activeUIElement={activeUIElement} 
                  sendActiveUIElementToParent={sendActiveUIElementToControls}/>
              </div>
            </div>
            
            <div style={{display: "flex", width: "100%", height: "26px", padding: "3px"}}>
              <div className="control-label">master volume</div>
              <div style={{width: "67%", marginLeft: "6px"}}>
                <Slider 
                  id={73} 
                  mapping={"master-volume"} 
                  activeUIElement={activeUIElement} 
                  sendActiveUIElementToParent={sendActiveUIElementToControls}/>
              </div>
            </div>
          </div>
      
          <div className="players-outer">
            <div className="players">
              {createPlayers(4)}
            </div>
          </div>
        </div>

    </section>
  )
}

export default Controls;