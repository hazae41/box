export type Ownable<T extends Disposable> =
  | Viewed<T>
  | Owned<T>

export class Viewed<T extends Disposable> {

  constructor(
    readonly value: T
  ) { }

  [Symbol.dispose]() { }

  async [Symbol.asyncDispose]() { }

  get() {
    return this.value
  }

}

export class Owned<T extends Disposable> {

  constructor(
    readonly value: T
  ) { }

  [Symbol.dispose]() {
    this.value[Symbol.dispose]()
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

}