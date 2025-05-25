import { Nullable } from "libs/nullable/index.js"
import { Deferred } from "mods/deferred/index.js"

export class BorrowedError extends Error {
  readonly #class = BorrowedError
  readonly name = this.#class.name

  constructor() {
    super(`Resource is borrowed`)
  }
}

/**
 * A borrowable reference
 * @param value 
 */
export class Borrow<T> {

  #borrowed = false

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
    if (this.#borrowed)
      throw new BorrowedError()

    this.clean[Symbol.dispose]()
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  get borrowed() {
    return this.#borrowed
  }

  get() {
    return this.value
  }

  getOrNull(): Nullable<T> {
    if (this.#borrowed)
      return

    return this.value
  }

  getOrThrow(): T {
    if (this.#borrowed)
      throw new BorrowedError()

    return this.value
  }

  checkOrNull(): Nullable<this> {
    if (this.#borrowed)
      return

    return this
  }

  checkOrThrow(): this {
    if (this.#borrowed)
      throw new BorrowedError()

    return this
  }

  borrowOrNull(): Nullable<Borrow<T>> {
    if (this.#borrowed)
      return

    this.#borrowed = true

    const dispose = () => { this.#borrowed = false }

    return new Borrow(this.value, new Deferred(dispose))
  }

  borrowOrThrow(): Borrow<T> {
    if (this.#borrowed)
      throw new BorrowedError()

    this.#borrowed = true

    const dispose = () => { this.#borrowed = false }

    return new Borrow(this.value, new Deferred(dispose))
  }

  getAndDispose() {
    this[Symbol.dispose]()

    return this.value
  }

}