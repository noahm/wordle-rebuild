import { useCallback, useReducer } from "react";
import { useRecoilValue } from "recoil";
import { usePreviousImmediate } from "rooks";
import styled, { keyframes } from "styled-components";
import { useClearFeedback } from "../lib/actions";
import { evaluation, rowFeedback, wordInRow } from "../lib/state";
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

  &.invalid {
    animation-name: ${Shake};
    animation-duration: 600ms;
  }
  &.win {
    animation-name: ${Bounce};
    animation-duration: 1000ms;
  }
`;

interface Props {
  idx: number;
}

interface State {
  revealed?: number;
  anim: "reveal" | "idle";
}

type Action = "tileRevealed" | "animEnd" | "evalsArrived";

function reducer(s: State, action: Action): State {
  switch (action) {
    case "tileRevealed":
      if (s.revealed === 4) {
        return { anim: "idle", revealed: 5 };
      }
      return { anim: "reveal", revealed: (s.revealed || 0) + 1 };
    case "animEnd":
      return { ...s, anim: "idle" };
    case "evalsArrived":
      return { anim: "reveal", revealed: 0 };
  }
}

function mergeAnim(anim: State["anim"], feedback: "invalid" | "win" | "idle") {
  if (anim === "idle") {
    return feedback;
  }
  return anim;
}

export default function Row(props: Props) {
  const feedback = useRecoilValue(rowFeedback(props.idx));
  const clearFeedback = useClearFeedback();
  const letters = useRecoilValue(wordInRow(props.idx));
  const evals = useRecoilValue(evaluation(props.idx));
  // const isLiveRow = useRecoilValue(isCurrentRow(props.idx));
  const [state, dispatch] = useReducer(reducer, { anim: "idle", revealed: 5 });
  const handleTileReveal = useCallback(() => {
    dispatch("tileRevealed");
  }, []);
  const handleRowAnim = useCallback(
    (e) => {
      if (e.currentTarget === e.target) {
        dispatch("animEnd");
        if (feedback !== "idle") {
          console.log("clearing", { feedback });
          clearFeedback();
        }
      }
    },
    [clearFeedback, feedback]
  );
  const revealIdx = state.revealed || 0;

  const prevEvals = usePreviousImmediate(evals);
  if (!prevEvals && evals && state.anim === "idle") {
    dispatch("evalsArrived");
  }

  return (
    <div>
      <RowDiv
        className={mergeAnim(state.anim, feedback)}
        onAnimationEnd={handleRowAnim}
      >
        {times(5, (i) => (
          <Tile
            key={i.toString() + letters[i]}
            letter={letters[i]}
            reveal={evals && i <= revealIdx}
            evaluation={evals && i <= revealIdx ? evals[i] : undefined}
            onAnimationEnd={handleTileReveal}
          />
        ))}
      </RowDiv>
    </div>
  );
}
