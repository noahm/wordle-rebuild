import { useCallback, useEffect } from "react";
import { useRecoilTransaction_UNSTABLE, useSetRecoilState } from "recoil";
import { solution } from "./logic";
import {
  guessedWord,
  wordInProgress,
  rowIndex,
  hardMode,
  lastPlayedTs,
  lastCompletedTs,
  liveRowFeedback,
} from "./state";
import { getStorageKey, setStorageKey } from "./storage";

interface Boot {
  type: "boot";
}

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

type Action = Boot | Guess | AddLetter | DelLetter;

export function useGameDispatch() {
  return useRecoilTransaction_UNSTABLE(({ get, set }) => (action: Action) => {
    const currentInput = get(wordInProgress);
    const idx = get(rowIndex);
    switch (action.type) {
      case "boot":
        const oldState = getStorageKey("gameState");
        if (oldState) {
          if (oldState.solution === solution) {
            if (oldState.boardState) {
              (oldState.boardState as string[]).forEach((word, idx) => {
                set(guessedWord(idx), word);
              });
            }
            set(rowIndex, oldState.rowIndex);
          }
          set(hardMode, !!oldState.hardMode);
          set(lastPlayedTs, oldState.lastPlayedTs);
          set(lastCompletedTs, oldState.lastCompletedTs);
          setStorageKey("gameState", undefined);
        }
        break;
      case "add":
        if (currentInput.length < 5) {
          set(wordInProgress, currentInput + action.letter);
        }
        break;
      case "del":
        if (currentInput.length) {
          set(wordInProgress, currentInput.slice(0, -1));
        }
        break;
      case "guess":
        if (idx < 5) {
          if (currentInput.length !== 5) {
            set(liveRowFeedback, "shake");
            return;
          }
          set(rowIndex, idx + 1);
          set(guessedWord(idx), currentInput);
          set(wordInProgress, "");
        }
        break;
    }
  });
}

export function useClearFeedback() {
  const setFeedback = useSetRecoilState(liveRowFeedback);
  return useCallback(() => {
    setFeedback("idle");
  }, [setFeedback]);
}

export function useGameBoot() {
  const dispatch = useGameDispatch();
  useEffect(() => {
    dispatch({ type: "boot" });
  }, [dispatch]);
}
