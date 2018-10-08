// @flow
import { use } from './functions.js';
import { Store } from './Store.js';

/**
 * Create a revuex store.
 * @param {Object}
 * @returns {Store}
 */
function createStore(options: Object) {
  return new Store(options);
}

var Revuex = {
  use,
  createStore
};

export default Revuex;
