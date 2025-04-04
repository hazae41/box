/**
 * A mutable reference
 */
export class Slot<T extends Disposable> {

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

  static create<T extends Disposable>(value: T) {
    return new Slot(value)
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

}

export class AsyncSlot<T extends AsyncDisposable> {

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

  static create<T extends AsyncDisposable>(value: T) {
    return new AsyncSlot(value)
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

}