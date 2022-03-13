import { useCallback } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import styled, { css } from "styled-components";
import { puzzleIndex } from "../lib/logic";
import {
  colorBlind,
  displayDarkTheme,
  extremeMode,
  hardMode,
  lockHardMode,
} from "../lib/state";
import Switch from "./switch";
import { takeoverState } from "./takeover";
import { useShowToast } from "./toast";

const Setting = styled.div<{ disabled?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-tone-4);
  padding: 16px 0;
  ${(props) =>
    props.disabled
      ? css`
          cursor: not-allowed;
          label {
            cursor: not-allowed;
          }
        `
      : ""}

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
  const hardModeLocked = useRecoilValue(lockHardMode);
  const showToast = useShowToast();
  const handleIllegalHardToggle = useCallback(() => {
    if (hardModeLocked) {
      showToast(
        "Difficulty can only be changed at the start of a round",
        1500,
        "system"
      );
    }
  }, [hardModeLocked, showToast]);
  return (
    <>
      <div>
        <section>
          <Setting disabled={hardModeLocked}>
            <Label htmlFor={hardMode.key}>
              <div>Hard Mode</div>
              <Desc>
                Any revealed hints must be used in subsequent guesses
                <br />
                Initial guesses cannot be reused in later days
              </Desc>
            </Label>
            <Switch
              atom={hardMode}
              disabled={hardModeLocked}
              onChange={handleIllegalHardToggle}
            />
          </Setting>
        </section>
        <section>
          <Setting disabled={hardModeLocked}>
            <Label>
              <div>Extreme Mode</div>
              <Desc>
                Letters revealed in the incorrect place must be moved
                <br />
                Letters revealed as absent cannot be used
              </Desc>
            </Label>
            <Switch
              atom={extremeMode}
              disabled={hardModeLocked}
              onChange={handleIllegalHardToggle}
            />
          </Setting>
        </section>
        <section>
          <Setting>
            <Label htmlFor={displayDarkTheme.key}>
              <div>Dark Theme</div>
            </Label>
            <Switch atom={displayDarkTheme} />
          </Setting>
        </section>
        <section>
          <Setting>
            <Label htmlFor={colorBlind.key}>
              <div>Color Blind Mode</div>
              <Desc>High contrast colors</Desc>
            </Label>
            <Switch atom={colorBlind} />
          </Setting>
        </section>
      </div>
      <Footnote>
        <div>Reforged 2022. No Rights Assumed.</div>
        <div>#{puzzleIndex}</div>
      </Footnote>
    </>
  );
}
