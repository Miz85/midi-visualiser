import { Note } from "@tonejs/midi/dist/Note";
import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { loadSampler } from "../load-sampler";

export const useScheduleNotes = (notes: Note[] | undefined = []) => {
  const sampler = useRef<Tone.Sampler>();

  useEffect(() => {
    if (!sampler.current) {
      loadSampler().then((newSampler) => (sampler.current = newSampler));
    }
  }, []);

  useEffect(() => {
    if (Tone.Transport.state !== "started") {
      Tone.Transport.cancel();

      notes.forEach((note) => {
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
  }, [notes]);
};
