const editorReducer = (state, action) => {
  switch (action.type) {  
    case 'SET_TITLE':
      return {
        ...state,
        title: action.text,
      };
    case 'SET_SUMMARY':
      return {
        ...state,
        summary: action.text,
      };
    case 'SET_CONTENT':
      return {
        ...state,
        content: action.text,
      };
    case 'ADD_TAG':
      return {
        ...state,
        tags: (state.tags || []).concat(action.tag),
      };
    case 'REMOVE_TAG':
      return {
        ...state,
        tags: (state.tags || []).filter((tag) => tag !== action.tag),
      };
    default:
      throw new Error('Unhandled action');
  }
};

export default editorReducer;
