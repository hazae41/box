/**
 * A reference that will be disposed after some delay
 */
export class Tick<T extends Disposable> {

  #timeout: NodeJS.Timeout

  /**
   * A reference that will be disposed after some delay
   * @param inner 
   * @param delay 
   */
  constructor(
    readonly inner: T,
    readonly delay = 0
  ) {
    this.#timeout = setTimeout(() => this.inner[Symbol.dispose](), delay)
  }

  [Symbol.dispose]() {
    clearTimeout(this.#timeout)
  }

  get() {
    return this.inner
  }

  unwrap() {
    using _ = this
    return this.inner
  }

}

/**
 * A reference that will be disposed after some delay
 */
export class AsyncTick<T extends AsyncDisposable> {

  #timeout: NodeJS.Timeout

  /**
   * A reference that will be disposed after some delay
   * @param inner 
   * @param delay 
   */
  constructor(
    readonly inner: T,
    readonly delay = 0
  ) {
    this.#timeout = setTimeout(() => this.inner[Symbol.asyncDispose]().then(undefined, console.error), delay)
  }


  [Symbol.dispose]() {
    clearTimeout(this.#timeout)
  }

  get() {
    return this.inner
  }

  unwrap() {
    using _ = this
    return this.inner
  }

}