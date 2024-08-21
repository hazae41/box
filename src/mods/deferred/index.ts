export class Deferred<T> {

  constructor(
    readonly inner: () => T
  ) { }

  [Symbol.dispose](this: Deferred<void>) {
    this.inner()
  }

  async [Symbol.asyncDispose](this: Deferred<PromiseLike<void>>) {
    await this.inner()
  }

}