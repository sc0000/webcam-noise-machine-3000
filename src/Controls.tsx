import { useEffect, useState, FC, memo } from 'react'
import Player from './Player'
import audio from './Audio'
import './controls.css'
import Dropdown from './Dropdown'
import Slider from './Slider'

//--------------------------------------------------

interface ControlsProps {
  activeUIElement: number;
  sendActiveUIElementToControlLayer: (i: number) => void;
}

//--------------------------------------------------

const Controls: FC<ControlsProps> = ({
  activeUIElement, sendActiveUIElementToControlLayer
}) => {
  const [startButton, setStartButton] = useState('start audio');

  // Waveforms
  const [lastWaveform, setLastWaveform] = useState("");
  const [newWaveform, setNewWaveform] = useState("sine");
  const [assignmentMode, setAssignmentMode] = useState("single");
  const assignmentModes = ["single", "all of type", "all"];
  const [randomize, setRandomize] = useState(false);

  const sendLastWaveform = (s: string) => {
    setLastWaveform(s);
  }

  const sendNewWaveform = async (s: string) => {
    await setNewWaveform("");
    await setNewWaveform(s);
  }

  const sendActiveUIElementToControls = (i: number): void => {
    sendActiveUIElementToControlLayer(i);
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
  const createPlayers = (n: number): JSX.Element[] => {
    let players = [];

    for (let i = 0; i < n; ++i) {
      players.push(
        <Player key={i} i={i} activeUIElement={activeUIElement} sendActiveUIElementToParent={sendActiveUIElementToControls}/>
      )
    }

    return players;
  }

  return (
    <section id="controls">
        <div className="control-buttons">
          <div className="button-outer">
            <div className="btn btn-controls" onKeyDown={()=>{}}
              onClick={() => {
                  setStartButton(startButton === 'stop audio' ? 'start audio' : 'stop audio');
                  startButton === 'start audio' ? audio.start() : audio.stop();
                }
              }
              >{startButton}
            </div>
          </div>

          <div className="shapes-options-outer" style={{display: "flex", justifyContent: "center"}}>
            <div className="shapes-options">
              {assignmentModes.map((m) => {
                return (
                  <div key={m} className={assignmentMode === m ? "btn btn-controls btn-controls-active" : "btn btn-controls"}
                  onKeyDown={()=>{}} onClick={() => setAssignmentMode(m)}
                    >{m}
                  </div>
                )
              })}

              <div className="btn btn-controls" onKeyDown={()=>{}}
                onClick={() => {
                  const lastMode = assignmentMode;
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
                    <Dropdown key={30}
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

          {/* Microtonal slider */}
          <div className="microtonal">
            <h5>microtonal deviations</h5>
            <div style={{padding: "3px", height: "32px"}}>
              <Slider id={21} mapping={"microtonalSpread"} activeUIElement={activeUIElement} sendActiveUIElementToParent={sendActiveUIElementToControls}/>
            </div>
          </div>

          <div className="players-outer">
            <div className="players">
              {createPlayers(5)}
            </div>
          </div>
        </div>

    </section>
  )
}

export default Controls;