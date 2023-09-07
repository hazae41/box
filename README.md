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
- Uses Result from `@hazae41/result`

## Usage

The `Box<T extends Disposable>` will:
- hold a disposable object `T`
- only dispose the object if it still owns it
- no longer own it if the box is moved

```typescript
import { Box } from "@hazae41/box"

class D {
  [Symbol.dispose]() { 
    console.log("it should only happen once")
  }
}

/**
 * At the end of this block, D will only be disposed once
 */
{
  using box = new Box(new D())
  using box2 = box.move()
}
```
