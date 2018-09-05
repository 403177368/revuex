export default {
  state: {
    username: ''
  },
  actions: {
    LOGIN(state, { username }) {
      return {
        ...state,
        username,
      };
    }
  }
};
