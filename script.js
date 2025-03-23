document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("game-board");
    const restartBtn = document.getElementById("restart");
    const difficultySelect = document.getElementById("difficulty");
    const themeSelect = document.getElementById("theme-select");
    const cardSetSelect = document.getElementById("card-set");
    const timerDisplay = document.getElementById("timer");
    const movesDisplay = document.getElementById("moves");

    const cardFlipSound = new Audio("flip.mp3");
    const matchSound = new Audio("match.mp3");
    const winSound = new Audio("win.mp3");

    let firstCard, secondCard;
    let lockBoard = false;
    let moves = 0;
    let timer;
    let seconds = 0;

    const cardSets = {
        classic: ["🍎", "🍌", "🍒", "🍇", "🥝", "🍍", "🥕", "🌽", "🍉", "🥑", "🍔", "🍕"],
        animals: ["🐶", "🐱", "🦁", "🐼", "🐨", "🦊", "🐸", "🐵", "🐷", "🐘", "🦉", "🐢"],
        space: ["🚀", "🪐", "🌍", "🌕", "✨", "🛸", "☄️", "🔭", "🌌", "🌠", "🛰️", "👨‍🚀"],
        superheroes: ["🦸‍♂️", "🦸‍♀️", "🕷️", "🦇", "⚡", "🛡️", "🔥", "🦹‍♂️", "🦹‍♀️", "🧙‍♂️", "🦸", "🦿"]
    };

    function getPairCount(difficulty) {
        return difficulty === "easy" ? 4 : difficulty === "medium" ? 8 : 12;
    }

    function startTimer() {
        clearInterval(timer);
        seconds = 0;
        timerDisplay.textContent = "Time: 0s";
        timer = setInterval(() => {
            seconds++;
            timerDisplay.textContent = `Time: ${seconds}s`;
        }, 1000);
    }

    function checkWin() {
        const totalPairs = getPairCount(difficultySelect.value);
        const flippedCards = document.querySelectorAll(".flipped").length;
    
        if (flippedCards === totalPairs * 2) {
            clearInterval(timer);
    
            // Ensure the sound plays fully before the alert
            winSound.currentTime = 0;  
            winSound.play();  
    
            setTimeout(() => {
                alert(`🎉 Congratulations! You won in ${moves} moves and ${seconds} seconds!`);
            }, 500); // Delay alert so sound plays
        }
    }
    
    function createBoard() {
        gameBoard.innerHTML = "";
        moves = 0;
        movesDisplay.textContent = "Moves: 0";
        clearInterval(timer);
        startTimer();
    
        // Stop win sound if it's playing
        winSound.pause();
        winSound.currentTime = 0;
    
        let pairCount = getPairCount(difficultySelect.value);
        let selectedSet = cardSetSelect.value;
        let selectedCards = cardSets[selectedSet].slice(0, pairCount);
        let cardSet = [...selectedCards, ...selectedCards].sort(() => Math.random() - 0.5);
    
        let cols = Math.ceil(Math.sqrt(pairCount * 2));
        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 100px)`;
    
        cardSet.forEach(symbol => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.dataset.symbol = symbol;
    
            const frontFace = document.createElement("div");
            frontFace.classList.add("front");
            frontFace.textContent = "?";
    
            const backFace = document.createElement("div");
            backFace.classList.add("back");
            backFace.textContent = symbol;
    
            card.appendChild(frontFace);
            card.appendChild(backFace);
            card.addEventListener("click", flipCard);
            gameBoard.appendChild(card);
        });
    }
    
    

    function flipCard() {
        if (lockBoard || this === firstCard) return;
        this.classList.add("flipped");
        cardFlipSound.play();

        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        lockBoard = true;
        moves++;
        movesDisplay.textContent = `Moves: ${moves}`;
        checkMatch();
    }

    function checkMatch() {
        let isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;
        if (isMatch) {
            matchSound.play();
            resetBoard();
            checkWin();
        } else {
            setTimeout(() => {
                firstCard.classList.remove("flipped");
                secondCard.classList.remove("flipped");
                resetBoard();
            }, 1000);
        }
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    function changeTheme() {
        document.body.className = themeSelect.value + "-theme";
    }
    

    restartBtn.addEventListener("click", createBoard);
    difficultySelect.addEventListener("change", createBoard);
    cardSetSelect.addEventListener("change", createBoard);
    themeSelect.addEventListener("change", changeTheme);

    createBoard();
});
