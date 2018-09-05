// store.js
import Revuex from 'revuex';
import * as redux from 'redux';

import home from './home/index.js';
import user from './user/index.js';

// Create the store
const store = Revuex.createStore({
  // Mandatory
  // 'redux' must be passed in or an error will be thrown 
  redux: redux,
  // Optional
  middlewares: [],
  state: {
    appName: 'demo',
    inited: false,
  },
  modules: {
    user: user,
    home: home
  },
  creators: {
    init({ state, invoke, dispatch }, payload) {
      dispatch('INIT', payload);
      dispatch('user/LOGIN', { username: 'Superman' }, { root: true });
      dispatch('home/INIT', payload, { root: true });
    }
  },
  actions: {
    INIT(state) {
      // The argument 'state' here is the local state object.
      // Just like in redux, you can not mutate the state object and
      // a new state object must be returned at the end.
      return {
        ...state,
        inited: true
      };
    }
  }
});

store.invoke('init');
