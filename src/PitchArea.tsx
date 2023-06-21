import { useState, useEffect, useCallback, FC } from 'react'
import { randomInt } from './utils';
import { ControlProps } from './ControlLayer';
import Slider from './Slider';
import { Pitch } from './Audio';

//--------------------------------------------------

interface PitchAreaProps {
  i: number;
  sendPitch: (p: Pitch) => void;
}

const PITCHES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const MAX_OCTAVE = 9;
const MIN_OCTAVE = 1;

//--------------------------------------------------

const PitchArea: FC<PitchAreaProps & ControlProps> = (
  { i, sendPitch, activeUIElement, sendActiveUIElementToParent }
) => {
  const [activePitch, setActivePitch] = useState(PITCHES[randomInt(0, 11)]);

  const [octaveSpread, setOctaveSpread] = useState(() => {
    const init = randomInt(1, 7);
    return { min: init, max: init };
  });

  const [lastMax, setLastMax] = useState(octaveSpread.max);
  const [locked, setLocked] = useState(true);
  const [range, setRange] = useState(`${octaveSpread.min}-${octaveSpread.max}`);
  const [centWiseDeviation, setCentWiseDeviation] = useState(0);

  const sendActiveUIElementToPitchArea = (i: number): void => {
    sendActiveUIElementToParent(i);
  }

  const sendCentWiseDeviation = (cents: number): void => {
    setCentWiseDeviation(Math.trunc(cents));
  }

  const printCentWiseDeviation = useCallback((): string => {
    const absDeviation = Math.abs(centWiseDeviation);

    let toPrint = "";

    if (absDeviation < 10) toPrint += " ";

    if (centWiseDeviation < 0) toPrint += "-";
    else toPrint += "+";
    // else toPrint += " ";

    toPrint += absDeviation;
    toPrint += "ct";

    return toPrint;
  }, [centWiseDeviation]);

  useEffect(() => {
    // if locked, set both to min
    if (locked) {
      setLastMax(octaveSpread.max);
      setOctaveSpread({ min: octaveSpread.min, max: octaveSpread.min });
    }

    if (!locked && lastMax > octaveSpread.max)
      setOctaveSpread({ min: octaveSpread.min, max: lastMax });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  useEffect(() => {
    setRange(`${octaveSpread.min}-${octaveSpread.max}`);
    sendPitch({ pitch: activePitch, deviation: centWiseDeviation, min: octaveSpread.min, max: octaveSpread.max });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [octaveSpread, activePitch, centWiseDeviation]);

  const maxSwitches = (l: boolean) => {
    if (l) return;

    else {
      return (
        <div>
          <div className={octaveSpread.max < MAX_OCTAVE ? "btn-pitch" : "btn-pitch btn-pitch-disabled"}
            onKeyDown={() => { }}
            onClick={() => {
              if (octaveSpread.max < MAX_OCTAVE)
                setOctaveSpread({
                  min: octaveSpread.min,
                  max: octaveSpread.max + 1
                }
                );
            }}
          >+</div>

          <div className={octaveSpread.max > MIN_OCTAVE ? "btn-pitch" : "btn-pitch btn-pitch-disabled"}
            onKeyDown={() => { }}
            onClick={() => {
              if (octaveSpread.max > 1)
                setOctaveSpread({
                  min: (octaveSpread.min >= octaveSpread.max ? octaveSpread.max - 1 : octaveSpread.min),
                  max: octaveSpread.max - 1
                }
                );
            }}
          >-</div>
        </div>
      )
    }
  }

  //--------------------------------------------------

  return (
    <div className="subdiv">
      <div className="selector">
        {PITCHES.map((p) => {
          return (
            <div key={p}
              onKeyDown={() => { }}
              onClick={() => {
                setActivePitch(p);
                sendPitch({
                  pitch: p,
                  deviation: centWiseDeviation,
                  min: octaveSpread.min,
                  max: octaveSpread.max
                });
              }}

              className={activePitch === p ? "btn-pitch btn-pitch-active" : "btn-pitch"}>{p}
            </div>
          );
        })}
      </div>

      <div className="octave-spread">
        <div className="btn-pitch btn-pitch-active" style={{ cursor: "default" }}>
          oct {locked ? octaveSpread.min : range}
        </div>

        <div className={octaveSpread.min < MAX_OCTAVE ? "btn-pitch" : "btn-pitch btn-pitch-disabled"}
          onKeyDown={() => { }}
          onClick={() => {
            if (octaveSpread.min < MAX_OCTAVE) {
              if (locked)
                setOctaveSpread({
                  min: octaveSpread.min + 1,
                  max: octaveSpread.min + 1
                });

              else
                setOctaveSpread({
                  min: octaveSpread.min + 1,
                  max: (octaveSpread.max <= octaveSpread.min ? octaveSpread.min + 1 : octaveSpread.max)
                });
            }
          }}>+
        </div>

        <div className={octaveSpread.min > MIN_OCTAVE ? "btn-pitch" : "btn-pitch btn-pitch-disabled"}
          onKeyDown={() => { }}
          onClick={() => {
            if (octaveSpread.min > 1) {
              if (locked)
                setOctaveSpread({
                  min: octaveSpread.min - 1,
                  max: octaveSpread.min - 1
                });

              else
                setOctaveSpread({
                  min: octaveSpread.min - 1,
                  max: octaveSpread.max
                });
            }
          }}>-
        </div>

        <div>{maxSwitches(locked)}</div>

        <div className="btn-pitch" onKeyDown={() => { }} onClick={() => {
          setLocked(!locked);
        }}>{locked ? "spread" : "unison"}
        </div>
        <div className="btn-pitch btn-pitch-active" style={{ cursor: "default", whiteSpace: "pre-wrap" }}>
          {printCentWiseDeviation()}
        </div>
        {/* TODO: Hide slider behind "micro" button */}
        <Slider
          id={i + 40}
          mapping="cent-wise-deviation"
          sendCentWiseDeviation={sendCentWiseDeviation}
          activeUIElement={activeUIElement}
          sendActiveUIElementToParent={sendActiveUIElementToPitchArea}
        />
      </div>

    </div>
  )
}

export default PitchArea