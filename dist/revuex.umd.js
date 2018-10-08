/*
 * Revuex v0.0.11 
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Revuex = factory());
}(this, (function () { 'use strict';

  function use(ref) {
  }

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  // import { getRedux } from './functions.js';

  var Module = function () {
    function Module(path, rawModule, store) {
      classCallCheck(this, Module);

      this.store = store;
      if (!Array.isArray(path)) {
        throw new Error('[revuex] Expect module path to be an array.');
      }

      if (path.length === 0) {
        this.isRoot = true;
        this.name = '@@root';
        this.path = '@@root';
      } else {
        this.isRoot = false;
        this.name = path[path.length - 1];
        if (path.length === 1) {
          this.path = path[0];
        } else {
          this.path = path.join('/');
        }
      }

      // Put this module into modulesMap.
      store.modulesMap[this.path] = this;
      // console.log(this.path)

      // Set parent for this module:
      var parentPath;
      var parentModule;
      if (path.length === 0) {
        parentModule = null;
      } else if (path.length === 1) {
        parentModule = store.modulesMap['@@root'];
      } else {
        var arr = path.slice();
        arr.pop();
        parentPath = arr.join('/');
        parentModule = store.modulesMap[parentPath];
      }

      this.parent = parentModule;
      if (parentModule) {
        parentModule.modules[this.name] = this;
        // console.log(parentModule);
        // if (parentModule.childrenKeys.indexOf(this.name) === -1) {
        //   parentModule.childrenKeys.push(this.name);
        // }
      }

      // Create and set children for this module:
      this.modules = {};
      // this.childrenKeys = [];
      if (rawModule.modules) {
        for (var key in rawModule.modules) {
          // Create the children modules:
          var childPath = path.slice();
          childPath.push(key);
          this.modules[key] = new Module(childPath, rawModule.modules[key], store);
        }
      }

      // this.state = rawModule.state || {};

      this.initialState = rawModule.state || {};
      this.indexState;
      this.childrenState;
      // Create internalReducer and wrapperReducer for this module:
      this.initReducer(rawModule);

      // Register the creators:
      this.creators = rawModule.creators || {};
      for (var _key in this.creators) {
        if (this.isRoot) {
          Object.assign(store._creatorsMap, this.creators);
        } else {
          store._creatorsMap[this.path + '/' + _key] = this.creators[_key];
        }
      }

      this.handlers = rawModule.actions || {};
    }
    // Children modules


    createClass(Module, [{
      key: 'initReducer',
      value: function initReducer(rawModule) {
        // this.indexReducer =
        //   rawModule.reducer ||
        //   function(state, action) {
        //     if (!state) {
        //       state = self.state;
        //     }
        //     return state;
        //   };
        // this.childrenReducer = function(state, action) {
        //   return state;
        // };
        this.updateReducer();
      }
      // internalReducer and reducer of this module must be updated when a new child module is installed.

    }, {
      key: 'updateReducer',
      value: function updateReducer() {
        var self = this;
        self.indexReducer = function (state, action) {
          if (!self.handlers[action.type]) {
            return state;
          } else {
            return self.handlers[action.type](state, action);
          }
        };

        var childrenKeys = Object.keys(self.modules) || [];
        if (childrenKeys.length > 0) {
          var reducers = {};
          for (var key in this.modules) {
            reducers[key] = this.modules[key].reducer;
          }
          // Combine wrapper reducers of the children into a children reducer for this module:
          self.childrenReducer = self.store.redux.combineReducers(reducers);
        } else {
          self.childrenReducer = function (state, action) {
            return state;
          };
        }

        self.reducer = function (state, action) {
          if (self.isRoot) {
            console.log('\nReducing: ' + action.type);
          }
          if (state === void 0) {
            state = self.initialState;
          }

          if (action.type) {
            var indexState;
            var childrenState;
            if (state) {
              if (state.toString() !== '[object Object]') {
                throw new Error('[revuex] State of a module must be a plain object!');
              } else {
                // Split the state into indexState and childrenState
                indexState = {};
                childrenState = {};
                for (var _key2 in state) {
                  if (self.modules[_key2]) {
                    childrenState[_key2] = state[_key2];
                  } else {
                    indexState[_key2] = state[_key2];
                  }
                }
              }
            }

            // If path of this module is matched in action.type:
            var rawType = action.type;
            var arr = action.type.split('/');
            var name = arr.pop();
            var path = arr.join('/') || '@@root';
            var nextState;

            // if (path === 'item') {
            //   console.log(self.path + ' indexState', indexState);
            // }
            // console.log('path: ', path);
            // console.log('reducing: ' + action.type);

            if (path === self.path) {
              console.log('[revuex] path \'' + path + '\' matched action: ' + action.type);
              // Remove the prefix:
              action.type = name;
              indexState = self.indexReducer(indexState, action);
              action.type = rawType;
              childrenState = self.childrenReducer(childrenState, action);

              nextState = self.mergeState(indexState, childrenState);

              // return (self.state = nextState);
              return nextState;
            } else {
              // Make sure not to change the state.
              indexState = self.indexReducer(indexState, action);

              childrenState = self.childrenReducer(childrenState, action);

              nextState = self.mergeState(indexState, childrenState);
              // return (self.state = nextState);
              return nextState;
              // throw new Error('[revuex] Invalid action type: ' + action.type + '.');
            }
          } else {
            throw new Error('[revuex] Action needs a type field.');
          }
        };
      }
    }, {
      key: 'mergeState',
      value: function mergeState(indexState, childrenState) {
        var state = {};
        for (var key in indexState) {
          if (this.modules[key]) {
            throw new Error('[revuex] Duplicated state key "' + key + '" in module "' + this.path + '".\'');
          }
          state[key] = indexState[key];
        }
        for (var _key3 in childrenState) {
          state[_key3] = childrenState[_key3];
        }
        return state;
      }
    }]);
    return Module;
  }();

  var Store = function () {
    function Store(options) {
      classCallCheck(this, Store);

      if (!options.redux) {
        throw new Error('[revuex] \'Redux\' must be assigned to options.redux');
      }
      this.redux = options.redux;
      this.modulesMap = {};
      this._creatorsMap = {};
      this._rootModule = new Module([], options, this);
      this._reduxStore = this.redux.createStore(this._rootModule.reducer, undefined);
      this.getState = this._reduxStore.getState;
      this.subscribe = this._reduxStore.subscribe;
      // Object.assign(this, this._reduxStore);
    }
    // Invoke an action-creator


    createClass(Store, [{
      key: 'invoke',
      value: function invoke(path, payload) {
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
          invoke: function invoke(key, payload, options) {
            if (options && options.root) {
              return self.invoke(key, payload);
            } else {
              return self.invoke(modulePath + '/' + key, payload);
            }
          },

          // dispatch function passed to a creator:
          dispatch: function dispatch(key, payload, options) {
            // In case that payload is null:
            var action = payload || {};
            if (options && options.root) {
              action.type = key;
              return self._reduxStore.dispatch(action);
            } else {
              // Complete the action type:
              // Make this action a global action:
              // console.log('\n' + modulePath);
              action.type = (modulePath === '' ? '' : modulePath + '/') + key;
              return self._reduxStore.dispatch(action);
            }
          }
        };
        Object.defineProperty(ctx, 'rootState', {
          enumerable: true,
          configurable: true,
          // writable: elKey?true:false,,
          get: function get$$1() {
            return self._reduxStore.getState();
          },
          set: function set$$1() {
            throw new Error('[revuex] The state must not be mutated.');
          }
        });
        Object.defineProperty(ctx, 'state', {
          enumerable: true,
          configurable: true,
          // writable: elKey?true:false,,
          get: function get$$1() {
            var state = self._reduxStore.getState();
            arr.forEach(function (a) {
              state = state[a];
            });
            return state;
          },
          set: function set$$1() {
            throw new Error('[revuex] The state must not be mutated.');
          }
        });

        return self._creatorsMap[path](ctx, payload);
      }
      // Dispatch an action

    }, {
      key: 'dispatch',
      value: function dispatch(path) {
        var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var action = payload;
        action.type = path;
        this._reduxStore.dispatch(action);
      }
      // Ensure the given module is installed to the given path

    }, {
      key: 'ensure',
      value: function ensure(pathArr, rawModule) {
        this.registerModule(pathArr, rawModule);
      }
      // Register a module to the given path

    }, {
      key: 'registerModule',
      value: function registerModule(pathArr, rawModule) {
        if (!Array.isArray(pathArr)) {
          throw new Error('[revuex] Expect pathArr to be an array but get ' + pathArr.toString());
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
    }]);
    return Store;
  }();

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
  function createStore(options) {
    return new Store(options);
  }

  var Revuex = {
    use: use,
    createStore: createStore
  };

  return Revuex;

})));
