export class Auto<T extends Disposable> {

  static readonly cleanup = (x: Disposable) => x[Symbol.dispose]?.()
  static readonly registry = new FinalizationRegistry(Auto.cleanup)

  /**
   * A reference that will be disposed when garbage collected
   */
  constructor(
    readonly inner: T
  ) {
    Auto.registry.register(this, inner, this)
  }

  [Symbol.dispose]() {
    Auto.registry.unregister(this)
  }

  get() {
    return this.inner
  }

  unwrap() {
    using _ = this
    return this.inner
  }

}

export class AsyncAuto<T extends AsyncDisposable> {

  static readonly cleanup = (x: AsyncDisposable) => x[Symbol.asyncDispose]?.().then(undefined, console.error)
  static readonly registry = new FinalizationRegistry(AsyncAuto.cleanup)

  /**
   * A readonly slot that will be automatically disposed
   */
  constructor(
    readonly inner: T
  ) {
    AsyncAuto.registry.register(this, inner, this)
  }

  [Symbol.dispose]() {
    AsyncAuto.registry.unregister(this)
  }

  get() {
    return this.inner
  }

  unwrap() {
    using _ = this
    return this.inner
  }

}