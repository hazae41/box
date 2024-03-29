import { assert, test } from "@hazae41/phobos"
import "@hazae41/symbol-dispose-polyfill"
import { Copiable } from "index.js"
import { Box } from "./box.js"

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

class Resource implements Disposable {

  disposed = false;

  [Symbol.dispose]() {
    console.log("disposed lol")
    this.disposed = true
  }

}

class Slice implements Disposable, Copiable {

  constructor(
    readonly bytes: Uint8Array
  ) { }

  disposed = false;

  [Symbol.dispose]() {
    this.free()
  }

  free(): void {
    console.log("disposed lol")
    this.disposed = true
  }

  freeNextTick(): this {
    setTimeout(() => this.free(), 0)
    return this
  }

  copyAndDispose() {
    this.free()
    return this.bytes
  }

}

await test("holder", async ({ test, message }) => {
  console.log(message)
  const resource = new Resource()
  const box = new Box(resource)

  {
    using a = new A(box)
    using b = a.toB()
  }

  assert(resource.disposed)
})

await test("greed", async ({ test, message }) => {
  console.log(message)

  const resource = new Resource()

  function take(box: Box<Resource>) {
    assert(box.moved === true)
  }

  /**
   * This block will keep ownership of the box
   */
  {
    using box = new Box(resource)

    take(box.greed())
    take(box.greed())

    assert(!resource.disposed)
  }

  assert(resource.disposed)
})

await test("copyAndDispose", async ({ test, message }) => {
  console.log(message)

  const slice = new Slice(new Uint8Array([1, 2, 3]))
  const box = new Box(slice)
  box.unwrapOrThrow().copyAndDispose()
  assert(slice.disposed)
})

