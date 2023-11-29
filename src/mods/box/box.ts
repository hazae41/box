import { Err, Ok, Result } from "@hazae41/result"

export class BoxMovedError extends Error {
  readonly #class = BoxMovedError
  readonly name = this.#class.name

  constructor() {
    super(`Box has been moved`)
  }
}

export class Box<T>  {

  #moved = false

  /**
   * Object that uniquely owns a type T and can dispose it
   */
  constructor(
    readonly inner: T
  ) { }

  [Symbol.dispose](this: Box<Disposable>) {
    if (this.#moved)
      return
    this.inner[Symbol.dispose]()
  }

  /**
   * Create a new Box
   * @param inner 
   * @returns 
   */
  static new<T>(inner: T) {
    return new Box(inner)
  }

  /**
   * Create a new Box that's already moved
   * @param inner 
   * @returns 
   */
  static greedy<T>(inner: T) {
    const box = new Box(inner)
    box.#moved = true
    return box
  }

  get moved() {
    return this.#moved
  }

  get() {
    if (this.#moved)
      return undefined
    return this.inner
  }

  /**
   * Just get the inner value
   * @returns T
   * @throws BoxMovedError if moved
   */
  getOrThrow(): T {
    if (this.#moved)
      throw new BoxMovedError()
    return this.inner
  }

  /**
   * Just get the inner value
   * @returns Ok<T> or Err<BoxMovedError> if moved
   */
  tryGet(): Result<T, BoxMovedError> {
    if (this.#moved)
      return new Err(new BoxMovedError())
    return new Ok(this.inner)
  }

  unwrap() {
    if (this.#moved)
      return undefined
    this.#moved = true
    return this.inner
  }

  /**
   * Get the inner value and set this as moved
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
   * Get the inner value and set this as moved
   * @returns Ok<T> or Err<BoxMovedError> if already moved
   */
  tryUnwrap(): Result<T, BoxMovedError> {
    if (this.#moved)
      return new Err(new BoxMovedError())
    this.#moved = true
    return new Ok(this.inner)
  }

  move() {
    if (this.#moved)
      return undefined
    this.#moved = true
    return new Box(this.inner)
  }

  /**
   * Move the inner value to a new box and set this one as moved
   * @returns Box<T>
   * @throws BoxMovedError if already moved
   */
  moveOrThrow() {
    if (this.#moved)
      throw new BoxMovedError()
    this.#moved = true
    return new Box(this.inner)
  }

  /**
   * Move the inner value to a new box and set this one as moved
   * @returns Ok<Box<T>> or Err<BoxMovedError> if already moved
   */
  tryMove(): Result<Box<T>, BoxMovedError> {
    if (this.#moved)
      return new Err(new BoxMovedError())
    this.#moved = true
    return new Ok(new Box(this.inner))
  }

  /**
   * Create a new Box that's already moved, and keep this one as is
   * @returns Box<T>
   */
  greed() {
    const moved = new Box(this.inner)
    moved.#moved = true
    return moved
  }

}