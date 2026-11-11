export class CommandDispatcher {
  constructor(store){this.store=store;this.active=false;}
  run(command){
    if(command.constructor.name==='AsyncFunction')throw Error('命令必須同步完成');
    if(this.active)throw Error('禁止巢狀命令');
    this.store.commandSequence+=1;this.active=true;
    try{const result=command();if(result&&typeof result.then==='function')throw Error('命令必須同步完成');return result;}finally{this.active=false;}
  }
}
