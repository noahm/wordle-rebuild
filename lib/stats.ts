import { atom, selector, TransactionInterface_UNSTABLE } from "recoil";
import { getDayDifference } from "./logic";
import { persistAsSubkeyOf, persistStandalone } from "./storage";

export const lastCompletedTs = atom<number>({
  key: "lastCompletedTs",
  default: 0,
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

interface Input {
  isWin: boolean;
  numGuesses: number;
}

export function updateStats(
  { isWin, numGuesses }: Input,
  { get, set }: TransactionInterface_UNSTABLE
) {
  const isStreak =
    getDayDifference(new Date(get(lastCompletedTs)), new Date()) === 1;
  set(lastCompletedTs, Date.now());
  set(guesses, (prev) => {
    const next = { ...prev };
    if (isWin) {
      next[numGuesses as 1] += 1;
    } else {
      next.fail += 1;
    }
    return next;
  });
  let streak = get(currentStreak);
  if (isStreak) {
    streak += 1;
  }
  set(currentStreak, streak);
  set(maxStreak, (lastMax) => Math.max(lastMax, streak));
}
