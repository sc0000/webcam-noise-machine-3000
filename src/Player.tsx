import React, { useState } from 'react'
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

interface Player {
  i: number;
}

const Player: React.FC<Player> = ({/*update,*/ i}) => {
    const [recordButton, setRecordButton] = useState(RECORDBUTTONRED);
    const [isRecording, setIsRecording] = useState(false);
    const [playButton, setPlayButton] = useState(PLAYBUTTON);

  return (
    <div className="player">
          <img src={recordButton} alt="" onClick={() => {
                if (!isRecording) {
                  setIsRecording(true);
                  audio.startRecording();
                  setRecordButton(RECORDBUTTONACTIVE);
                }

                else {
                  // update();
                  audio.stopRecording(i);
                  setIsRecording(false);
                  setRecordButton(RECORDBUTTONRED);
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

          <img src={!audio.players[i] ? PLAYBUTTONDISABLED : playButton} alt="" onClick={() => {
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
            
            // className={playButton === PLAYBUTTON ? "btn btn-controls" : "btn btn-controls btn-controls-active"} 
            className={!audio.players[i] ? "btn-disabled" : "btn btn-controls"}
          />

          <div style={{paddingTop: "0.47rem"}} onClick={() => {
                audio.players[i].playbackRate *= 0.5;
              }
            } 
            className={!audio.players[i] ? "btn-disabled" : "btn btn-controls"}>/2
          </div>

          <div style={{paddingTop: "0.47rem"}} onClick={() => {
                audio.players[i].playbackRate *= 2;
              }
            } 
            className={!audio.players[i] ? "btn-disabled" : "btn btn-controls"}>*2
        </div>

        <div className="slider">
          <Slider iterator={i} />
        </div>
        
    </div>
  )
}

export default Player