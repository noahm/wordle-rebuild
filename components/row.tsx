import { useCallback, useReducer } from "react";
import styled, { keyframes } from "styled-components";
import { times } from "../lib/utils";
import Tile from "./tile";

const Bounce = keyframes`
  0%, 20% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  50% {
    transform: translateY(5px);
  }
  60% {
    transform: translateY(-15px);
  }
  80% {
    transform: translateY(2px);
  }
  100% {
    transform: translateY(0);
  }
`;

const Shake = keyframes`
  10%,
  90% {
    transform: translateX(-1px);
  }

  20%,
  80% {
    transform: translateX(2px);
  }

  30%,
  50%,
  70% {
    transform: translateX(-4px);
  }

  40%,
  60% {
    transform: translateX(4px);
  }
`;

const RowDiv = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 5px;

  &.shake {
    animation-name: ${Shake};
    animation-duration: 600ms;
  }
  &.bounce {
    animation-name: ${Bounce};
    animation-duration: 1000ms;
  }
`;

interface Props {
  letters: string;
  length: number;
  win?: boolean;
  invalid?: boolean;
  onAnimEnd?: () => void;
}

interface State {
  revealed?: number;
  anim: "reveal" | "bounce" | "shake" | "idle";
}

type Action = "tileRevealed" | "animEnd";

function reducer(s: State, action: Action): State {
  switch (action) {
    case "tileRevealed":
      if (s.revealed === 4) {
        return { anim: "bounce", revealed: 5 };
      }
      return { anim: "reveal", revealed: (s.revealed || 0) + 1 };
    case "animEnd":
      return { ...s, anim: "idle" };
  }
}

function initialState(p: Props): State {
  if (p.invalid) {
    return { anim: "shake" };
  }
  if (p.win) {
    return { anim: "reveal" };
  }
  return { anim: "idle" };
}

export default function Row(props: Props) {
  const [state, dispatch] = useReducer(reducer, initialState(props));
  const handleTileReveal = useCallback(() => {
    console.log("tile anim end");
    dispatch("tileRevealed");
  }, []);
  const handleRowAnim = useCallback((e) => {
    if (e.currentTarget === e.target) {
      dispatch("animEnd");
      props.onAnimEnd && props.onAnimEnd();
    }
  }, []);
  const revealIdx = state.revealed || 0;
  return (
    <div>
      <RowDiv className={state.anim} onAnimationEnd={handleRowAnim}>
        {times(props.length, (i) => (
          <Tile
            key={i}
            letter={props.letters[i]}
            reveal={props.win && i <= revealIdx}
            evaluation={props.win && i <= revealIdx ? "correct" : undefined}
            onAnimationEnd={handleTileReveal}
          />
        ))}
      </RowDiv>
    </div>
  );
}
