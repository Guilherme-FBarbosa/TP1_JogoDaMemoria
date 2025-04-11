/** 
 * Aplicações Multimédia - Trabalho Prático 1
 * 
 * Alterações ao código original e desenvolvimento feitos por:
 * Daniel Duarte Nº 220000942;
 * Guilherme Barbosa Nº 230000002;
 * Tiago Tomás Nº 220001585.
 * 
 * (c) Catarina Cruz, 2025
 * 
 */

const game = {}; // encapsula a informação de jogo. Está vazio mas vai-se preenchendo com definições adicionais.

// Representa a imagem de uma carta de um país. Esta definição é apenas um modelo para outros objectos que sejam criados
// com esta base através de let umaFace = Object.create(face).
const face = {
	country: -1,
	x: -1,
	y: -1
};

// numero de linhas e colunas do tabuleiro;
const ROWS = 4;
const COLS = 4;
const TOTAL_CARDS = ROWS * COLS; // total de cartas no tabuleiro
const CARDSIZE = 102; 	// tamanho da carta (altura e largura)
let faces = []; 		// Array que armazena objectos face que contêm posicionamentos da imagem e códigos dos paises
let flippedCards = []; // Array que armazena as cartas que foram viradas
let timerId = null; // Armazena o ID do temporizador
let gameRunning = false;
let moves = 0; // contador de movimentos do jogador
let startTime = 0; // tempo de início do jogo
let unguessedCards = TOTAL_CARDS; // Quantidade de cartas por adivinhar

// sons do jogo
const sounds = {
	background: null,
	flip: null,
	success: null,
	hide: null,
	win: null
};

game.sounds = sounds; // Adicionar os sons sons do jogo ao objeto game.
game.board = Array(COLS).fill().map(() => Array(ROWS)); // criação do tabuleiro como um array de 6 linhas x 8 colunas

window.addEventListener("load", init, false);

function init() {
	game.stage = document.querySelector("#stage");
	setupAudio(); 		// configurar o audio
	getFaces(); 		// calcular as faces e guardar no array faces
	createCountries();	// criar países

	unguessedCards = TOTAL_CARDS;

	// inicia o tempo ao carregar o jogo:
	startTime = Date.now(); // Regista o tempo de início do jogo

	// Após o primeiro clique, o som de fundo começa a tocar:
	// Tivemos de fazer isto pois a maioria dos navegadores não permitem que o som comece a tocar sem interação do utilizador.
	document.addEventListener("click", startBackgroundMusic, { once: true });
	document.addEventListener("click", startTimer, { once: true });

	console.log("Jogo iniciado. Cartas por adivinhar:", unguessedCards);
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

	// Define o tamanho do tabuleiro:
	const pairs = TOTAL_CARDS / 2;

	// Baralha as cartas:
	scramble(pairs);

	// Adiciona as cartas ao tabuleiro:
	render();
}

// baralha as cartas no tabuleiro
function scramble(pairs) {
	// Duplica e baralha as faces:
	const shuffledCards = [];
	for (let i = 0; i < pairs; i++) {
		shuffledCards.push(faces[i]);
		shuffledCards.push(faces[i]);
	}
	// Baralha as faces:
	shuffledCards.sort(() => Math.random() - 0.5);

	// Atualiza o array faces com as faces baralhadas:
	game.shuffledCards = shuffledCards;
}

// Adicionar as cartas do tabuleiro à stage
function render() {
	const stage = game.stage;

	for (let index = 0; index < TOTAL_CARDS; index++) {
		const face = game.shuffledCards[index];
		const card = document.createElement("div");
		card.classList.add("carta");
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
		// DelayNextAction(500)
	}

	// index++; // Incrementa o índice para a próxima carta
	// }, 500); // Adiciona uma carta a cada meio segundo

	// const cards = document.getElementsByClassName("carta")
	// console.log("==========CARTAS============")
	// console.log(cards)
	// console.log("==========CARTAS============")
	// for (let index = 0; index < cards.length; index++) {
	// 	var card = cards[index];
	// 	console.log("=================================")
	// 	console.log("CARTA" + card)
	// 	console.log("=================================")
	// 	card.classList.add("escondida");
	// 	stage.appendChild(card)
	// }

}
// function DelayNextAction(milliseconds) {
//     const start = Date.now();
//     while (Date.now() - start < milliseconds) {
//         // Busy-wait loop
//     }
// }
// Inicia o som de fundo:
function startBackgroundMusic() {
	game.sounds.background.play();
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
			scrambleUnguessedCards();
			timeElapsed = 0; // Reinicia o tempo
			gameRunning ? startTimer() : ""; // Reinicia o temporizador
		}
	}, 1000); // atualiza a cada segundo 
}

