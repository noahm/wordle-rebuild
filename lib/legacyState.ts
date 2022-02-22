import type { ResetRecoilState } from "recoil";
import { solution } from "./logic";
import { guessedWord, hardMode, lastPlayedTs } from "./state";
import { lastCompletedTs } from "./stats";
import { getStorageKey, setStorageKey } from "./storage";
import type { BeginRecoilTransaction } from "./utils";

/**
 * If original wordle state exists, tries to import it as best we can.
 * @returns true if state was found, false if not found
 */
export function applyLegacyState(
  transact: BeginRecoilTransaction,
  resetOldGuesses: (reset: ResetRecoilState) => void
) {
  const oldState = getStorageKey("gameState");
  if (oldState) {
    transact(({ set, reset }) => {
      if (oldState.solution === solution) {
        if (oldState.boardState) {
          (oldState.boardState as string[]).forEach((word, idx) => {
            set(guessedWord(idx), word);
          });
        }
      } else {
        resetOldGuesses(reset);
      }
      set(hardMode, !!oldState.hardMode);
      set(lastPlayedTs, oldState.lastPlayedTs);
      set(lastCompletedTs, oldState.lastCompletedTs);
    });
    setStorageKey("gameState", undefined);
    return true;
  }
  return false;
}
