import { AtomEffect } from "recoil";
import { ssrCompletedState } from "./deferSsr";

type StorageValue = Record<string, any>;

const storageCache: Record<string, StorageValue | undefined> = {};

export function getStorageKey(key: string) {
  if (typeof window === "undefined") {
    return;
  }
  if (!storageCache[key]) {
    var e = localStorage.getItem(key);
    if (e) {
      try {
        storageCache[key] = JSON.parse(e);
      } catch (e) {
        console.error("Failed to parse storage value", e);
      }
    }
  }
  return storageCache[key];
}

export function setStorageKey(key: string, v: any) {
  storageCache[key] = v;
  if (v === undefined) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(v));
  }
}

export function updateStorageFields(key: string, updateFields: StorageValue) {
  const prevState = getStorageKey(key);
  const nextState = { ...prevState, ...updateFields };
  setStorageKey(key, nextState);
}

export function persistAsSubkeyOf<T>(macroKey: string) {
  const effect: AtomEffect<T> = ({ node, setSelf, onSet, getPromise }) => {
    getPromise(ssrCompletedState).then(() => {
      const storedValue = getStorageKey(macroKey);
      if (storedValue) {
        setSelf(storedValue[node.key]);
      }
      onSet((newValue) => {
        updateStorageFields(macroKey, { [node.key]: newValue });
      });
    });
  };

  return effect;
}

export const persistStandalone: AtomEffect<any> = ({
  node,
  setSelf,
  onSet,
  getPromise,
}) => {
  getPromise(ssrCompletedState).then(() => {
    const storedValue = getStorageKey(node.key);
    if (storedValue) {
      setSelf(storedValue);
    }
    onSet((newValue) => {
      setStorageKey(node.key, newValue);
    });
  });
};
