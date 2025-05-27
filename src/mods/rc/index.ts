import { Deferred } from "mods/deferred/index.js"
import { Wrap } from "mods/wrap/index.js"

export class Rc<T> {

  constructor(
    readonly value: T,
    readonly clean: Disposable,
    readonly count: { value: number }
  ) { }

  static wrap<T extends Disposable>(value: T) {
    return new Rc(value, value, { value: 0 })
  }

  static from<T>(value: Wrap<T>) {
    return new Rc(value.get(), value, { value: 0 })
  }

  static with<T>(value: T, clean: (value: T) => void) {
    return new Rc(value, new Deferred(() => clean(value)), { value: 0 })
  }

  [Symbol.dispose]() {
    this.clean[Symbol.dispose]()
  }

  async [Symbol.asyncDispose]() {
    this[Symbol.dispose]()
  }

  get() {
    return this.value
  }

  getAndDispose() {
    this[Symbol.dispose]()

    return this.value
  }

}