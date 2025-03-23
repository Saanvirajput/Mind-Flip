document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("game-board");
    const restartBtn = document.getElementById("restart");
    const difficultySelect = document.getElementById("difficulty");
    const themeSelect = document.getElementById("theme-select");
    const cardSetSelect = document.getElementById("card-set");
    const timerDisplay = document.getElementById("timer");
    const movesDisplay = document.getElementById("moves");
    const starsDisplay = document.getElementById("stars");
    const pauseBtn = document.getElementById("pause");
    const leaderboardList = document.getElementById("leaderboard-list");
    const musicToggle = document.getElementById("music-toggle");
    const bgMusic = document.getElementById("bg-music");
    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.accept = "image/*";
    uploadInput.multiple = true;
    uploadInput.style.display = "none";
    document.body.appendChild(uploadInput);

    const cardFlipSound = new Audio("flip.mp3");
    const matchSound = new Audio("match.mp3");
    const winSound = new Audio("win.mp3");

    let firstCard, secondCard;
    let lockBoard = false;
    let moves = 0;
    let timer;
    let seconds = 0;
    let paused = false;
    let customImages = [];

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
            if (!paused) {
                seconds++;
                timerDisplay.textContent = `Time: ${seconds}s`;
            }
        }, 1000);
    }

    function updateStars() {
        if (moves <= 10) starsDisplay.textContent = "Stars: ⭐⭐⭐";
        else if (moves <= 15) starsDisplay.textContent = "Stars: ⭐⭐";
        else starsDisplay.textContent = "Stars: ⭐";
    }

    function saveLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
        leaderboard.push({ moves, seconds });
        leaderboard.sort((a, b) => a.seconds - b.seconds || a.moves - b.moves);
        localStorage.setItem("leaderboard", JSON.stringify(leaderboard.slice(0, 5)));
        displayLeaderboard();
    }

    function displayLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
        leaderboardList.innerHTML = "";
        leaderboard.forEach(entry => {
            const li = document.createElement("li");
            li.textContent = `Time: ${entry.seconds}s, Moves: ${entry.moves}`;
            leaderboardList.appendChild(li);
        });
    }

    function checkWin() {
        const totalPairs = getPairCount(difficultySelect.value);
        const flippedCards = document.querySelectorAll(".flipped").length;

        if (flippedCards === totalPairs * 2) {
            clearInterval(timer);
            winSound.currentTime = 0;  
            winSound.play();  

            setTimeout(() => {
                alert(`🎉 You won in ${moves} moves and ${seconds} seconds!`);
                saveLeaderboard();
            }, 500);
        }
    }

    function createBoard() {
        gameBoard.innerHTML = "";
        moves = 0;
        movesDisplay.textContent = "Moves: 0";
        starsDisplay.textContent = "Stars: ⭐⭐⭐";
        clearInterval(timer);
        startTimer();
        paused = false;
        pauseBtn.textContent = "Pause";
        winSound.pause();
        winSound.currentTime = 0;

        let pairCount = getPairCount(difficultySelect.value);
        let selectedSet = cardSetSelect.value;
        let selectedCards;

        if (selectedSet === "custom" && customImages.length >= pairCount) {
            selectedCards = customImages.slice(0, pairCount);
        } else {
            selectedCards = cardSets[selectedSet].slice(0, pairCount);
        }

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
            if (selectedSet === "custom") {
                const img = document.createElement("img");
                img.src = symbol;
                img.style.width = "80px";
                img.style.height = "80px";
                backFace.appendChild(img);
            } else {
                backFace.textContent = symbol;
            }

            card.appendChild(frontFace);
            card.appendChild(backFace);
            card.addEventListener("click", flipCard);
            gameBoard.appendChild(card);
        });
    }

    function flipCard() {
        if (lockBoard || this === firstCard || paused) return;
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
        updateStars();
        checkMatch();
    }

    function checkMatch() {
        let isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;
        if (isMatch) {
            matchSound.play();
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");
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

    pauseBtn.addEventListener("click", () => {
        paused = !paused;
        pauseBtn.textContent = paused ? "Resume" : "Pause";
    });

    musicToggle.addEventListener("click", () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.textContent = "Music Off";
        } else {
            bgMusic.pause();
            musicToggle.textContent = "Music On";
        }
    });

    restartBtn.addEventListener("click", createBoard);
    difficultySelect.addEventListener("change", createBoard);
    cardSetSelect.addEventListener("change", () => {
        if (cardSetSelect.value === "custom") {
            uploadInput.click();
        } else {
            createBoard();
        }
    });
    themeSelect.addEventListener("change", changeTheme);

    uploadInput.addEventListener("change", (e) => {
        customImages = [];
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                customImages.push(event.target.result);
                if (customImages.length === e.target.files.length) {
                    createBoard();
                }
            };
            reader.readAsDataURL(file);
        });
    });

    displayLeaderboard();
    createBoard();
});
