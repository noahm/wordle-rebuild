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
}

export default function Row(props: Props) {
  let anim = "";
  if (props.invalid) {
    anim = "shake";
  }
  if (props.win) {
    anim = "bounce";
  }
  return (
    <div>
      <RowDiv className={anim}>
        {times(props.length, (i) => (
          <Tile key={i} letter={props.letters[i]} />
        ))}
      </RowDiv>
    </div>
  );
}
