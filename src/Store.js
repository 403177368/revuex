// @flow
import { getRedux } from './functions.js';
import { Module } from './Module.js';

export class Store {
  _rootModule: Module;
  _creatorsMap: Object;
  _reduxStore;

  constructor(options) {
    if (!options.redux) {
      throw new Error('[revuex] \'Redux\' must be assigned to options.redux');
    }
    this.redux = options.redux;
    this.modulesMap = {};
    this._creatorsMap = {};
    this._rootModule = new Module([], options, this);
    this._reduxStore = this.redux.createStore(
      this._rootModule.reducer, undefined
    );
    this.getState = this._reduxStore.getState;
    this.subscribe = this._reduxStore.subscribe;
    // Object.assign(this, this._reduxStore);
  }
  // Invoke an action-creator
  invoke(path: string, payload: Object) {
    var self = this;
    console.log('[revuex] Invoking action creator: ' + path);
    if (!this._creatorsMap[path]) {
      throw new Error('[revuex] Unknown action creator: ' + path + '.');
    }
    var arr = path.split('/');
    arr.pop();
    var modulePath = arr.join('/');
    var ctx = {
      // dispatch: store.dispatch,
      invoke(key: string, payload: Object | null, options?: Object) {
        if (options && options.root) {
          return self.invoke(key, payload);
        } else {
          return self.invoke(modulePath + '/' + key, payload);
        }
      },
      // dispatch function passed to a creator:
      dispatch(key: string, payload: Object | null, options?: Object) {
        // In case that payload is null:
        var action = payload || {};
        if (options && options.root) {
          action.type = key;
          return self._reduxStore.dispatch(action);
        } else {
          // Complete the action type:
          // Make this action a global action:
          // console.log('\n' + modulePath);
          action.type = (
            modulePath === '' ? '' : (modulePath + '/')) + key;
          return self._reduxStore.dispatch(action);
        }
      }
    };
    Object.defineProperty(ctx, 'rootState', {
      enumerable: true,
      configurable: true,
      // writable: elKey?true:false,,
      get() {
        return self._reduxStore.getState();
      },
      set() {
        throw new Error('[revuex] The state must not be mutated.');
      }
    });
    Object.defineProperty(ctx, 'state', {
      enumerable: true,
      configurable: true,
      // writable: elKey?true:false,,
      get() {
        var state = self._reduxStore.getState();
        arr.forEach(a => {
          state = state[a];
        });
        return state;
      },
      set() {
        throw new Error('[revuex] The state must not be mutated.');
      }
    });

    return self._creatorsMap[path](ctx, payload);
  }
  // Dispatch an action
  dispatch(path: string, payload = {}) {
    var action = payload;
    action.type = path;
    this._reduxStore.dispatch(action);
  }
  // Ensure the given module is installed to the given path
  ensure(pathArr: Array<string>, rawModule: Object) {
    this.registerModule(pathArr: Array<string>, rawModule: Object);
  }
  // Register a module to the given path
  registerModule(pathArr: Array<string>, rawModule: Object) {
    if (!Array.isArray(pathArr)) {
      throw new Error(
        `[revuex] Expect pathArr to be an array but get ${pathArr.toString()}`
      );
    }
    var path = pathArr.join('/');
    if (!this.modulesMap[path]) {
      console.log('[revuex] Registering module ' + path);
      var module = new Module(pathArr, rawModule, this);
      // Update this module's ancestors' internalReducer and reducer:
      while (module.parent) {
        module.parent.updateReducer();
        module = module.parent;
      }
      // var nextReducer = getNextReducer(rootModule);
      // store.replaceReducer(rootModule.reducer);
      // console.log(this.modulesMap);
    }
  }
}
