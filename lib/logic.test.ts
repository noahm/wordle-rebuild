import { describe, expect, it } from "@jest/globals";
import { snapshot_UNSTABLE } from "recoil";
import {
  extremeMode,
  firstWords,
  guessedWord,
  hardMode,
  wordInProgress,
} from "./state";
import { getErrorForGuess } from "./logic";
import { solution, today } from "./days";

interface Truth {
  guess?: string;
  pastGuess?: string[];
  hardMode?: boolean;
  extremeMode?: boolean;
  firstWords?: string[];
}

function buildSnapshot(truth: Truth) {
  return snapshot_UNSTABLE(({ set }) => {
    set(today, new Date(2022, 2, 13));
    truth.guess && set(wordInProgress, truth.guess);
    if (truth.pastGuess)
      truth.pastGuess.forEach((guess, idx) => set(guessedWord(idx), guess));
    set(hardMode, !!truth.hardMode);
    set(extremeMode, !!truth.extremeMode);
    if (truth.firstWords) set(firstWords, truth.firstWords);
  });
}

function getErrorFeedback(truth: Truth) {
  return getErrorForGuess(buildSnapshot(truth));
}

it("test env uses expected solution", async () => {
  const snapshot = buildSnapshot({});
  await expect(snapshot.getPromise(solution)).resolves.toBe("focus");
});

it("rejects guesses that are too short", async () => {
  await expect(getErrorFeedback({ guess: "abc" })).resolves.toBe(
    "Not enough letters"
  );
});

it("rejects guesses that are not in dictionary", async () => {
  await expect(getErrorFeedback({ guess: "abcde" })).resolves.toBe(
    "Not in word list"
  );
});

describe("hard mode", () => {
  it("rejects opening guesses previously used as openers, only in hard mode", async () => {
    await expect(
      getErrorFeedback({
        guess: "bland",
        hardMode: true,
        firstWords: ["bland"],
      })
    ).resolves.toBe("Already used as opening guess");
    await expect(
      getErrorFeedback({
        guess: "bland",
        hardMode: false,
        firstWords: ["bland"],
      })
    ).resolves.toBe(false);
  });

  it("rejects guesses that omit revealed correct letters", async () => {
    await expect(
      getErrorFeedback({ guess: "tools", hardMode: true, pastGuess: ["fools"] })
    ).resolves.toBe("1st letter must be F");
    await expect(
      getErrorFeedback({ guess: "foley", hardMode: true, pastGuess: ["fools"] })
    ).resolves.toBe("5th letter must be S");
  });

  it("rejects guesses that omit revealed present letters", async () => {
    await expect(
      getErrorFeedback({ guess: "napes", hardMode: true, pastGuess: ["cafes"] })
    ).resolves.toBe("Guess must contain C");
    await expect(
      getErrorFeedback({ guess: "capes", hardMode: true, pastGuess: ["cafes"] })
    ).resolves.toBe("Guess must contain F");
  });
});

describe("extreme mode", () => {
  it("rejects guesses that reuse present letters in previous positions", async () => {
    await expect(
      getErrorFeedback({
        guess: "drool",
        hardMode: true,
        extremeMode: true,
        pastGuess: ["bloom"],
      })
    ).resolves.toBe("3rd letter must not be O");
    await expect(
      getErrorFeedback({
        guess: "drool",
        hardMode: true,
        extremeMode: false,
        pastGuess: ["bloom"],
      })
    ).resolves.toBe(false);
  });
  it("rejects guesses that reuse absent letters", async () => {
    await expect(
      getErrorFeedback({
        guess: "broom",
        hardMode: true,
        extremeMode: true,
        pastGuess: ["blame"],
      })
    ).resolves.toBe("Word does not contain B");
    await expect(
      getErrorFeedback({
        guess: "groom",
        hardMode: true,
        extremeMode: true,
        pastGuess: ["blame"],
      })
    ).resolves.toBe("Word does not contain M");
    await expect(
      getErrorFeedback({
        guess: "broom",
        hardMode: true,
        extremeMode: false,
        pastGuess: ["blame"],
      })
    ).resolves.toBe(false);
  });
});
