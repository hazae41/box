/**
 * A mutable reference
 */
export class Slot<T extends Disposable> {

  /**
   * A mutable reference
   * @param inner 
   */
  constructor(
    public inner: T
  ) { }

  [Symbol.dispose]() {
    this.inner[Symbol.dispose]()
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  static create<T extends Disposable>(inner: T) {
    return new Slot(inner)
  }

  get() {
    return this.inner
  }

  set(value: T) {
    this.inner = value
  }

  getAndSet(value: T) {
    const old = this.inner
    this.inner = value
    return old
  }

}

export class AsyncSlot<T extends AsyncDisposable> {

  /**
   * A mutable reference
   * @param inner 
   */
  constructor(
    public inner: T
  ) { }

  async [Symbol.asyncDispose]() {
    await this.inner[Symbol.asyncDispose]?.()
  }

  static create<T extends AsyncDisposable>(inner: T) {
    return new AsyncSlot(inner)
  }

  get() {
    return this.inner
  }

  set(value: T) {
    this.inner = value
  }

  getAndSet(value: T) {
    const old = this.inner
    this.inner = value
    return old
  }

}