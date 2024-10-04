//import puppeteer from "puppeteer";
const app = express(); //* Inicializa express
const PORT = process.env.PORT || 3000; //* Puerto de escucha
import puppeteer from "puppeteer"; //* Importa puppeteer
import express, { response } from "express"; //* Importa express
import "dotenv/config"; //* Importa dotenv

let gallery = []; //* Array de objetos obtenidos de la página

//Funcion para formatear el precio
//Param price: precio a formatear
function priceFormater(price) {
	let data = []; //* Array con los datos obtenidos
	price = price.replaceAll("$", ""); //* Elimina el signo de pesos

	//* Si el precio tiene un guión
	if (price.includes(" - ")) {
		let index = price.indexOf(" - "); //* Busca el primer guión
		let precio1 = price.substring(0, index - 2); //* Obtiene el primer entero
		data.push(precio1); //* Agrega el primer entero al array
		let decimal1 = price.substring(index - 2, index); //* Obtiene los primeros dos decimales
		data.push(decimal1); //* Agrega los primeros dos decimales al array
		let precio2 = price.substring(index + 3, price.length - 2); //* Obtiene el segundo entero
		data.push(precio2); //* Agrega el segundo entero al array
		let decimal2 = price.substring(price.length - 2, price.length); //* Obtiene los segundos dos decimales
		data.push(decimal2); //* Agrega los segundos dos decimales al array
	} else {
		let precio2 = price.substring(0, price.length - 2); //* Obtiene el entero
		data.push(precio2); //* Agrega el entero al array
		let decimal2 = price.substring(price.length - 2, price.length); //* Obtiene los dos decimales
		data.push(decimal2); //* Agrega los dos decimales al array
	}

	return data; //* Retorna el array
}

//Funcion para crear objetos con los datos
function creaObjeto(
	src, //Param src: url de la imagen
	supFlag, //Param supFlag: bandera superior del producto
	title, //Param title: titulo del producto
	precioOriginal, //Param precioOriginal: precio original del producto
	precioDesc, //Param precioDesc: precio con descuento del producto
	smoshes, //Param smoshes: colores disponibles del producto
	smoshPlus, //Param smoshPlus: si el producto tiene más de 6 colores disponibles
	flags, //Param flags: si el producto tiene alguna bandera
	stars, //Param stars: cantidad de estrellas del producto
	opinions //Param opinions: cantidad de opiniones del producto
) {
	//* Crea un objeto con los datos obtenidos
	let objeto = {
		src: src,
		supFlag: supFlag,
		title: title,
		precioOriginal: precioOriginal,
		precioDesc: precioDesc,
		smoshes: smoshes,
		smoshPlus: smoshPlus,
		flags: flags,
		stars: stars,
		opinions: opinions,
	};
	gallery.push(objeto); //* Agrega el objeto al array global
}

