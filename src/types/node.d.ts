declare module 'node:console' {
  global {
    interface Console {
      pipe: <Value>(value: Value, ...rest: any[]) => Value;
    }
  }
}
