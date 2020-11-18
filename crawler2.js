/*
  Crawler busca todos os processos de um CNPJ.
*/

const puppeteer = require('puppeteer');					//Importa a biblioteca `puppeteer` como objeto.

//main();
//Exporta função para permitir importação em outros arquivos / Função main
module.exports = function main(){
//function main(){

console.log("\n\n\n-----------------------CRAWLER2-----------------------");
crawler();
}


function crawler() //Executa o Crawler
{
 var url = 'https://consultas.anvisa.gov.br/#/medicamentos/q/?cnpj=10588595001092';	//Inicializa a variavel URL

 var encerra = false;
 var relatorio = [];
 var pagina = 0;

 let scrape = async()=>{ 							//Chama uma função assincrona armazenando o resultado na constante scrape

	 const browser = await puppeteer.launch({		//Inicializa a constante browser definindo as propriedades e abrindo o chrome
	 'args':[
		 '--no-sandbox',
		 '--disable-setuid-sandbox'
	 ],
	 headless: true,
	 });

	 const page = await browser.newPage(); 			//Abre o browser
	 await page.goto(url); 							//Vai para a url definida
	 await page.waitFor(6000); 						//Espera 6 segundos para carregar a pagina do site


    while(encerra != true)
    {

	 var lastpag = await page.evaluate(() => { 				//Quando a pagina carregar execute o codigo abaixo
		  verifica = document.querySelector('li.ng-scope.disabled > [ng-switch-when="next"]'); 							//Verifica se é a ultima pagina dos medicamentos do site, verificando se o botão de ir para a proxima pagina está desabilitado.
		  if(verifica != null && verifica != undefined)
	       return true;
	      else
	       return false;
	 });

	 if(lastpag == false)
	  {
	   await page.waitForSelector('[ng-switch-when="next"]'); //Espera o botão do site de ir para a pagina seguinte está carregado.
	   await page.click('[ng-switch-when="next"]'); 	//Clica no botão do site para mudar de pagina
	   await page.waitFor(2000);						//Espera 2 segundos para carregar a pagina e clicar novamente
      }
     else
      {
		encerra = true;
	  }

	 //Scrape
	 const result = await page.evaluate(() => { 				//Quando a pagina carregar execute o codigo abaixo
		 alerta = document.querySelector('div.toast-message'); 	//Armazena na variavel alert se existe algum problema ao buscar o registro

		 if(alerta != null)										//Verifica se a variavel alert não é nula, se existir algum valor = erro ao buscar o registro na pagina
		 {
		  return null;											//Retorna nulo se houver problema ao buscar o registro na pagina
		 }
		 else
		 {
		  const books = [] 																								//Inicializa uma array
		  document.querySelectorAll('td.text-center.col-sm-2.ng-binding').forEach(book => books.push(book.innerText));	//Busca a informação desejada pela tag
	      return books;														//Junta a array books com a informação do botão e retorna o valor para o result
	     }
	 }).catch((error) => {
     console.log("Erro ao interagir com a página: ", error);
     });

	 relatorio = relatorio.concat(result); //Junta(concaterna na array) todos os resultados
	 pagina++;
	 console.log("Pagina: " + pagina +"- OK");
     }

	 await browser.close()    					// fecha o browser
     return relatorio;    							//retorna todos os resultados
   }


 	scrape().then((value)=>{     				//Pega o valor do results acima
		console.log(value);
	});

} //fim da função crawler