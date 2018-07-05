pragma solidity ^0.4.23;


contract Game {

    event CardsAvailable(string gameName, uint8[] cards);

    enum GameState { JOIN, DEAL, PLAY, LIE, REVEAL, END }

    struct gameInfo {
        uint size;
        address[5] playerAddrs;
        uint currentPlayer;
        GameState state;
        uint8[] playedCards;
        string[5] initialCards;
        string[] pubkeys;
        //byte[256][][5] nonces;
    }

    mapping(string => gameInfo) private playerGameMap;

    function join(string gameName, uint256 players, string pubkey) public {

        gameInfo memory currentGame =  playerGameMap[gameName];

        if (currentGame.size == 0) {
            require(players >= 2 && players <= 5);
            uint8[51][5] memory test;
            //byte[150][] memory pubkeys = new byte[150][](players);
            string[] memory pubkeys = new string[](players);
            pubkeys[0] = pubkey;
            //pubkeys[0] = pubkey;
            //byte[256][][5] memory nonces;
            playerGameMap[gameName] = gameInfo(
                players,
                [msg.sender, 0, 0, 0, 0],
                5,
                GameState.JOIN,
                new uint8[] (0),
                test,
                pubkeys
                //nonces
            );

        }

        for (uint i = 0; i <= currentGame.size - 1; i++) {
            if (currentGame.playerAddrs[i] == msg.sender) {
                break;
            }
            if (currentGame.playerAddrs[i] == 0x0) {
                if (i == currentGame.size - 1) {
                    uint dealer = uint(keccak256(block.timestamp)) % currentGame.size;
                    playerGameMap[gameName].currentPlayer = dealer;
                    playerGameMap[gameName].state = GameState.DEAL;

                }
                playerGameMap[gameName].playerAddrs[i] = msg.sender;
                break;
            }
        }

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

    function playCard(string _gameName, uint8 _card) public {
        require(isGameFull(_gameName));

        uint index = playerGameMap[_gameName].currentPlayer;
        address currentPlayerAddr = playerGameMap[_gameName].playerAddrs[index];
        require(msg.sender == currentPlayerAddr);
        uint size = playerGameMap[_gameName].size;

        playerGameMap[_gameName].playedCards.push(_card);
        playerGameMap[_gameName].currentPlayer = (index + 1) % size;

    }

    function claimLie(string gameName) public returns (bool) {
        uint currentPlayer = playerGameMap[gameName].currentPlayer;
        uint8[] storage playedCards = playerGameMap[gameName].playedCards;
        address currentPlayerAddr = playerGameMap[gameName].playerAddrs[currentPlayer];
        uint size = playerGameMap[gameName].size;
        require(msg.sender == currentPlayerAddr);
        require(playedCards.length > 1);

        playerGameMap[gameName].state = GameState.LIE;

        if (isLie(playedCards)) {

            if (currentPlayer == 0) {
               playerGameMap[gameName].currentPlayer = size - 1;
            } else {
               playerGameMap[gameName].currentPlayer = currentPlayer - 1;
            }

        }
    }

    function dealCards(string gameName, string cards, uint _playerId) public {
        uint size = playerGameMap[gameName].size;
        require(_playerId < size);

        playerGameMap[gameName].initialCards[_playerId] = cards;

        playerGameMap[gameName].currentPlayer = (playerGameMap[gameName].currentPlayer+1)%playerGameMap[gameName].size;
        playerGameMap[gameName].state = GameState.PLAY;
    }

    function getCards(string _gameName) public view returns (uint8[51]) {

        uint p = getPlayerId(_gameName, msg.sender);
        return playerGameMap[_gameName].initialCards[p];

    }

    function showCardsOnTable(string _gameName) public view returns (uint8[]) {

        return playerGameMap[_gameName].playedCards;

    }

    function getPubkeys(string _gameName, uint _playerId) public view returns (string) {

        if(_playerId > playerGameMap[_gameName].pubkeys.length) {
            return "0";
        }

        return playerGameMap[_gameName].pubkeys[_playerId];

    }

    // https://stackoverflow.com/questions/42716858/string-array-in-solidity
//    function submitNonces(string _gameName, byte[256][] _nonces) public {
//        playerGameMap[_gameName].nonces[getPlayerId(_gameName, msg.sender)] = _nonces;
//    }

    function takeCardsOnTable(string _gameName) public {
        uint index = playerGameMap[_gameName].currentPlayer;
        address currentPlayerAddr = playerGameMap[_gameName].playerAddrs[index];
        require(msg.sender == currentPlayerAddr);
        require(GameState.LIE == playerGameMap[_gameName].state);

        uint8[] memory cards = playerGameMap[_gameName].playedCards;
        playerGameMap[_gameName].playedCards = new uint8[] (0);
        emit CardsAvailable(_gameName, cards);
        playerGameMap[_gameName].state = GameState.PLAY;
    }

    function getState(string _gameName) public view returns (uint, GameState, uint8) {
        require(playerGameMap[_gameName].size != 0);

        if (playerGameMap[_gameName].playedCards.length > 0) {
            return (playerGameMap[_gameName].currentPlayer, playerGameMap[_gameName].state, playerGameMap[_gameName].playedCards[0]);
        } else {
            return (playerGameMap[_gameName].currentPlayer, playerGameMap[_gameName].state, 0);
        }
    }

    function getPlayerId(string _gameName, address _addr) public view returns (uint) {
        for (uint i; i < playerGameMap[_gameName].size; i++) {
            if (playerGameMap[_gameName].playerAddrs[i] == _addr) {
                return i;
            }
        }
    }

    function isLie(uint8[] playedCards) public pure returns (bool) {
        uint8 lastCard = playedCards[playedCards.length - 1];
        uint8 openCard = playedCards[0];

        if(getSuit(lastCard) == getSuit(openCard) || getRank(lastCard) == getRank(openCard)) {
            return false;
        } else {
            return true;
        }


    }
/*
    SPADES: '♠', 0
    HEARTS: '♥', 1
    DIAMONDS: '♦', 2
    CLUBS: '♣' 3
*/
    function getSuit(uint8 card) public pure returns (uint8) {
        require(card < 52);
        return card / 13;
    }

    function getRank(uint8 card) public pure returns (uint8) {
        require(card < 52);
        return card % 13;
    }

    function getNumber(uint8 suit,uint8 rank) public pure returns (uint8) {
        require(suit < 4);
        require(rank < 13);
        return suit*13 + rank;
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
