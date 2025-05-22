import "@hazae41/symbol-dispose-polyfill";

import { assert, test } from "@hazae41/phobos";
import { Borrow } from "mods/borrow/index.js";
import { Box } from "./index.js";

class Resource implements Disposable {

  disposed = false;

  [Symbol.dispose]() {
    this.disposed = true
  }

}

class A<T extends Disposable> {

  constructor(
    readonly value: Box<T>
  ) { }

  [Symbol.dispose]() {
    this.value[Symbol.dispose]()
  }

  toB() {
    return new B(this.value.moveOrThrow())
  }

}

class B<T extends Disposable> {

  constructor(
    readonly value: Box<T>
  ) { }

  [Symbol.dispose]() {
    this.value[Symbol.dispose]()
  }

  toA() {
    return new A(this.value.moveOrThrow())
  }

}

await test("holder", async ({ test, message }) => {
  console.log(`--- ${message} ---`)

  console.log(message)

  const resource = new Resource()
  const box = Box.from(resource)

  {
    using a = new A(box)
    using b = a.toB()
  }

  assert(resource.disposed)
})

await test("dummy", async ({ test, message }) => {
  console.log(`--- ${message} ---`)

  const resource = new Resource()

  /**
   * This block will keep ownership of the box
   */
  {
    using box = Box.from(resource)

    assert(!resource.disposed)
  }

  assert(resource.disposed)
})

await test("borrow", async ({ test, message }) => {
  console.log(`--- ${message} ---`)

  const resource = new Resource()

  async function borrow(parent: Box<Resource>) {
    using borrow = parent.borrowOrThrow()
    const value = borrow.getOrThrow()

    assert(value === resource)

    borrow2(borrow)

    assert(borrow.borrowed === true)

    await new Promise(ok => setTimeout(ok, 1000))

    assert(parent.dropped === true)

    console.log("returning first borrow")
  }

  async function borrow2(parent: Borrow<Resource>) {
    using borrow = parent.borrowOrThrow()
    const value = borrow.getOrThrow()

    assert(value === resource)

    await new Promise(ok => setTimeout(ok, 2000))

    assert(parent.dropped === true)

    console.log("returning second borrow")
  }

  {
    using box = Box.from(resource)

    borrow(box)

    assert(box.borrowed === true)
  }

  await new Promise(ok => setTimeout(ok, 5000))

  assert(resource.disposed)
})