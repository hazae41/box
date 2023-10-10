import { Err, Ok, Result } from "@hazae41/result"
import { Copiable } from "mods/copy/copy.js"

export class BoxMovedError extends Error {
  readonly #class = BoxMovedError
  readonly name = this.#class.name

  constructor() {
    super(`Box has been moved`)
  }
}

export class Box<T extends Disposable> implements Disposable {

  moved = false

  /**
   * Object that uniquely owns a type T and can dispose it
   */
  constructor(
    readonly inner: T
  ) { }

  [Symbol.dispose]() {
    if (this.moved)
      return
    this.inner[Symbol.dispose]()
  }

  static wrap<T extends Disposable>(inner: T) {
    return new Box(inner)
  }

  /**
   * Just get the inner value
   * @returns T
   * @throws BoxMovedError if moved
   */
  get(): T {
    if (this.moved)
      throw new BoxMovedError()
    return this.inner
  }

  /**
   * Just get the inner value
   * @returns Ok<T> or Err<BoxMovedError> if moved
   */
  tryGet(): Result<T, BoxMovedError> {
    if (this.moved)
      return new Err(new BoxMovedError())
    return new Ok(this.inner)
  }

  /**
   * Get the inner value and set this as moved
   * @returns T
   * @throws BoxMovedError if already moved
   */
  unwrap(): T {
    if (this.moved)
      throw new BoxMovedError()
    this.moved = true
    return this.inner
  }

  /**
   * Get the inner value and set this as moved
   * @returns Ok<T> or Err<BoxMovedError> if already moved
   */
  tryUnwrap(): Result<T, BoxMovedError> {
    if (this.moved)
      return new Err(new BoxMovedError())
    this.moved = true
    return new Ok(this.inner)
  }

  /**
   * Move the inner value to a new box and set this one as moved
   * @returns Box<T>
   * @throws BoxMovedError if already moved
   */
  move() {
    if (this.moved)
      throw new BoxMovedError()
    this.moved = true
    return new Box(this.inner)
  }

  /**
   * Move the inner value to a new box and set this one as moved
   * @returns Ok<Box<T>> or Err<BoxMovedError> if already moved
   */
  tryMove(): Result<Box<T>, BoxMovedError> {
    if (this.moved)
      return new Err(new BoxMovedError())
    this.moved = true
    return new Ok(new Box(this.inner))
  }

  /**
   * Move if not already moved; useful if you want to take ownership only if available
   * @example using box2 = box.moveIfNotMoved()
   * @returns Box<T>
   */
  moveIfNotMoved() {
    if (this.moved)
      return this
    this.moved = false
    return new Box(this.inner)
  }

  /**
   * Create a new Box that's already moved, and keep this one as is
   * @returns Box<T>
   */
  greed() {
    const moved = new Box(this.inner)
    moved.moved = true
    return moved
  }

  /**
   * Unwrap, copy, and rewrap
   * @param this 
   * @returns 
   */
  copyAndDispose<T>(this: Box<Copiable<T>>) {
    return new Box(this.unwrap().copyAndDispose())
  }

}
