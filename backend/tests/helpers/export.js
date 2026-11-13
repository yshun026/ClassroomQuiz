import {readFile} from 'node:fs/promises';
import {quizFixture} from './quiz.js';
export async function exportFixture(name='valid-a'){
 const f=quizFixture(3),source=await readFile(new URL(`../../../tests/fixtures/guided-notes/${name}.xlsx`,import.meta.url));
 f.c.store.activity.document=await f.c.activity.notes.validateAndImport(source,name+'.xlsx');
 return {...f,source,notes:f.c.activity.notes};
}
