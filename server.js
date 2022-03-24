const express = require('express')
const redis = require('redis')
const util = require('util')
const { Pool } = require('pg')
// crear el cliente del postgress
const pgClient = new Pool()
 
const app = express()
//crear el cliente del redis
const redisClient = redis.createClient({host: 'redis'})

const get = util.promisify(redisClient.get).bind(redisClient);
const set = util.promisify(redisClient.set).bind(redisClient);

//funciona
// Buscar los tweets de un usuario en particular
app.get('/timeline/:user', async (req, res) => {
  try {
  const redisData = await get('timeline'+req.params.user)
  if (redisData) {
    return res.json({source: 'redis', data: JSON.parse(redisData)})
  }else{
    const data = await pgClient.query('select * from tweets a, follows b where a.id_user_fk = b.id_follower and b.id_followeed = '+req.params.user)
  
    await set('timeline'+req.params.user, JSON.stringify(data.rows), 'EX', 100)
    
    res.json({source: 'pg', data: data.rows});
  }  
  
  }catch (err) {
  console.error(`Error while getting quotes `, err.message);
  res.status(err.statusCode || 500).json({'message': err.message});
  }

});
//funciona
// Todos los tweets
app.get('/alltweets', async (req, res) => {
  try {
  const redisData = await get('alltweetsRD')
  
  if (redisData) {    
    return res.json({source: 'redis', data: JSON.parse(redisData)})       
  }
  else{
    const data = await pgClient.query('select * from tweets order by id_tweet')
    await set('alltweetsRD', JSON.stringify(data.rows), 'EX', 100)
    res.json({source: 'pg', data: data.rows});
  }  
  }catch (err) {
  console.error('Error while getting quotes', err.message);
  res.status(err.statusCode || 500).json({'message': err.message});
  }

});
//funciona
// Buscar los follows de un usuario en particular
app.get('/allfollows', async (req, res) => {
  try {
  const pgClientT = new Pool()
  const redisData = await get('allfollowsRD')
  if (redisData) {
    return res.json({source: 'redis', data: JSON.parse(redisData)})
  }else{
    const data = await pgClientT.query('select * from follows')
    await set('allfollowsRD', JSON.stringify(data.rows), 'EX', 100)
    res.json({source: 'pg', data: data.rows});
  }  
  
  }catch (err) {
  console.error('Error while getting quotes', err.message);
  res.status(err.statusCode || 500).json({'message': err.message});
  }

});
//funciona
// Buscar a quien sigue un usuario en particular
app.get('/follows/:user', async (req, res) => {
  try {
  const redisData = await get('latesttweets')
  if (redisData) {
    return res.json({source: 'redis', data: JSON.parse(redisData)})
  }else{
    const data = await pgClient.query('select * from follows where id_follower = '+req.params.user)
    await set('latesttweets', JSON.stringify(data.rows), 'EX', 100)
    res.json({source: 'pg', data: data.rows});
  }  
  
  }catch (err) {
  console.error(`Error while posting quotes `, err.message);
  res.status(err.statusCode || 500).json({'message': err.message});
  }

});
//funciona
// Mostrar todos los usuarios
app.get('/users', async (req, res) => {
  try {
  const redisData = await get('latestusers')
  if (redisData) {
    return res.json({source: 'redis', data: JSON.parse(redisData)})
  }else{
    const data = await pgClient.query('select * from users')
    await set('latestusers', JSON.stringify(data.rows), 'EX', 100)
    res.json({source: 'pg', data: data.rows});
  }
  
  
  }catch (err) {
  console.error(`Error while posting quotes `, err.message);
  res.status(err.statusCode || 500).json({'message': err.message});
  }

});
// funciona
// Crear un nuevo tweet 
app.post("/ptweet/:usuario/:textos", async (req, res) => {
  try {
    var usuariovar = Number(req.params.usuario);
    var textovar = String(req.params.textos);
    const pgClientPT = new Pool()
    await pgClientPT.query('INSERT INTO tweets (texto,id_user_fk) VALUES ($1, $2)', [textovar,usuariovar]);
    res.status(pgClientPT.statusCode || 200).json({'message': 'tweet creado en la BD'});
   // const redisData = await set(pgClientPT)

  } catch (err) {
    console.error(`Error while posting quotes `, err.message);
    res.status(err.statusCode || 500).json({'message': err.message});
  }
  
});
// funciona
// realizar un follow de un usuario a otro
app.post("/pfollow/:idfollower/:idfolloweed", async (req, res) => {  
  try {  
    var idFA = Number(req.params.idfollower);
    var idFB = Number(req.params.idfolloweed);
    const pgClientFO = new Pool()
    await pgClientFO.query('INSERT INTO follows (id_follower,id_followeed) VALUES ($1, $2)', [idFA,idFB]);
    res.status(pgClientFO.statusCode || 200).json({'message': 'Usuario '+req.params.idfolloweed+'sigue a '+req.params.idfollower}); 
  } catch (err) {
  console.error(`Error while posting quotes `, err.message);
  res.status(err.statusCode || 500).json({'message': err.message});
  }
});

app.listen(3000, () => {
  console.log('listening');
});
