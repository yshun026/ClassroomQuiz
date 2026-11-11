import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
export async function isolatedProfile(){const path=await mkdtemp(join(tmpdir(),'classroomquiz-profile-'));return {path,cleanup:()=>rm(path,{recursive:true,force:true})};}
