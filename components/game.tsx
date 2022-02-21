import styled from "styled-components";
import Row from "../components/row";
import { useGameBoot } from "../lib/actions";
import { times } from "../lib/utils";
import Header from "./header";
import Keyboard from "./keyboard";

const Root = styled.div`
  width: 100%;
  max-width: var(--game-max-width);
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const BoardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  overflow: hidden;
`;

const Board = styled.div`
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 5px;
  padding: 10px;
  box-sizing: border-box;
`;

export default function Game() {
  useGameBoot();
  return (
    <Root>
      <Header />
      <BoardContainer>
        <Board style={{ width: "350px", height: "420px" }}>
          {times(6, (idx) => (
            <Row key={idx} idx={idx} />
          ))}
        </Board>
      </BoardContainer>
      <Keyboard />
    </Root>
  );
}
