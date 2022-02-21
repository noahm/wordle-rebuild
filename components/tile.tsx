import { useCallback, useEffect, useState } from "react";
import { usePreviousImmediate } from "rooks";
import styled, { keyframes, css } from "styled-components";
import { Evaluation } from "../lib/logic";

const PopIn = keyframes`
from {
  transform: scale(0.8);
  opacity: 0;
}
40% {
  transform: scale(1.1);
  opacity: 1;
}`;

const FlipIn = keyframes`
0% {
  transform: rotateX(0);
}
100% {
  transform: rotateX(-90deg);
}`;

const FlipOut = keyframes`
0% {
  transform: rotateX(-90deg);
}
100% {
  transform: rotateX(0);
}`;

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

interface DivProps {
  animation: "pop" | "flipin" | "flipout" | "bounce" | "idle";
  state: "empty" | "tbd" | "correct" | "present" | "absent";
}

const Host = styled.div`
  display: inline-block;
`;
const TileDiv = styled.div<DivProps>`
  width: 100%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  line-height: 2rem;
  font-weight: bold;
  vertical-align: middle;
  box-sizing: border-box;
  color: var(--tile-text-color);
  text-transform: uppercase;
  user-select: none;

  ${(props) => {
    switch (props.state) {
      case "empty":
        return "border: 2px solid var(--color-tone-4);";
      case "tbd":
        return css`
          border: 2px solid var(--color-tone-3);
          background-color: var(--color-tone-7);
          color: var(--color-tone-1);
        `;
      case "correct":
        return "background-color: var(--color-correct);";
      case "present":
        return "background-color: var(--color-present);";
      case "absent":
        return "background-color: var(--color-absent);";
    }
  }}

  ${(props) => {
    switch (props.animation) {
      case "pop":
        return css`
          animation-name: ${PopIn};
          animation-duration: 100ms;
        `;
      case "flipin":
        return css`
          animation-name: ${FlipIn};
          animation-duration: 250ms;
          animation-timing-function: ease-in;
        `;
      case "flipout":
        return css`
          animation-name: ${FlipOut};
          animation-duration: 250ms;
          animation-timing-function: ease-in;
        `;
      case "bounce":
        return css`
          animation-name: ${Bounce};
          animation-duration: 1000ms;
        `;
      default:
        return "";
    }
  }}

  &::before {
    content: "";
    display: inline-block;
    padding-bottom: 100%;
  }

  /* Allow tiles to be smaller on small screens */
  @media (max-height: 600px) {
    font-size: 1em;
    line-height: 1em;
  }
`;

interface Props {
  letter?: string;
  evaluation?: Evaluation;
  reveal?: boolean;
  bounceWithDelay?: number;
  onAnimationEnd?: () => void;
}

export default function Tile({
  evaluation,
  letter,
  onAnimationEnd,
  bounceWithDelay,
  reveal,
}: Props) {
  let evalState: DivProps["state"] = "tbd";
  let initialAnim: DivProps["animation"] = "idle";
  if (evaluation) {
    evalState = evaluation;
    if (reveal) {
      initialAnim = "flipin";
    }
  } else {
    if (letter) {
      initialAnim = "pop";
    } else {
      evalState = "empty";
    }
  }
  const [anim, setAnim] = useState<DivProps["animation"]>(initialAnim);
  const handleAnimEnd = useCallback(() => {
    switch (anim) {
      case "flipout":
      case "pop":
      case "bounce":
        setAnim("idle");
        break;
      case "idle":
        if (!reveal) break;
      case "flipin":
        setAnim("flipout");
        onAnimationEnd && onAnimationEnd();
        break;
    }
  }, [anim, reveal, onAnimationEnd]);
  const prevReveal = usePreviousImmediate(reveal);
  if (!prevReveal && reveal && anim === "idle") {
    setAnim("flipin");
  }
  useEffect(() => {
    if (bounceWithDelay !== undefined) {
      setAnim("bounce");
    }
  }, [bounceWithDelay]);

  return (
    <Host>
      <TileDiv
        style={{ animationDelay: `${bounceWithDelay}ms` }}
        state={anim === "flipin" ? "tbd" : evalState}
        animation={anim}
        onAnimationEnd={handleAnimEnd}
      >
        {letter}
      </TileDiv>
    </Host>
  );
}
