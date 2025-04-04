import { AsyncDeferred, Deferred } from "mods/deferred/index.js"

export class Disposer<T> implements Disposable {

  constructor(
    readonly value: T,
    readonly clean: Deferred
  ) { }

  static wrap<T>(value: T, clean: (value: T) => void = () => { }) {
    return new Disposer(value, new Deferred(() => clean(value)))
  }

  static from<T>(value: T & Disposable) {
    return new Disposer(value, new Deferred(() => value[Symbol.dispose]()))
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

  async await<T>(this: Disposer<Promise<T>>) {
    using _ = this.clean
    return await this.get()
  }

}

export class AsyncDisposer<T> implements AsyncDisposable {

  constructor(
    readonly value: T,
    readonly clean: AsyncDeferred
  ) { }

  static wrap<T>(value: T, clean: (value: T) => PromiseLike<void> = async () => { }) {
    return new AsyncDisposer(value, new AsyncDeferred(() => clean(value)))
  }

  static from<T>(value: T & AsyncDisposable) {
    return new AsyncDisposer(value, new AsyncDeferred(() => value[Symbol.asyncDispose]()))
  }

  async [Symbol.asyncDispose]() {
    await this.clean[Symbol.asyncDispose]()
  }

  get() {
    return this.value
  }

  async await<T>(this: AsyncDisposer<Promise<T>>) {
    await using _ = this.clean
    return await this.get()
  }

}
