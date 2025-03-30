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

export interface Borrowable<T> {
  readonly inner: T

  readonly borrowed: boolean

  borrowOrNull(): Nullable<Borrow<T>>
  borrowOrThrow(): Borrow<T>

  returnOrThrow(): void
}

export class Borrow<T> {

  #borrowed = false

  constructor(
    readonly parent: Borrowable<T>
  ) { }

  [Symbol.dispose](this: Borrow<Disposable>) {
    if (this.#borrowed)
      throw new BorrowedError()
    this.#borrowed = false

    this.parent.returnOrThrow()
  }

  get inner() {
    return this.parent.inner
  }

  get borrowed() {
    return this.#borrowed
  }

  getOrNull(): Nullable<T> {
    if (this.#borrowed)
      return
    return this.inner
  }

  getOrThrow(): T {
    if (this.#borrowed)
      throw new BorrowedError()
    return this.inner
  }

  borrowOrNull(): Nullable<Borrow<T>> {
    if (this.#borrowed)
      return
    this.#borrowed = true

    return new Borrow(this)
  }

  borrowOrThrow(): Borrow<T> {
    if (this.#borrowed)
      throw new BorrowedError()
    this.#borrowed = true

    return new Borrow(this)
  }

  returnOrThrow(): void {
    if (!this.#borrowed)
      throw new NotBorrowedError()
    this.#borrowed = false
  }

}