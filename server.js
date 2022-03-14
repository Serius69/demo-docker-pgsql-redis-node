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
app.get('/tweets/:user', async (req, res) => {
  try {
  const redisData = await get('latesttweets')
  if (redisData) {
    return res.json({source: 'redis', data: JSON.parse(redisData)})
  }
  const data = await pgClient.query('select * from tweets where id_user_fk = '+req.params.user)
  await set('latesttweets', JSON.stringify(data.rows), 'EX', 10)
  res.json({source: 'pg', data: data.rows});
  
  }catch (err) {
  console.error(`Error while posting quotes `, err.message);
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
  }
  const data = await pgClient.query('select * from follows where id_follower = '+req.params.user)
  await set('latesttweets', JSON.stringify(data.rows), 'EX', 10)
  res.json({source: 'pg', data: data.rows});
  
  }catch (err) {
  console.error(`Error while posting quotes `, err.message);
  res.status(err.statusCode || 500).json({'message': err.message});
  }

});
// 
// Crear un nuevo tweet 
app.post("/ptweet", async (req, res) => {
  try {
    var usuario = Number(req.params.usuario);
    var textos = String(req.params.texto);
    const data = await pgClient.query('INSERT INTO tweets (texto,id_user_fk) VALUES ($1, $2)', [textos,usuario]);
    res.json({source: 'pg', data: data.rows});
    await set('latesttweets', JSON.stringify(data.rows), 'EX', 10)
  } catch (err) {
    console.error(`Error while posting quotes `, err.message);
    res.status(err.statusCode || 500).json({'message': err.message});
  }
  
});
// 
// realizar un follow de un usuario a otro
app.post("/pfollow", async (req, res) => {  
  try {  
    var idFA = Number(req.params.idfollower);
    var idFB = String(req.params.idfolloweed);
  const data = await pgClient.query('INSERT INTO follows (id_follower,id_followeed) VALUES ($1, $2)', [idFA,idFB]);
  res.json({source: 'pg', data: data.rows});  
  } catch (err) {
  console.error(`Error while posting quotes `, err.message);
  res.status(err.statusCode || 500).json({'message': err.message});
  }
});

app.listen(3000, () => {
  console.log('listening');
});
