var config = require('./dbconfig');
const sql = require('mssql');

async function artistas(){
    try{
        let pool = await sql.connect(config);
        let products = await pool.request().query("SELECT DISTINCT [ARTIST] FROM [dbo].[BBDD_FINAL_CANCIONES]")
        return products.recordsets;
    }
    catch(error){
        console.log(error);
    }
}

async function artista(artist){
    let q = "SELECT DISTINCT [ARTIST],[UPC] FROM [dbo].[BBDD_FINAL_CANCIONES] WHERE [ARTIST] = \'"+artist+"\'";
    console.log(q);
    try {
        let pool = await sql.connect(config);
        let product = await pool.request().query(q);
        return product.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}

async function disco(disco){
    let q = "SELECT DISTINCT [UPC],[ARTIST],[ALBUM_NAME],[ISRC],[TRACK_NAME] FROM [dbo].[BBDD_FINAL_CANCIONES] where [ALBUM_NAME] = \'"+disco+"\'";
    console.log(q);
    try {
        let pool = await sql.connect(config);
        let product = await pool.request().query(q);
        return product.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}

async function discos(){
    let q = "SELECT DISTINCT [UPC],[ARTIST],[ALBUM_NAME] FROM [dbo].[BBDD_FINAL_CANCIONES]";
    console.log(q);
    try {
        let pool = await sql.connect(config);
        let product = await pool.request().query(q);
        return product.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}

async function canciones(){
    let q = "SELECT DISTINCT [UPC],[ISRC],[TRACK_NAME] FROM [dbo].[BBDD_FINAL_CANCIONES]";
    console.log(q);
    try {
        let pool = await sql.connect(config);
        let product = await pool.request().query(q);
        return product.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}

async function discoUpc(disco,upc){
    let q = "SELECT DISTINCT [UPC],[ARTIST],[ALBUM_NAME],[ISRC],[TRACK_NAME] FROM [dbo].[BBDD_FINAL_CANCIONES] where [ALBUM_NAME] = \'"+disco+"\' or [UPC] = \'"+upc+"\'";
    console.log(q);
    try {
        let pool = await sql.connect(config);
        let product = await pool.request().query(q);
        return product.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}

async function upc(upc){
    let q = "SELECT DISTINCT [UPC],[ARTIST],[ALBUM_NAME],[ISRC],[TRACK_NAME] FROM [dbo].[BBDD_FINAL_CANCIONES] where [UPC] = \'"+upc+"\'";
    console.log(q);
    try {
        let pool = await sql.connect(config);
        let product = await pool.request().query(q);
        return product.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}


async function plataformaFecha(upc,fecha){
    
    let up = upc;
    console.log(up);
    console.log(fecha);
    let q = "SELECT DISTINCT [Retailer] FROM [dbo].[000_Client_Dashboard_Total] where (";
    console.log(q);
    let c=0;
    up.forEach(element => {
        c=c+1;
        
        q = q+`[UPC] = '${element}`;
        //console.log(element)
        
        if(c<upc.length)
        {
            q = q+'\' or ';
        }
        console.log(q);
    });
    q = q+`\') and [Year_Month] = \'${fecha}\'`;
    console.log(q); 
    try {
        let pool = await sql.connect(config);
        let product = await pool.request().query(q);
        return product.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}

async function paisFecha(isrc,fecha,plataforma){
    let q = "SELECT DISTINCT [Country_Sale] FROM [dbo].[000_Client_Dashboard_Total] where [ISRC] = \'"+isrc+"\' and [Year_Month] = \'"+fecha+"\' and [Retailer]=\'"+plataforma+"\'";
    console.log(q);
    try {
        let pool = await sql.connect(config);
        let product = await pool.request().query(q);
        return product.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}

async function resumen(isrc,fecha,plataforma,pais){
    let q = "SELECT SUM (Net_Royalty_Total) as RegaliasTotales, SUM (Quantity) as TotaldeClics FROM [dbo].[000_Client_Dashboard_Total] where [ISRC] = \'"+isrc+"\' and [Year_Month] = \'"+fecha+"\' and [Retailer]=\'"+plataforma+"\' and [Country_Sale] = \'"+pais+"\'";
    console.log(q);
    try {
        let pool = await sql.connect(config);
        let product = await pool.request().query(q);
        return product.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}

async function retailer(upc,isrc,fecha){
    let q = "SELECT * FROM [dbo].[000_Client_Dashboard_Total] where (";
    //console.log(q);
    let c = 0;
    let a1 = '';
    let a2 = '';
    let a3 = '';
    upc.forEach(element => {
        c = c + 1;
        if (c < upc.length) {
            a1 = a1 + 'UPC=\'' + element + '\' or ';
        } else {
            a1 = a1 + 'UPC=\'' + element + '\'';
        }
    });
    c = 0;
    isrc.forEach(element1 => {
        c = c + 1;
        if (c < isrc.length) {
            a2 = a2 + 'ISRC=\'' + element1 + '\' or ';
        } else {
            a2 = a2 + 'ISRC=\'' + element1 + '\'';
        }
    });
    c = 0;
    fecha.forEach(element2 => {
        c = c + 1;
        if (c < fecha.length) {
            a3 = a3 + 'Year_Month=\'' + element2 + '\' or ';
        } else {
            a3 = a3 + 'Year_Month=\'' + element2 + '\'';
        }
    });
    q = q + a1 + ' or ' + a2 + ') and (' + a3 + ')';
    try {
        let pool = await sql.connect(config);
        let product = await pool.request().query(q);
        return product.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = {
    artistas : artistas,
    discos : discos,
    canciones : canciones,
    artista : artista,
    disco : disco,
    discoUpc : discoUpc,
    upc : upc,
    plataformaFecha : plataformaFecha,
    paisFecha : paisFecha,
    resumen : resumen,
    retailer : retailer
}