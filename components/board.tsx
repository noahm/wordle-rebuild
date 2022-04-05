import { useRef, useState } from "react";
import { useWindowEventListener, useFreshTick, useEffectOnceWhen } from "rooks";
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
  gap: 5px;
  padding: 10px;
  box-sizing: border-box;

  &.two-col {
    column-gap: 20px;
    column-count: 2;
    display: block;
    & > div {
      margin-bottom: 5px;
    }
  }
`;

const TWO_COL_THRESHOLD = 170;

export default function Board() {
  const [boardStyle, setBoardStyle] = useState<{
    twoCol: boolean;
    width: number;
  }>({
    width: 350,
    twoCol: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeBoard = useFreshTick(() => {
    if (!containerRef.current) {
      return;
    }
    const availableHeight = containerRef.current.clientHeight;
    let width = 0;
    let twoCol = false;
    if (availableHeight <= TWO_COL_THRESHOLD) {
      twoCol = true;
      width = Math.min(Math.floor(availableHeight * (10 / 3)), 500);
    } else {
      width = Math.min(Math.floor(availableHeight * (5 / 6)), 350);
    }
    if (boardStyle.width !== width || boardStyle.twoCol !== twoCol) {
      setBoardStyle({ width, twoCol });
    }
  });
  useWindowEventListener("resize", sizeBoard);
  useEffectOnceWhen(() => {
    sizeBoard();
  });
  return (
    <BoardContainer ref={containerRef}>
      <TheBoard
        style={{
          width: `${boardStyle.width}px`,
        }}
        className={boardStyle.twoCol ? "two-col" : undefined}
      >
        {times(6, (idx) => (
          <Row key={idx} idx={idx} />
        ))}
      </TheBoard>
    </BoardContainer>
  );
}
