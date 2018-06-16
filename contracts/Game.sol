pragma solidity ^0.4.17;


contract Game {

    enum GameState { JOIN, LIE, PLAY, DEAL, END }

    struct gameInfo {
        uint size;
        address[5] playerAddrs;
        uint dealer;
        uint currentPlayer;
        GameState gameState;
        uint8[] playedCards;
        uint8[51][5] initialCards;
        byte[256][][5] nonces;
        //string[5] pubKeys;
    }

/*
    struct gameData {
        int[4][52] playerCards;
        int[][4][2] CardHistory;//second dim: players third dim: 0 is the encrypt real card 
    }
*/

    mapping(string => gameInfo) private playerGameMap;
//    mapping(string => gameData) private playerGameData;

    function join(string gameName, uint256 players) public returns (address[5]) {

        gameInfo memory currentGame =  playerGameMap[gameName];

        if (currentGame.size == 0) {
            require(players >= 2 && players <= 5);
            uint8[51][5] memory test;
            byte[256][][5] memory nonces;
            playerGameMap[gameName] = gameInfo(
                players,
                [msg.sender, 0, 0, 0, 0],
                5,
                5,
                GameState.JOIN,
                new uint8[] (0),
                test,
                nonces
            );

            return playerGameMap[gameName].playerAddrs;
        }


        for (uint i = 0; i <= currentGame.size; i++) {
            if (currentGame.playerAddrs[i] == msg.sender) {
                break;
            }
            if (currentGame.playerAddrs[i] == 0x0) {
                if (i == currentGame.size - 1) {
                    uint dealer = uint(keccak256(block.timestamp)) % currentGame.size;
                    uint firstPlayer = (dealer + 1) % currentGame.size;
                    playerGameMap[gameName].dealer = dealer;
                    playerGameMap[gameName].currentPlayer = firstPlayer;

                }
                playerGameMap[gameName].playerAddrs[i] = msg.sender;
                break;
            }
        }

        return currentGame.playerAddrs;
    }

    function getPlayers(string gameName) public view returns (address[5]) {
        return playerGameMap[gameName].playerAddrs;
    }

    function isGameFull(string gameName) public view returns (bool) {
        gameInfo memory currentGame =  playerGameMap[gameName];

        if (currentGame.playerAddrs[currentGame.size - 1] == 0) {
            return false;
        }

        return true;
    }

    function getDealer(string gameName) public view returns (uint) {
        return playerGameMap[gameName].dealer;
    }


    function playCard(string gameName, uint8 card) public returns (bool) {

        uint index = playerGameMap[gameName].currentPlayer;
        uint size = playerGameMap[gameName].size;
        address currentPlayerAddr = playerGameMap[gameName].playerAddrs[index];

        if (currentPlayerAddr != msg.sender) {
            return false;
        }

        playerGameMap[gameName].playedCards.push(card);
        playerGameMap[gameName].currentPlayer = (index + 1) % size;

        return true;


    }

    function getCurrentPlayer(string gameName) public view returns (uint) {
        return playerGameMap[gameName].currentPlayer;
    }

    function claimLie(string gameName) public returns (bool) {
        uint currentPlayer = playerGameMap[gameName].currentPlayer;
        address currentPlayerAddr = playerGameMap[gameName].playerAddrs[currentPlayer];
        uint size = playerGameMap[gameName].size;

        if (msg.sender == currentPlayerAddr) {

            playerGameMap[gameName].gameState = GameState.LIE;

            if (currentPlayer == 0) {
                playerGameMap[gameName].currentPlayer = currentPlayer - 1;
            } else {
                playerGameMap[gameName].currentPlayer = size - 1;
            }

            return true;
        }

        return false;
    }

    function dealCards(string gameName, uint8[51][5] cards) public returns (bool) {
        uint size = playerGameMap[gameName].size;

        for (uint i = 0; i < size; i++) {
            playerGameMap[gameName].initialCards[i] = cards[i];
        }

        return true;
    }

    function getCards(string _gameName) public view returns (uint8[51]) {

        return playerGameMap[_gameName].initialCards[_myPositon(_gameName, msg.sender)];

    }

    // https://stackoverflow.com/questions/42716858/string-array-in-solidity
    function submitNonces(string _gameName, byte[256][] _nonces) public returns (bool) {
        playerGameMap[_gameName].nonces[_myPositon(_gameName, msg.sender)] = _nonces;
        return true;
    }

    function takeCardsOnTable(string _gameName) public returns (uint8[]) {
        uint8[] memory cards = playerGameMap[_gameName].playedCards;
        playerGameMap[_gameName].playedCards = new uint8[] (0);
        return cards;
    }

    function _myPositon(string _gameName, address _addr) private view returns (uint) {

        for (uint i; i < playerGameMap[_gameName].size; i++) {
            if (playerGameMap[_gameName].playerAddrs[i] == _addr) {
                return i;
            }
        }
    }


/*
function getCard(string gameName,uint cardNumber) public view returns (int) {
for(uint i = 0; i<=playerGameMap[gameName].size; i++) {
            if(playerGameMap[gameName].playerAddrs[i] == msg.sender){
                return playerGameData[gameName].playerCards[i][cardNumber];
            }
}
return -1;
}

function getPlayerId(string gameName) public view returns (uint){
    for(uint i = 0; i<=playerGameMap[gameName].size; i++) {
            if(playerGameMap[gameName].playerAddrs[i] == msg.sender){
                return i;
            }
}
return 0xFFFF;
}

function getRound(string gameName) public view returns (uint){
    uint round = 0;
    for(uint i = 0; i<=playerGameMap[gameName].size; i++) {
        round += playerGameData[gameName].CardHistory[i][0].length;
    } 
    return round - 4;
}
*/
}
