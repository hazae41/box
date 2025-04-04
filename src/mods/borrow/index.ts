import { Nullable } from "libs/nullable/index.js"

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

export interface Borrowable<T extends Disposable> {
  readonly value: T

  readonly owned: boolean

  readonly borrowed: boolean

  readonly dropped: boolean

  borrowOrNull(): Nullable<Borrow<T>>
  borrowOrThrow(): Borrow<T>

  returnOrThrow(): void
}

export type BorrowState =
  | "owned"
  | "borrowed"
  | "dropped"

export class Borrow<T extends Disposable> {

  #state: BorrowState = "owned"

  constructor(
    readonly parent: Borrowable<T>
  ) { }

  [Symbol.dispose]() {
    const owned = this.owned

    this.#state = "dropped"

    if (!owned)
      return

    this.parent.returnOrThrow()
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  get value() {
    return this.parent.value
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
      this.parent.returnOrThrow()

    return
  }

}