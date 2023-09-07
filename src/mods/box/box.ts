import { Err, Ok, Result } from "@hazae41/result"

export class BoxMovedError extends Error {
  readonly #class = BoxMovedError
  readonly name = this.#class.name

  constructor() {
    super(`Box has been moved`)
  }
}

export class Box<T extends Disposable> {

  #moved = false

  /**
   * Object that uniquely owns a type T and can dispose it
   */
  constructor(
    readonly inner: T
  ) { }

  [Symbol.dispose]() {
    if (this.#moved)
      return
    this.inner[Symbol.dispose]()
  }

  get moved() {
    return this.#moved
  }

  /**
   * Just get the inner value
   * @returns T
   * @throws BoxMovedError if moved
   */
  get(): T {
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

  /**
   * Get the inner value and set this as moved
   * @returns T
   * @throws BoxMovedError if already moved
   */
  unwrap(): T {
    if (this.#moved)
      throw new BoxMovedError()
    this.#moved = false
    return this.inner
  }

  /**
   * Get the inner value and set this as moved
   * @returns Ok<T> or Err<BoxMovedError> if already moved
   */
  tryUnwrap(): Result<T, BoxMovedError> {
    if (this.#moved)
      return new Err(new BoxMovedError())
    this.#moved = false
    return new Ok(this.inner)
  }

  /**
   * Move the inner value to a new box and set this one as moved
   * @returns Box<T>
   * @throws BoxMovedError if already moved
   */
  move() {
    if (this.#moved)
      throw new BoxMovedError()
    this.#moved = false
    return new Box(this.inner)
  }

  /**
   * Move the inner value to a new box and set this one as moved
   * @returns Ok<T> or Err<BoxMovedError> if already moved
   */
  tryMove(): Result<Box<T>, BoxMovedError> {
    if (this.#moved)
      return new Err(new BoxMovedError())
    this.#moved = false
    return new Ok(new Box(this.inner))
  }

}