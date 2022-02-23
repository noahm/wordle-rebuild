import { CSSProperties, useEffect, useRef, useState } from "react";
import { useWindowEventListener, useFreshTick } from "rooks";
import styled from "styled-components";
import { times } from "../lib/utils";
import Row from "./row";

const BoardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  overflow: hidden;
`;

const TheBoard = styled.div`
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 5px;
  padding: 10px;
  box-sizing: border-box;
`;

export default function Board() {
  const [boardStyle, setBoardStyle] = useState<CSSProperties>({
    width: "350px",
    height: "420px",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeBoard = useFreshTick(() => {
    if (!containerRef.current) {
      return;
    }
    const rowWidth = Math.min(
      Math.floor(containerRef.current.clientHeight * (5 / 6)),
      350
    );
    const width = `${rowWidth}px`;
    const height = `${6 * Math.floor(rowWidth / 5)}px`;
    if (boardStyle.height !== height || boardStyle.width !== width) {
      setBoardStyle({ height, width });
    }
  });
  useWindowEventListener("resize", sizeBoard);
  useEffect(() => {
    sizeBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <BoardContainer ref={containerRef}>
      <TheBoard style={boardStyle}>
        {times(6, (idx) => (
          <Row key={idx} idx={idx} />
        ))}
      </TheBoard>
    </BoardContainer>
  );
}
