import { useCallback, useEffect } from "react";
import { useRecoilTransaction_UNSTABLE, useSetRecoilState } from "recoil";
import useShowHelp from "../components/help";
import { applyLegacyState } from "./legacyState";
import { getDayDifference, solution } from "./logic";
import {
  guessedWord,
  wordInProgress,
  liveRowFeedback,
  lastPlayedTs,
} from "./state";
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
  const showHelp = useShowHelp();
  return useRecoilTransaction_UNSTABLE(({ get, set, reset }) => {
    function resetOldGuesses() {
      times(6, (idx) => reset(guessedWord(idx)));
    }
    return (action: Action) => {
      const currentInput = get(wordInProgress);
      switch (action.type) {
        case "boot":
          if (applyLegacyState(set, resetOldGuesses)) {
            return;
          }
          const lastPlayed = get(lastPlayedTs);

          if (lastPlayed) {
            if (getDayDifference(new Date(lastPlayed), new Date()) >= 1) {
              // current state is from previous day, must reset
              resetOldGuesses();
            }
          } else {
            setTimeout(showHelp, 100);
            resetOldGuesses();
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
            set(lastPlayedTs, Date.now());
            if (currentInput === solution) {
              console.log(" setting live row feedback ");
              set(liveRowFeedback, "win");
            }
          }
          break;
      }
    };
  }, []);
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
