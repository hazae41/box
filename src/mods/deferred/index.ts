export class Deferred {

  constructor(
    readonly inner: () => void
  ) { }

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

  async [Symbol.asyncDispose]() {
    await this.inner()
  }

}