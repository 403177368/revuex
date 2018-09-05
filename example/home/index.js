// raw module
export default {
  state: {
    inited: false
  },
  creators: {
    init({ state, rootState, invoke, dispatch }, payload) {
    
    }
  },
  actions: {
    INIT(state, payload) {
      return {
        ...state,
        inited: true
      };
    }
  }
};
