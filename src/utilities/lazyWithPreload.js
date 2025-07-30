// src/utilities/lazyWithPreload.js
export function lazyWithPreload(factory) {
  const C = React.lazy(factory);
  C.preload = factory;
  return C;
}
