export interface Wrapped<T extends Disposable> {
  get(): T
}

export interface AsyncWrapped<T extends AsyncDisposable> {
  get(): T
}