// Vira a carta, mostrando ou escondendo a imagem e toca o respetivo som:
function flipCard(card) {
	if (card.classList.contains("escondida") && flippedCards.length < 2) {
		game.sounds.flip.play();
		card.classList.remove("escondida");
		flippedCards.push(card); // Adiciona a carta ao array de cartas viradas

		moves++;

		// Verifica se duas cartas foram viradas:
		if (flippedCards.length === 2) {
			checkMatch();
		}
	}
}

// Verifica se as cartas viradas são iguais:
function checkMatch() {
	const [card1, card2] = flippedCards;

	// Compara as posições de fundo das cartas para saber se são iguais:
	if (card1.style.backgroundPosition === card2.style.backgroundPosition) {
		game.sounds.success.play();
		card1.classList.add("certa");
		card2.classList.add("certa");
		flippedCards = []; // limpa o array de cartas viradas
		console.log("Cards ungessed " + unguessedCards);
		unguessedCards -= 2;
		console.log("Cards ungessed " + unguessedCards);

		// Verifica se todas as cartas foram encontradas:
		if (unguessedCards === 0) {
			const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
			win(elapsedTime, moves);
		}
	} else {
		game.sounds.hide.play();
		setTimeout(() => {
			card1.classList.add("escondida");
			card2.classList.add("escondida");
			flippedCards = []; // limpa o array de cartas viradas	
		}, 500); // espera meio segundo antes de esconder as cartas
	}
}

// rebaralha as cartas ainda não encontradas:
function scrambleUnguessedCards() {
	// limpa o array de cartas viradas:
	flippedCards = [];

	const unguessedCards = Array.from(document.querySelectorAll(".carta:not(.certa)"));

	// adiciona a classe de animação às cartas não encontradas:
	unguessedCards.forEach(card => {
		card.classList.add("shuffle");
	});

	// esconde todas as cartas que estão viradas:
	unguessedCards.forEach(card => {
		if (!card.classList.contains("escondida")) {
			card.classList.add("escondida");
		}
	});

	//aguarda o término da animação antes de baralhar as cartas:
	setTimeout(() => {
		// remove a classe de animação
		unguessedCards.forEach(card => {
			card.classList.remove("shuffle");
		});

		// baralha as faces das cartas não encontradas:
		const shuffledCards = unguessedCards.map(card => ({
			x: card.style.backgroundPositionX,
			y: card.style.backgroundPositionY,
		})).sort(() => Math.random() - 0.5);

		// Atualiza as posições de fundo das cartas e o array game.shuffledCards:
		unguessedCards.forEach((card, index) => {
			card.style.backgroundPositionX = shuffledCards[index].x;
			card.style.backgroundPositionY = shuffledCards[index].y;

			// atualiza o array game.shuffledCards:
			game.shuffledCards[index] = {
				x: shuffledCards[index].x,
				y: shuffledCards[index].y,
			};
		});

		// Verifica se todas as cartas foram encontradas após o reembaralhamento:
		if (unguessedCards === 0) {
			const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
			win(elapsedTime, moves);
		}
	}, 800); // duração da animação (0.8s)
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
	else {
		notification.remove();
	}
}

// Adiciona o evento de clique ao botão de reiniciar (barra de espaço):
window.addEventListener("keydown", (event) => {
	if (!gameRunning) {
		return
	}
	if (event.code === "Space") {
		restartGame();
	}
});

function restartGame() {
	// Redefine o estado do jogo:
	flippedCards = [];
	unguessedCards = ROWS * COLS;
	moves = 0;
	startTime = Date.now();
	gameRunning = true;

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

	// Reinicia o som de fundo:
	game.sounds.background.currentTime = 0;
	game.sounds.background.play();

	console.log("Jogo reiniciado. Cartas por adivinhar:", unguessedCards);
}

function win(elapsedTime, moves) {
	gameRunning = false;
	clearInterval(timerId);
	game.sounds.background.pause();
	game.sounds.background.currentTime = 0;
	game.sounds.win.play();

	const score = calculateScore(elapsedTime, moves);

	showNotification(
		"Parabéns! Você ganhou o jogo em " + elapsedTime + " segundos com " + moves + " movimentos. " +
		"Sua pontuação final é " + score + ". " +
		"O jogo será reiniciado dentro de segundos.",
		10
	);

	setTimeout(restartGame, 10000); // Reinicia o jogo após 5 segundos
}

function calculateScore(time, moves) {
	const baseScore = 1000; // Pontuação base
	const timePenalty = time * 2; // Penalidade por tempo (quanto maior o tempo, maior a penalidade)
	const movePenalty = moves * 5; // Penalidade por movimentos (quanto mais movimentos, maior a penalidade)
	return Math.max(baseScore - timePenalty - movePenalty, 0); // Garante que a pontuação não fique negativa
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
	game.sounds.background.volume = 0.05;  // o volume varia entre 0 e 1

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