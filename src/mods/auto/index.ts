import { AsyncDeferred, Deferred } from "mods/deferred/index.js"

/**
 * A reference that will be disposed when garbage collected
 */
export class Auto<T> {

  static readonly cleanup = (x: Disposable) => x[Symbol.dispose]()
  static readonly registry = new FinalizationRegistry(Auto.cleanup)

  /**
   * A reference that will be disposed when garbage collected
   * @param value 
   */
  constructor(
    readonly value: T,
    readonly clean: Disposable
  ) {
    Auto.registry.register(this, clean, this)
  }

  static with<T>(value: T, clean: (value: T) => void) {
    return new Auto(value, new Deferred(() => clean(value)))
  }

  static from<T extends Disposable>(value: T) {
    return new Auto(value, new Deferred(() => value[Symbol.dispose]()))
  }

  [Symbol.dispose]() {
    Auto.registry.unregister(this)
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  get() {
    return this.value
  }

  unwrap() {
    using _ = this
    return this.value
  }

}

/**
 * A reference that will be disposed when garbage collected
 */
export class AsyncAuto<T> {

  static readonly cleanup = (x: AsyncDisposable) => x[Symbol.asyncDispose]().then(undefined, console.error)
  static readonly registry = new FinalizationRegistry(AsyncAuto.cleanup)

  /**
   * A reference that will be disposed when garbage collected
   * @param value 
   */
  constructor(
    readonly value: T,
    readonly clean: AsyncDisposable
  ) {
    AsyncAuto.registry.register(this, clean, this)
  }

  static with<T>(value: T, clean: (value: T) => PromiseLike<void>) {
    return new AsyncAuto(value, new AsyncDeferred(() => clean(value)))
  }

  static from<T extends AsyncDisposable>(value: T) {
    return new AsyncAuto(value, new AsyncDeferred(() => value[Symbol.asyncDispose]()))
  }

  [Symbol.dispose]() {
    AsyncAuto.registry.unregister(this)
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  get() {
    return this.value
  }

  unwrap() {
    using _ = this
    return this.value
  }

}