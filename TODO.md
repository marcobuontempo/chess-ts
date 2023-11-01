2. create encodeBoardstate() and decodeBoardstate() functions
3. update parseFEN() to encode boardstate as UInt32
4. update getFEN() to properly get FEN
5. update printBoard() to access boardstate values correctly and display current FEN
6. update makeMove() to increment ply count and update boardstates
7. update unmakeMove() to decrement ply count and reverse previous move




- WRITE UNIT TESTS FOR GENERATEMOVES() FOR EVERY PIECE. E.G. (ONLY PAWN ON BOARD, PUSH, DOUBLEPUSH) (PAWN AND PIECE, CAPTURE)

4. fix perft() function. generateMoves() => BLACK PAWN IS REGISTERING ALL MOVES INSTEAD OF VALID MOVES (I.E. DIAGONAL AND DOUBLEPUSH ALWAYS GENERATING WHEN NOT ACTUALLY AVAILABLE)
1. makeMove, use meaningful constant values instead of hardcoding numbers
5. create engine.tests for king castling (king can_castle flag, then can castle. king castling through attacked squares, cannot castle)
7. create engine.tests for enpassant moves
8. validate move -> check whether king squares are attacked during castle
9. EDGE validation for engine.tests
6. don't use has_moved flag king or rook. use can_castle only!