//Funcion del crawler
const crawler = async (obj) => {
	console.log("> Bienvenido a Liverpool"); //* Bienvenida

	//* Inicio de Puppeteers
	//main Browser
	const browser = await puppeteer.launch({ headless: "new" }); //* headless: "new" para que se abra el navegador
	console.log("> Browser Opened"); //* Mensaje de apertura del navegador

	await delay();
	const page = await browser.newPage(); //* Abre una nueva pestaña
	console.log("> Page Opened"); //* Mensaje de apertura de la pestaña

	try {
		//await delay();
		//await page.goto("https://www.liverpool.com.mx/");
		await delay();
		//await page.goto("https://www.liverpool.com.mx/tienda?s=" + obj); //* Ir a la página de Liverpool con el objeto a buscar
		//console.log("> Page Loaded for " + obj); //* Mensaje de carga de la página
		await page.goto("https://www.liverpool.com.mx/tienda/home");
		console.log("> Page Loaded");

		//await delay();
		await page.waitForSelector('.form-control.search-bar.plp-no__results');
		console.log("> Input Loaded");

		await delay();
		await page.click('.form-control.search-bar.plp-no__results');
		console.log("> Input Clicked");
		
		await delay();
		await page.type('.form-control.search-bar.plp-no__results', obj + "");
		console.log("> Input Typed");

		await delay();
		await page.keyboard.press('Enter');
		console.log("> Enter Pressed");
	} catch (error) {
		//await page. screenshot({ path: 'pythonorg.png', fullPage: true });
		gallery = ["Error en la carga de las páginas"]; //* Mensaje de error
		return gallery; //* Retorna el array
	}

	//main Data
	await delay();
	//* Busca todas las cards de producto y las guarda en un array
	//const elements = await page.$$(".m-product__card.card-masonry.a");

	/* let count;
	try {
		count = await page.$$eval(".m-product__card.card-masonry.a", elements => elements.length);
	} catch (error) {
		console.log("Error en el conteo de elementos");
		return error;
	} */

	//console.log("\nregistros: " + count); //* Muestra la cantidad de registros encontrados
	//console.log("\nregistros: " + elements.length); //* Muestra la cantidad de registros encontrados
	
	let elements = [];
	console.log("Se contaron " + 56 + " en total");
	
	try {
		for(let i = 1; i <= 56; i++){
			await delay();
			try {
				let element = await page.$(".m-product__card.card-masonry.a:nth-of-type(" + i + ")");
				console.log("elemento " + i + ": ");
				console.log(element);
				elements.push(element);
			} catch (error) {
				console.log("no se pudo extraer el elemento");
				return error;
			}
		}
	} catch (error) {
		console.log("Error en la extracción de elementos");
		return error;
	}
	

	//let element2 = await page.$('.m-product__card.card-masonry.a:nth-of-type(1)');
	//let element4 = await page.$('.m-product__card.card-masonry.a:nth-of-type(4)');

	//console.log(elements);
	//console.log(element2);


	//* Si no hay registros
	if (elements.length == 0) {
		console.log("No conto nada");
		
		gallery = [404]; //* Mensaje de error
	} else {
		gallery = []; //* Limpiamos el array
		//* Recorre el array de cards
		for (let i = 0; i < elements.length; i++) {
			//await delay();
			let n = elements[i]; //* Selecciona la card actual

			//main Imagen
			let src = await n.$eval("img", (n) => n.getAttribute("src")); //* Busca la imagen del producto y obtenemos el link

			//main Flag superior
			let supFlag;
			try {
				supFlag = await n.$eval("div.a-newFlagPLP", (n) => n.textContent); //* Busca la imagen del producto y obtenemos el link
			} catch (erro) {
				supFlag = null; //* Si no hay flag superior
			}

			//main Titulo
			let title = await n.$eval("h3", (n) => n.textContent); //* Busca el titulo del producto

			//main Precio original
			let precioOriginal;
			try {
				let priceOriginal = await n.$eval(
					"p.a-card-price",
					(n) => n.textContent
				); //* Busca el elemento con el precio original y obtiene el texto
				precioOriginal = priceFormater(priceOriginal); //* Formatea el precio
			} catch (error) {
				precioOriginal = null; //* Si no hay precio original
			}

			//main Precio con descuento
			let precioDesc;
			try {
				let priceDesc = await n.$eval(
					"p.a-card-discount",
					(n) => n.textContent
				); //* Busca el elemento con el precio con descuento y obtiene el texto
				precioDesc = priceFormater(priceDesc); //* Formatea el precio
			} catch (error) {
				precioDesc = null; //* Si no hay precio con descuento
			}

			//main Smoshes
			let smoshes = [];
			try {
				const smosh = await n.$$("li.a-productColor__item.a-product__color"); //* Busca el elemento li
				//clconsole.log("registros Smoshes: " + smosh.length);
				//* Busca el elemento span y obtiene el atributo color
				for (let i = 0; i < smosh.length; i++) {
					//* Armamos array con los datos obtenidos

					try {
						smoshes.push(
							await smosh[i].$eval("span.atom-color", (n) =>
								n.getAttribute("data-color")
							)
						);
					} catch (error) {
						smoshes.push(
							await smosh[i].$eval("img.atom-color", (n) =>
								n.getAttribute("src")
							)
						);
					}
				}
			} catch (error) {
				smoshes = null; //* Si no hay smoshes
			}

			//main SmoshPlus
			let smoshPlus;
			try {
				smoshPlus = await n.$$("i.icon-sum"); //* Busca el elemento div con la clase a-product__flags y obtiene el texto
				smoshPlus.length == 1 ? (smoshPlus = true) : (smoshPlus = false);
			} catch (error) {
				smoshPlus = null; //* Si no hay flags
			}

			//main Flags
			let flags;
			try {
				flags = await n.$eval("span.a-flag", (n) => n.textContent); //* Busca el elemento div con la clase a-product__flags y obtiene el texto
			} catch (error) {
				flags = null; //* Si no hay flags
			}

			//main Stars
			let stars = [];
			let opinions;
			try {
				stars = await n.$$("i.icon-star_large"); //* Busca el elemento span
				stars = stars.length;
				opinions = await n.$eval("li.ratings-number.aaa", (n) => n.textContent); //* Busca el elemento span y obtiene el texto
				opinions = opinions.trim();
			} catch (error) {
				stars = null; //* Si no hay stars
				opinions = null; //* Si no hay opinions
			}
			//Funcion para crear objetos con los datos
			creaObjeto(
				src,
				supFlag,
				title,
				precioOriginal,
				precioDesc,
				smoshes,
				smoshPlus,
				flags,
				stars,
				opinions
			);
			console.log("Objeto creado: " + i);
		}
	}

	//main Finishes
	await browser.close(); //* Cierra el navegador
	console.log("> Browser Closed");
	//* Fin de Puppeteer
	return gallery;
};

const mensaje = async (obj) => {
	let mensaje = [];
	mensaje = ["Hola " + obj];
	return mensaje;
};

function delay() {
	return new Promise((resolve) => setTimeout(resolve, 2000));
}

//main Server
//* Configuración de CORS
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*"); //* Permite el acceso a todos los dominios
	next(); //* Continua con la ejecución
});

//* Ruta de inicio
app.get("/:obj", async (req, res) => {
	const obj = req.params.obj; //* Obtiene el objeto a buscar
	let response = null; //* Respuesta del crawler

	response = await crawler(obj); //* Ejecuta el crawler

	//await delay();
	//response = await mensaje(obj); //* Ejecuta el mensaje

	console.log(response[0]); //* Muestra la respuesta
	//* Si no se encuentra lo buscado
	response == "No se encontro lo buscado"
		? res.send(response) //* Envia la respuesta en formato texto en caso de que no se encuentre lo buscado
		: res.json(response); //* Envia la respuesta en formato json en caso de que se encuentre lo buscado

	/* response = await mensaje(obj); //* Ejecuta el mensaje

	console.log(response[0]); //* Muestra la respuesta
	//* Si no se encuentra lo buscado
	response == "No se encontro lo buscado"
		? res.send(response) //* Envia la respuesta en formato texto en caso de que no se encuentre lo buscado
		: res.json(response); //* Envia la respuesta en formato json en caso de que se encuentre lo buscado
 */
});

//* Inicia el servidor
app.listen(PORT, () => {
	console.log(`Web service listening at http://localhost:${PORT}`); //* Mensaje de inicio del servidor
});
