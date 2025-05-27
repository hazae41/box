import { Nullable } from "libs/nullable/index.js"
import { Borrow, BorrowedError } from "mods/borrow/index.js"
import { Deferred } from "mods/deferred/index.js"
import { MovedError } from "mods/unpin/index.js"

/**
 * A movable and borrowable reference
 */
export class Box<T> implements Disposable {

  #state: "owned" | "borrowed" | "moved" = "owned"

  /**
   * An movable and borrowable reference
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
    if (this.moved)
      return

    if (this.borrowed)
      throw new BorrowedError()

    this.clean[Symbol.dispose]()
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

  get moved() {
    return this.#state === "moved"
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
    if (this.borrowed)
      return
    if (this.moved)
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
    if (this.moved)
      throw new MovedError()

    return this.value
  }

  checkOrNull(): Nullable<this> {
    if (this.borrowed)
      return
    if (this.moved)
      return

    return this
  }

  checkOrThrow(): this {
    if (this.borrowed)
      throw new BorrowedError()
    if (this.moved)
      throw new MovedError()

    return this
  }

  /**
   * Get the value and set this as moved or null-like if not owned
   * @returns T or null-like if not owned
   */
  unwrapOrNull(): Nullable<T> {
    if (this.borrowed)
      return
    if (this.moved)
      return

    this.#state = "moved"

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
    if (this.moved)
      throw new MovedError()

    this.#state = "moved"

    return this.value
  }

  /**
   * Move the value to a new box and set this one as moved or null-like if already moved
   * @returns Box<T> or null-like if moved
   */
  moveOrNull(): Nullable<Box<T>> {
    if (this.borrowed)
      return
    if (this.moved)
      return

    this.#state = "moved"

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
    if (this.moved)
      throw new MovedError()

    this.#state = "moved"

    return new Box(this.value, this.clean)
  }

  borrowOrNull(): Nullable<Borrow<T>> {
    if (this.borrowed)
      return
    if (this.moved)
      return

    this.#state = "borrowed"

    const dispose = () => { this.#state = "owned" }

    return new Borrow(this.value, new Deferred(dispose))
  }

  borrowOrThrow(): Borrow<T> {
    if (this.borrowed)
      throw new BorrowedError()
    if (this.moved)
      throw new MovedError()

    this.#state = "borrowed"

    const dispose = () => { this.#state = "owned" }

    return new Borrow(this.value, new Deferred(dispose))
  }

  getAndDispose() {
    this[Symbol.dispose]()

    return this.value
  }

}