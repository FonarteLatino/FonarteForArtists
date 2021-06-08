const pool = require('../config/dbconexionmysql');

//llama a todos los Artistas de la base de datos
async function artistas(){
  let a = 'SELECT * FROM `artista`'
  try{
    var result = await pool.query(a);
    return result;
  }
  catch(error){
    console.log(error);
        console.log("Problemas de conexion interna")
        return 0;
  }  
}

async function artista(ar){
  let a = 'SELECT * FROM `artista` WHERE `nombre` = \''+ar+'\''
  var result = await pool.query(a);
  //console.log(result);
  //console.log(result.length);
  return result;
}

//Ejecuta cualquier query limpio que le mandemos la usamos para INSERT, DELETE y UPDATE
async function ejecutar(q){
  console.log(q);
  var result = await pool.query(q);
  console.log(result);
  //console.log(result.length);
  return result;
}

async function discos(){
  let a = 'SELECT `a`.`nombre` AS `ARTIST`,`d`.`UPC`,`d`.`nombre`,`d`.`artista_id` FROM `artista` AS `a` JOIN `disco` AS `d` ON `d`.`artista_id` = `a`.`id`'
  try{
    var result = await pool.query(a);
    return result;
  }
  catch(error){
    console.log(error);
    console.log("Problemas de conexion interna")
    return 0;
  }
}

async function canciones(){
  let a = 'SELECT * FROM `cancion`'
  try{
    var result = await pool.query(a);
    return result;
  }
  catch(error){
    console.log(error);
    console.log("Problemas de conexion interna")
    return 0;
  }
}

async function fecha(){
  let a = 'SELECT DISTINCT `anio` FROM `regalias`';
  try{
    var result = await pool.query(a);
    return result;
  }
  catch(error){
    console.log(error);
    console.log("Problemas de conexion interna")
    return 0;
  }
}

module.exports = {
    artistasLocal : artistas,
    artistaLocal : artista,
    ejecutarQuery : ejecutar,
    discosLocal : discos,
    cancionesLocal : canciones,
    fechas : fecha/*,
    disco : disco,
    discoUpc : discoUpc,
    upc : upc,
    plataformaFecha : plataformaFecha,
    paisFecha : paisFecha,
    resumen : resumen,
    retailer : retailer*/
}