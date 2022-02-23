import { useCallback } from "react";
import { RecoilState, useRecoilState } from "recoil";
import styled from "styled-components";

interface Props {
  atom: RecoilState<boolean>;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Control = styled.div<{ checked: boolean; disabled: boolean }>`
  height: 20px;
  width: 32px;
  /* not quite right */
  background: var(--color-tone-3);
  border-radius: 999px;
  display: block;
  position: relative;
  ${(props) => (props.checked ? "background: var(--color-correct);" : "")}
  ${(props) => (props.disabled ? "opacity: 0.5;" : "")}
`;

const Knob = styled.span<{ checked: boolean }>`
  display: block;
  position: absolute;
  left: 2px;
  top: 2px;
  height: calc(100% - 4px);
  width: 50%;
  border-radius: 8px;
  background: var(--white);
  transform: translateX(0);
  transition: transform 0.3s;
  ${(props) =>
    props.checked ? "transform: translateX(calc(100% - 4px));" : ""}
`;

export default function Switch({ atom, disabled, onChange }: Props) {
  const [checked, setChecked] = useRecoilState(atom);
  const handleClick = useCallback(() => {
    if (disabled) {
      onChange && onChange(checked);
      return;
    }
    onChange && onChange(!checked);
    setChecked((prev) => !prev);
  }, [checked, disabled, onChange, setChecked]);
  return (
    <Container>
      <Control disabled={!!disabled} checked={checked} onClick={handleClick}>
        <Knob checked={checked} />
      </Control>
    </Container>
  );
}
