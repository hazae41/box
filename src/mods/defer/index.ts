export class Defer<T> {

  constructor(
    readonly inner: () => T
  ) { }

  [Symbol.dispose](this: Defer<void>) {
    this.inner()
  }

  async [Symbol.asyncDispose](this: Defer<PromiseLike<void>>) {
    await this.inner()
  }

}