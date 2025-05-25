/**
 * A stack of disposable objects
 */
export class Stack<T extends Disposable> {

  /**
   * A stack of disposable objects
   */
  constructor(
    readonly array: T[] = []
  ) { }

  [Symbol.iterator]() {
    return this.array[Symbol.iterator]()
  }

  [Symbol.dispose](this: Stack<Disposable>) {
    for (const value of this.array)
      value[Symbol.dispose]()
    //
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  push(value: T) {
    this.array.push(value)
  }

}

export class AsyncStack<T extends AsyncDisposable> {

  /**
   * A stack of disposable objects
   */
  constructor(
    readonly array: T[] = []
  ) { }

  [Symbol.iterator]() {
    return this.array[Symbol.iterator]()
  }

  async [Symbol.asyncDispose]() {
    for (const value of this.array)
      await value[Symbol.asyncDispose]()
    //
  }

  push(value: T) {
    this.array.push(value)
  }

}

