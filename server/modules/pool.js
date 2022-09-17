const pg = require('pg'); // import postgres

//configuration for for database to connect to
const config = {
    database: 'weekend-to-do-app',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
};

const pool = new pg.Pool(config); // initialze the pool using db from config

// log to indicate successful connection
pool.on('connect', () => console.log('Successful connection to Postgress'));

// log to indicate error on connection attempt
pool.on('error', (error) => console.log('Error connecting to database!', error));

// export the pool
module.exports = pool;
