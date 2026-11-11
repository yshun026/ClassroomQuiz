export function loadConfig(env=process.env){
  if(typeof env.ADMIN_PASSWORD!=='string'||!env.ADMIN_PASSWORD.trim())throw Error('ADMIN_PASSWORD 必須由環境變數提供');
  return {password:env.ADMIN_PASSWORD,host:'localhost',port:3000,origin:'http://localhost:5173'};
}
