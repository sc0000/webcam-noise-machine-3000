import { useState, useEffect } from 'react'
import { randomInt } from './utils';

// TODO: Update style when reaching boundaries (greyed out buttons)

const PitchArea = ({sendPitch}: any) => {
    const pitches = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const [activePitch, setActivePitch] = useState(pitches[randomInt(0, 11)]);
    
    const [octaveSpread, setOctaveSpread] = useState(() => {
        const init = randomInt(1, 8);
        return {min: init, max: init};
    });

    sendPitch({pitch: activePitch, min: octaveSpread.min, max: octaveSpread.max});

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

    }, [locked, lastMax, octaveSpread.max, octaveSpread.min]);

    useEffect(() => {
        setRange(`${octaveSpread.min}-${octaveSpread.max}`);
        sendPitch({pitch: activePitch, min: octaveSpread.min, max: octaveSpread.max});
    }, [octaveSpread, activePitch, sendPitch]);

    const maxSwitches = (l: boolean) => {
        if (l) return;

        else {
            return (
                <div>
                    <div className="btn-pitch" onClick={() => {
                        if (octaveSpread.max < 15)
                            setOctaveSpread({
                                min: octaveSpread.min, 
                                max: octaveSpread.max + 1}
                            );
                        }
                    }
                    >+</div>

                    <div className="btn-pitch" onClick={() => {
                        if (octaveSpread.max > 1)
                            setOctaveSpread({
                                min: (octaveSpread.min >= octaveSpread.max - 1 ? octaveSpread.max - 1 : octaveSpread.min), 
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
                    <div key={p} onClick={() => {
                        setActivePitch(p); sendPitch({pitch: p, min: octaveSpread.min, max: octaveSpread.max});
                    }} 
                    
                    className={activePitch === p ? "btn-pitch btn-pitch-active" : "btn-pitch"}>{p}</div>
                );
            })}
        </div>

        <div className="octave-spread">
            <div className="btn-pitch btn-pitch-active" style={{cursor: "default"}}>oct {locked ? octaveSpread.min : range}</div>
            <div className="btn-pitch" onClick={() => {
                    if (octaveSpread.min < 15) {
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

            <div className="btn-pitch" onClick={() => {
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

            <div className="btn-pitch" onClick={() => setLocked(!locked)}>{locked ? "spread" : "unison"}</div>
        </div>
    </div>
  )
}

export default PitchArea