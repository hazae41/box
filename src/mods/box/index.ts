import { Nullable } from "libs/nullable/index.js"
import { Borrow, BorrowedError, DroppedError, OwnedError } from "mods/borrow/index.js"
import { Deferred } from "mods/deferred/index.js"

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
 * A movable and borrowable reference
 */
export class Box<T> implements Disposable {

  #state: BoxState = "owned"

  /**
   * An ownable reference
   * @param value 
   */
  constructor(
    readonly value: T,
    readonly clean: Disposable
  ) { }

  static from<T extends Disposable>(value: T) {
    return new Box(value, value)
  }

  static with<T>(value: T, clean: (value: T) => void) {
    return new Box(value, new Deferred(() => clean(value)))
  }

  [Symbol.dispose]() {
    if (this.dropped)
      return

    if (this.owned)
      this.clean[Symbol.dispose]()

    this.#state = "dropped"
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
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

    return new Box(this.value, this.clean)
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

    return new Box(this.value, this.clean)
  }

  borrowOrNull(): Nullable<Borrow<T>> {
    if (!this.owned)
      return
    this.#state = "borrowed"

    const returnOrThrow = () => {
      if (this.owned)
        throw new OwnedError()

      if (this.borrowed)
        this.#state = "owned"
      else if (this.dropped)
        this.clean[Symbol.dispose]()

      return
    }

    return new Borrow(this.value, new Deferred(returnOrThrow))
  }

  borrowOrThrow(): Borrow<T> {
    if (this.borrowed)
      throw new BorrowedError()
    if (this.dropped)
      throw new DroppedError()
    this.#state = "borrowed"

    const returnOrThrow = () => {
      if (this.owned)
        throw new OwnedError()

      if (this.borrowed)
        this.#state = "owned"
      else if (this.dropped)
        this.clean[Symbol.dispose]()

      return
    }

    return new Borrow(this.value, new Deferred(returnOrThrow))
  }

  getAndDispose() {
    this[Symbol.dispose]()

    return this.value
  }

}