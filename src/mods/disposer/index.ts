import { AsyncDeferred, Deferred } from "mods/deferred/index.js"

export class Disposer<T> implements Disposable {

  constructor(
    readonly value: T,
    readonly clean: Deferred
  ) { }

  static with<T>(inner: T, clean: (inner: T) => void) {
    return new Disposer(inner, new Deferred(() => clean(inner)))
  }

  static from<T>(disposable: T & Disposable) {
    return new Disposer(disposable, new Deferred(() => disposable[Symbol.dispose]()))
  }

  static void<T>(inner: T) {
    return new Disposer(inner, Deferred.void())
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

  static with<T>(inner: T, clean: (inner: T) => Promise<void>) {
    return new AsyncDisposer(inner, new AsyncDeferred(() => clean(inner)))
  }

  static from<T>(disposable: T & AsyncDisposable) {
    return new AsyncDisposer(disposable, new AsyncDeferred(() => disposable[Symbol.asyncDispose]()))
  }

  static void<T>(inner: T) {
    return new AsyncDisposer(inner, AsyncDeferred.void())
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
