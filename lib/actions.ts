import { useCallback, useEffect } from "react";
import { useRecoilTransaction_UNSTABLE, useSetRecoilState } from "recoil";
import { solution } from "./logic";
import {
  guessedWord,
  wordInProgress,
  hardMode,
  lastPlayedTs,
  lastCompletedTs,
  liveRowFeedback,
} from "./state";
import { getStorageKey, setStorageKey } from "./storage";
import { times } from "./utils";
import { dictionary } from "./words";

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
  return useRecoilTransaction_UNSTABLE(
    ({ get, set, reset }) =>
      (action: Action) => {
        const currentInput = get(wordInProgress);
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
              } else {
                times(6, (idx) => reset(guessedWord(idx)));
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
            } else {
              reset(guessedWord(5));
            }
            break;
          case "guess":
            let idx = 0;
            while (idx < 7) {
              if (!get(guessedWord(idx))) {
                break;
              }
              idx++;
            }
            if (idx < 6) {
              if (currentInput.length !== 5) {
                set(liveRowFeedback, "invalid");
                return;
              }
              if (!dictionary.has(currentInput)) {
                set(liveRowFeedback, "invalid");
                return;
              }
              set(guessedWord(idx), currentInput);
              set(wordInProgress, "");
              if (currentInput === solution) {
                console.log(" setting live row feedback ");
                set(liveRowFeedback, "win");
              }
            }
            break;
        }
      }
  );
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
