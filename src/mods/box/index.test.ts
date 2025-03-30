import "@hazae41/symbol-dispose-polyfill";

import { assert, test } from "@hazae41/phobos";
import { Box } from "./index.js";

class Resource implements Disposable {

  disposed = false;

  [Symbol.dispose]() {
    this.disposed = true
  }

}

class A<T extends Disposable> {

  constructor(
    readonly inner: Box<T>
  ) { }

  [Symbol.dispose]() {
    this.inner[Symbol.dispose]()
  }

  toB() {
    return new B(this.inner.moveOrThrow())
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
    return new A(this.inner.moveOrThrow())
  }

}

await test("holder", async ({ test, message }) => {
  console.log(`--- ${message} ---`)

  console.log(message)

  const resource = new Resource()
  const box = new Box(resource)

  {
    using a = new A(box)
    using b = a.toB()
  }

  assert(resource.disposed)
})

await test("dummy", async ({ test, message }) => {
  console.log(`--- ${message} ---`)

  const resource = new Resource()

  function take(box: Box<Resource>) {
    assert(box.moved === true)
  }

  /**
   * This block will keep ownership of the box
   */
  {
    using box = new Box(resource)

    take(Box.createAsMoved(box.getOrThrow()))
    take(Box.createAsMoved(box.getOrThrow()))

    assert(!resource.disposed)
  }

  assert(resource.disposed)
})

await test("borrow", async ({ test, message }) => {
  console.log(`--- ${message} ---`)

  const resource = new Resource()

  async function borrow(box: Box<Resource>) {
    using borrow = box.borrowOrThrow()
    const inner = borrow.getOrThrow()

    assert(inner === resource)

    await new Promise(ok => setTimeout(ok, 1000))

    assert(box.borrowed === true)
  }

  {
    using box = new Box(resource)

    borrow(box)

    await box.resolveOnReturn

    assert(box.borrowed === false)
  }

  assert(resource.disposed)
})