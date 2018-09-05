// @flow

// import { getRedux } from './functions.js';

export class Module {
  store: Store;
  isRoot: boolean;
  name: string;
  path: string;
  parent: Module | null;
  children: Array<Module>;
  // Children modules
  modules: Array<Module>;
  state: Object;
  creators: Object;

  constructor(path: Array<string>, rawModule: Object, store: Store) {
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
      for (let key in rawModule.modules) {
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
    for (let key in this.creators) {
      if (this.isRoot) {
        Object.assign(store._creatorsMap, this.creators);
      } else {
        store._creatorsMap[this.path + '/' + key] = this.creators[key];
      }
    }

    this.handlers = rawModule.actions || {};
  }
  initReducer(rawModule) {
    var self = this;
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
  updateReducer() {
    var self = this;
    self.indexReducer = function(state, action) {
      if (!self.handlers[action.type]) {
        return state;
      } else {
        return self.handlers[action.type](state, action);
      }
    };

    var childrenKeys = Object.keys(self.modules) || [];
    if (childrenKeys.length > 0) {
      var reducers = {};
      for (let key in this.modules) {
        reducers[key] = this.modules[key].reducer;
      }
      // Combine wrapper reducers of the children into a children reducer for this module:
      self.childrenReducer = self.store.redux.combineReducers(reducers);
    } else {
      self.childrenReducer = function(state, action) {
        return state;
      };
    }

    self.reducer = function(state, action) {
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
            throw new Error(
              '[revuex] State of a module must be a plain object!'
            );
          } else {
            // Split the state into indexState and childrenState
            indexState = {};
            childrenState = {};
            for (let key in state) {
              if (self.modules[key]) {
                childrenState[key] = state[key];
              } else {
                indexState[key] = state[key];
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
          console.log(`[revuex] path \'${path}\' matched action: ` + action.type);
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
  mergeState(indexState, childrenState): Object {
    var state = {};
    for (let key in indexState) {
      if (this.modules[key]) {
        throw new Error(
          `[revuex] Duplicated state key "${key}" in module "${this.path}".'`
        );
      }
      state[key] = indexState[key];
    }
    for (let key in childrenState) {
      state[key] = childrenState[key];
    }
    return state;
  }
}

  