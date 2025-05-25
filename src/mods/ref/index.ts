export class Ref<T> {

  constructor(
    readonly value: T
  ) { }

  static from<T>(value: T) {
    return new Ref(value)
  }

  [Symbol.dispose]() { }

  async [Symbol.asyncDispose]() { }

  get() {
    return this.value
  }

}
