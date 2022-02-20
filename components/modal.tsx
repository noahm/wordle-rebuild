import { MouseEvent, useCallback, useEffect, useReducer } from "react";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { modalState } from "../lib/state";
import Icon from "./icon";
import { SlideIn, SlideOut } from "./takeover";

const Overlay = styled.div`
  display: none;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  justify-content: center;
  align-items: center;
  background-color: var(--opacity-50);
  z-index: 3000;

  &.open,
  &.closing {
    display: flex;
  }
`;
const Content = styled.div`
  position: relative;
  border-radius: 8px;
  border: 1px solid var(--color-tone-6);
  background-color: var(--modal-content-bg);
  color: var(--color-tone-1);
  box-shadow: 0 4px 23px 0 rgba(0, 0, 0, 0.2);
  max-height: 90%;
  width: 90%;
  max-width: var(--game-max-width);
  overflow-y: auto;
  animation: ${SlideIn} 200ms;
  padding: 16px;
  box-sizing: border-box;

  &.closing {
    animation: ${SlideOut} 200ms linear;
  }

  @media only screen and (min-device-width: 320px) and (max-device-width: 480px) {
    max-width: 100%;
    padding: 0;
  }
`;
const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;

  position: absolute;
  right: 16px;
  top: 16px;
  user-select: none;
`;

type State = "open" | "closing" | "closed";
type Action = "close" | "animationEnd" | "reset";

function reducer(s: State, a: Action): State {
  switch (a) {
    case "animationEnd":
      if (s === "closing") {
        return "closed";
      }
      break;
    case "close":
      if (s !== "closed") {
        return "closing";
      }
      break;
    case "reset":
      return "open";
  }
  return s;
}

export default function Modal() {
  const [state, setState] = useRecoilState(modalState);
  const [animClass, dispatch] = useReducer(reducer, "open");
  const handleAnimationEnd = useCallback(() => {
    dispatch("animationEnd");
  }, []);
  const handleClose = useCallback(() => {
    dispatch("close");
  }, []);
  const handleOverlayClick = useCallback((e: MouseEvent<HTMLElement>) => {
    if (e.target === e.currentTarget) {
      dispatch("close");
    }
  }, []);
  useEffect(() => {
    if (animClass === "closed") {
      setState(null);
      dispatch("reset");
    }
  }, [animClass, setState]);
  if (!state || animClass === "closed") {
    return null;
  }
  const [Contents] = state;
  return (
    <Overlay className={animClass} onClick={handleOverlayClick}>
      <Content onAnimationEnd={handleAnimationEnd} className={animClass}>
        <Button onClick={handleClose}>
          <Icon icon="close" />
        </Button>
        <Contents />
      </Content>
    </Overlay>
  );
}
