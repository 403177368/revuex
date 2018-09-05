// @flow

var redux;

export function use(ref) {
  redux = ref;
}

export function getRedux() {
  if (!redux) {
  	// throw new Error('[revuex] Must register redux first!');
  }
  return redux;
}
