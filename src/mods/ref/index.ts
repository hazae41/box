export class Ref<T extends Disposable> {

  constructor(
    readonly value: T
  ) { }

  [Symbol.dispose]() { }

  async [Symbol.asyncDispose]() { }

  get() {
    return this.value
  }

}
