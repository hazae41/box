# Box

Rust-like Box for TypeScript

```bash
npm i @hazae41/box
```

[**Node Package 📦**](https://www.npmjs.com/package/@hazae41/box)

## Features

### Current features
- 100% TypeScript and ESM
- No external dependencies
- Similar to Rust
- Can hold data
- Unit-tested

## Usage

### Box<T>

A reference that can be unset

```typescript
import { Box } from "@hazae41/box"

class Resource {

  [Symbol.dispose]() { 
    console.log("This should only happen once")
  }

}

/**
 * Resource will only be disposed once
 */
{
  using box = new Box(new Resource())
  using box2 = box.moveOrThrow()
}
```

### Slot<T>

A reference that can change

```tsx
class Pointer {

  constructor(
    readonly value: number
  ) {}

  [Symbol.dispose]() {
    free(this.value)
  }

  plus(pointer: Pointer) {
    return new Pointer(this.value + pointer.value)
  }

}

class Null extends Pointer {
  
  [Symbol.dispose]() {}

}

function* getPointersOrThrow() {
  yield new Pointer(123)
  yield new Pointer(456)
  throw new Error()
  yield new Pointer(789)
}

{
  using result = new Slot(new Null())

  for (const pointer of getPointersOrThrow()) {
    using a = pointer
    const b = result.get()

    result.set(a.plus(b))

    using _ = b
  }

  console.log(result.get().value)
}
```

The slot is correctly disposed if `getNumbersOrThrow()` throws in the midst of the loop

### Auto<T>

A reference that will be disposed when garbage collected

```tsx
class Pointer {

  constructor(
    readonly value: number
  ) {}

  [Symbol.dispose]() {
    free(this.value)
  }

}

class MyObject {

  constructor(
    readonly pointer: Auto<Pointer>
  ) {}

  something() {
    something(this.pointer.get().value)
  }

}

{
  const pointer = new Auto(new Pointer(123))
  const object = new MyObject(pointer)
}
```

The pointer will be freed when the object will be garbage collected

But `Auto<T>` can be disposed to unregister itself from garbage collection

```tsx
function unwrap<T extends Disposable>(auto: Auto<T>) {
  using _ = auto
  return auto.get()
}

const raw = new Pointer(123)
const auto = new Auto(raw)
using raw2 = unwrap(auto)
```

The pointer will need to be manually freed

You can also use `.unwrap()` to do this

```tsx
const raw = new Pointer(123)
const auto = new Auto(raw)
using raw2 = auto.unwrap()
```