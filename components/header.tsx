import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { modalState, takeoverState } from "../lib/state";
import Icon from "./icon";
import Settings from "./settings";
import Stats from "./stats";

const Root = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
  color: var(--color-tone-1);
  border-bottom: 1px solid var(--color-tone-4);
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 36px;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;

  @media (max-width: 360px) {
    font-size: 22px;
    letter-spacing: 0.1rem;
  }
`;

const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 4px;
`;

export default function Header() {
  const setTakeover = useSetRecoilState(takeoverState);
  const setModal = useSetRecoilState(modalState);
  const openSettings = useCallback(() => {
    setTakeover(["settings", Settings]);
  }, [setTakeover]);
  const openStats = useCallback(() => {
    setModal([Stats]);
  }, [setModal]);
  return (
    <Root>
      <div>
        <Button>
          <Icon icon="help" />
        </Button>
      </div>
      <Title> WORDLE* </Title>
      <div>
        <Button onClick={openStats}>
          <Icon icon="statistics" />
        </Button>{" "}
        <Button onClick={openSettings}>
          <Icon icon="settings" />
        </Button>
      </div>
    </Root>
  );
}
