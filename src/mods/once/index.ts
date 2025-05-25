/**
 * A reference that can only be disposed once
 */
export class Once<T extends Disposable> {

  #disposed = false

  /**
   * A reference that can only be disposed once
   * @param value 
   */
  constructor(
    readonly value: T
  ) { }

  [Symbol.dispose](this: Once<Disposable>) {
    if (this.#disposed)
      return
    this.#disposed = true

    this.value[Symbol.dispose]()
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  get disposed() {
    return this.#disposed
  }

  get() {
    return this.value
  }

  getAndDispose() {
    this[Symbol.dispose]()

    return this.value
  }

}

export class AsyncOnce<T extends AsyncDisposable> {

  #disposed = false

  /**
   * A reference that can only be disposed once
   * @param value 
   */
  constructor(
    readonly value: T
  ) { }

  async [Symbol.asyncDispose]() {
    if (this.#disposed)
      return
    this.#disposed = true

    await this.value[Symbol.asyncDispose]()
  }

  get disposed() {
    return this.#disposed
  }

  get() {
    return this.value
  }

  async dispose() {
    await this[Symbol.asyncDispose]()

    return this.value
  }

}