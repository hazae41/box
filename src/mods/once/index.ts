/**
 * A reference that can only be disposed once
 */
export class Once<T> {

  #disposed = false

  /**
   * A reference that can only be disposed once
   * @param inner 
   */
  constructor(
    readonly inner: T
  ) { }

  [Symbol.dispose](this: Once<Disposable>) {
    if (this.#disposed)
      return
    this.#disposed = true

    this.inner[Symbol.dispose]?.()
  }

  async [Symbol.asyncDispose](this: Once<AsyncDisposable>) {
    if (this.#disposed)
      return
    this.#disposed = true

    await this.inner[Symbol.asyncDispose]?.()
  }

  get disposed() {
    return this.#disposed
  }

  get() {
    return this.inner
  }

}