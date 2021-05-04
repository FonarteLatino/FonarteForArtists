
const config = {
    user: 'Dataguys2',
    password: 'Fonarte2018',
    server: 'fonarte2.database.windows.net',
    database: "Reporteador",
    'requestTimeout': 480000,
    options: {
        'enableArithAbort': true,
        'idleTimeoutMillis': 480000
    }
}


const configMysql = {
    host : 'localhost',
    user: 'root',
    password: '',
    database: "resumen_regalias"
};

//Rutas de conexio DB para Produccion
/*

const configMysql = {
    host : 'localhost',
    user: 'root',
    password: '',
    database: "resumen_regalias"
};*/

module.exports = {
    config : config,
    configMysql : configMysql
};