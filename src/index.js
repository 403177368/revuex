// @flow
import { use } from './functions.js';
import { Store } from './Store.js';

// Organize your react/redux application in the vuex way.

/*
API Reference
  createStore(options): Store
    Arguments
  	Returns
  Store
	ensure(path: Array<string>)
  	dispatch(path: string, payload)
*/

/**
 * Create a revuex store.
 * @param {Object}
 * @returns 
 */
function createStore(options: Object) {
  return new Store(options);
}

var Revuex = {
  use,
  createStore
};

export default Revuex;
