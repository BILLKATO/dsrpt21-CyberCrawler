/*
  Crawler busca e-mail vazados.
*/

const puppeteer = require('puppeteer');					//Importa a biblioteca `puppeteer` como objeto.
const connection = require("./database/connection");	//Importa a biblioteca de conexão como objeto.

//main();
//Exporta função para permitir importação em outros arquivos / Função main
//function main(){
module.exports = function main(){

console.log("\n\n\n-----------------------CRAWLER-----------------------");
//crawler();
seleciona();
}

function seleciona()
{
  connection.query("SELECT * FROM Lista_pesquisa", function(error, results, fields){
	if(error) res.json(error);
	 crawler(results);
  });
}


function crawler(email) //Executa o Crawler
{
 var relatorio = [];
 var url = 'https://haveibeenpwned.com/';	//Inicializa a variavel URL

 let scrape = async()=>{ 							//Chama uma função assincrona armazenando o resultado na constante scrape

	 const browser = await puppeteer.launch({		//Inicializa a constante browser definindo as propriedades e abrindo o chrome
	 'args':[
		 '--no-sandbox',
		 '--disable-setuid-sandbox'
	 ],
	 headless: false,
	 });

	 const page = await browser.newPage(); 			//Abre o browser

	 for(var i=0;email[i] != null;i++)
	 {
		relatorio = relatorio.concat("-------------------------------------------------");
		relatorio = relatorio.concat(email[i].email);
	 	await page.goto(url); 							//Vai para a url definida
	 	await page.waitForSelector('input#Account');
 	 	await page.$eval('input#Account',(el, value) => el.value = value, email[i].email);
	 	await page.click('button#searchPwnage');
	 	await page.waitFor(2000); 						//Espera 2 segundos para carregar a pagina do site

	 	//Scrape
	 	const result = await page.evaluate(() => { 				//Quando a pagina carregar execute o codigo abaixo
		  	const books = [] 																								//Inicializa uma array
		  	document.querySelectorAll('div.pwnedSearchResult.pwnedWebsite.panel-collapse.collapse.in').forEach(book => books.push(book.innerText));	//Busca a informação desejada pela tag
	      	return books;														//Junta a array books com a informação do botão e retorna o valor para o result
	 	}).catch((error) => {
     		console.log("Erro ao interagir com a página: ", error);
     	});

     	relatorio = relatorio.concat(result);
 	}

	 	await browser.close()    					// fecha o browser
     	return relatorio;    							//retorna todos os resultados
   }


 	scrape().then((value)=>{     				//Pega o valor do results acima
 		console.log(value);
 		organiza(value);
	});

} //fim da função crawler


function organiza(value){ 		//Separa os `pedaços` do texto recuperado pelo bot organizando e inserindo no BD

	var dados_comprometidos = "";
	var descricao = "";
	var local_vazado = "";
	var intermediaria = "";
	var email = "";

	for(var i=0;value[i] != null;i++){	    //Visita todos os registros buscados pelo crawler organizando e chamando a função para inserir no banco

		if(value[i].indexOf("-------------------------") != -1)
		{
			email = value[i+1];
			i = i + 2;
		}
		else
		{
			intermediaria = value[i].toString().split("\n\n");

			dados_comprometidos = (intermediaria[1].toString().split(":"))[1];
			local_vazado = (intermediaria[0].toString().split(":"))[0]
			descricao = (intermediaria[0].toString().split(":"))[1]

			console.log("Local Vazado:"+local_vazado);
			console.log("Descricao:\n"+descricao);
			console.log("Dados Comprometidos:"+dados_comprometidos);
			console.log("\n\n");
			addRows(connection,email,local_vazado,descricao,dados_comprometidos);
		}

	}

}//fim da função organiza


function addRows(conn,email,local_vazado,descricao,dados_comprometidos){ 				//Adiciona linhas em uma tabela no BD
	const sql = 'INSERT INTO Monitoramento(email,local_vazado,descricao,dados_comp) VALUES ?';
	const values = [[email,local_vazado,descricao,dados_comprometidos]];

	conn.query(sql,[values],function(error,results,fields){
	if(error==null) console.log('Adicionou Registros');
	else if(error.code == "ER_DUP_ENTRY") return console.log("Registro ja Existente");
	else if(error) return console.log(error);
	});

}//fim da função addRows



