import { useState, useEffect, FC } from 'react'
import { randomInt } from './utils';

// TODO: Update style when reaching boundaries (greyed out buttons)

interface PitchAreaProps {
    sendPitch: ({pitch, min, max}: {pitch: string, min: number, max: number}) => void;
}

const pitches = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const MAX_OCTAVE = 9;
const MIN_OCTAVE = 1;

const PitchArea: FC<PitchAreaProps> = ({sendPitch}) => {   
    const [activePitch, setActivePitch] = useState(pitches[randomInt(0, 11)]);
    
    const [octaveSpread, setOctaveSpread] = useState(() => {
        const init = randomInt(1, 7);
        return {min: init, max: init};
    });

    const [lastMax, setLastMax] = useState(octaveSpread.max);

    const [locked, setLocked] = useState(true);

    const [range, setRange] = useState(`${octaveSpread.min}-${octaveSpread.max}`);

    useEffect(() => {
        // if locked, set both to min
        if (locked){
            setLastMax(octaveSpread.max);
            setOctaveSpread({min: octaveSpread.min, max: octaveSpread.min});
        }

        if (!locked && lastMax > octaveSpread.max)
            setOctaveSpread({min: octaveSpread.min, max: lastMax});

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locked]);

    useEffect(() => {
        setRange(`${octaveSpread.min}-${octaveSpread.max}`);
        sendPitch({pitch: activePitch, min: octaveSpread.min, max: octaveSpread.max});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [octaveSpread, activePitch]);

    const maxSwitches = (l: boolean) => {
        if (l) return;

        else {
            return (
                <div>
                    <div className={octaveSpread.max < MAX_OCTAVE ? "btn-pitch" : "btn-pitch-disabled"} onKeyDown={()=>{}} onClick={() => {
                        if (octaveSpread.max < MAX_OCTAVE)
                            setOctaveSpread({
                                min: octaveSpread.min, 
                                max: octaveSpread.max + 1}
                            );
                        }
                    }
                    >+</div>

                    <div className={octaveSpread.max > MIN_OCTAVE ? "btn-pitch" : "btn-pitch-disabled"} onKeyDown={()=>{}} onClick={() => {
                        if (octaveSpread.max > 1)
                            setOctaveSpread({
                                min: (octaveSpread.min >= octaveSpread.max ? octaveSpread.max - 1 : octaveSpread.min), 
                                max: octaveSpread.max - 1}
                            );
                        }
                    }
                    >-</div>
                </div>
            )
        }
    }

  return (
    <div className="subdiv">
        <div className="selector">
            {pitches.map((p) => {
                return (
                    <div key={p} onKeyDown={()=>{}} onClick={() => {
                        setActivePitch(p); sendPitch({pitch: p, min: octaveSpread.min, max: octaveSpread.max});
                    }} 
                    
                    className={activePitch === p ? "btn-pitch btn-pitch-active" : "btn-pitch"}>{p}</div>
                );
            })}
        </div>

        <div className="octave-spread">
            <div className="btn-pitch btn-pitch-active" style={{cursor: "default"}}>oct {locked ? octaveSpread.min : range}</div>
            <div className={octaveSpread.min < MAX_OCTAVE ? "btn-pitch" : "btn-pitch-disabled"} onKeyDown={()=>{}} onClick={() => {
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
                }
            }>+</div>

            <div className={octaveSpread.min > MIN_OCTAVE ? "btn-pitch" : "btn-pitch-disabled"} onKeyDown={()=>{}} onClick={() => {
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
                }
            }>-</div>

            <div>{maxSwitches(locked)}</div>

            <div className="btn-pitch" onKeyDown={()=>{}} onClick={() => {
                setLocked(!locked);
            }}>{locked ? "spread" : "unison"}</div>
        </div>
    </div>
  )
}

export default PitchArea