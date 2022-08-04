import styles from "./index.module.css";
import * as Tone from "tone";
import React, { useState, useMemo } from "react";
import { scaleLinear } from "d3-scale";
import { PianoKeyboard } from "../components/PianoKeyboard";
import { scalePiano } from "../lib/piano-scale";
import { Stage, Layer, Rect } from "react-konva";
import { getFileNameWithoutExtension } from "../lib/get-file-name-without-extension";
import { useFrame } from "../lib/use-frame";
import { Select } from "../components/Select";
import { formatDuration } from "../lib/format-duration";
import { useMidiMetadata } from "../lib/hooks/use-midi-metadata";
import { useScheduleNotes } from "../lib/hooks/use-schedule-notes";

const trackHeight = 600;
const trackWidth = 800;
const xScale = scalePiano().range([0, trackWidth]);
const yScale = scaleLinear().range([trackHeight - 70, 0]);

interface HomeProps {
  midiFiles: string[];
}

export default function Home({ midiFiles }: HomeProps) {
  const [selectedMidiFile, setSelectedMidiFile] = React.useState(midiFiles[0]);
  const { notes, duration } = useMidiMetadata(selectedMidiFile);
  const isPlaying = React.useMemo(() => {
    return Tone.Transport.state === "started";
  }, [Tone.Transport.state]);
  const [playbackPosition, setPlaybackPosition] = useState(0);

  const [color, setColor] = React.useState("#00ffff");

  yScale.domain([playbackPosition, playbackPosition + 3]);

  useScheduleNotes(notes);

  React.useEffect(() => {}, []);

  useFrame(() => {
    setPlaybackPosition(Tone.Transport.seconds);
  });

  async function handlePlayPause() {
    await Tone.start();
    if (isPlaying) {
      Tone.Transport.pause();
    } else {
      Tone.Transport.start("+0.6");
    }
  }

  const notesInScene = useMemo(() => {
    return notes?.filter(
      (note) =>
        note.time + note.duration > playbackPosition &&
        // Arbitrarily choosing a 3s time window at a time
        note.time <= playbackPosition + 3
    );
  }, [notes, playbackPosition]);

  const notesPlaying = useMemo(() => {
    return notesInScene?.filter((note) => note.time <= playbackPosition);
  }, [notesInScene]);
  return (
    <div className={styles.App}>
      {notes ? (
        <>
          <div className={styles.options}>
            <Select
              options={midiFiles.map((fileName) => ({
                value: fileName,
                label: getFileNameWithoutExtension(fileName),
              }))}
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
          <div className={styles["playback-controls"]}>
            <button onClick={handlePlayPause}>
              {isPlaying ? "Pause" : "Play"}
            </button>
            <input
              type="range"
              min={0}
              max={duration}
              value={playbackPosition}
              step={10}
              onChange={(e) => {
                setPlaybackPosition(Number(e.target.value));
                Tone.Transport.seconds = Number(e.target.value);
              }}
            />
            <span className={styles.timing}>
              {formatDuration(playbackPosition)}
              {" / "}
              {formatDuration(duration)}
            </span>
          </div>

          <Stage height={trackHeight} width={trackWidth}>
            <Layer>
              {notesInScene.map((note, i) => {
                const pianoKey = xScale(note.midi);
                const x = pianoKey?.x ?? 0;
                const width = pianoKey?.width ?? 0;
                const height =
                  yScale(note.time) - yScale(note.time + note.duration);

                const y = yScale(note.time) - height;

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
                pianoScale={xScale}
                highlightedNotes={
                  isPlaying ? notesPlaying.map((note) => note.midi) : []
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
  const path = require("path");
  const fs = require("fs");

  const publicFolderPath = path.resolve("public");
  return { props: { midiFiles: fs.readdirSync(publicFolderPath) } };
}
