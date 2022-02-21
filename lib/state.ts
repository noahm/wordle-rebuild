import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { evaluateWord, Evaluation, solution } from "./logic";
import { persistAsSubkeyOf, persistStandalone } from "./storage";
import { times } from "./utils";

/**
 * The one central source of truth about the game state beyond the current date.
 * All other aspects of board state are selectors against these words.
 */
export const guessedWord = atomFamily<string, number>({
  key: "boardState",
  default: "",
  effects: [persistStandalone],
});

export const wordInProgress = atom<string>({
  key: "wordInProgress",
  default: "",
});

type GAME_STATUS = "IN_PROGRESS" | "WIN" | "FAIL";
export const gameStatus = selector<GAME_STATUS>({
  key: "gameStatus",
  get: ({ get }) => {
    const guesses = get(guessedWords);
    if (guesses.some((word) => word === solution)) {
      return "WIN";
    }
    if (guesses[5]) {
      return "FAIL";
    }
    return "IN_PROGRESS";
  },
});

export const wordInRow = selectorFamily<string, number>({
  key: "wordInRow",
  get:
    (idx) =>
    ({ get }) => {
      const currentRow = get(rowIndex);
      const gameState = get(gameStatus);
      if (currentRow === idx && gameState === "IN_PROGRESS") {
        return get(wordInProgress);
      }
      return get(guessedWord(idx));
    },
});

export const guessedWords = selector({
  key: "guessedWords",
  get: ({ get }) => times(6, (idx) => get(guessedWord(idx))),
});

export const rowIndex = selector<number>({
  key: "rowIndex",
  get: ({ get }) => {
    let idx = get(guessedWords).indexOf("");
    const status = get(gameStatus);
    console.log(status);
    if (idx === -1) {
      idx = 6;
    }
    if (status === "WIN") {
      idx -= 1;
    }
    return idx;
  },
});

export const isCurrentRow = selectorFamily({
  key: "isCurrentRow",
  get:
    (idx: number) =>
    ({ get }) =>
      idx === get(rowIndex),
});

export const evaluation = selectorFamily({
  key: "evaluation",
  get:
    (idx: number) =>
    ({ get }) => {
      const word = get(guessedWord(idx));
      return evaluateWord(solution, word);
    },
});

export const liveRowFeedback = atom<"invalid" | "win" | "idle">({
  key: "liveRowFeedback",
  default: "idle",
});

export const rowFeedback = selectorFamily({
  key: "rowFeedback",
  get:
    (idx: number) =>
    ({ get }) => {
      const liveRow = get(rowIndex);
      if (idx === liveRow) {
        return get(liveRowFeedback);
      }
      return "idle";
    },
});

export const evaluations = selector({
  key: "evaluations",
  get: ({ get }) => times(6, (idx) => get(evaluation(idx))),
});

export const keyEvaluations = selector({
  key: "keyEvaluations",
  get: ({ get }) => {
    const guesses = get(guessedWords);
    const evals = get(evaluations);
    const ret = new Map<string, Evaluation>();
    guesses.forEach((word, wordIndex) => {
      const wordEval = evals[wordIndex];
      for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
        if (!wordEval) {
          continue;
        }
        const letter = word[letterIndex];
        const letterEval = wordEval[letterIndex];
        const previousEval = ret.get(letter);
        if (previousEval !== "correct") {
          ret.set(letter, letterEval);
        }
      }
    });
    return ret;
  },
});

export const firstPlayedTs = atom<number>({
  key: "firstPlayedTs",
  default: 0,
  effects: [persistStandalone],
});
export const lastPlayedTs = atom<number>({
  key: "lastPlayedTs",
  default: 0,
  effects: [persistStandalone],
});
export const lastCompletedTs = atom<number>({
  key: "lastCompletedTs",
  default: 0,
  effects: [persistStandalone],
});

export const hardMode = atom<boolean>({
  key: "hardMode",
  default: false,
  effects: [persistStandalone],
});

export const darkTheme = atom<boolean | undefined>({
  key: "darkTheme",
  default: undefined,
  effects: [persistStandalone],
});

export const firstWords = atom<string[]>({
  key: "first-words",
  default: [],
  effects: [persistStandalone],
});

export const currentStreak = atom<number>({
  key: "currentStreak",
  default: 0,
  effects: [persistAsSubkeyOf("statistics")],
});
export const maxStreak = atom<number>({
  key: "maxStreak",
  default: 0,
  effects: [persistAsSubkeyOf("statistics")],
});

export interface Guesses {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  fail: number;
}
export const guesses = atom<Guesses>({
  key: "guesses",
  default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0 },
  effects: [persistAsSubkeyOf("statistics")],
});

export const gamesPlayed = selector({
  key: "gamesPlayed",
  get: ({ get }) => {
    const guess = get(guesses);
    return (
      guess[1] +
      guess[2] +
      guess[3] +
      guess[4] +
      guess[5] +
      guess[6] +
      guess.fail
    );
  },
});

export const gamesWon = selector({
  key: "gamesWon",
  get: ({ get }) => {
    const failed = get(guesses).fail;
    const played = get(gamesPlayed);
    return played - failed;
  },
});

export const winPercentage = selector({
  key: "winPercentage",
  get: ({ get }) => {
    const played = get(gamesPlayed);
    if (!played) {
      return 0;
    }
    return Math.round((100 * get(gamesWon)) / played);
  },
});

export const averageGuesses = selector({
  key: "averageGuesses",
  get: ({ get }) => {
    const guess = get(guesses);
    const totalGuesses = Object.entries(guess).reduce((total, [key, val]) => {
      if (key === "fail") {
        return total;
      }
      return total + val * +key;
    }, 0);
    return Math.round(totalGuesses / get(gamesWon));
  },
});
