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

An ownable reference

```typescript
import { Box } from "@hazae41/box"

class Resource {

  [Symbol.dispose]() { 
    console.log("Disposed")
  }

}

async function borrow(box: Box<Resource>) {
  using borrow = box.borrowOrThrow()
  const resource = borrow.getOrThrow()

  await doSomethingOrThrow(resource)

  // Returned to owner here
}

async function move(box: Box<Resource>) {
  using box2 = box.moveOrThrow()
  const resource = box2.getOrThrow()

  await doSomethingOrThrow(resource)

  // Disposed here
}

/**
 * Resource will only be disposed after the promise settles
 */
{
  using box = new Box(new Resource())

  // Won't take ownership
  const borrowed = borrow(box)
  console.log(box.borrowed) // true
  await borrowed

  // Will take ownership
  move(box).catch(console.error)

  // Not disposed here
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

Everything is correctly disposed if `getPointersOrThrow()` throws in the midst of the loop

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

### `Deferred<T>`

A reference to a callback that will be called when disposed

```tsx
function waitOrThrow(socket: WebSocket) {
  const future = new Future<void>()

  const onOpen = () => future.resolve()
  
  socket.addEventListener("open", onOpen, { passive: true })
  using _0 = new Deferred(() => socket.removeEventListener("open", onOpen))

  const onClose = () => future.reject(new Error("Closed"))

  socket.addEventListener("close", onClose, { passive: true })
  using _1 = new Deferred(() => socket.removeEventListener("close", onClose))

  const onError = () => future.reject(new Error("Errored"))

  socket.addEventListener("error", onError, { passive: true })
  using _2 = new Deferred(() => socket.removeEventListener("error", onError))

  return await future.promise
}
```

### `Stack<T>`

A stack of disposable objects

```tsx
using stack = new Stack()

stack.push(new Resource())

stack.push(new Deferred(() => console.log("Disposed")))
```

You can also imitate `DisposableStack` behaviour with `Box<Once<Stack>>`

```tsx
using stack = new Box(new Once(new Stack()))

stack.getOrThrow().get().push(new Resource())

stack.getOrThrow().get().push(new Deferred(() => console.log("Disposed")))

using stack2 = stack.moveOrThrow()
```

Or just `Box<Stack>`

```tsx
using stack = new Box(new Stack())

stack.getOrThrow().push(new Resource())

stack.getOrThrow().push(new Deferred(() => console.log("Disposed")))

using stack2 = stack.moveOrThrow()
```

### Why not use `DisposableStack`?

DisposableStack already combines many of these concepts. 

You can see `DisposableStack` as a `Box<Once<Stack>>`.

But using `DisposableStack` can lead to many issues in your code.

1. You can opt-out `Box<T>` behavior

When you use `DisposableStack`, you allow the developer to use `move()`

This makes your code unpredictable if you didn't expect a `DisposableStack` to be moved.

When you get passed a `DisposableStack` you have to check if it is not moved.

While this may be useful in some situations, it may lead to unnecessary code.

Whereas when using `Box<Stack>`, you explicitly allow it to be moved.

And when just using `Stack`, you explicitly disallow it to be moved.

2. You can opt-out `Once<T>` behavior

When you use `DisposableStack`, you can only dispose it once.

While it prevents bugs related to double-dispose, it can prevent other bugs from being discovered.

You're not supposed to dispose a resource multiple times, and doing so is a bug from a logic issue.

When using `DisposableStack`, you allow this bug to remain undiscovered because `Once<T>` protects you.

When just using `Stack`, you can fix your code to avoid double-dispose instead of relying on this protection.

3. You can use code that accepts `Box<T>`

Suppose we have an external function that accepts any `Box<T>`.

When using `DisposableStack` as `T`, you have to wrap it into `Box<DisposableStack>`.

This leads to extra burden because the stack can be moved twice.

Once in `Box<T>` and once in `DisposableStack`.

Whereas when using `Box<Stack>` it can only be moved once.

4. You can use code that accepts `Once<T>`

Same with `Once<DisposableStack>` instead of `Once<Stack>`.

You have two different ways of checking if the stack has already been disposed.

This leads to extra code, extra logic burden, and possibly unexpected behavior.

When you use the standardized `Once<T>` in all your code, you are safe from this.