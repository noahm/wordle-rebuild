import { RecoilState } from "recoil";
import { solution } from "./logic";
import { guessedWord, hardMode, lastPlayedTs, lastCompletedTs } from "./state";
import { getStorageKey, setStorageKey } from "./storage";

type SetRecoilState = <T>(
  recoilVal: RecoilState<T>,
  newVal: T | ((prevValue: T) => T)
) => void;

/**
 * If original wordle state exists, tries to import it as best we can.
 * @returns true if state was found, false if not found
 */
export function applyLegacyState(
  set: SetRecoilState,
  resetOldGuesses: () => void
) {
  const oldState = getStorageKey("gameState");
  if (oldState) {
    if (oldState.solution === solution) {
      if (oldState.boardState) {
        (oldState.boardState as string[]).forEach((word, idx) => {
          set(guessedWord(idx), word);
        });
      }
    } else {
      resetOldGuesses();
    }
    set(hardMode, !!oldState.hardMode);
    set(lastPlayedTs, oldState.lastPlayedTs);
    set(lastCompletedTs, oldState.lastCompletedTs);
    setStorageKey("gameState", undefined);
    return true;
  }
  return false;
}
