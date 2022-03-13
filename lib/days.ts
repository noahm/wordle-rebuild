import { atom, selector } from "recoil";
import { wotd } from "./words";

const firstDay = new Date(2021, 5, 19, 0, 0, 0, 0);
export const today = atom({
  key: "today",
  default: new Date(),
});

function timeAtMidnight(d: Date) {
  return new Date(d).setHours(0, 0, 0, 0);
}

export function getDayDifference(a: Date, b: Date) {
  return Math.round((timeAtMidnight(b) - timeAtMidnight(a)) / 864e5);
}

export const nextWordleDate = selector({
  key: "nextWordleDate",
  get: ({ get }) => {
    const ret = new Date(get(today));
    ret.setDate(ret.getDate() + 1);
    ret.setHours(0, 0, 0, 0);
    return ret;
  },
});

export const puzzleIndex = selector({
  key: "puzzleIndex",
  get: ({ get }) => getDayDifference(firstDay, get(today)),
});

export const solution = selector({
  key: "solution",
  get: ({ get }) => {
    const dayIndex = get(puzzleIndex);
    const idx = dayIndex % wotd.length;
    return wotd[idx];
  },
});
