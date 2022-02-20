import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { modalState } from "../lib/state";
import Tile from "./tile";

const Section = styled.section`
  padding: 16px;
  padding-top: 0px;
`;

const Instructions = styled.div`
  font-size: 14px;
  color: var(--color-tone-1);
`;

const Examples = styled.div`
  border-bottom: 1px solid var(--color-tone-4);
  border-top: 1px solid var(--color-tone-4);
`;

const Example = styled.div`
  margin: 24px 0;
`;

const Row = styled.div`
  & > div {
    width: 40px;
    height: 40px;
  }
`;

export default function useShowHelp() {
  const setModal = useSetRecoilState(modalState);
  return useCallback(() => {
    setModal([Help]);
  }, [setModal]);
}

function Help() {
  return (
    <Section>
      <Instructions>
        <p>
          Guess the <strong>WORDLE</strong> in 6 tries.
        </p>
        <p>
          Each guess must be a valid 5 letter word. Hit the enter button to
          submit.
        </p>
        <p>
          After each guess, the color of the tiles will change to show how close
          your guess was to the word.
        </p>
        <Examples>
          <p>
            <strong>Examples</strong>
          </p>
          <Example>
            <Row>
              <Tile letter="w" evaluation="correct" reveal />{" "}
              <Tile letter="e" /> <Tile letter="a" /> <Tile letter="r" />{" "}
              <Tile letter="y" />
            </Row>
            <p>
              The letter <strong>W</strong> is in the word and in the correct
              spot.
            </p>
          </Example>
          <Example>
            <Row>
              <Tile letter="p" />{" "}
              <Tile letter="i" evaluation="present" reveal />{" "}
              <Tile letter="l" /> <Tile letter="l" /> <Tile letter="s" />
            </Row>
            <p>
              The letter <strong>I</strong> is in the word but in the wrong
              spot.
            </p>
          </Example>
          <Example>
            <Row>
              <Tile letter="v" /> <Tile letter="a" /> <Tile letter="g" />{" "}
              <Tile letter="u" evaluation="absent" reveal /> <Tile letter="e" />
            </Row>
            <p>
              The letter <strong>U</strong> is not in the word in any spot.
            </p>
          </Example>
        </Examples>
        <p>
          <strong>A new WORDLE will be available each day!</strong>
        </p>
      </Instructions>
    </Section>
  );
}
