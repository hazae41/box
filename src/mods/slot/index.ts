
export class Slot<T> {

  /**
   * A reference that can change
   * @param inner 
   */
  constructor(
    public inner: T
  ) { }

  [Symbol.dispose](this: Slot<Disposable>) {
    this.inner[Symbol.dispose]?.()
  }

  async [Symbol.asyncDispose](this: Slot<AsyncDisposable>) {
    await this.inner[Symbol.asyncDispose]?.()
  }

  static create<T>(inner: T) {
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