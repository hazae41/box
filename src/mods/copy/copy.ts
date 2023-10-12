/**
 * An object whose bytes can be copied
 */
export interface Copiable<T = Uint8Array> extends Disposable {

  /**
   * Disposable bytes
   */
  readonly bytes: T

  /**
   * Copy and dispose bytes
   */
  copyAndDispose(): T

}

export namespace Copiable {

  export type Infer<T> = Copiable<Bytes<T>>

  export type Bytes<T> = T extends Copiable<infer U> ? U : never

}

/**
 * A copiable whose bytes are already copied
 */
export class Copied<T = Uint8Array> implements Copiable<T> {

  /**
   * A copiable whose bytes are already copied
   * @param bytes 
   */
  constructor(
    readonly bytes: T
  ) { }

  [Symbol.dispose]() { }

  static new<T>(bytes: T) {
    return new Copied(bytes)
  }

  copyAndDispose() {
    return this.bytes
  }

}