
export class BoxMovedError extends Error {
  readonly #class = BoxMovedError
  readonly name = this.#class.name

  constructor() {
    super(`Box has been moved`)
  }
}

export class Box<T> {

  #moved = false

  /**
   * A reference that can be unset
   */
  constructor(
    readonly inner: T
  ) { }

  [Symbol.dispose](this: Box<Disposable>) {
    if (this.#moved)
      return
    this.inner[Symbol.dispose]?.()
  }

  async [Symbol.asyncDispose](this: Box<AsyncDisposable>) {
    if (this.#moved)
      return
    await this.inner[Symbol.asyncDispose]?.()
  }

  static create<T>(inner: T) {
    return new Box(inner)
  }

  static createAsMoved<T>(inner: T) {
    const dummy = new Box(inner)
    dummy.#moved = true
    return dummy
  }

  get moved() {
    return this.#moved
  }

  /**
   * Get the value or null-like if moved
   * @returns T or null-like if moved
   */
  getOrNull() {
    if (this.#moved)
      return
    return this.inner
  }

  /**
   * Get the value or throw if moved
   * @returns T
   * @throws BoxMovedError if moved
   */
  getOrThrow(): T {
    if (this.#moved)
      throw new BoxMovedError()
    return this.inner
  }

  /**
   * Get the value and set this as moved or null-like if already moved
   * @returns T or null-like if moved
   */
  unwrapOrNull() {
    if (this.#moved)
      return
    this.#moved = true

    return this.inner
  }

  /**
   * Get the value and set this as moved or throw if already moved
   * @returns T
   * @throws BoxMovedError if already moved
   */
  unwrapOrThrow(): T {
    if (this.#moved)
      throw new BoxMovedError()
    this.#moved = true

    return this.inner
  }

  /**
   * Move the value to a new box and set this one as moved or null-like if already moved
   * @returns Box<T> or null-like if moved
   */
  moveOrNull() {
    if (this.#moved)
      return
    this.#moved = true

    return new Box(this.inner)
  }

  /**
   * Move the value to a new box and set this one as moved or throw if already moved
   * @returns Box<T>
   * @throws BoxMovedError if already moved
   */
  moveOrThrow() {
    if (this.#moved)
      throw new BoxMovedError()
    this.#moved = true

    return new Box(this.inner)
  }

}