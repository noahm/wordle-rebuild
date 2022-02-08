import styled from "styled-components";
import Row from "../components/row";
import Header from "./header";
import Keyboard from "./keyboard";

`
.toaster {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, 0);
  pointer-events: none;
  width: fit-content;
}
#game-toaster {
  z-index: 1000;
}
#system-toaster {
  z-index: 4000;
}

button.icon {
}

#debug-tools {
  position: absolute;
  bottom: 0;
}
`;

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
  return (
    <Root>
      <Header />
      <BoardContainer>
        <Board style={{ width: "350px", height: "420px" }}>
          <Row letters="" length={5} />
          <Row letters="julie" length={5} />
          <Row letters="  i" length={5} />
          <Row letters="heart" length={5} />
          <Row letters=" you" length={5} />
          <Row letters="" length={5} />
        </Board>
      </BoardContainer>
      <Keyboard />
    </Root>
  );
}
