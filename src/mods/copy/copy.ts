export type BytesOrCopiable<N extends number = number> =
  | Uint8Array & { readonly length: N }
  | Copiable<Uint8Array & { readonly length: N }>

/**
 * An object whose bytes can be copied
 */
export interface Copiable<T extends Uint8Array = Uint8Array> extends Disposable {

  /**
   * Disposable bytes
   */
  readonly bytes: T

  /**
   * Copy and dispose bytes
   */
  copyAndDispose(): T

  /**
   * Free
   */
  free(): void

  /**
   * Free on next tick
   */
  freeNextTick(): this

}

export namespace Copiable {

  export type Infer<T> = Copiable<Bytes<T>>

  export type Bytes<T> = T extends Copiable<infer U> ? U : never

}

/**
 * A copiable whose bytes are already copied
 */
export class Copied<T extends Uint8Array = Uint8Array> implements Copiable<T> {

  /**
   * A copiable whose bytes are already copied
   * @param bytes 
   */
  constructor(
    readonly bytes: T
  ) { }

  [Symbol.dispose]() { }

  static new<T extends Uint8Array>(bytes: T) {
    return new Copied(bytes)
  }

  copyAndDispose() {
    return this.bytes
  }

  free(): void {
    return
  }

  freeNextTick(): this {
    return this
  }

}