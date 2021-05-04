var config = require('../config/dbconfig');
const sql = require('mssql');

async function artistas(){
    try{
        let pool = await sql.connect(config.config);
        let products = await pool.request().query("SELECT DISTINCT [ARTIST] FROM [dbo].[BBDD_FINAL_CANCIONES]")
        return products.recordsets;
    }
    catch(error){
        console.log(error);
        return 0;
    }
}

async function discos(){
    let q = "SELECT DISTINCT [UPC],[ARTIST],[ALBUM_NAME] FROM [dbo].[BBDD_FINAL_CANCIONES]";
    console.log(q);
    try {
        let pool = await sql.connect(config.config);
        let product = await pool.request().query(q);
        return product.recordsets;
    }
    catch (error) {
        console.log(error);
        return 0;
    }
}

async function canciones(){
    let q = "SELECT DISTINCT [UPC],[ISRC],[TRACK_NAME] FROM [dbo].[BBDD_FINAL_CANCIONES]";
    console.log(q);
    try {
        let pool = await sql.connect(config.config);
        let product = await pool.request().query(q);
        return product.recordsets;
    }
    catch (error) {
        console.log(error);
        return 0;
    }
}

module.exports = {
    artistasEx : artistas,
    discosEx : discos,
    cancionesEx : canciones/* ,
    artista : artista,
    disco : disco,
    discoUpc : discoUpc,
    upc : upc,
    plataformaFecha : plataformaFecha,
    paisFecha : paisFecha,
    resumen : resumen,
    retailer : retailer*/
}