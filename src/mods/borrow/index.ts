import { Nullable } from "libs/nullable/index.js"
import { Deferred } from "mods/deferred/index.js"

export class OwnedError extends Error {
  readonly #class = OwnedError
  readonly name = this.#class.name

  constructor() {
    super(`Resource is owned`)
  }
}

export class BorrowedError extends Error {
  readonly #class = BorrowedError
  readonly name = this.#class.name

  constructor() {
    super(`Resource is borrowed`)
  }
}

export class DroppedError extends Error {
  readonly #class = DroppedError
  readonly name = this.#class.name

  constructor() {
    super(`Resource is dropped`)
  }
}

export type BorrowState =
  | "owned"
  | "borrowed"
  | "dropped"

/**
 * A borrowable reference
 * @param value 
 */
export class Borrow<T> {

  #state: BorrowState = "owned"

  constructor(
    readonly value: T,
    readonly clean: Disposable
  ) { }

  static from<T extends Disposable>(value: T) {
    return new Borrow(value, value)
  }

  static with<T>(value: T, clean: (value: T) => void) {
    return new Borrow(value, new Deferred(() => clean(value)))
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

  get() {
    return this.value
  }

  getOrNull(): Nullable<T> {
    if (!this.owned)
      return
    return this.value
  }

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