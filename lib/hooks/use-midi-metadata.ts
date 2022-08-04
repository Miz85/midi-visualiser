import { Midi } from "@tonejs/midi";
import { useEffect, useMemo, useState } from "react";

/**
 * Uses ToneJS to parse the midi file metadata into a json format
 * that we can then use.
 */
export const useMidiMetadata = (midiFilePath: string) => {
  const [midiMetadata, setMidiMetadata] = useState<Midi>();

  useEffect(() => {
    async function loadMidi() {
      const midi = await Midi.fromUrl(midiFilePath);
      setMidiMetadata(midi);
    }
    if (typeof window !== "undefined") {
      loadMidi();
    }
  }, [midiFilePath]);

  const notes = useMemo(() => {
    return midiMetadata?.tracks
      .filter((track) => track.instrument.family === "piano")
      .flatMap((track) => track.notes);
  }, [midiMetadata]);

  return { notes, duration: midiMetadata?.tracks?.[0].duration ?? 0 };
};
