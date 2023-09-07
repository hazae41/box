import { assert, test } from "@hazae41/phobos"
import "@hazae41/symbol-dispose-polyfill"
import { Box } from "./box.js"

class A<T extends Disposable> {

  constructor(
    readonly inner: Box<T>
  ) { }

  [Symbol.dispose]() {
    this.inner[Symbol.dispose]()
  }

  toB() {
    return new B(this.inner.move())
  }

}

class B<T extends Disposable> {

  constructor(
    readonly inner: Box<T>
  ) { }

  [Symbol.dispose]() {
    this.inner[Symbol.dispose]()
  }

  toA() {
    return new A(this.inner.move())
  }

}

class C implements Disposable {

  disposed = false;

  [Symbol.dispose]() {
    console.log("disposed lol")
    this.disposed = true
  }

}

test("test", async ({ test, message }) => {
  const c = new C()
  const box = new Box(c)

  {
    using a = new A(box)
    using b = a.toB()
  }

  assert(c.disposed)
})

