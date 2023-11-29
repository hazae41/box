/**
 * A disposable whose reference can change
 */
export class Slot<T> {

  constructor(
    public inner: T
  ) { }

  [Symbol.dispose](this: Slot<Disposable>) {
    this.inner[Symbol.dispose]()
  }

  static new<T>(inner: T) {
    return new Slot(inner)
  }

}