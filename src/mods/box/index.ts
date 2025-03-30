import { Future } from "@hazae41/future"
import { Nullable } from "libs/nullable/index.js"
import { Borrow, BorrowedError, NotBorrowedError } from "mods/borrow/index.js"

export class MovedError extends Error {
  readonly #class = MovedError
  readonly name = this.#class.name

  constructor() {
    super(`Resource has been moved`)
  }
}

export type BoxState =
  | "owned"
  | "moved"
  | "borrowed"

/**
 * An ownable reference
 */
export class Box<T> {

  #state = "owned"

  #resolveOnReturn = Future.resolve()

  /**
   * An ownable reference
   * @param inner 
   */
  constructor(
    readonly inner: T
  ) { }

  [Symbol.dispose](this: Box<Disposable>) {
    if (this.moved)
      return
    if (this.borrowed)
      throw new BorrowedError()
    this.inner[Symbol.dispose]?.()
  }

  async [Symbol.asyncDispose](this: Box<AsyncDisposable>) {
    if (this.moved)
      return
    if (this.borrowed)
      throw new BorrowedError()
    await this.inner[Symbol.asyncDispose]?.()
  }

  static create<T>(inner: T) {
    return new Box(inner)
  }

  static createAsMoved<T>(inner: T) {
    const box = new Box(inner)
    box.#state = "moved"
    return box
  }

  get owned() {
    return this.#state === "owned"
  }

  get moved() {
    return this.#state === "moved"
  }

  get borrowed() {
    return this.#state === "borrowed"
  }

  get resolveOnReturn() {
    return this.#resolveOnReturn.promise
  }

  /**
   * Get the value or null-like if not owned
   * @returns T or null-like if not owned
   */
  getOrNull(): Nullable<T> {
    if (!this.owned)
      return
    return this.inner
  }

  /**
   * Get the value or throw if not owned
   * @returns T
   * @throws NotOwnedError if not owned
   */
  getOrThrow(): T {
    if (this.moved)
      throw new MovedError()
    if (this.borrowed)
      throw new BorrowedError()
    return this.inner
  }

  /**
   * Get the value and set this as moved or null-like if not owned
   * @returns T or null-like if not owned
   */
  unwrapOrNull(): Nullable<T> {
    if (!this.owned)
      return
    this.#state = "moved"

    return this.inner
  }

  /**
   * Get the value and set this as moved or throw if not owned
   * @returns T
   * @throws BoxMovedError if not owned
   */
  unwrapOrThrow(): T {
    if (this.moved)
      throw new MovedError()
    if (this.borrowed)
      throw new BorrowedError()
    this.#state = "moved"

    return this.inner
  }

  /**
   * Move the value to a new box and set this one as moved or null-like if already moved
   * @returns Box<T> or null-like if moved
   */
  moveOrNull(): Nullable<Box<T>> {
    if (!this.owned)
      return
    this.#state = "moved"

    return new Box(this.inner)
  }

  /**
   * Move the value to a new box and set this one as moved or throw if already moved
   * @returns Box<T>
   * @throws BoxMovedError if already moved
   */
  moveOrThrow(): Box<T> {
    if (this.moved)
      throw new MovedError()
    if (this.borrowed)
      throw new BorrowedError()
    this.#state = "moved"

    return new Box(this.inner)
  }

  borrowOrNull(): Nullable<Borrow<T>> {
    if (!this.owned)
      return
    this.#state = "borrowed"

    this.#resolveOnReturn = new Future()

    return new Borrow(this)
  }

  borrowOrThrow(): Borrow<T> {
    if (this.moved)
      throw new MovedError()
    if (this.borrowed)
      throw new BorrowedError()
    this.#state = "borrowed"

    this.#resolveOnReturn = new Future()

    return new Borrow(this)
  }

  returnOrThrow(): void {
    if (!this.borrowed)
      throw new NotBorrowedError()
    this.#state = "owned"

    this.#resolveOnReturn.resolve()
  }

}