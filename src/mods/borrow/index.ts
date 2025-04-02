import { Nullable } from "libs/nullable/index.js"

export class BorrowedError extends Error {
  readonly #class = BorrowedError
  readonly name = this.#class.name

  constructor() {
    super(`Resource has been borrowed`)
  }
}

export class NotBorrowedError extends Error {
  readonly #class = NotBorrowedError
  readonly name = this.#class.name

  constructor() {
    super(`Resource has not been borrowed`)
  }
}

export class DroppedError extends Error {
  readonly #class = DroppedError
  readonly name = this.#class.name

  constructor() {
    super(`Resource has been dropped`)
  }
}

export interface Borrowable<T extends Disposable> {
  readonly inner: T

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
    if (this.borrowed)
      this.#state = "dropped"
    if (this.owned)
      this.parent.returnOrThrow()
    return
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  get inner() {
    return this.parent.inner
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

  getOrNull(): Nullable<T> {
    if (!this.owned)
      return
    return this.inner
  }

  getOrThrow(): T {
    if (this.borrowed)
      throw new BorrowedError()
    if (this.dropped)
      throw new DroppedError()
    return this.inner
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
    if (this.dropped)
      this.parent.returnOrThrow()
    if (this.borrowed)
      this.#state = "owned"
    return
  }

}