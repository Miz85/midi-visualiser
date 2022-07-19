import { Rect, Group, Text } from "react-konva";
export const PianoKeyboard = ({
  x,
  y,
  height,
  pianoScale,
  highlightedNotes,
}) => {
  return (
    <Group x={x} y={y}>
      {pianoScale.whiteKeys().map((whiteKey) => {
        return (
          <Group key={whiteKey.midiCode} x={whiteKey.x} y={0}>
            <Rect
              x={0}
              y={0}
              stroke="black"
              fill={
                highlightedNotes.includes(whiteKey.midiCode)
                  ? "hotpink"
                  : "white"
              }
              width={whiteKey.width}
              height={height}
            ></Rect>
            <Text
              x={0}
              y={height}
              fontSize={9}
              fill={
                highlightedNotes.includes(whiteKey.midiCode) ? "white" : "black"
              }
              text={whiteKey.noteName}
            />
          </Group>
        );
      })}
      {pianoScale.blackKeys().map((blackKey) => {
        return (
          <Group key={blackKey.midiCode} x={blackKey.x} y={0}>
            <Rect
              x={0}
              y={0}
              fill={
                highlightedNotes.includes(blackKey.midiCode)
                  ? "hotpink"
                  : "black"
              }
              height={height / 2}
              width={blackKey.width}
            ></Rect>
          </Group>
        );
      })}
    </Group>
  );
};
