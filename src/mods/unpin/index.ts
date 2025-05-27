import { Nullable } from "libs/nullable/index.js"
import { Deferred } from "mods/deferred/index.js"

export class MovedError extends Error {
  readonly #class = MovedError
  readonly name = this.#class.name

  constructor() {
    super(`Resource is moved`)
  }
}

/**
 * A movable reference
 */
export class Unpin<T> implements Disposable {

  #moved = false

  /**
   * An movable reference
   * @param value 
   */
  constructor(
    readonly value: T,
    readonly clean: Disposable
  ) { }

  static from<T extends Disposable>(value: T) {
    return new Unpin(value, value)
  }

  static with<T>(value: T, clean: (value: T) => void) {
    return new Unpin(value, new Deferred(() => clean(value)))
  }

  [Symbol.dispose]() {
    if (this.#moved)
      return

    this.clean[Symbol.dispose]()
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  get moved() {
    return this.#moved
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
    if (this.#moved)
      return

    return this.value
  }

  /**
   * Get the value or throw if not owned
   * @returns T
   * @throws NotOwnedError if not owned
   */
  getOrThrow(): T {
    if (this.#moved)
      throw new MovedError()

    return this.value
  }

  checkOrNull(): Nullable<this> {
    if (this.#moved)
      return

    return this
  }

  checkOrThrow(): this {
    if (this.#moved)
      throw new MovedError()

    return this
  }

  /**
   * Get the value and set this as moved or null-like if not owned
   * @returns T or null-like if not owned
   */
  unwrapOrNull(): Nullable<T> {
    if (this.#moved)
      return

    this.#moved = true

    return this.value
  }

  /**
   * Get the value and set this as moved or throw if not owned
   * @returns T
   * @throws DroppedError if not owned
   */
  unwrapOrThrow(): T {
    if (this.#moved)
      throw new MovedError()

    this.#moved = true

    return this.value
  }

  /**
   * Move the value to a new Unpin and set this one as moved or null-like if already moved
   * @returns Unpin<T> or null-like if moved
   */
  moveOrNull(): Nullable<Unpin<T>> {
    if (this.#moved)
      return

    this.#moved = true

    return new Unpin(this.value, this.clean)
  }

  /**
   * Move the value to a new Unpin and set this one as moved or throw if already moved
   * @returns Unpin<T>
   * @throws DroppedError if already moved
   */
  moveOrThrow(): Unpin<T> {
    if (this.#moved)
      throw new MovedError()

    this.#moved = true

    return new Unpin(this.value, this.clean)
  }

  getAndDispose() {
    this[Symbol.dispose]()

    return this.value
  }

}