import * as redux from 'redux';
import Revuex from '../src/index.js';

const moduleItem = {
  creators: {
    add() {

    }
  }
};

const moduleHome = {

  state: {
    inited: false,
    count: 5,
  },
  modules: {
  },
  actions: {
    INIT(state) {
      // console.log(state);
      return {
        ...state,
        inited: true,
      };
    }
  }
    
};

const store = Revuex.createStore({
  redux: redux,
  state: {
    inited: false,
    appName: 'demo',
    user: {}
  },
  modules: {
    home: moduleHome,
    item: moduleItem
  },
  creators: {
    init({ dispatch }) {
      dispatch('INIT');
      dispatch('home/INIT', null, { root: true });
    }
  },
  actions: {
    INIT(state, payload) {
      return {
        ...state,
        inited: true,
        user: {
          ...state.user,
          name: 'me'
        }
      };
    }
  },
});

// console.log(JSON.stringify(store._creatorsMap, null, 2));

describe('revuex', () => {
  
  it('Dynamically registered a module', () => {

    store.ensure(['home', 'item'], moduleItem);
    expect(
      store.modulesMap['home/item']
    ).toBeDefined();

  });

  it('Register creators correctly', () => {

    expect(
      Object.keys(store._creatorsMap).sort()
    ).toEqual(
      ['item/add', 'init', 'home/item/add'].sort()
    );

  });

  it('Invoke an actionCreator and the state is changed successfullly', () => {
    store.invoke('init');

    expect(
      store.getState()
    ).toEqual({
      inited: true,
      appName: 'demo',
      user: {
        name: 'me'
      },
      home: {
        inited: true,
        count: 5,
        item: {}
      },
      item: {}
    });
  });

});