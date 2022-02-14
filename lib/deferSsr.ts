import { atom, useSetRecoilState } from "recoil";
import { useEffect } from "react";

export const ssrCompletedState = atom({
  key: "ssrCompleted",
  default: false,
});

export function useSsrCompletionState() {
  const setSsrCompleted = useSetRecoilState(ssrCompletedState);
  useEffect(() => setSsrCompleted(true), [setSsrCompleted]);
}
