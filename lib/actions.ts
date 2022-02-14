import { useRecoilTransaction_UNSTABLE } from "recoil";
import { boardState, rowIndex } from "./state";

interface Guess {
  type: "guess";
}

interface AddLetter {
  type: "add";
  letter: string;
}

interface DelLetter {
  type: "del";
}

type Action = Guess | AddLetter | DelLetter;

export function useGameDispatch() {
  return useRecoilTransaction_UNSTABLE(({ get, set }) => (action: Action) => {
    const state = get(boardState).slice();
    const idx = get(rowIndex);
    const currentInput = state[idx] || "";
    switch (action.type) {
      case "add":
        if (currentInput.length < 5) {
          state[idx] = currentInput + action.letter;
          set(boardState, state);
        }
        break;
      case "del":
        if (currentInput.length) {
          state[idx] = currentInput.slice(0, -1);
          set(boardState, state);
        }
        break;
      case "guess":
        if (idx < 5) {
          set(rowIndex, idx + 1);
        }
        break;
    }
  });
}
