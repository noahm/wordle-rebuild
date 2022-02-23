import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { evaluateWord, Evaluation, puzzleIndex, solution } from "./logic";
import { persistStandalone } from "./storage";
import { squareForEval, times } from "./utils";

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

export const winningGuessCount = selector({
  key: "winningGuessCount",
  get: ({ get }) => {
    const state = get(gameStatus);
    if (state !== "WIN") {
      return 0;
    }
    return get(rowIndex);
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

export const hardMode = atom<boolean>({
  key: "hardMode",
  default: false,
  effects: [persistStandalone],
});

export const lockHardMode = selector({
  key: "lockHardMode",
  get: ({ get }) => {
    const status = get(gameStatus);
    if (status !== "IN_PROGRESS") {
      return true;
    }
    const idx = get(rowIndex);
    return !!idx;
  },
});

export const darkTheme = atom<boolean | undefined>({
  key: "darkTheme",
  default: undefined,
  effects: [persistStandalone],
});

export const displayDarkTheme = selector<boolean>({
  key: "displayDarkTheme",
  get: ({ get }) => {
    const setting = get(darkTheme);
    if (setting !== undefined) {
      return setting;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  },
  set: ({ set }, newValue) => {
    set(darkTheme, newValue);
  },
});

export const colorBlind = atom<boolean>({
  key: "colorBlind",
  default: false,
  effects: [persistStandalone],
});

export const firstWords = atom<string[]>({
  key: "first-words",
  default: [],
  effects: [persistStandalone],
});

export const shareMessage = selector<string>({
  key: "shareMessage",
  get: ({ get }) => {
    const state = get(gameStatus);
    if (state === "IN_PROGRESS") {
      return "";
    }
    const idx = get(rowIndex);
    const evals = get(evaluations);
    const isHardMode = get(hardMode);
    const isDarkTheme = get(displayDarkTheme);
    const isColorBlind = get(colorBlind);
    const getSquare = squareForEval.bind(null, !!isColorBlind, isDarkTheme);

    return evals.reduce((prev, rowEval) => {
      if (!rowEval) {
        return prev;
      }
      return prev.concat("\n", rowEval.map(getSquare).join(""));
    }, `Wordle* ${puzzleIndex} ${state === "WIN" ? idx : "X"}/6${isHardMode ? "*" : ""}\n`);
  },
});
