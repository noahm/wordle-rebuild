import { dictionary, wotd } from "./words";

export type Evaluation = "correct" | "present" | "absent";

export function evaluateWord(target: string, guess: string) {
  if (!dictionary.has(guess)) {
    return false; // invalid guess
  }
  let ret: Evaluation[] = [];
  for (let idx = 0; idx < 5; idx++) {
    const gl = guess[idx];
    if (target[idx] === gl) {
      ret.push("correct");
    } else if (target.includes(gl)) {
      ret.push("present");
    } else {
      ret.push("absent");
    }
  }
  return ret;
}

const firstDay = new Date(2021, 5, 19, 0, 0, 0, 0);

function zeroHrs(d: Date) {
  return new Date(d).setHours(0, 0, 0, 0);
}

export function getDayDifference(a: Date, b: Date) {
  return Math.round((zeroHrs(b) - zeroHrs(a)) / 864e5);
}

function getPuzzleIndexForDate(d: Date) {
  return getDayDifference(firstDay, d);
}

function getSolutionForPuzzleNumber(num: number) {
  const idx = num % wotd.length;
  return wotd[idx];
}

export const puzzleIndex = getPuzzleIndexForDate(new Date());
export const solution = getSolutionForPuzzleNumber(puzzleIndex);

const feedback = [
  "Lucker Dog",
  "Magnificent",
  "Impressive",
  "Splendid",
  "Great",
  "Phew",
];

export function feedbackForWin(rowIndex: number) {
  return feedback[rowIndex];
}
