# Box and its friends

Rust-like Box and similar objects for TypeScript

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
- Composable
- Unit-tested

## Usage

### `Box<T>`

A movable reference

```typescript
import { Box } from "@hazae41/box"

class Resource {

  [Symbol.dispose]() { 
    console.log("Disposed")
  }

}

async function take(box: Box<Resource>) {
  using box2 = box.moveOrThrow()
  await doSomethingOrThrow()
}

/**
 * Resource will only be disposed after the promise settles
 */
{
  using box = new Box(new Resource())
  take(box).catch(console.error)
}
```

### `Slot<T>`

A mutable reference

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

function* getPointersOrThrow() {
  yield new Pointer(123)
  yield new Pointer(456)
  throw new Error()
  yield new Pointer(789)
}

{
  using result = new Slot(new Pointer(1))

  for (const pointer of getPointersOrThrow()) {
    using a = pointer
    const b = result.get()

    result.set(a.plus(b))

    using _ = b
  }

  console.log(result.get().value)
}
```

Everything is correctly disposed if `getNumbersOrThrow()` throws in the midst of the loop

### `Auto<T>`

A reference that will be disposed when garbage collected

These references are NOT guaranteed to be disposed

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

---

An auto can be disposed to unregister itself from garbage collection

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

### `Tick<T>`

A reference that will be disposed after some delay

These references are guaranteed to be disposed

```tsx
{
  const pointer = new Tick(new Pointer(123))

  await doSomethingOrThrow()

  // Pointer is guaranteed to be freed here
}
```

This is useful to prevent WebAssembly memory from growing without using `using`

### `Once<T>`

A reference that can only be disposed once

```tsx
class Socket {

  constructor(
    readonly socket: WebSocket
  ) {}

  [Symbol.dispose]() {
    this.socket.close()
  }

  get() {
    return this.socket
  }

}

function terminate(socket: Once<Socket>) {
  using _ = socket
  
  socket.get().send("closing")
}

{
  const socket = new Auto(new Once(new Socket(raw)))

  if (something) {
    terminate(socket.get())
    return
    // Will be closed here
  } 
  
  // Will be closed on garbage collection
}
```

This can enable mixed behaviour where a resource can be disposed on demand or disposed on garbage collection