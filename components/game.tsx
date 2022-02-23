import styled from "styled-components";
import { useGameBoot } from "../lib/actions";
import Board from "./board";
import Header from "./header";
import Keyboard from "./keyboard";
import ThemeManager from "./theme-manager";

const Root = styled.div`
  width: 100%;
  max-width: var(--game-max-width);
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export default function Game() {
  useGameBoot();
  return (
    <Root>
      <ThemeManager />
      <Header />
      <Board />
      <Keyboard />
    </Root>
  );
}
