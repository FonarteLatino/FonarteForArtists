const { Connection, Request } = require("tedious");

// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "Dataguys2",
      password: "Fonarte2018"
    },
    type: "default"
  },
  server: "fonarte2.database.windows.net",
  options: {
    database: "Reporteador",
    encrypt: true
  }
};

module.exports = {
    config
}