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

class Resource implements Disposable {

  disposed = false;

  [Symbol.dispose]() {
    console.log("disposed lol")
    this.disposed = true
  }

}

await test("holder", async ({ test, message }) => {
  console.log(message)
  const r = new Resource()
  const box = new Box(r)

  {
    using a = new A(box)
    using b = a.toB()
  }

  assert(r.disposed)
})

await test("greed", async ({ test, message }) => {
  console.log(message)

  const r = new Resource()

  function take(box: Box<Resource>) {
    using box2 = box.moveIfNotMoved()
    assert(!box2.inner.disposed)
  }

  /**
   * This block will keep ownership of the box
   */
  {
    using box = new Box(r)

    take(box.greed())
    take(box.greed())

    assert(!r.disposed)
  }

  assert(r.disposed)
})
