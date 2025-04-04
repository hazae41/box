import { Nullable } from "libs/nullable/index.js"
import { Borrow, BorrowedError, DroppedError, OwnedError } from "mods/borrow/index.js"

export class MovedError extends Error {
  readonly #class = MovedError
  readonly name = this.#class.name

  constructor() {
    super(`Resource has been moved`)
  }
}

export type BoxState =
  | "owned"
  | "borrowed"
  | "dropped"

/**
 * An ownable and borrowable reference
 */
export class Box<T extends Disposable> {

  #state: BoxState = "owned"

  /**
   * An ownable reference
   * @param value 
   */
  constructor(
    readonly value: T
  ) { }

  [Symbol.dispose]() {
    if (this.dropped)
      return

    if (this.owned)
      this.value[Symbol.dispose]()

    this.#state = "dropped"
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  static create<T extends Disposable>(value: T) {
    return new Box(value)
  }

  static createAsDropped<T extends Disposable>(value: T) {
    const box = new Box(value)
    box.#state = "dropped"
    return box
  }

  get owned() {
    return this.#state === "owned"
  }

  get borrowed() {
    return this.#state === "borrowed"
  }

  get dropped() {
    return this.#state === "dropped"
  }

  /**
   * Get the value
   * @returns T
   */
  get() {
    return this.value
  }

  /**
   * Get the value or null-like if not owned
   * @returns T or null-like if not owned
   */
  getOrNull(): Nullable<T> {
    if (!this.owned)
      return
    return this.value
  }

  /**
   * Get the value or throw if not owned
   * @returns T
   * @throws NotOwnedError if not owned
   */
  getOrThrow(): T {
    if (this.borrowed)
      throw new BorrowedError()
    if (this.dropped)
      throw new DroppedError()
    return this.value
  }

  checkOrNull(): Nullable<this> {
    if (!this.owned)
      return
    return this
  }

  checkOrThrow(): this {
    if (this.borrowed)
      throw new BorrowedError()
    if (this.dropped)
      throw new DroppedError()
    return this
  }

  /**
   * Get the value and set this as moved or null-like if not owned
   * @returns T or null-like if not owned
   */
  unwrapOrNull(): Nullable<T> {
    if (!this.owned)
      return
    this.#state = "dropped"

    return this.value
  }

  /**
   * Get the value and set this as moved or throw if not owned
   * @returns T
   * @throws BoxMovedError if not owned
   */
  unwrapOrThrow(): T {
    if (this.borrowed)
      throw new BorrowedError()
    if (this.dropped)
      throw new DroppedError()
    this.#state = "dropped"

    return this.value
  }

  /**
   * Move the value to a new box and set this one as moved or null-like if already moved
   * @returns Box<T> or null-like if moved
   */
  moveOrNull(): Nullable<Box<T>> {
    if (!this.owned)
      return
    this.#state = "dropped"

    return new Box(this.value)
  }

  /**
   * Move the value to a new box and set this one as moved or throw if already moved
   * @returns Box<T>
   * @throws BoxMovedError if already moved
   */
  moveOrThrow(): Box<T> {
    if (this.borrowed)
      throw new BorrowedError()
    if (this.dropped)
      throw new DroppedError()
    this.#state = "dropped"

    return new Box(this.value)
  }

  borrowOrNull(): Nullable<Borrow<T>> {
    if (!this.owned)
      return
    this.#state = "borrowed"

    return new Borrow(this)
  }

  borrowOrThrow(): Borrow<T> {
    if (this.borrowed)
      throw new BorrowedError()
    if (this.dropped)
      throw new DroppedError()
    this.#state = "borrowed"

    return new Borrow(this)
  }

  returnOrThrow(): void {
    if (this.owned)
      throw new OwnedError()

    if (this.borrowed)
      this.#state = "owned"
    else if (this.dropped)
      this.value[Symbol.dispose]()

    return
  }

}