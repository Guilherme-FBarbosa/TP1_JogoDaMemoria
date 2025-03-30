/** 
 * Aplicações multimédia - Trabalho Prático 1
 * (c) Catarina Cruz, 2025
 * 
 */

const game = {}; // encapsula a informação de jogo. Está vazio mas vai-se preenchendo com definições adicionais.

// sons do jogo
const sounds = {
	background: null,
	flip: null,
	success: null,
	hide: null
};

// numero de linhas e colunas do tabuleiro;
const ROWS = 4;
const COLS = 4;

game.sounds = sounds; // Adicionar os sons sons do jogo ao objeto game.
game.board  = Array(COLS).fill().map(() => Array(ROWS)); // criação do tabuleiro como um array de 6 linhas x 8 colunas
 
// Representa a imagem de uma carta de um país. Esta definição é apenas um modelo para outros objectos que sejam criados
// com esta base através de let umaFace = Object.create(face).
const face = {
	country: -1,
	x: -1,
	y: -1
};

const CARDSIZE = 102; 	// tamanho da carta (altura e largura)
let faces = []; 		// Array que armazena objectos face que contêm posicionamentos da imagem e códigos dos paises
 

window.addEventListener("load", init, false);

function init() {
	game.stage = document.querySelector("#stage");
	setupAudio(); 		// configurar o audio
	getFaces(); 		// calcular as faces e guardar no array faces
	createCountries();	// criar países

	// Após o primeiro clique, o som de fundo começa a tocar:
	// Tivemos de fazer isto pois a maioria dos navegadores não permitem que o som comece a tocar sem interação do utilizador.
	document.addEventListener("click", startBackgroundMusic, { once: true });
	 
	//completar
}

// Inicia o som de fundo:
function startBackgroundMusic() {
	game.sounds.background.play();
}

// Cria os paises e coloca-os no tabuleiro de jogo(array board[][])
function createCountries() {
	/* DICA:
	Seja umaCarta um elemento DIV, a imagem de carta pode ser obtida nos objetos armazenados no array faces[]; o verso da capa 
	está armazenado na ultima posicao do array faces[]. Pode também ser obtido através do seletor de classe .escondida do CSS.
		umaCarta.classList.add("carta"); 	
		umaCarta.style.backgroundPositionX=faces[0].x;
		umaCarta.style.backgroundPositionX=faces[0].y;

		Colocar uma carta escondida:
			umaCarta.classList.add("escondida");
			
		virar a carta:
			umaCarta.classList.remove("escondida");
    */
   
	// Adiciona as cartas do tabuleiro à stage:
	const stage = game.stage;
	const totalCards = ROWS * COLS;
	const pairs = totalCards / 2;

	// Duplica e baralha as faces:
	const shuffledFaces = [...faces.slice(0, pairs), ...faces.slice(0, pairs)]
		.sort(() => Math.random() - 0.5);
		// Nesta constante, o método slice() é usado para criar uma cópia do array faces, pegando apenas os primeiros "pairs" elementos.
		// Em seguida, o operador de espalhamento (...) é usado para duplicar esses elementos e o método sort() é usado para embaralhar a ordem dos elementos.
		// O resultado é um novo array que contém pares de faces, mas em uma ordem aleatória.
	
	// Cria as cartas e as adiciona ao tabuleiro:
	shuffledFaces.forEach((face, index) => {
		const card = document.createElement("div");
		card.classList.add("carta", "escondida");
		card.style.backgroundPositionX = face.x;
		card.style.backgroundPositionY = face.y;

		// Calcula a posição da carta no tabuleiro:
		const row = Math.floor(index / COLS);
		const col = index % COLS;
		game.board[row][col] = card; // Armazena a carta no tabuleiro
	
		// Define a posição da carta no stage:
		card.style.top = row * CARDSIZE + "px";
		card.style.left = col * CARDSIZE + "px";

		// Adiciona a carta ao stage e o evento de clique à ela:
		card.addEventListener("click", () => flipCard(card));
		stage.appendChild(card); 
	});
}

// Vira a carta, mostrando ou escondendo a imagem e toca o respetivo som:
function flipCard(card) {
	if (card.classList.contains("escondida")){
		game.sounds.flip.play();
		card.classList.remove("escondida");
	} else {
		game.sounds.hide.play();
		card.classList.add("escondida");
	}
	
}

// Adicionar as cartas do tabuleiro à stage
function render() {
	 
}


// baralha as cartas no tabuleiro
function scramble() {
 
}

function exemplo (){
  let o1={id:1, pos:{x:10,y:20}}
  let o2={id:2, pos:{x:1,y:2}}
  let aux=Object.assign({},o1);

  o1.pos=Object.assign({},o2.pos)

  let umaFace= Object.create(face);
  umaFace.novaProp="asdasd"
}

 
function tempo() {
  let contador=0;
  let maxCount=60;

  let timeHandler= setInterval(()=>{
	contador++;
	document.getElementById("time").value=contador;
	if(contador===maxCount-5)document.getElementById("time").classList.add("warning");
	if(contador===maxCount){
		clearInterval(timeHandler);
		document.getElementById("time").classList.remove("warning");
	} 
  },1)

}


/* ------------------------------------------------------------------------------------------------  
 ** /!\ NÃO MODIFICAR ESTAS FUNÇÕES /!\
-------------------------------------------------------------------------------------------------- */
 
// configuração do audio
function setupAudio() {
	game.sounds.background = document.querySelector("#backgroundSnd");
	game.sounds.success = document.querySelector("#successSnd");
	game.sounds.flip = document.querySelector("#flipSnd");
	game.sounds.hide = document.querySelector("#hideSnd");
	game.sounds.win = document.querySelector("#goalSnd");

	// definições de volume;
	game.sounds.background.volume=0.05;  // o volume varia entre 0 e 1

	// nesta pode-se mexer se for necessário acrescentar ou configurar mais sons

}

// calcula as coordenadas das imagens da selecao de cada país e atribui um código único
function getFaces() {
/* NÂO MOFIFICAR ESTA FUNCAO */
	let offsetX = 1;
	let offsetY = 1;
	for (let i = 0; i < 3; i++) {
		offsetX = 1;
		for (let j = 0; j < 3; j++) {
			let countryFace = Object.create(face); 				// criar um objeto com base no objeto face
			countryFace.x = -(j * CARDSIZE + offsetX) + "px";   // calculo da coordenada x na imagem
			countryFace.y = -(i * CARDSIZE + offsetY) + "px";   // calculo da coordenada y na imagem
			countryFace.country = "" + i + "" + j; 			    // criação do código do país
			faces.push(countryFace); 					        // guardar o objeto no array de faces
			offsetX += 2;
		}
		offsetY += 2;
	}
}

/* ------------------------------------------------------------------------------------------------  
 ** /!\ NÃO MODIFICAR ESTAS FUNÇÕES /!\
-------------------------------------------------------------------------------------------------- */