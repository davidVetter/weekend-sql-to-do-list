const pg = require('pg'); // import postgres
const url = require('url');

let config = {};

//configuration for for database to connect to
if (process.env.DATABASE_URL) {
    config = {
      // We use the DATABASE_URL from Heroku to connect to our DB
      connectionString: process.env.DATABASE_URL,
      // Heroku also requires this special `ssl` config
      ssl: { rejectUnauthorized: false },
    };
  } else {
    config = {
        database: 'weekend-to-do-app',
        host: 'localhost',
        port: 5432,
        max: 10,
        idleTimeoutMillis: 30000
};
}

const pool = new pg.Pool(config); // initialze the pool using db from config

// log to indicate successful connection
pool.on('connect', () => console.log('Successful connection to Postgress'));

// log to indicate error on connection attempt
pool.on('error', (error) => console.log('Error connecting to database!', error));

// export the pool
module.exports = pool;
