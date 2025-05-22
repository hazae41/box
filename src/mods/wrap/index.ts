export interface Wrap<T> extends Disposable {
  get(): T
}

export interface Wrap<T> extends AsyncDisposable {
  get(): T
}