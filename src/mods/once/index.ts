import { Nullable } from "libs/nullable/index.js"

export class DisposedError extends Error {
  readonly #class = DisposedError
  readonly name = this.#class.name

  constructor() {
    super(`Reference has been disposed`)
  }
}

/**
 * A reference that can only be disposed once
 */
export class Once<T> {

  #disposed = false

  /**
   * A reference that can only be disposed once
   * @param value 
   */
  constructor(
    readonly value: T,
    readonly clean: Disposable
  ) { }

  [Symbol.dispose]() {
    if (this.#disposed)
      return
    this.#disposed = true

    this.clean[Symbol.dispose]()
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

  getOrNull(): Nullable<T> {
    if (this.#disposed)
      return

    return this.value
  }

  getOrThrow(): T {
    if (this.#disposed)
      throw new DisposedError()

    return this.value
  }

}

export class AsyncOnce<T> {

  #disposed = false

  /**
   * A reference that can only be disposed once
   * @param value 
   */
  constructor(
    readonly value: T,
    readonly clean: AsyncDisposable
  ) { }

  async [Symbol.asyncDispose]() {
    if (this.#disposed)
      return
    this.#disposed = true

    await this.clean[Symbol.asyncDispose]()
  }

  get disposed() {
    return this.#disposed
  }

  get() {
    return this.value
  }

  async getAndDispose() {
    await this[Symbol.asyncDispose]()

    return this.value
  }

  getOrNull(): Nullable<T> {
    if (this.#disposed)
      return

    return this.value
  }

  async getOrThrow(): Promise<T> {
    if (this.#disposed)
      throw new DisposedError()

    return this.value
  }

}