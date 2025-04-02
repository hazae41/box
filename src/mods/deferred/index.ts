export class Deferred {

  constructor(
    readonly inner: () => void
  ) { }

  static void() {
    return new Deferred(() => { })
  }

  [Symbol.dispose]() {
    this.inner()
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

}

export class AsyncDeferred {

  constructor(
    readonly inner: () => PromiseLike<void>
  ) { }

  static void() {
    return new AsyncDeferred(async () => { })
  }

  async [Symbol.asyncDispose]() {
    await this.inner()
  }

}