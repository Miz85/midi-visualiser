import { getNoteName, getNoteOctave } from "../lib/notes";

// A piano has 88 keys ranging from A-1(9) to C7(96)
const firstNoteMidiCode = 9;
const lastNoteMidiCode = 96;

const pianoKeys = new Array(lastNoteMidiCode - firstNoteMidiCode + 1)
  .fill(0)
  .map((_, i) => {
    return {
      isWhite: isWhiteKey(i + 9),
      midiCode: i + 9,
      noteName: getNoteName(i + 9),
      noteOctave: getNoteOctave(i + 9),
    };
  });

function isWhiteKey(midiCode) {
  return [0, 2, 4, 5, 7, 9, 11].includes(midiCode % 12);
}

const whiteKeys = pianoKeys.filter((pianoKey) => pianoKey.isWhite);
const blackKeys = pianoKeys.filter((pianoKey) => !pianoKey.isWhite);

export function scalePiano(range) {
  let _domain = [firstNoteMidiCode, lastNoteMidiCode];
  let _range = range;
  let _midiCodeKeyMap = {};

  let midiCodeKeyMap = {};

  function computeKeysPositions() {
    const whiteKeysWidth = _range
      ? (_range[1] - _range[0]) / whiteKeys.length
      : 0;

    const blackKeysWidth = whiteKeysWidth / 2;

    whiteKeys.forEach((whiteKey, i) => {
      _midiCodeKeyMap[whiteKey.midiCode] = {
        ...whiteKey,
        x: i * whiteKeysWidth,
        y: 0,
        width: whiteKeysWidth,
      };
    });

    blackKeys.forEach((blackKey, i) => {
      const previousWhiteKeyIndex = whiteKeys.findIndex(
        (key) => key.midiCode === blackKey.midiCode - 1
      );
      _midiCodeKeyMap[blackKey.midiCode] = {
        ...blackKey,
        x:
          previousWhiteKeyIndex * whiteKeysWidth +
          whiteKeysWidth / 2 +
          blackKeysWidth / 2,
        y: 0,
        width: blackKeysWidth,
      };
    });
  }
  computeKeysPositions();

  function scale(midiCode) {
    if (midiCode < 9 || midiCode > 96) {
      console.error(
        `MIDI code ${midiCode} is not a valid piano note. Piano notes should be between A-1(9) and C7(96)`
      );
    }
    return _midiCodeKeyMap[midiCode];
  }

  scale.domain = () => _domain;

  scale.range = (newRange) => {
    if (!newRange) {
      return _range;
    }
    _range = newRange;
    computeKeysPositions();

    return scale;
  };

  scale.pianoKeys = () => Object.values(_midiCodeKeyMap);
  scale.whiteKeys = () =>
    scale.pianoKeys().filter((pianoKey) => pianoKey.isWhite);
  scale.blackKeys = () =>
    scale.pianoKeys().filter((pianoKey) => !pianoKey.isWhite);

  return scale;
}
