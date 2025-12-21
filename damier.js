        const boardSize = 10;
        let board = [];
        let currentPlayer = 1;
        let selectedPiece = null;
        let possibleMoves = [];
        let mustCapture = false;

        // Initialisation du plateau
        function initializeBoard() {
            board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < boardSize; col++) {
                    if ((row + col) % 2 === 1) {
                        board[row][col] = 2; // Joueur 2 (Bleu)
                    }
                }
            }
            for (let row = 6; row < boardSize; row++) {
                for (let col = 0; col < boardSize; col++) {
                    if ((row + col) % 2 === 1) {
                        board[row][col] = 1; // Joueur 1 (Rouge)
                    }
                }
            }
        }

        // Vérifier si le joueur doit capturer
        function checkMustCapture(player) {
            for (let row = 0; row < boardSize; row++) {
                for (let col = 0; col < boardSize; col++) {
                    if (board[row][col] === player) {
                        const moves = getPossibleMoves(row, col);
                        if (moves.some(move => move.capture)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        // Affichage du plateau
        function renderBoard() {
            const gameBoard = document.getElementById('gameBoard');
            gameBoard.innerHTML = '';
            
            // Vérifier si une capture est obligatoire
            mustCapture = checkMustCapture(currentPlayer);
            const captureMessage = document.getElementById('capture-obligatoire');
            captureMessage.style.display = mustCapture ? 'block' : 'none';
            
            for (let row = 0; row < boardSize; row++) {
                for (let col = 0; col < boardSize; col++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell ' + ((row + col) % 2 === 0 ? 'white' : 'black');
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                    
                    if (board[row][col] !== 0) {
                        const piece = document.createElement('div');
                        piece.className = 'piece player' + board[row][col];
                        if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
                            piece.classList.add('selected');
                        }
                        
                        // Ne permettre la sélection que si c'est au tour du joueur
                        if (board[row][col] === currentPlayer) {
                            // Si une capture est obligatoire, vérifier que cette pièce peut capturer
                            if (!mustCapture || (mustCapture && getPossibleMoves(row, col).some(move => move.capture))) {
                                piece.addEventListener('click', () => selectPiece(row, col));
                            }
                        }
                        
                        cell.appendChild(piece);
                    } else {
                        // Vérifier si cette case est un mouvement possible
                        const moveIndex = possibleMoves.findIndex(move => move.row === row && move.col === col);
                        if (moveIndex !== -1) {
                            cell.classList.add(possibleMoves[moveIndex].capture ? 'capture-move' : 'possible-move');
                            cell.addEventListener('click', () => movePiece(row, col));
                        }
                    }
                    
                    gameBoard.appendChild(cell);
                }
            }
            updateStatus();
        }

        // Sélection d'une pièce
        function selectPiece(row, col) {
            if (board[row][col] === currentPlayer) {
                selectedPiece = { row, col };
                possibleMoves = getPossibleMoves(row, col);
                
                // Si une capture est obligatoire, filtrer les mouvements pour ne garder que les captures
                if (mustCapture) {
                    possibleMoves = possibleMoves.filter(move => move.capture);
                }
                
                renderBoard();
            }
        }

        // Obtenir les mouvements possibles
        function getPossibleMoves(row, col) {
            const moves = [];
            const directions = currentPlayer === 1 ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
            
            for (let [dr, dc] of directions) {
                // Mouvement simple
                let newRow = row + dr;
                let newCol = col + dc;
                if (isValidPosition(newRow, newCol) && board[newRow][newCol] === 0) {
                    moves.push({ row: newRow, col: newCol });
                }
                
                // Capture
                newRow = row + 2 * dr;
                newCol = col + 2 * dc;
                const midRow = row + dr;
                const midCol = col + dc;
                if (isValidPosition(newRow, newCol) && board[newRow][newCol] === 0 && 
                    isValidPosition(midRow, midCol) && board[midRow][midCol] === (3 - currentPlayer)) {
                    moves.push({ 
                        row: newRow, 
                        col: newCol, 
                        capture: { row: midRow, col: midCol } 
                    });
                }
            }
            return moves;
        }

        // Vérifier si la position est valide
        function isValidPosition(row, col) {
            return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
        }

        // Déplacer une pièce
        function movePiece(row, col) {
            if (selectedPiece && possibleMoves.some(move => move.row === row && move.col === col)) {
                const move = possibleMoves.find(m => m.row === row && m.col === col);
                board[row][col] = board[selectedPiece.row][selectedPiece.col];
                board[selectedPiece.row][selectedPiece.col] = 0;
                
                if (move.capture) {
                    board[move.capture.row][move.capture.col] = 0;
                    
                    // Vérifier si une capture multiple est possible
                    selectedPiece = { row, col };
                    possibleMoves = getPossibleMoves(row, col).filter(m => m.capture);
                    
                    if (possibleMoves.length > 0) {
                        // Continuer avec le même joueur pour une capture multiple
                        renderBoard();
                        return;
                    }
                }
                
                // Passer au joueur suivant
                currentPlayer = 3 - currentPlayer;
                selectedPiece = null;
                possibleMoves = [];
                renderBoard();
                checkGameOver();
            }
        }

        // Mettre à jour le statut du jeu
        function updateStatus() {
            const playerName = currentPlayer === 1 ? 'Rouge' : 'Bleu';
            document.getElementById('status').textContent = `Tour du joueur ${currentPlayer} (${playerName})`;
        }

        // Vérifier la fin de la partie
        function checkGameOver() {
            let player1Pieces = 0, player2Pieces = 0;
            for (let row = 0; row < boardSize; row++) {
                for (let col = 0; col < boardSize; col++) {
                    if (board[row][col] === 1) player1Pieces++;
                    if (board[row][col] === 2) player2Pieces++;
                }
            }
            
            if (player1Pieces === 0) {
                alert('Joueur 2 (Bleu) gagne !');
                resetGame();
            } else if (player2Pieces === 0) {
                alert('Joueur 1 (Rouge) gagne !');
                resetGame();
            } // else if (player1Pieces != 0 && player2Pieces != 0){
            //     alert('Nous n\'avons aucun gagnant pour ce tour !');
            //     resetGame();
            // }

        }

        // Réinitialiser la partie
        function resetGame() {
            initializeBoard();
            currentPlayer = 1;
            selectedPiece = null;
            possibleMoves = [];
            mustCapture = false;
            renderBoard();
        }

        // Événement pour le bouton de réinitialisation
        document.getElementById('resetButton').addEventListener('click', resetGame);

        // Lancer le jeu
        initializeBoard();
        renderBoard();