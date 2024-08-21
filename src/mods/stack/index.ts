/**
 * A stack of disposable objects
 */
export class Stack {

  #stack = new Array<Disposable>()

  /**
   * A stack of disposable objects
   */
  constructor() { }

  [Symbol.dispose]() {
    for (const value of this.#stack) {
      using _ = value
    }
  }

  push(value: Disposable) {
    this.#stack.push(value)
  }

}

/**
 * A stack of disposable objects
 */
export class AsyncStack {

  #stack = new Array<AsyncDisposable>()

  /**
   * A stack of disposable objects
   */
  constructor() { }

  async [Symbol.asyncDispose]() {
    for (const value of this.#stack) {
      await using _ = value
    }
  }

  push(value: AsyncDisposable) {
    this.#stack.push(value)
  }

}