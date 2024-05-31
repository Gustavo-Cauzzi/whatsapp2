console.pipe = <Value>(value: Value, ...rest: any[]) => {
  console.log(value, ...rest);
  return value;
};
