export function createStore() {
  return {activity:null, preparationDraft:{groupCount:null,document:null,busy:false},sessionsByTokenHash:new Map(),commandSequence:0};
}
