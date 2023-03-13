import React, { useState, useEffect } from 'react'
import audio from './Audio';
import Slider from './Slider';
import PLAYBUTTON from './assets/playbutton-lo.png'
import PLAYBUTTONACTIVE from './assets/playbutton-lo-active.png'
import PLAYBUTTONDISABLED from './assets/playbutton-lo-disabled.png'
import STOPBUTTON from './assets/stopbutton-lo.png'
import STOPBUTTONACTIVE from './assets/stopbutton-lo-active.png'
import RECORDBUTTONRED from './assets/recordbutton-lo-red.png'
import RECORDBUTTONACTIVE from './assets/recordbutton-lo-active.png'

import './player.css'

interface PlayerProps {
  i: number;
  activeUIElement: number;
  sendActiveUIElementToParent: (id: number) => void;
}

const Player: React.FC<PlayerProps> = ({i, activeUIElement, sendActiveUIElementToParent}) => {
    const [recordButton, setRecordButton] = useState(RECORDBUTTONRED);
    const [isRecording, setIsRecording] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [playButton, setPlayButton] = useState(PLAYBUTTONDISABLED);

    // const [className, setClassName] = useState("btn-disabled");

    const sendActiveUIElementToPlayer = (id: number): void => {
      sendActiveUIElementToParent(id);
    }


  return (
    <div className="player">
          {/* Record button */}
          <img src={recordButton} alt="" onKeyDown={()=>{}} 
            onClick={() => {
                if (!isRecording) {
                  setIsRecording(true);
                  audio.startRecording();
                  setRecordButton(RECORDBUTTONACTIVE);
                }

                else {
                  // update();
                  audio.stopRecording(i);
                  setIsRecording(false);
                  setHasRecorded(true);
                  setRecordButton(RECORDBUTTONRED);
                  // setClassName("btn btn-controls");
                  setPlayButton(PLAYBUTTON);
                }
              }
            }
          
            onMouseEnter={() => {
                if (recordButton === RECORDBUTTONRED)
                  setRecordButton(RECORDBUTTONACTIVE);
              }
            }

            onMouseLeave={() => {
                if (!isRecording)
                  setRecordButton(RECORDBUTTONRED);
            }}

            className={recordButton === RECORDBUTTONRED ? "btn btn-controls" : "btn btn-controls btn-controls-active"}
          />

          {/* Play button */}
          <img src={hasRecorded ? playButton : PLAYBUTTONDISABLED} alt="" style={{ transition: "opacity 200ms ease-in-out" }} onKeyDown={()=>{}} 
            onClick={() => {
                if (playButton === PLAYBUTTONACTIVE) {
                  audio.players[i].start(); 
                  setPlayButton(STOPBUTTONACTIVE);
                }
            
                else {
                  audio.players[i].stop();
                  setPlayButton(PLAYBUTTONACTIVE);
                }
              }
            } 
              
            onMouseEnter={() => {
                if (playButton === PLAYBUTTON)
                  setPlayButton(PLAYBUTTONACTIVE);

                else if (playButton === STOPBUTTON)
                  setPlayButton(STOPBUTTONACTIVE);
              }
            }

            onMouseLeave={() => {
                if (playButton === PLAYBUTTONACTIVE)
                  setPlayButton(PLAYBUTTON);     

                else if (playButton === STOPBUTTONACTIVE)
                  setPlayButton(STOPBUTTON);
              }
            } 
            
            className={hasRecorded ? "btn btn-controls" : "btn btn-controls btn-disabled"} 
            // className={className}
          />

          {/* Half speed button */}
          <div style={{paddingTop: "0.47rem"}} onKeyDown={()=>{}}
            onClick={() => {
                audio.players[i].playbackRate *= 0.5;
              }
            } 

            className={hasRecorded ? "btn btn-controls" : "btn btn-controls btn-disabled"}>/2
          </div>

          {/* Double speed button */}
          <div style={{paddingTop: "0.47rem"}} onKeyDown={()=>{}} 
            onClick={() => {
                audio.players[i].playbackRate *= 2;
              }
            } 
            
            className={hasRecorded ? "btn btn-controls" : "btn btn-controls btn-disabled"}>*2
        </div>

        <div className="slider">
          <Slider id={i + 22} mapping={"playerVolume"} recorded={hasRecorded} 
            activeUIElement={activeUIElement} sendActiveUIElementToParent={sendActiveUIElementToPlayer}/>
        </div>
        
    </div>
  )
}

export default Player