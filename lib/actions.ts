import { useCallback, useEffect } from "react";
import { ResetRecoilState, useRecoilCallback, useSetRecoilState } from "recoil";
import useShowHelp from "../components/help";
import useShowStats from "../components/stats";
import { useShowToast } from "../components/toast";
import { feedbackForWin, getErrorForGuess } from "./logic";
import { getDayDifference, solution } from "./days";
import {
  guessedWord,
  wordInProgress,
  liveRowFeedback,
  lastPlayedTs,
  gameStatus,
  rowIndex,
  shareMessage,
  hardMode,
  firstWords,
  firstPlayedTs,
} from "./state";
import { updateStats } from "./stats";
import { shareText, times } from "./utils";

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

interface Share {
  type: "share";
}

type Action = Boot | Guess | AddLetter | DelLetter | Share;

function resetStaleState(reset: ResetRecoilState) {
  times(6, (idx) => reset(guessedWord(idx)));
  reset(firstPlayedTs);
}

export function useGameDispatch() {
  const showHelp = useShowHelp();
  const showStats = useShowStats();
  const showToast = useShowToast();

  return useRecoilCallback(
    ({ snapshot, set: queueSet, transact_UNSTABLE }) => {
      return async (action: Action) => {
        const currentInput = await snapshot.getPromise(wordInProgress);
        const state = await snapshot.getPromise(gameStatus);
        switch (action.type) {
          case "boot":
            transact_UNSTABLE(({ get, reset }) => {
              const lastPlayed = get(lastPlayedTs);

              if (lastPlayed) {
                if (getDayDifference(new Date(lastPlayed), new Date()) >= 1) {
                  // current state is from previous day, must reset
                  resetStaleState(reset);
                } else if (state !== "IN_PROGRESS") {
                  setTimeout(showStats, 100);
                }
              } else {
                setTimeout(showHelp, 100);
                resetStaleState(reset);
              }
            });

            break;
          case "add":
            if (state === "IN_PROGRESS" && currentInput.length < 5) {
              queueSet(wordInProgress, currentInput + action.letter);
            }
            break;
          case "del":
            if (state === "IN_PROGRESS" && currentInput.length) {
              queueSet(wordInProgress, currentInput.slice(0, -1));
            }
            break;
          case "guess":
            const feedback = await getErrorForGuess(snapshot);
            if (feedback) {
              queueSet(liveRowFeedback, "invalid");
              showToast(feedback, 1000);
              return;
            }
            const idx = await snapshot.getPromise(rowIndex);
            const now = Date.now();
            const isHardMode = await snapshot.getPromise(hardMode);
            const todaysSolution = await snapshot.getPromise(solution);
            transact_UNSTABLE((tx) => {
              const { set } = tx;
              if (idx === 0) {
                set(firstPlayedTs, now);
                if (isHardMode) {
                  set(firstWords, (previous) => [...previous, currentInput]);
                }
              }
              set(guessedWord(idx), currentInput);
              set(wordInProgress, "");
              set(lastPlayedTs, now);
              const isWin = currentInput === todaysSolution;
              const numGuesses = idx + 1;
              if (isWin) {
                set(liveRowFeedback, "win");
                setTimeout(() => showToast(feedbackForWin(idx), 2500), 1500);
                setTimeout(() => showStats(), 4000);
                updateStats({ isWin, numGuesses }, tx);
              } else if (idx === 5) {
                setTimeout(() =>
                  showToast(todaysSolution.toUpperCase(), Infinity)
                );
                updateStats({ isWin, numGuesses }, tx);
              }
            });

            break;
          case "share":
            const text = await snapshot.getPromise(shareMessage);
            try {
              await shareText(text);
              showToast("Copied results to clipboard", 2000, "system");
            } catch {
              showToast("Share failed", 2000, "system");
            }
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
