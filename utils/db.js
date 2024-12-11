// import mysql from 'mysql2';
const mysql = require('mysql2');

// const cors = require("cors");

// app.use(cors({ origin: "*"}));
// Create the MySQL connection with the correct credentials
const Connection = mysql.createConnection({
  host: 'empdb-1.cpciemww60k8.eu-north-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Priya123', // Make sure this matches your MySQL root password
  database: 'emp', // Replace with your database name
});

Connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err); 
    return;
  }
  console.log('Connected to MySQL');
});
 
// export default Connection
module.exports = Connection;



