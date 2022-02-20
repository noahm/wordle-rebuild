import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { puzzleIndex } from "../lib/logic";
import { takeoverState } from "../lib/state";
import Switch from "./switch";

const Setting = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-tone-4);
  padding: 16px 0;

  @media only screen and (min-device-width: 320px) and (max-device-width: 480px) {
    padding: 16px;
  }
`;
const Label = styled.label`
  padding-right: 8px;
  font-size: 18px;
`;
const Desc = styled.div`
  font-size: 12px;
  color: var(--color-tone-2);
`;
const Footnote = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  color: var(--color-tone-2);
  font-size: 12px;
  text-align: right;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

export default function useShowSettings() {
  const setTakeover = useSetRecoilState(takeoverState);
  return useCallback(() => {
    setTakeover(["settings", Settings]);
  }, [setTakeover]);
}

function Settings() {
  return (
    <>
      <div>
        <section>
          <Setting>
            <Label>
              <div>Hard Mode</div>
              <Desc>
                Any revealed hints must be used in subsequent guesses
                <br />
                Initial guesses cannot be reused in later days
              </Desc>
            </Label>
            <Switch />
          </Setting>
        </section>
      </div>
      <Footnote>
        <div>Pirated 2022. No Rights Deserved.</div>
        <div>#{puzzleIndex}</div>
      </Footnote>
    </>
  );
}
