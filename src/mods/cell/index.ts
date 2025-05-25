/**
 * An interior mutable reference
 */
export class Cell<T extends Disposable> {

  /**
   * A mutable reference
   * @param value 
   */
  constructor(
    public value: T
  ) { }

  [Symbol.dispose]() {
    this.value[Symbol.dispose]()
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  get() {
    return this.value
  }

  set(value: T) {
    this.value = value
  }

  getAndSet(value: T) {
    const old = this.value
    this.value = value
    return old
  }

  getAndDispose() {
    this[Symbol.dispose]()

    return this.value
  }

}

export class AsyncCell<T extends AsyncDisposable> {

  /**
   * A mutable reference
   * @param value 
   */
  constructor(
    public value: T
  ) { }

  async [Symbol.asyncDispose]() {
    await this.value[Symbol.asyncDispose]()
  }

  get() {
    return this.value
  }

  set(value: T) {
    this.value = value
  }

  getAndSet(value: T) {
    const old = this.value
    this.value = value
    return old
  }

  async getAndDispose() {
    await this[Symbol.asyncDispose]()

    return this.value
  }

}