import { AsyncDeferred, Deferred } from "mods/deferred/index.js"

export class Pin<T> implements Disposable {

  constructor(
    readonly value: T,
    readonly clean: Disposable
  ) { }

  static with<T>(value: T, clean: (value: T) => void) {
    return new Pin(value, new Deferred(() => clean(value)))
  }

  static from<T extends Disposable>(value: T) {
    return new Pin(value, new Deferred(() => value[Symbol.dispose]()))
  }

  [Symbol.dispose]() {
    this.clean[Symbol.dispose]()
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  get() {
    return this.value
  }

  getAndDispose() {
    this[Symbol.dispose]()

    return this.value
  }

}

export class AsyncPin<T> implements AsyncDisposable {

  constructor(
    readonly value: T,
    readonly clean: AsyncDeferred
  ) { }

  static with<T>(value: T, clean: (value: T) => PromiseLike<void>) {
    return new AsyncPin(value, new AsyncDeferred(() => clean(value)))
  }

  static from<T extends AsyncDisposable>(value: T) {
    return new AsyncPin(value, new AsyncDeferred(() => value[Symbol.asyncDispose]()))
  }

  async [Symbol.asyncDispose]() {
    await this.clean[Symbol.asyncDispose]()
  }

  get() {
    return this.value
  }

  async getAndDispose() {
    await this[Symbol.asyncDispose]()

    return this.value
  }

}
