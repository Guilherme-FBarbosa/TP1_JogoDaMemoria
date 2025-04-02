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
	hide: null,
	win: null
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
let flippedCards = []; // Array que armazena as cartas que foram viradas
let cardsUnguessed = 16; // Quantidade de cartas por adivinhar
let timerId = null; // Armazena o ID do temporizador
let gameRunning = false;

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

// Inicia o temporizador ao carregar o jogo:
window.addEventListener("load", () => {
    startTimer();
});

// Adiciona o evento de clique ao botão de reiniciar (barra de espaço):
window.addEventListener("keydown", (event) => {
	if (!gameRunning) {
		return
	}
	if (event.code === "Space") {
		restartGame();
	}
});

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
   
	// Define o tamanho do tabuleiro:
	const totalCards = ROWS * COLS;
	const pairs = totalCards / 2;

	// Baralha as cartas:
	scramble(pairs);

	// Adiciona as cartas ao tabuleiro:
	render();
}

// Vira a carta, mostrando ou escondendo a imagem e toca o respetivo som:
function flipCard(card) {
	if (card.classList.contains("escondida") && flippedCards.length < 2){
		game.sounds.flip.play();
		card.classList.remove("escondida");
		flippedCards.push(card); // Adiciona a carta ao array de cartas viradas
	
		// Verifica se duas cartas foram viradas:
		if (flippedCards.length === 2){
			checkMatch();
		}
		cardsUnguessed == 0 ? win(10) : ""
	}	
}

// Verifica se as cartas viradas são iguais:
function checkMatch(){
	const [card1, card2] = flippedCards;

	// Compara as posições de fundo das cartas para saber se são iguais:
	if (card1.style.backgroundPosition === card2.style.backgroundPosition){
		game.sounds.success.play();
		card1.classList.add("certa");
		card2.classList.add("certa");
		flippedCards = []; // limpa o array de cartas viradas
		console.log("Cards ungessed " + cardsUnguessed)
		cardsUnguessed -= 2
		console.log("Cards ungessed " + cardsUnguessed)
	} else {
		game.sounds.hide.play();
		setTimeout(() => {
			card1.classList.add("escondida");
			card2.classList.add("escondida");
			flippedCards = []; // limpa o array de cartas viradas	
		}, 500); // espera meio segundo antes de esconder as cartas
	}
}

// Adicionar as cartas do tabuleiro à stage
function render() {
	const stage = game.stage;

	 // Cria as cartas e as adiciona ao tabuleiro:
	game.shuffledFaces.forEach((face, index) => {
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

// baralha as cartas no tabuleiro
function scramble(pairs) {
	// Duplica e baralha as faces:
	const shuffledFaces = [...faces.slice(0, pairs), ...faces.slice(0, pairs)]
		.sort(() => Math.random() - 0.5);
		// Nesta constante, o método slice() é usado para criar uma cópia do array faces, pegando apenas os primeiros "pairs" elementos.
		// Em seguida, o operador de espalhamento (...) é usado para duplicar esses elementos e o método sort() é usado para embaralhar a ordem dos elementos.
		// O resultado é um novo array que contém pares de faces, mas em uma ordem aleatória.

		// Atualiza o array faces com as faces baralhadas:
		game.shuffledFaces = shuffledFaces;
}

// rebaralha as cartas ainda não encontradas:
function scrambleUnmatchedCards() {
	// limpa o array de cartas viradas:
	flippedCards = [];

	const unmatchedCards = Array.from(document.querySelectorAll(".carta:not(.certa)"));

	// adiciona a classe de animação às cartas não encontradas:
	unmatchedCards.forEach(card => {
		card.classList.add("shuffle");
	})

	// esconde todas as cartas que estão viradas:
	unmatchedCards.forEach(card => {
		if (!card.classList.contains("escondida")) {
			card.classList.add("escondida");
		}
	})

	//aguarda o término da animação antes de baralhar as cartas:
	setTimeout(() => {
		// remove a classe de animação
		unmatchedCards.forEach(card => {
			card.classList.remove("shuffle");
		});

		// baralha as faces das cartas não encontradas:
		const shuffledFaces = unmatchedCards.map(card => ({
			x: card.style.backgroundPositionX,
			y: card.style.backgroundPositionY,
		})).sort(() => Math.random() - 0.5);

		unmatchedCards.forEach((card, index) => {
			card.style.backgroundPositionX = shuffledFaces[index].x;
			card.style.backgroundPositionY = shuffledFaces[index].y;
	
			// atualiza a posição da carta no tabuleiro:
			const row = Math.floor(index / COLS);
			const col = index % COLS;
			game.board[row][col] = card; // Armazena a carta no tabuleiro
		});
	}, 800); // duração da animação (0.8s)
}

// Inicia o temporizador:
function startTimer() {
	const progressBar = document.getElementById("time");
	let timeElapsed = 0;
	const maxTime = parseInt(progressBar.max, 10); // 45 segundos

	// limpa a barra do temporizador:
	if (timerId) {
		clearInterval(timerId);
	}

	// inicia um novo temporizador:
	gameRunning = true;
	timerId = setInterval(() => {
		timeElapsed++;
		progressBar.value = timeElapsed;

		// quando faltam 5 segundos, adiciona animação de aviso:
		if (timeElapsed === maxTime - 5) {
			progressBar.classList.add("warning");
			showNotification("As cartas ainda não encontradas serão baralhadas em 5 segundos!", 5);
		}

		// quando o tempo acabar, baralha as cartas não encontradas:
		if (timeElapsed === maxTime) {
			clearInterval(timerId);
			progressBar.classList.remove("warning");
			progressBar.value = 0; // Reinicia a barra de progresso
			scrambleUnmatchedCards();
			timeElapsed = 0; // Reinicia o tempo
			gameRunning ? startTimer() : ""; // Reinicia o temporizador
		}
	}, 1000); // atualiza a cada segundo 
}

// Mostra a notificação na tela:
function showNotification(message, time) {
	const notification = document.createElement("div");
	notification.id = "notification";
	notification.textContent = message;
	document.body.appendChild(notification);
	if (time != null) {
		setTimeout(() => {
			notification.remove();
		}, time * 1000); // remove a notificação após (time * 1000) segundos
	}
	else{
		notification.remove();
	}
}

// Reinicia o jogo:
function restartGame() {
	// limpa o array de cartas viradas:
	flippedCards = [];

	// baralha as cartas novamente:
	scramble(ROWS * COLS / 2);

	// remove todas as cartas do stage:
	const stage = game.stage;
	while (stage.firstChild) {
		stage.removeChild(stage.firstChild);
	}

	// renderiza as cartas novamente:
	render();

	// reinicia o temporizador:
	const progressBar = document.getElementById("time");
	progressBar.value = 0; // Reseta a barra de progresso
	startTimer(); // Reseta o temporizador
}

function exemplo (){
  let o1={id:1, pos:{x:10,y:20}}
  let o2={id:2, pos:{x:1,y:2}}
  let aux=Object.assign({},o1);

  o1.pos=Object.assign({},o2.pos)

  let umaFace= Object.create(face);
  umaFace.novaProp="asdasd"
}

function win(time = 30) {
	gameRunning = false;
	game.sounds.background.pause();
	game.sounds.currentTime = 0;
	game.sounds.win.play();
	showNotification("Ganhou! Todos os pares foram encontrados", time)
	restartGame()
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