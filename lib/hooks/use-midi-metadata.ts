import { Midi } from "@tonejs/midi";
import { useEffect, useState } from "react";

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

  return midiMetadata;
};
