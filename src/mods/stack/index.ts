/**
 * A stack of disposable objects
 */
export class Stack<T> {

  /**
   * A stack of disposable objects
   */
  constructor(
    readonly array: T[] = []
  ) { }

  [Symbol.dispose](this: Stack<Disposable>) {
    for (const value of this.array)
      value[Symbol.dispose]?.()
    //
  }

  async [Symbol.asyncDispose](this: Stack<AsyncDisposable>) {
    for (const value of this.array)
      await value[Symbol.asyncDispose]?.()
    //
  }

  push(value: T) {
    this.array.push(value)
  }

}
