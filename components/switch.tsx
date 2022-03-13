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

const Control = styled.input.attrs((props) => ({
  type: "checkbox",
  // weird hack due to styled components not updating DOM checked attribute
  "data-checked": props.checked ? "true" : undefined,
}))`
  height: 20px;
  width: 32px;
  /* not quite right */
  background: var(--color-tone-3);
  border-radius: 999px;
  display: block;
  position: relative;
  appearance: unset;

  &::before {
    content: "";
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
  }
  &[data-checked] {
    background: var(--color-correct);
  }
  &[data-checked]::before {
    transform: translateX(calc(100% - 4px));
  }
  &[disabled] {
    opacity: 0.5;
    pointer-events: none;
  }
`;

export default function Switch({ atom, disabled, onChange }: Props) {
  const [checked, setChecked] = useRecoilState(atom);
  const handleClick = useCallback(() => {
    if (disabled) {
      onChange && onChange(checked);
      return;
    }
  }, [checked, disabled, onChange]);
  const handleChange = useCallback(() => {
    setChecked((prev) => {
      console.log("flipping to ", !prev);
      return !prev;
    });
    onChange && onChange(!checked);
  }, [setChecked, onChange, checked]);
  return (
    <Container onClickCapture={handleClick}>
      <Control
        name={atom.key}
        disabled={!!disabled}
        checked={checked}
        onChange={handleChange}
      />
    </Container>
  );
}
