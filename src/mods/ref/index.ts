export class Ref<T> {

  constructor(
    readonly value: T
  ) { }

  [Symbol.dispose]() { }

  async [Symbol.asyncDispose]() { }

  get() {
    return this.value
  }

}
