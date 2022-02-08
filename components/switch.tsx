import { useCallback, useState } from "react";
import styled from "styled-components";

interface Props {
  defaultChecked?: boolean;
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

export default function Switch(props: Props) {
  const [checked, setChecked] = useState(!!props.defaultChecked);
  const handleClick = useCallback(() => {
    props.onChange && props.onChange(!checked);
    setChecked((prev) => !prev);
  }, []);
  return (
    <Container>
      <Control
        disabled={!!props.disabled}
        checked={checked}
        onClick={handleClick}
      >
        <Knob checked={checked} />
      </Control>
    </Container>
  );
}
