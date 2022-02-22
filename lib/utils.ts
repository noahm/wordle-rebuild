import type { TransactionInterface_UNSTABLE } from "recoil";

export type BeginRecoilTransaction = (
  cb: (i: TransactionInterface_UNSTABLE) => void
) => void;

export function times<T>(n: number, cb: (idx: number) => T): T[] {
  const ret: T[] = [];
  for (let i = 0; i < n; i++) {
    ret[i] = cb(i);
  }
  return ret;
}
