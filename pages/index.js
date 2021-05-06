import styles from './index.module.css';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import React, { useEffect, useState, useRef } from 'react';
import { scaleLinear } from 'd3-scale';
import { PianoKeyboard } from '../components/PianoKeyboard';
import { scalePiano } from '../lib/piano-scale';
import { Stage, Layer, Rect, Line } from 'react-konva';

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

export default function Home({ midiFiles }) {
  const [midiMetadata, setMidiMetadata] = useState();
  const [selectedMidiFile, setSelectedMidiFile] = React.useState(midiFiles[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerId = useRef();
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const xScale = useRef(scalePiano().range([0, trackWidth]));
  const yScale = useRef(scaleLinear().range([trackHeight - 70, 0]));
  const synth = useRef();
  const sampler = useRef();

  useEffect(() => {
    console.log('>>>>', midiFiles);
    async function convertMidi() {
      const midi = await Midi.fromUrl(selectedMidiFile);

      setMidiMetadata(midi);
    }
    if (typeof window !== 'undefined') {
      convertMidi();
    }
  }, [selectedMidiFile]);

  useEffect(() => {
    if (!synth.current) {
      // synth.current = new Tone.PolySynth().toDestination();
    }
    const reverb = new Tone.Reverb({ decay: 10, wet: 0.4 }).toDestination();
    const _sampler = new Tone.Sampler({
      urls: {
        A1: 'A1.mp3',
        A2: 'A2.mp3',
        A3: 'A3.mp3',
        A4: 'A4.mp3',
        A5: 'A5.mp3',
        A6: 'A6.mp3',
        A7: 'A7.mp3',
        C1: 'C1.mp3',
        C2: 'C2.mp3',
        C3: 'C3.mp3',
        C4: 'C4.mp3',
        C5: 'C5.mp3',
        C6: 'C6.mp3',
        C7: 'C7.mp3',
        'D#1': 'Ds1.mp3',
        'D#2': 'Ds2.mp3',
        'D#3': 'Ds3.mp3',
        'D#4': 'Ds4.mp3',
        'D#5': 'Ds5.mp3',
        'D#6': 'Ds6.mp3',
        'D#7': 'Ds7.mp3',
        'F#1': 'Fs1.mp3',
        'F#2': 'Fs2.mp3',
        'F#3': 'Fs3.mp3',
        'F#4': 'Fs4.mp3',
        'F#5': 'Fs5.mp3',
        'F#6': 'Fs6.mp3',
        'F#7': 'Fs7.mp3',
      },
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => {
        sampler.current = _sampler;
      },
    }).connect(reverb);
  }, []);

  yScale.current.domain([playbackPosition, playbackPosition + 3]);

  useEffect(() => {
    if (Tone.Transport.state !== 'started' && midiMetadata) {
      console.log(midiMetadata);
      Tone.Transport.cancel();
      setIsPlaying(false);
      midiMetadata?.tracks?.[1].notes.forEach((note) =>
        midiMetadata?.tracks?.[0].notes.push(note)
      );
      midiMetadata?.tracks?.[0]?.notes.forEach((note) => {
        Tone.Transport.schedule((time) => {
          sampler.current.triggerAttackRelease(
            note.name,
            note.duration,
            '+0.1',
            note.velocity
          );
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
        // if(Tone.Transport.seconds > )
        updatePlaybackPosition();
      });
    }
    updatePlaybackPosition();

    return () => {
      cancelAnimationFrame(timerId.current);
    };
  }, []);

  async function handlePlayPause() {
    await Tone.start();
    setIsPlaying((current) => !current);
    if (isPlaying) {
      Tone.Transport.pause();
    } else {
      Tone.Transport.start('+0.6');
    }
  }

  function getUserFriendlySongName(midiFile) {
    const parts = midiFile.split('.');
    parts.pop();
    return parts.join('.');
  }

  return (
    <div className={styles.App}>
      {midiMetadata ? (
        <>
          <select
            value={selectedMidiFile}
            onChange={(e) => setSelectedMidiFile(e.target.value)}
          >
            {midiFiles.map((midiFile) => (
              <option value={midiFile}>
                {getUserFriendlySongName(midiFile)}
              </option>
            ))}
          </select>
          <div className={styles.controls}>
            <button style={{ width: '70px' }} onClick={handlePlayPause}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <input
              type="range"
              min={0}
              max={midiMetadata?.tracks?.[0]?.duration}
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
              {formatDuration(midiMetadata?.tracks?.[0]?.duration)}
            </span>
          </div>

          <Stage height={trackHeight} width={trackWidth}>
            <Layer>
              {midiMetadata?.tracks?.[0]?.notes
                .filter(
                  (note) =>
                    note.time + note.duration > playbackPosition &&
                    note.time <= playbackPosition + 3
                )
                .map((note, i) => {
                  const pianoKey = xScale.current(note.midi);
                  const x = pianoKey?.x ?? 0;
                  const width = pianoKey?.width ?? 0;
                  const height =
                    yScale.current(note.time) -
                    yScale.current(note.time + note.duration);

                  const y = yScale.current(note.time) - height;

                  return (
                    <Rect
                      key={i}
                      x={x}
                      y={y}
                      height={height - 5}
                      width={width}
                      cornerRadius={3}
                      fill="cyan"
                      shadowColor="cyan"
                      shadowBlur={20}
                    />
                  );
                })}
              <Rect
                x={0}
                y={trackHeight - 72}
                height={10}
                width={trackWidth}
                fill="cyan"
                shadowColor="cyan"
                shadowBlur={20}
                cornerRadius={3}
              ></Rect>
              <PianoKeyboard
                x={0}
                y={trackHeight - 70}
                height={70}
                pianoScale={xScale.current}
                highlightedNotes={
                  Tone.Transport.state === 'started'
                    ? midiMetadata?.tracks?.[0]?.notes
                        .filter(
                          (note) =>
                            note.time + note.duration > playbackPosition &&
                            note.time <= playbackPosition &&
                            note.time <= playbackPosition + 3
                        )
                        .map((note) => note.midi)
                    : []
                }
              />
            </Layer>
          </Stage>
        </>
      ) : null}
    </div>
  );
}

export async function getStaticProps() {
  const path = require('path');
  const fs = require('fs');

  const publicFolderPath = path.resolve('public');
  return { props: { midiFiles: fs.readdirSync(publicFolderPath) } };
}
