"use client";

import { Midi } from "@tonejs/midi";
import * as Tone from "tone";
import { scan } from "react-scan";
import React, { useEffect, useState, useRef } from "react";
import { scaleLinear } from "d3-scale";
import { PianoKeyboard } from "../components/PianoKeyboard";
import { scalePiano } from "../lib/piano-scale";
import { Stage, Layer, Rect } from "react-konva";
import { loadSampler } from "../lib/load-sampler";
import { getFileNameWithoutExtension } from "../lib/get-file-name-without-extension";
import { useFrame } from "../lib/use-frame";
import { Select } from "../components/Select";
import { formatDuration } from "../lib/format-duration";

import "./index.css";

if (typeof window !== "undefined") {
  scan({
    enabled: true,
    log: true, // logs render info to console (default: false)
  });
}

const trackHeight = 600;
const trackWidth = 800;

const midiFiles: string[] = [
  "Back to the future - Main theme.mid",
  "Pachebel - Canon in D.mid",
  "Pirates of the Caribeans - He's a pirate.mid",
  "Vincent Gauchot - Closure.mid",
  "Gorillaz - Feel Good Inc..mid",
  "Passenger - Let Her Go.mid",
  "The Script feat. will.i.am - Hall of Fame.mid",
  "Yiruma - River flows in you.mid",
];

export default function Home() {
  const [midiMetadata, setMidiMetadata] = useState<Midi>();
  const [selectedMidiFile, setSelectedMidiFile] = React.useState(midiFiles[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const xScale = useRef(scalePiano().range([0, trackWidth]));
  const yScale = useRef(scaleLinear().range([trackHeight - 70, 0]));
  const sampler = useRef<Tone.Sampler>();
  const [color, setColor] = React.useState("#00ffff");

  useEffect(() => {
    async function loadMidiAndSampler() {
      const midi = await Midi.fromUrl(selectedMidiFile);
      if (!sampler.current) {
        sampler.current = await loadSampler();
      }
      setMidiMetadata(midi);
    }
    if (typeof window !== "undefined") {
      loadMidiAndSampler();
    }
  }, [selectedMidiFile]);

  yScale.current.domain([playbackPosition, playbackPosition + 3]);

  useEffect(() => {
    if (Tone.Transport.state !== "started" && midiMetadata) {
      console.log(midiMetadata);
      Tone.Transport.cancel();
      setIsPlaying(false);
      midiMetadata?.tracks?.[1].notes.forEach((note) =>
        midiMetadata?.tracks?.[0].notes.push(note)
      );
      midiMetadata?.tracks?.[0]?.notes.forEach((note) => {
        Tone.Transport.schedule(() => {
          sampler?.current?.triggerAttackRelease(
            note.name,
            note.duration,
            "+0.1",
            note.velocity
          );
        }, note.time);
      });
    }
    return () => {
      Tone.Transport.stop();
    };
  }, [midiMetadata]);

  useFrame(() => {
    setPlaybackPosition(Tone.Transport.seconds);
  });

  async function handlePlayPause() {
    await Tone.start();
    setIsPlaying((current) => !current);
    if (isPlaying) {
      Tone.Transport.pause();
    } else {
      Tone.Transport.start("+0.6");
    }
  }

  const selectOptions = React.useMemo(
    () =>
      midiFiles.map((fileName) => ({
        value: fileName,
        label: getFileNameWithoutExtension(fileName),
      })),
    [midiFiles]
  );

  return (
    <div className="App">
      {midiMetadata ? (
        <>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Select
              options={selectOptions}
              value={selectedMidiFile}
              onChange={(newValue) => setSelectedMidiFile(newValue)}
            ></Select>
            <input
              style={{ marginLeft: "10px" }}
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <div className="controls">
            <button onClick={handlePlayPause}>
              {isPlaying ? "Pause" : "Play"}
            </button>
            <input
              type="range"
              min={0}
              max={midiMetadata?.tracks?.[0]?.duration}
              value={playbackPosition}
              step={10}
              onChange={(e) => {
                setPlaybackPosition(Number(e.target.value));
                Tone.Transport.seconds = Number(e.target.value);
              }}
            />
            <span className="timing">
              {formatDuration(playbackPosition)}
              {" / "}
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
                      fill={color}
                      shadowColor={color}
                      shadowBlur={20}
                    />
                  );
                })}
              <Rect
                x={0}
                y={trackHeight - 72}
                height={10}
                width={trackWidth}
                fill={color}
                shadowColor={color}
                shadowBlur={20}
                cornerRadius={3}
              ></Rect>
              <PianoKeyboard
                x={0}
                y={trackHeight - 70}
                height={70}
                pianoScale={xScale.current}
                highlightedNotes={
                  Tone.Transport.state === "started"
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
