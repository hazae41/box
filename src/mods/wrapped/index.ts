export interface Wrapped<T extends Disposable> extends Disposable {
  get(): T
}

export interface AsyncWrapped<T extends AsyncDisposable> extends AsyncDisposable {
  get(): T
}