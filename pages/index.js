import styles from './index.module.css';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import { useEffect, useState, useRef } from 'react';
import { scaleLinear } from 'd3-scale';
import { PianoKeyboard } from '../components/PianoKeyboard';
import { scalePiano } from '../lib/piano-scale';
import { Stage, Layer, Rect } from 'react-konva';

function formatDurationPart(num) {
  return num < 10 ? `0${num}` : `${num}`;
}
function formatDuration(nbSeconds) {
  const minutes = Math.floor(nbSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const seconds = Math.round((nbSeconds / 60 - minutes) * 60);
  return `${formatDurationPart(hours)}:${formatDurationPart(
    minutes
  )}:${formatDurationPart(seconds)}`;
}

const trackHeight = 600;
const trackWidth = 800;

let synth;
if (typeof window !== 'undefined') {
  synth = new Tone.PolySynth().toDestination();
}

export default function Home() {
  const [midiMetadata, setMidiMetadata] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const timerId = useRef();
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const xScale = useRef(scalePiano().range([0, trackWidth]));
  const yScale = useRef(scaleLinear().range([trackHeight - 70, 0]));

  useEffect(() => {
    async function convertMidi() {
      // const midi = await Midi.fromUrl("pachelbels-canon-arranged.mid");
      //const midi = await Midi.fromUrl("Closure.mid");
      const midi = await Midi.fromUrl('24884_Back-to-the-Future.mid');
      await Tone.start();
      Tone.Transport.bpm.value = 220;

      setMidiMetadata(midi);
    }
    if (!midiMetadata && typeof window !== 'undefined') {
      convertMidi();
    }
  }, []);

  yScale.current.domain([playbackPosition, playbackPosition + 5]);

  useEffect(() => {
    if (Tone.Transport.state !== 'started' && midiMetadata) {
      console.log(midiMetadata);
      midiMetadata?.tracks?.[1]?.notes.forEach((note) => {
        Tone.Transport.scheduleOnce((time) => {
          synth.triggerAttackRelease(note.name, note.duration);
        }, note.time);
      });
    }
    return () => {
      Tone.Transport.stop();
    };
  }, [midiMetadata]);

  useEffect(() => {
    function updatePlaybackPosition() {
      timerId.current = requestAnimationFrame(() => {
        setPlaybackPosition(Tone.Transport.seconds);
        updatePlaybackPosition();
      });
    }
    updatePlaybackPosition();

    return () => {
      cancelAnimationFrame(timerId.current);
    };
  }, []);

  return (
    <div className={styles.App}>
      <div className={styles.controls}>
        <button
          style={{ width: '70px' }}
          onClick={() => {
            setIsPlaying((current) => !current);
            Tone.Transport.toggle();
          }}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
        <input
          type="range"
          min={0}
          max={midiMetadata?.tracks?.[1]?.duration}
          value={playbackPosition}
          step={10}
          onChange={(e) => {
            setPlaybackPosition(e.target.value);
            Tone.Transport.seconds = e.target.value;
          }}
        />
        <span className={styles.timing}>
          {formatDuration(playbackPosition)}
          {' / '}
          {formatDuration(midiMetadata?.tracks?.[1]?.duration)}
        </span>
      </div>

      <Stage height={trackHeight} width={trackWidth}>
        <Layer>
          {midiMetadata?.tracks?.[1]?.notes
            .filter(
              (note) =>
                note.time + note.duration > playbackPosition &&
                note.time <= playbackPosition + 5
            )
            .map((note, i) => {
              const pianoKey = xScale.current(note.midi);
              const x = pianoKey?.x ?? 0;
              const width = pianoKey?.width ?? 0;
              const height = note.duration * 80;
              const y = yScale.current(note.time) - height - 1;

              return (
                <Rect
                  key={i}
                  x={x}
                  y={y}
                  height={height}
                  width={width}
                  cornerRadius={3}
                  fill="cyan"
                  shadowColor="cyan"
                  shadowBlur={20}
                />
              );
            })}
          <PianoKeyboard
            x={0}
            y={trackHeight - 70}
            height={70}
            pianoScale={xScale.current}
            highlightedNotes={
              Tone.Transport.state === 'started'
                ? midiMetadata?.tracks?.[1]?.notes
                    .filter(
                      (note) =>
                        note.time + note.duration > playbackPosition &&
                        note.time <= playbackPosition &&
                        note.time <= playbackPosition + 5
                    )
                    .map((note) => note.midi)
                : []
            }
          />
        </Layer>
      </Stage>
    </div>
  );
}
