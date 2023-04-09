class AntonChess{
    undoMemory = "";
    board = [
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null]
    ];
    white = true;
    positionsAttackedByOpp = [];
    positionsAttackedByMe = [];
    doTheKingsMoved = {
        white: false,
        black: false
    }
    doTheRooksMoved = {
        white: {left: false, right: false},
        black: {left: false, right: false}
    }
    enPassant = {
        white: false,
        black: false
    }

    constructor(white = true, board = [["r", "n", "b", "q", "k", "b", "n", "r"], ["p", "p", "p", "p", "p", "p", "p", "p"], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], ["P", "P", "P", "P", "P", "P", "P", "P"], ["R", "N", "B", "Q", "K", "B", "N", "R"]]) {
        this.board = board;
        this.white = white;
        this.calcAttackedPositions();
    }

    calcAttackedPositions(simulation = false){
        this.positionsAttackedByMe = [];
        this.positionsAttackedByOpp = [];
        for (let r=0; r<8; r++){
            for(let c=0; c<8; c++){
                const piece = this.board[r][c];
                if(piece === null) continue;
                if(this.white) {
                    if(this.isPieceWhite(piece)){
                        this.positionsAttackedByMe.push(...this.findPossibleMoves([r, c], true, simulation));
                    }else{
                        this.positionsAttackedByOpp.push(...this.findPossibleMoves([r, c], false, simulation));
                    }
                }else{
                    if(this.isPieceWhite(piece)){
                        this.positionsAttackedByOpp.push(...this.findPossibleMoves([r, c], true, simulation));
                    }else{
                        this.positionsAttackedByMe.push(...this.findPossibleMoves([r, c], true, simulation));
                    }
                }
            }
        }
    }

    makeCopy(){
        this.undoMemory = JSON.stringify({
            board: this.board,
            white: this.white,
            doTheKingsMoved: this.doTheKingsMoved,
            doTheRooksMoved: this.doTheRooksMoved,
            enPassant: this.enPassant
        })
    }
    undo(){
        if(this.undoMemory === "") return;
        const snap = JSON.parse(this.undoMemory);
        this.board = snap.board;
        this.white = snap.white;
        this.doTheKingsMoved = snap.doTheKingsMoved;
        this.doTheRooksMoved = snap.doTheRooksMoved;
        this.enPassant = snap.enPassant;
    }

    isGameOver(){
        const myPiecesPos = [];
        for(let r=0; r<8; r++){
            for(let c=0; c<8; c++){
                const piece = this.board[r][c];
                if(this.white){
                    if(this.isPieceWhite(piece)){
                        myPiecesPos.push([r, c])
                    }
                }else{
                    if(!this.isPieceWhite(piece)){
                        myPiecesPos.push([r, c])
                    }
                }
            }
        }

        for(const piecePos of myPiecesPos){
            const possibleMoves = this.findPossibleMoves(piecePos);
            if(possibleMoves.length > 0){
                return false;
            }
        }
        return true;
    }
    getPiece(position){
        if(this.isPositionOnBoard(position)){
            return this.board[position[0]][position[1]];
        }else{
            return null;
        }
    }
    isPositionAttacked(position){
        return (this.isPositionInPositionlist(this.positionsAttackedByOpp, position));
    }
    isPositionInPositionlist(moveList, move){
        for(const moveFromList of moveList){
            if(moveFromList.length === move?.length){
                let areMovesTheSame = true;
                for(let i=0; i<moveFromList.length; i++){
                    if(moveFromList[i] !== move[i]){
                        areMovesTheSame = false;
                    }
                }
                if(areMovesTheSame) return true;
            }
        }
        return false;
    }
    isPieceWhite = (piece) => piece === piece?.toUpperCase();
    isPositionOnBoard = position => position[0] >= 0 && position[0] <= 7 && position[1] >= 0 && position[1] <= 7;
    isPositionOccupied(white, position){
        const row = position[0];
        const column = position[1];
        const figure = this.board[row][column];

        if (figure === null) return false;
        if(white){
            return figure === figure.toUpperCase();
        }else{
            return figure !== figure.toUpperCase();
        }
    }
    isPositionBeaten(white, position){
        const row = position[0];
        const column = position[1];
        const figure = this.board[row][column];

        if (figure === null) return false;
        if(white){
            return figure !== figure.toUpperCase();
        }else{
            return figure === figure.toUpperCase();
        }
    }
    findPossibleMoves(position, white = this.white, simulation = false){
        const row = position[0];
        const column = position[1];
        const figure = this.board[row][column];
        if(figure === null || figure === undefined) return [];
        let moves = [];
        if(this.isPieceWhite(figure) && !white || !this.isPieceWhite(figure) && white) return moves;

        switch(figure.toLowerCase()){
            case "k":
                for(let c=-1; c<=1; c++){
                    for(let r=-1; r<=1; r++){
                        if (c===0 && r===0) continue;
                        const newPosition = [row+r, column+c];
                        if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) continue;
                        moves.push(newPosition);
                    }
                }

                // castling white
                if(white && this.doTheKingsMoved.white === false && this.doTheRooksMoved.white.left === false){
                    if(this.board[row][column-1] === null && this.board[row][column-2] === null && this.board[row][column-3] === null && this.board[row][column-4] === "R"  && !this.isPositionAttacked([row, column-1]) && !this.isPositionAttacked([row, column-2])){
                        moves.push([row, column-2])
                    }
                }
                if(white && this.doTheKingsMoved.white === false && this.doTheRooksMoved.white.right === false){
                    if(this.board[row][column+1] === null && this.board[row][column+2] === null && this.board[row][column+3] === "R"  && !this.isPositionAttacked([row, column+1]) && !this.isPositionAttacked([row, column+2])){
                        moves.push([row, column+2])
                    }
                }
                // castling black
                if(!white && this.doTheKingsMoved.black === false && this.doTheRooksMoved.black.left === false){
                    if(this.board[row][column-1] === null && this.board[row][column-2] === null && this.board[row][column-3] === null && this.board[row][column-4] === "r" && !this.isPositionAttacked([row, column-1]) && !this.isPositionAttacked([row, column-2])){
                        moves.push([row, column-2])
                    }
                }
                if(!white && this.doTheKingsMoved.black === false && this.doTheRooksMoved.black.right === false){
                    if(this.board[row][column+1] === null && this.board[row][column+2] === null && this.board[row][column+3] === "r" &&!this.isPositionAttacked([row, column+1]) && !this.isPositionAttacked([row, column+2])){
                        moves.push([row, column+2])
                    }
                }

                break;
            case "q":
                //columns and rows
                for(let i=1; i<=7; i++){
                    const newPosition = [row, column+i];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                for(let i=-1; i>=-7; i--){
                    const newPosition = [row, column+i];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                for(let i=1; i<=7; i++){
                    const newPosition = [row+i, column];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                for(let i=-1; i>=-7; i--){
                    const newPosition = [row+i, column];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }

                //diagonal
                for(let i=1; i<=7; i++){
                    const newPosition = [row+i, column+i];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                for(let i=-1; i>=-7; i--){
                    const newPosition = [row+i, column+i];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                for(let i=1; i<=7; i++){
                    const newPosition = [row+i, column-i];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                for(let i=1; i<=7; i++){
                    const newPosition = [row-i, column+i];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                break;
            case "r":
                for(let i=1; i<=7; i++){
                    const newPosition = [row, column+i];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                for(let i=-1; i>=-7; i--){
                    const newPosition = [row, column+i];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                for(let i=1; i<=7; i++){
                    const newPosition = [row+i, column];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                for(let i=-1; i>=-7; i--){
                    const newPosition = [row+i, column];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                break;
            case "b":
                for(let i=1; i<=7; i++){
                    const newPosition = [row+i, column+i];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                for(let i=-1; i>=-7; i--){
                    const newPosition = [row+i, column+i];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                for(let i=1; i<=7; i++){
                    const newPosition = [row+i, column-i];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                for(let i=1; i<=7; i++){
                    const newPosition = [row-i, column+i];
                    if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                        moves.push(newPosition);
                        break;
                    }
                    if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) break;
                    moves.push(newPosition);
                }
                break;
            case "n":
                for(let c=-2; c<=2; c++){
                    for(let r=-2; r<=2; r++){
                        if(c===0 || r===0) continue;
                        if(c%2===0){
                            if(r%2!==0){
                                const newPosition = [row+r, column+c];
                                if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                                    moves.push(newPosition);
                                    continue;
                                }
                                if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) continue;
                                moves.push(newPosition);
                            }
                        }else{
                            if(r%2===0){
                                const newPosition = [row+r, column+c];
                                if(this.isPositionOnBoard(newPosition) && this.isPositionBeaten(white, newPosition)){
                                    moves.push(newPosition);
                                    continue;
                                }
                                if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition)) continue;
                                moves.push(newPosition);
                            }
                        }
                    }
                }
                break;
            case "p":
                if(white){
                    const firstMove = row===6;
                    for(let r=-1; r>=(firstMove ? -2 : -1); r--){
                        const newPosition = [row+r, column];
                        if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition) || this.isPositionBeaten(white, newPosition)) break;
                        moves.push(newPosition);
                    }

                    const beatingLeftPosition = [row-1, column-1];
                    if(this.isPositionOnBoard(beatingLeftPosition) && this.isPositionBeaten(white, beatingLeftPosition)){
                        moves.push(beatingLeftPosition);
                    }

                    const beatingRightPosition = [row-1, column+1];
                    if(this.isPositionOnBoard(beatingRightPosition) && this.isPositionBeaten(white, beatingRightPosition)){
                        moves.push(beatingRightPosition);
                    }

                    //en passant
                    if(this.board[row][column-1] === "p"){
                        const beatingLeftPosition = [row-1, column-1];
                        if(this.enPassant.white !== false && this.enPassant.white[0] === beatingLeftPosition[0] && this.enPassant.white[1] === beatingLeftPosition[1]){
                            moves.push(beatingLeftPosition);
                        }
                    }
                    if(this.board[row][column+1] === "p"){
                        const beatingRightPosition = [row-1, column+1];
                        if(this.enPassant.white !== false && this.enPassant.white[0] === beatingRightPosition[0] && this.enPassant.white[1] === beatingRightPosition[1]){
                            moves.push(beatingRightPosition);
                        }
                    }
                    const newMoves = [];
                    for(let i=0; i<moves.length; i++){
                        const move = moves[i];
                        if(move[0]===0){
                            newMoves.push([...move, "R"]);
                            newMoves.push([...move, "N"]);
                            newMoves.push([...move, "B"]);
                            newMoves.push([...move, "Q"]);
                        }else{
                            newMoves.push(move);
                        }
                    }
                    moves = newMoves;
                }else{
                    const firstMove = position[0]===1;
                    for(let r=1; r<=(firstMove ? 2 : 1); r++){
                        const newPosition = [row+r, column];
                        if(!this.isPositionOnBoard(newPosition) || this.isPositionOccupied(white, newPosition) || this.isPositionBeaten(white, newPosition)) break;
                        moves.push(newPosition);
                    }

                    const beatingLeftPosition = [row+1, column-1];
                    if(this.isPositionOnBoard(beatingLeftPosition) && this.isPositionBeaten(white, beatingLeftPosition)){
                        moves.push(beatingLeftPosition);
                    }

                    const beatingRightPosition = [row+1, column+1];
                    if(this.isPositionOnBoard(beatingRightPosition) && this.isPositionBeaten(white, beatingRightPosition)){
                        moves.push(beatingRightPosition);
                    }


                    //en passant
                    if(this.board[row][column-1] === "P"){
                        const beatingLeftPosition = [row+1, column-1];
                        if(this.enPassant.black !== false && this.enPassant.black[0] === beatingLeftPosition[0] && this.enPassant.black[1] === beatingLeftPosition[1]){
                            moves.push(beatingLeftPosition);
                        }
                    }
                    if(this.board[row][column+1] === "P"){
                        const beatingRightPosition = [row+1, column+1];
                        if(this.enPassant.black !== false && this.enPassant.black[0] === beatingRightPosition[0] && this.enPassant.black[1] === beatingRightPosition[1]){
                            moves.push(beatingRightPosition);
                        }
                    }

                    const newMoves = [];
                    for(let i=0; i<moves.length; i++){
                        const move = moves[i];
                        if(move[0]===7){
                            newMoves.push([...move, "r"]);
                            newMoves.push([...move, "n"]);
                            newMoves.push([...move, "b"]);
                            newMoves.push([...move, "q"]);
                        }else{
                            newMoves.push(move);
                        }
                    }
                    moves = newMoves;
                }
                break;
        }
        if(simulation) return moves;
        return this.filterMovesByLegality(position, moves);

    }
    filterMovesByLegality(position, moves){
        const legalMoves = [];
        for(const move of moves){
            this.makeCopy();
            this.move(position, move, true)
            this.calcAttackedPositions(true);
            if(!this.amIChecked()) legalMoves.push(move);
            this.undo();
        }
        return legalMoves;
    }
    makeRandomMove(){
        const myPiecesPos = [];
        for(let r=0; r<8; r++){
            for(let c=0; c<8; c++){
                const piece = this.board[r][c];
                if(this.white){
                    if(this.isPieceWhite(piece)){
                        myPiecesPos.push([r, c])
                    }
                }else{
                    if(!this.isPieceWhite(piece)){
                        myPiecesPos.push([r, c])
                    }
                }
            }
        }

        const movesToChooseFrom = [];
        for(const piecePos of myPiecesPos){
            const possibleMoves = this.findPossibleMoves(piecePos);
            if(possibleMoves.length > 0){
                movesToChooseFrom.push([piecePos, possibleMoves[Math.floor(Math.random()*possibleMoves.length)]]);
            }
        }
        const chosenMove = movesToChooseFrom[Math.floor(Math.random()*movesToChooseFrom.length)];
        this.move(chosenMove[0], chosenMove[1]);
    }

    amIChecked(){
        let kingPosition;

        for(let r=0; r<8; r++){
            for(let c=0; c<8; c++){
                if(this.board[r][c]===(this.white ? "K" : "k")){
                    kingPosition = [r, c];
                    break;
                }
            }
        }
        return this.isPositionInPositionlist(this.positionsAttackedByOpp, kingPosition);
    }

    move(oldPosition, newPosition, simulation = false){
        let possibleMoves = []
        if(!simulation) possibleMoves = this.findPossibleMoves(oldPosition);
        if(simulation || this.isPositionInPositionlist(possibleMoves, newPosition)){
            if(!simulation) this.makeCopy();
            const piece = this.board[oldPosition[0]][oldPosition[1]];

            //en passant
            if(this.isPieceWhite(piece)){
                if((piece.toLowerCase()==="p" && this.enPassant.white !== false && newPosition[0] === this.enPassant.white[0] && newPosition[1] === this.enPassant.white[1]) ){
                    this.board[newPosition[0]+1][newPosition[1]] = null;
                }
                this.enPassant.white = false;
            }else{
                if((piece?.toLowerCase()==="p" && this.enPassant.black !== false && newPosition[0] === this.enPassant.black[0] && newPosition[1] === this.enPassant.black[1]) ){
                    this.board[newPosition[0]-1][newPosition[1]] = null;
                }
                this.enPassant.black = false;
            }
            if(piece==="P" && oldPosition[0]===6 && newPosition[0]===4){
                this.enPassant.black = [newPosition[0]+1, newPosition[1]];
            }
            if(piece==="p" && oldPosition[0]===1 && newPosition[0]===3){
                this.enPassant.white = [newPosition[0]-1, newPosition[1]];
            }

            //castling
            if(piece === "k"){
                this.doTheKingsMoved.black = true;
            }else if (piece === "K"){
                this.doTheKingsMoved.white = true;
            }else if(piece==="r" && oldPosition[1]===0){
                this.doTheRooksMoved.black.left = true;
            }else if(piece==="r" && oldPosition[1]===7){
                this.doTheRooksMoved.black.right = true;
            }else if(piece==="R" && oldPosition[1]===0){
                this.doTheRooksMoved.white.left = true;
            }else if(piece==="R" && oldPosition[1]===7){
                this.doTheRooksMoved.white.right = true;
            }
            if(piece === "K" && oldPosition[1]-newPosition[1]===2){
                this.board[7][0] = null;
                this.board[newPosition[0]][newPosition[1]+1] = "R";
            }
            else if(piece === "K" && oldPosition[1]-newPosition[1]===-2){
                this.board[7][7] = null;
                this.board[newPosition[0]][newPosition[1]-1] = "R";
            }
            else if(piece === "k" && oldPosition[1]-newPosition[1]===2){
                this.board[0][0] = null;
                this.board[newPosition[0]][newPosition[1]+1] = "r";
            }
            else if(piece === "k" && oldPosition[1]-newPosition[1]===-2){
                this.board[0][7] = null;
                this.board[newPosition[0]][newPosition[1]-1] = "r";
            }

            //promotion
            if(newPosition[2] !== undefined){
                this.board[newPosition[0]][newPosition[1]] = newPosition[2];
            }else{
                this.board[newPosition[0]][newPosition[1]] = this.board[oldPosition[0]][oldPosition[1]];
            }
            this.board[oldPosition[0]][oldPosition[1]] = null;

            if(!simulation) this.white = !this.white;

            if(!simulation) this.calcAttackedPositions();

            //TO CHANGEEEEEEEEEEEEEEEEEEEEE
            if(!simulation && this.isGameOver()){
                alert(`WYGRALY ${this.white ? "CZARNE" : "BIALE"}`);
            }

            return true;
        }
        return false;
    }
}
