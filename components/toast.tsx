import { useCallback, useEffect } from "react";
import { atom, useRecoilState, useSetRecoilState } from "recoil";
import styled from "styled-components";

const ToastHost = styled.div`
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, 0);
  pointer-events: none;
  width: fit-content;
  &.game {
    z-index: 1000;
  }
  &.system {
    z-index: 4000;
  }
`;

const Toast = styled.div`
  position: relative;
  margin: 16px;
  background-color: var(--color-tone-1);
  color: var(--color-tone-7);
  padding: 16px;
  border: none;
  border-radius: 4px;
  opacity: 1;
  transition: opacity 300ms cubic-bezier(0.645, 0.045, 0.355, 1);
  font-weight: 700;

  &.win {
    background-color: var(--color-correct);
    color: var(--tile-text-color);
  }

  &.fade {
    opacity: 0;
  }
`;

type ToastType = "system" | "game";

const toastContents = atom<[string, number, ToastType, boolean] | null>({
  key: "toastState",
  default: null,
});

export function useShowToast() {
  const setToastContents = useSetRecoilState(toastContents);
  return (
    contents: string,
    persistDuration: number,
    type: ToastType = "game"
  ) => {
    setToastContents([contents, persistDuration, type, false]);
  };
}

export default function ToastRoot() {
  const [contents, setContents] = useRecoilState(toastContents);

  const clearToast = useCallback(() => {
    setContents(null);
  }, [setContents]);
  const [text, , type, remove] = contents || [];

  useEffect(() => {
    if (contents && contents[1] && isFinite(contents[1]) && !contents[3]) {
      const newContents: typeof contents = [...contents];
      newContents[3] = true;
      const handle = setTimeout(() => setContents(newContents), contents[1]);
      return () => clearTimeout(handle);
    }
  }, [clearToast, contents, setContents]);

  if (!type || !text) {
    return null;
  }

  return (
    <ToastHost className={type}>
      <Toast
        key={text}
        onTransitionEnd={clearToast}
        className={remove ? "fade" : ""}
      >
        {text}
      </Toast>
    </ToastHost>
  );
}
