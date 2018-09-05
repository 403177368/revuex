# Revuex

Revuex is a state manager based upon redux and inspired by vuex. You can manipulate state of your react/redux app in the vuex-like way.

## What's wrong with redux?

## What Problems Revuex Solved?

The switch-case-in-reducer pattern is vulnerable because all the code inside a switch block share a same scope.

## Features

* Fully modularize your redux store.

## Installation

``` bash
npm install revuex
```

## Usage

Check the detailed [example](./example/).

## Terminology

### store

A revuex store instance is an enhanced redux store with more methods.

### rootState

The root state of a revuex store. It must not be mutated.

### actionCreators, or simply creators

In revuex, an actionCreator is merely a function in which you can **invoke** other actionCreators or dispatch actions.

## API Reference

### Top-level

#### createStore(options: Object): Store

Create and return a revuex store instance.

##### Example:

``` js
import * as Redux from 'redux';
import Revuex from 'revuex';
const store = Revuex.createStore({
  redux: Redux,
  state: {
    name: 'app'
  },
  modules: {
  },
  creators: {
    init({ state, rootState, invoke, dispatch }) {
    }
  },
  actions: {}
});
```

### Store

#### getState(): Object

Return the current **rootState** of the store.

``` js
const state = store.getState();
```

#### ensure(pathArr: string[], rawModule: Object)

If no module was registered to the given path, register the module to it, otherwise nothing will happen.

``` js
import rawModuleC from './baz.js';
// Try to register a module
store.ensure(['foo', 'baz'], rawModuleC);
```

#### invoke(path: string, payload?: Object)

Invoke an action creator.

``` js
store.invoke('foo/bar/do_something', payload);
```

#### dispatch(path: string, payload?: Object)

Dispatch an action.

``` js
store.dispatch('foo/bar/LIKE', {
  comment_id: 118
});
```

## License

MIT