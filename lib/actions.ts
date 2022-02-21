import { useCallback, useEffect } from "react";
import { useRecoilTransaction_UNSTABLE, useSetRecoilState } from "recoil";
import useShowHelp from "../components/help";
import useShowStats from "../components/stats";
import { useShowToast } from "../components/toast";
import { applyLegacyState } from "./legacyState";
import { feedbackForWin, getDayDifference, solution } from "./logic";
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
  const showStats = useShowStats();
  const showToast = useShowToast();

  return useRecoilTransaction_UNSTABLE(
    ({ get, set, reset }) => {
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
                showToast("Not enough letters", 1000);
                return;
              }
              if (!dictionary.has(currentInput)) {
                set(liveRowFeedback, "invalid");
                showToast("Not in word list", 1000);
                return;
              }
              set(guessedWord(idx), currentInput);
              set(wordInProgress, "");
              set(lastPlayedTs, Date.now());
              if (currentInput === solution) {
                set(liveRowFeedback, "win");
                setTimeout(() => showToast(feedbackForWin(idx), 2500), 1500);
                setTimeout(() => showStats(), 4500);
              } else if (idx === 5) {
                setTimeout(() => showToast(solution.toUpperCase(), Infinity));
              }
            }
            break;
        }
      };
    },
    [showHelp]
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
