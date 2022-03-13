import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { puzzleIndex, solution } from "./days";
import { evaluateWord, Evaluation } from "./logic";
import { persistStandalone } from "./storage";
import { clockDisplayForSeconds, squareForEval, times } from "./utils";

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
    if (guesses.some((word) => word === get(solution))) {
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

export const guessCount = selector({
  key: "guessCount",
  get: ({ get }) => {
    let idx = get(guessedWords).indexOf("");
    if (idx === -1) {
      idx = 6;
    }
    return idx;
  },
});

export const rowIndex = selector({
  key: "rowIndex",
  get: ({ get }) => {
    let idx = get(guessCount);
    const status = get(gameStatus);
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
      if (!word) {
        return null;
      }
      return evaluateWord(get(solution), word);
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
    return get(guessCount);
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

export const todaysTime = selector({
  key: "todaysTime",
  get: ({ get }) => {
    const state = get(gameStatus);
    if (state === "IN_PROGRESS") {
      return 0;
    }
    const firstPlayed = get(firstPlayedTs);
    const lastPlayed = get(lastPlayedTs);
    return Math.round((lastPlayed - firstPlayed) / 1000);
  },
});

const hardModeStored = atom<boolean>({
  key: "hardMode",
  default: false,
  effects: [persistStandalone],
});

export const hardMode = selector<boolean>({
  key: "hardModeExposed",
  get: ({ get }) => get(hardModeStored),
  set: ({ get, set }, next) => {
    if (!next) {
      const ex = get(extremeModeStored);
      if (ex) {
        set(extremeModeStored, false);
      }
    }
    set(hardModeStored, next);
  },
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

const extremeModeStored = atom<boolean>({
  key: "extremeMode",
  default: false,
  effects: [persistStandalone],
});

export const extremeMode = selector<boolean>({
  key: "extremeModeExposed",
  get: ({ get }) => get(extremeModeStored),
  set: ({ get, set }, next) => {
    if (next) {
      const hard = get(hardModeStored);
      if (!hard) {
        set(hardModeStored, true);
      }
    }
    set(extremeModeStored, next);
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
    const idx = get(guessCount);
    const evals = get(evaluations);
    const isDarkTheme = get(displayDarkTheme);
    const isColorBlind = get(colorBlind);
    const getSquare = squareForEval.bind(null, !!isColorBlind, isDarkTheme);
    const time = clockDisplayForSeconds(get(todaysTime));

    let difficultyMarker = "";
    if (get(hardMode)) {
      difficultyMarker = "*";
      if (get(extremeMode)) {
        difficultyMarker = "⁑";
      }
    }

    return evals.reduce((prev, rowEval) => {
      if (!rowEval) {
        return prev;
      }
      return prev.concat("\n", rowEval.map(getSquare).join(""));
    }, `Wordle* ${get(puzzleIndex)} ${state === "WIN" ? idx : "X"}/6${difficultyMarker} in ${time}\n`);
  },
});
