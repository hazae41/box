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

## Rules

1. You can't pass a disposable object without wrapping it in a Box
2. You can't hold a disposable object without wrapping it in a Box
3. You can't hold a Box without owning it and disposing it after
4. You can't return a Box without unwrapping it

This means the typical object holding a Box looks like this

```tsx
class MyWrapper<T extends Disposable> {

  private constructor(
    /**
     * Rule 2. hold as box
     **/
    readonly box: Box<T>
  ) {}

  [Symbol.dispose]() {
    /**
     * Rule 3. dispose any box you hold
     **/
    this.box[Symbol.dispose]()
  }

  static create<T extends Disposable>(box: Box<T>) {
    /**
     * Rule 3. own any box you want to hold
     **/
    return new MyWrapper(box.move())
  }

  use() {
    /**
     * Rule 1. only pass as box
     **/
    something(this.box)
  }

  export(): T {
    /**
     * Rule 4. unwrap on return
     **/
    return this.box.unwrap()
  }

}
```
