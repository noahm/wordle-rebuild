import { useCallback, MouseEvent } from "react";
import { useRecoilValue } from "recoil";
import { useFreshTick, useWindowEventListener } from "rooks";
import styled from "styled-components";
import { useGameDispatch } from "../lib/actions";
import { keyEvaluations } from "../lib/state";
import Icon from "./icon";

const Root = styled.div`
  height: var(--keyboard-height);
`;

const Container = styled.div`
  margin: 0 8px;
  user-select: none;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  margin: 0 auto 8px;
  /* https://stackoverflow.com/questions/46167604/ios-html-disable-double-tap-to-zoom */
  touch-action: manipulation;
`;

const Button = styled.button`
  font-family: inherit;
  font-weight: bold;
  border: 0;
  padding: 0;
  margin: 0 6px 0 0;
  height: 58px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  background-color: var(--key-bg);
  color: var(--key-text-color);
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.3);

  &:focus {
    outline: none;
  }

  &.fade {
    transition: background-color 0.1s ease, color 0.1s ease;
  }

  &:last-of-type {
    margin: 0;
  }

  &.one {
    flex: 1;
  }

  &.one-and-a-half {
    flex: 1.5;
    font-size: 12px;
  }

  &.two {
    flex: 2;
  }

  &[data-state="correct"] {
    background-color: var(--key-bg-correct);
    color: var(--key-evaluated-text-color);
  }

  &[data-state="present"] {
    background-color: var(--key-bg-present);
    color: var(--key-evaluated-text-color);
  }

  &[data-state="absent"] {
    background-color: var(--key-bg-absent);
    color: var(--key-evaluated-text-color);
  }
`;

const Spacer = styled.div`
  flex: 0.5;
`;

const alphabet = "abcdefghijklmnopqrstuvwxyz";
const layout = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["-", "a", "s", "d", "f", "g", "h", "j", "k", "l", "-"],
  ["↵", "z", "x", "c", "v", "b", "n", "m", "←"],
];

function labelForKey(key: string) {
  if (key === "←") {
    return <Icon icon="backspace" />;
  }
  if (key === "↵") {
    return "enter";
  }
  return key;
}

function classForKey(key: string) {
  if (key === "←" || key === "↵") {
    return "one-and-a-half";
  }
}

export default function Keyboard() {
  const keyEvals = useRecoilValue(keyEvaluations);
  const dispatch = useGameDispatch();
  const respondToKey = useFreshTick((key: string) => {
    if (key === "↵" || key === "enter") {
      dispatch({ type: "guess" });
    } else if (key === "←" || key === "backspace") {
      dispatch({ type: "del" });
    } else if (key.length === 1 && alphabet.includes(key)) {
      dispatch({ type: "add", letter: key });
    }
  });
  const handleVirtKeyPress = useCallback(
    (e: MouseEvent<Element>) => {
      const keyButton = (e.target as Element).closest("button");
      if (keyButton) {
        keyButton.blur();
        respondToKey(keyButton.dataset.key);
      }
    },
    [respondToKey]
  );
  useWindowEventListener("keydown", (e: KeyboardEvent) => {
    if (e.repeat || e.metaKey || e.ctrlKey) {
      return;
    }
    respondToKey(e.key.toLowerCase());
  });

  return (
    <Root>
      <Container onClick={handleVirtKeyPress}>
        {layout.map((row, idx) => (
          <Row key={idx}>
            {row.map((key, jdx) =>
              key === "-" ? (
                <Spacer key={jdx} />
              ) : (
                <Button
                  key={key}
                  data-key={key}
                  data-state={keyEvals.get(key)}
                  className={classForKey(key)}
                >
                  {labelForKey(key)}
                </Button>
              )
            )}
          </Row>
        ))}
      </Container>
    </Root>
  );
}
