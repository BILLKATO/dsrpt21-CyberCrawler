const mysql = require('mysql');

const connection = mysql.createConnection({

	host:'db4free.net',
	port: 3306,
	user: 'rm78111',
	password:'bilolinha7',
	database:'dsrpt_cyber'

});

module.exports = connection;