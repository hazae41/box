import { MaybeDisposable } from "index.js"

/**
 * A disposable whose reference can change
 */
export class Slot<T extends MaybeDisposable> implements Disposable {

  constructor(
    public inner: T
  ) { }

  [Symbol.dispose]() {
    this.inner[Symbol.dispose]?.()
  }

  static new<T extends Disposable>(inner: T) {
    return new Slot(inner)
  }

}