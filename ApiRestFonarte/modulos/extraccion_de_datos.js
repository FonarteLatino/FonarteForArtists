const conexionDB = require('../connections/conexion');
const { Connection, Request } = require("tedious");

var connection = new Connection(conexionDB.config);

  var plataformas = (upc,fecha) => {
    connection.on("connect", err => {
        if (err) {
          console.error(err.message);
        } else {
          return plataforma(upc,fecha);
        }
      });
  }
  let plataforma = (upc,fecha) => {
    var query = 'SELECT DISTINCT [Retailer] FROM [dbo].[000_Client_Dashboard_Total] where ([UPC] = \'7509841275835\' or [UPC] = \'7509841277167\') and [Year_Month] = \'2020-8\'';

    const request = new Request(
        query,
        (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );
    
      request.on("row", columns => {
        columns.forEach(column => {
          console.log("%s\t%s", column.metadata.colName, column.value);
        });
      });
    
      connection.execSql(request);
  }

  module.exports = {
    plataformas
}