import { Nullable } from "libs/nullable/index.js"
import { Deferred } from "mods/deferred/index.js"
import { Wrap } from "mods/wrap/index.js"

export class NotUniqueError extends Error {
  readonly #class = NotUniqueError
  readonly name = this.#class.name

  constructor() {
    super(`Resource is not unique`)
  }
}

export class Count<T> {

  #count = 1

  constructor(
    readonly value: T,
    readonly clean: Disposable
  ) { }

  static wrap<T extends Disposable>(value: T) {
    return new Count(value, value)
  }

  static from<T>(value: Wrap<T>) {
    return new Count(value.get(), value)
  }

  static with<T>(value: T, clean: (value: T) => void) {
    return new Count(value, new Deferred(() => clean(value)))
  }

  [Symbol.dispose]() {
    this.#count--

    if (this.#count > 0)
      return

    this.clean[Symbol.dispose]()
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  get count() {
    return this.#count
  }

  get() {
    return this.value
  }

  getOrNull(): Nullable<T> {
    if (this.#count > 1)
      return

    return this.value
  }

  getOrThrow(): T {
    if (this.#count > 1)
      throw new NotUniqueError()

    return this.value
  }

  checkOrNull(): Nullable<this> {
    if (this.#count > 1)
      return

    return this
  }

  checkOrThrow(): this {
    if (this.#count > 1)
      throw new NotUniqueError()

    return this
  }

  clone() {
    this.#count++
    return this
  }

}