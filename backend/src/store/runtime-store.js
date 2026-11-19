export function createStore() {
  return {activity:null, preparationDraft:{groupCount:null,busy:false},sessionsByTokenHash:new Map(),commandSequence:0,guidedNotesWritebacks:new Map()};
}
