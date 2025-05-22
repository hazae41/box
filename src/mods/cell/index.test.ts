import { test } from "@hazae41/phobos"
import { Cell } from "./index.js"

function alloc(value: number) {
  console.log(`alloc(${value})`)
}

function free(value: number) {
  console.log(`free(${value})`)
}

class Pointer {

  constructor(
    readonly value: number
  ) {
    alloc(value)
  }

  [Symbol.dispose]() {
    free(this.value)
  }

  plus(pointer: Pointer) {
    return new Pointer(this.value + pointer.value)
  }

}

function* getPointersOrThrow() {
  yield new Pointer(123)
  yield new Pointer(456)
  console.log("throwing")
  throw new Error()
  yield new Pointer(789)
}

await test("slot", async ({ test, message }) => {
  try {
    console.log(`--- ${message} ---`)

    using result = new Cell(new Pointer(1))

    for (const pointer of getPointersOrThrow()) {
      using a = pointer
      const b = result.get()

      result.set(a.plus(b))

      using _ = b
    }

    console.log(result.get().value)
  } catch { }
})