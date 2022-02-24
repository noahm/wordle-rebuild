import type { Snapshot } from "recoil";
import {
  evaluations,
  firstWords,
  guessedWords,
  hardMode,
  rowIndex,
  wordInProgress,
} from "./state";
import { CountingSet } from "./utils/counting-set";
import { dictionary, wotd } from "./words";

export type Evaluation = "correct" | "present" | "absent";

export function evaluateWord(target: string, guess: string) {
  if (!dictionary.has(guess)) {
    return null; // invalid guess
  }
  let ret: Evaluation[] = [];
  const availableCluesPerLetter = new CountingSet(target.split(""));
  // must make two passes, correct letters first
  for (let idx = 0; idx < 5; idx++) {
    const guessLetter = guess[idx];
    if (target[idx] === guessLetter) {
      availableCluesPerLetter.sub(guessLetter);
      ret[idx] = "correct";
    }
  }
  // then remaining letters
  for (let idx = 0; idx < 5; idx++) {
    if (ret[idx]) {
      continue;
    }
    const guessLetter = guess[idx];
    if (availableCluesPerLetter.has(guessLetter)) {
      availableCluesPerLetter.sub(guessLetter);
      ret[idx] = "present";
    } else {
      ret[idx] = "absent";
    }
  }
  return ret;
}

const firstDay = new Date(2021, 5, 19, 0, 0, 0, 0);

function timeAtMidnight(d: Date) {
  return new Date(d).setHours(0, 0, 0, 0);
}

export function getDayDifference(a: Date, b: Date) {
  return Math.round((timeAtMidnight(b) - timeAtMidnight(a)) / 864e5);
}

function getPuzzleIndexForDate(d: Date) {
  return getDayDifference(firstDay, d);
}

function getSolutionForPuzzleNumber(num: number) {
  const idx = num % wotd.length;
  return wotd[idx];
}

function nextWordleDate() {
  const ret = new Date();
  ret.setDate(ret.getDate() + 1);
  ret.setHours(0, 0, 0, 0);
  return ret;
}

export const nextWordle = nextWordleDate();
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

const suffixes = ["th", "st", "nd", "rd"];
function getOrdinal(n: number) {
  const firstTwoDigits = n % 100;
  return (
    n +
    (suffixes[(firstTwoDigits - 20) % 10] ||
      suffixes[firstTwoDigits] ||
      suffixes[0])
  );
}

export async function getErrorForGuess(s: Snapshot): Promise<false | string> {
  const currentInput = await s.getPromise(wordInProgress);
  if (currentInput.length !== 5) {
    return "Not enough letters";
  }
  if (!dictionary.has(currentInput)) {
    return "Not in word list";
  }
  if (await s.getPromise(hardMode)) {
    const prevRow = (await s.getPromise(rowIndex)) - 1;
    const currentInput = await s.getPromise(wordInProgress);
    // if no previous guesses, enforce unique starts, otherwise all fine
    if (prevRow === -1) {
      const previousOpeners = await s.getPromise(firstWords);
      if (previousOpeners.includes(currentInput)) {
        return "Already used as opening guess";
      }
      return false;
    }

    const guessed = await s.getPromise(guessedWords);
    const evals = await s.getPromise(evaluations);
    const prevGuess = guessed[prevRow];
    const previousEvals = evals[prevRow]!;
    const previousReveals = new Set<string>();
    // check each letter of input
    for (let i = 0; i < 5; i++) {
      const currentLetter = currentInput[i];
      const prevLetter = prevGuess[i];
      const prevLetterEval = previousEvals[i];
      if (prevLetterEval !== "absent") {
        previousReveals.add(prevLetter);
      }
      // must use discovered correct
      if (prevLetterEval === "correct" && currentLetter !== prevLetter) {
        return `${getOrdinal(
          i + 1
        )} letter must be ${prevLetter.toUpperCase()}`;
      }
    }
    // enforce every revealed letter is used
    for (const prevLetter of previousReveals) {
      if (!currentInput.includes(prevLetter)) {
        return `Guess must contain ${prevLetter.toUpperCase()}`;
      }
    }
    // TODO must use discovered presents in new locations
    // TODO (maybe?) must not use absent
  }

  return false;
}
