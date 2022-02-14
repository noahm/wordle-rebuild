import { atom, selector } from "recoil";
import { evaluateWord, Evaluation, solution } from "./logic";
import { persistAsSubkeyOf, persistStandalone } from "./storage";

export const boardState = atom<string[]>({
  key: "boardState",
  default: [],
  effects: [persistAsSubkeyOf("gameState")],
});

export const rowIndex = atom<number>({
  key: "rowIndex",
  default: 0,
  effects: [persistAsSubkeyOf("gameState")],
});

export const evaluations = selector({
  key: "evaluations",
  get: ({ get }) => {
    const board = get(boardState);
    const currentIndex = get(rowIndex);
    let ret: Evaluation[][] = [];
    let i = 0;
    while (i < currentIndex) {
      const evals = evaluateWord(solution, board[i]);
      ret.push(evals || []);
      i++;
    }
    return ret;
  },
});

export const firstPlayedTs = atom<number>({
  key: "firstPlayedTs",
  default: 0,
  effects: [persistAsSubkeyOf("gameState")],
});
export const lastPlayedTs = atom<number>({
  key: "lastPlayedTs",
  default: 0,
  effects: [persistAsSubkeyOf("gameState")],
});
export const lastCompletedTs = atom<number>({
  key: "lastCompletedTs",
  default: 0,
  effects: [persistAsSubkeyOf("gameState")],
});

type GAME_STATUS = "IN_PROGRESS" | "WIN" | "FAIL";
export const gameStatus = atom<GAME_STATUS>({
  key: "gameStatus",
  default: "IN_PROGRESS",
  effects: [persistAsSubkeyOf("gameState")],
});

export const hardMode = atom<boolean>({
  key: "hardMode",
  default: false,
  effects: [persistAsSubkeyOf("gameState")],
});

// export const darkTheme = atom<boolean>({
//   key: "darkTheme",
//   default: window.matchMedia("(prefers-color-scheme: dark)").matches,
//   effects: [persistStandalone],
// });

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
    return Math.round((100 * get(gamesWon)) / get(gamesPlayed));
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
