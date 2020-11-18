const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 8080; //porta padrão
const mysql = require('mysql');
var Crawler = require('./Crawler.js');

app.use(function(req, res, next) {
	 res.header('Access-Control-Allow-Origin',req.headers.origin||"*");
	 res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,HEAD,OPTIONS');
	 res.header('Access-Control-Allow-Headers','content-Type,x-requested-with');
	 next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));
app.use('/', router);
app.listen(port);
console.log('API funcionando!');


 app.get('/email/', (req, res) =>{

	 sql  = "SELECT * FROM Lista_pesquisa";

     execSQLQuery(sql, res, 0);
     });

 app.get('/monitoramento/:email?', (req, res) =>{
	 var email = "";

	 if(req.params.email)
	  email = " WHERE email LIKE '"+req.params.email+"'";

	 sql  = "SELECT * FROM Monitoramento";

     execSQLQuery(sql + email, res, 0);
     });

 app.post('/inserir/', (req, res) =>{
	 var email = "";

	 if(req.body.email)
	  email = req.body.email;

	 sql  = "INSERT INTO Lista_pesquisa(email) VALUES('"+email+"')";

     execSQLQuery(sql, res, 0);
     });

 app.get('/buscar/', (req, res) =>{

	 crawlers();
	 clearInterval(ligar);
	 setInterval(crawlers,10800000);
	 res.json("Rodando Crawler");
     });

function execSQLQuery(sqlQry, res, up){
const connection = mysql.createConnection({

	host:'db4free.net',
	port: 3306,
	user: 'rm78111',
	password:'bilolinha7',
	database:'dsrpt_cyber'

});

  connection.query(sqlQry, function(error, results, fields){
	 if(error == null)
	 {
 	   res.json(results);
 	 }
	 else if(error.code == "ER_DUP_ENTRY") res.json("Registro Existente");
	 else if(error) res.json(error);

      connection.end();
      console.log('executou!');
      console.log(sqlQry);
  });

}

var ligar = setInterval(crawlers,10800000);

function crawlers(){
  crawler = new Crawler();
}