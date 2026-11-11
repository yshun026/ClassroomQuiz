import {SynchronizationService} from './services/synchronization-service.js';
import {registerGroups} from './api/group-routes.js';
import {GuidedNotesService} from './services/guided-notes-service.js';
import {ActivityService} from './services/activity-service.js';
import {registerPreparation} from './api/preparation-routes.js';
import {registerSessions} from './api/session-routes.js';
import {registerActivity} from './api/activity-routes.js';
import express from 'express';
import {createStore} from './store/runtime-store.js';
import {AuthorizationService} from './services/authorization-service.js';
import {CommandDispatcher} from './services/command-dispatcher.js';
import {AppError,errorHandler} from './api/errors.js';
export function createApp({config,store=createStore(),register}={}){
  const app=express();app.disable('x-powered-by');app.disable('etag');
  const context={store,config,auth:new AuthorizationService(store,config.password),dispatcher:new CommandDispatcher(store)};app.locals.context=context;
  app.use((req,res,next)=>{if(req.headers.origin&&req.headers.origin!==config.origin)return next(new AppError('ORIGIN_FORBIDDEN'));next();});
  app.use(express.json());app.get('/api/health',(req,res)=>res.json({status:'ok'}));
  context.activity=new ActivityService(store,context.dispatcher,new GuidedNotesService());context.sync=new SynchronizationService(store,context.auth,context.activity);registerGroups(app,context);registerSessions(app,context);registerPreparation(app,context);registerActivity(app,context);if(register)register(app,context);app.use(errorHandler);return app;
}
