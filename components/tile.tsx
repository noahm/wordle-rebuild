import { useState } from "react";
import styled, { keyframes } from "styled-components";

const PopIn = keyframes`
from {
  transform: scale(0.8);
  opacity: 0;
}
40% {
  transform: scale(1.1);
  opacity: 1;
}
`;
const FlipIn = keyframes`
0% {
  transform: rotateX(0);
}
100% {
  transform: rotateX(-90deg);
}
`;
const FlipOut = keyframes`
0% {
  transform: rotateX(-90deg);
}
100% {
  transform: rotateX(0);
}
`;

interface DivProps {
  animation: "pop" | "flipin" | "flipout" | "idle";
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
        return `border: 2px solid var(--color-tone-3);
        background-color: var(--color-tone-7);
        color: var(--color-tone-1);`;
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
        return `animation-name: ${PopIn};
        animation-duration: 100ms;`;
      case "flipin":
        return `animation-name: ${FlipIn};
        animation-duration: 250ms;
        animation-timing-function: ease-in;`;
      case "flipout":
        return `animation-name: ${FlipOut};
        animation-duration: 250ms;
        animation-timing-function: ease-in;`;
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
  evaluation?: "correct" | "present" | "absent";
  reveal?: boolean;
  onAnimationEnd?: () => void;
}

export default function Tile(props: Props) {
  const [evalState, setEvalState] = useState<DivProps["state"]>("tbd");
  const [animState, setAnimState] = useState<DivProps["animation"]>(
    props.reveal ? "flipin" : "idle"
  );
  return (
    <Host>
      <TileDiv
        state={evalState}
        animation={animState}
        onAnimationEnd={props.onAnimationEnd}
      >
        {props.letter}
      </TileDiv>
    </Host>
  );
}
