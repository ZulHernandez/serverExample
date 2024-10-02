//import puppeteer from "puppeteer";
const app = express(); //* Inicializa express
const PORT = process.env.PORT || 3000; //* Puerto de escucha
import puppeteer from "puppeteer"; //* Importa puppeteer
import express, { response } from "express"; //* Importa express

async function mensaje(obj) {
	// Launch the browser and open a new blank page
	const browser = await puppeteer.launch({ headless: "new" });
	const page = await browser.newPage();

	// Navigate the page to a URL.
	await page.goto("https://developer.chrome.com/");

	// Set screen size.
	await page.setViewport({ width: 1080, height: 1024 });

	// Type into search box.
	await page.locator(".devsite-search-field").fill("automate beyond recorder");

	// Wait and click on first result.
	await page.locator(".devsite-result-item-link").click();

	// Locate the full title with a unique string.
	const textSelector = await page
		.locator("text/Customize and automate")
		.waitHandle();
	const fullTitle = await textSelector?.evaluate((el) => el.textContent);

	await browser.close();

	// Print the full title.
	return 'The title of this blog post is "%s".', fullTitle;
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
	console.log("Se busacara: " + obj); //* Muestra el objeto a buscar
	let response = null; //* Respuesta del crawler
	//response = await crawler(obj); //* Ejecuta el crawler

	response = await mensaje(obj); //* Ejecuta el crawler

	console.log(response[0]); //* Muestra la respuesta
	//* Si no se encuentra lo buscado
	response == "No se encontro lo buscado"
		? res.send(response) //* Envia la respuesta en formato texto en caso de que no se encuentre lo buscado
		: res.json(response); //* Envia la respuesta en formato json en caso de que se encuentre lo buscado
});

//* Inicia el servidor
app.listen(PORT, () => {
	console.log(`Web service listening at http://localhost:${PORT}`); //* Mensaje de inicio del servidor
});
