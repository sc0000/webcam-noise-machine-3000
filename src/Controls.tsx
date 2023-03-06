import { useEffect, useState, memo } from 'react'
import Player from './Player'
import audio from './Audio'
import './controls.css'
import Dropdown from './Dropdown'
import Slider from './Slider'

import { randomInt } from './utils'

const Controls = () => {
  const [startButton, setStartButton] = useState('start audio');

  // Waveforms
  const [activeDropdown, setActiveDropdown] = useState(99);
  const [lastWaveform, setLastWaveform] = useState("");
  const [newWaveform, setNewWaveform] = useState("sine");
  const [assignmentMode, setAssignmentMode] = useState("single");
  const assignmentModes = ["single", "all of type", "all"];
  const [randomize, setRandomize] = useState(false);


  const sendLastWaveform = (s: string) => {
    setLastWaveform(s);
  }

  const sendNewWaveform = async (s: string) => {
    // TODO: Remove first reset w/ string shenanigans
    await setNewWaveform("");
    await setNewWaveform(s);
  }

  const sendActivation = (i: number) => {
    setActiveDropdown(i);
  }

  const createNodes = (firstIterator: number) => {
    const nodes = [];

    for (let i = 0; i < 4; ++i) {
      nodes.push(
        <Dropdown key={i}
          iterator={firstIterator - i}
          activeDropdown={activeDropdown}
          lastWaveform={lastWaveform}
          newWaveform={newWaveform}
          sendActivation={sendActivation}
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
  const createPlayers = (n: number) => {
    let players = [];

    for (let i = 0; i < n; ++i) {
      players.push(
        <Player key={i} i={i} />
      )
    }

    return players;
  }

  // TODO: Tidy up and move to global scope!
  const [CC, setCC] = useState<string | null>("");

  useEffect(() => {
    if (CC && CC !== ("btn btn-controls dd" || "btn btn-controls btn-controls-active dd"))
      setActiveDropdown(99); 
  }, [CC]);

  return (
    <section id="controls" onKeyDown={()=>{}} onClick={(event: React.MouseEvent) => {
      const target = event.target as Element;
      const targetClass = target.getAttribute("class");
      setCC(targetClass);
    }}>
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
                  <div style={{marginTop: "7rem"}}>
                    <Dropdown key={30}
                    iterator={0}
                    activeDropdown={activeDropdown}
                    lastWaveform={lastWaveform}
                    newWaveform={newWaveform}
                    sendActivation={sendActivation}
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

          <div className="microtonal">
            <h5>microtonal deviations</h5>
            <div style={{padding: "3px", height: "32px"}}>
              <Slider micro={true}/>
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