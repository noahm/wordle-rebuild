import { ComponentType, useCallback, useEffect, useReducer } from "react";
import { atom, useRecoilState } from "recoil";
import styled, { keyframes } from "styled-components";
import Icon from "./icon";

export const SlideIn = keyframes`
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0px);
    opacity: 1;
  }`;

export const SlideOut = keyframes`
  0% {
    transform: translateY(0px);
    opacity: 1;
  }
  90% {
    opacity: 0;
  }
  100% {
    opacity: 0;
    transform: translateY(60px);
  }`;

const Overlay = styled.div`
  display: none;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  justify-content: center;
  background-color: var(--color-background);
  animation: ${SlideIn} 100ms linear;
  z-index: 2000;

  &.open {
    display: flex;
  }
  &.closing {
    display: flex;
    animation: ${SlideOut} 150ms linear;
  }
`;
const Content = styled.div`
  position: relative;
  color: var(--color-tone-1);
  padding: 0 32px;
  max-width: var(--game-max-width);
  width: 100%;
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;

  @media only screen and (min-device-width: 320px) and (max-device-width: 480px) {
    max-width: 100%;
    padding: 0;
  }
`;
const Header = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;
const H1 = styled.h1`
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 10px;
`;
const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 4px;
  @media only screen and (min-device-width: 320px) and (max-device-width: 480px) {
    padding: 0 16px;
  }

  position: absolute;
  right: 0;
  user-select: none;
`;
const ContentContainer = styled.div`
  height: 100%;
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

export const takeoverState = atom<[string, ComponentType] | null>({
  key: "takeover",
  default: null,
});

export default function Takeover() {
  const [state, setState] = useRecoilState(takeoverState);
  const [overlayClass, dispatch] = useReducer(reducer, "open");
  const handleAnimationEnd = useCallback(() => {
    dispatch("animationEnd");
  }, []);
  const handleClose = useCallback(() => {
    dispatch("close");
  }, []);
  useEffect(() => {
    if (overlayClass === "closed") {
      setState(null);
      dispatch("reset");
    }
  }, [overlayClass, setState]);
  if (!state || overlayClass === "closed") {
    return null;
  }
  const [title, Contents] = state;
  return (
    <Overlay onAnimationEnd={handleAnimationEnd} className={overlayClass}>
      <Content>
        <Header>
          <H1>{title}</H1>
          <Button onClick={handleClose}>
            <Icon icon="close" />
          </Button>
        </Header>
        <ContentContainer>
          <Contents />
        </ContentContainer>
      </Content>
    </Overlay>
  );
}
