pragma solidity ^0.4.17;


contract Game {


    struct gameInfo {
        uint size;
        address[5] playerAddrs;
        uint256 dealer;
        //string[5] pubKeys;
    }
    struct gameData {
	    int[4][52] playerCards;//mybe not use this
        int[][4][2] CardHistory;//second dim: players third dim: 0 is the encrypt real card 
    }

    mapping(string => gameInfo) private playerGameMap;
    mapping(string => gameData) private playerGameData;

    function join(string gameName, uint256 players) public returns (address[5]) {

        if (playerGameMap[gameName].size == 0) {
            require(players >= 2 && players <= 5);
            playerGameMap[gameName] = gameInfo(players, [msg.sender, 0, 0, 0, 0], 5);

            return playerGameMap[gameName].playerAddrs;
        }

        gameInfo memory currentGame =  playerGameMap[gameName];

        for (uint i = 0; i <= currentGame.size; i++) {
            if (playerGameMap[gameName].playerAddrs[i] == msg.sender) {
                break;
            }
            if (playerGameMap[gameName].playerAddrs[i] == 0x0) {
                if (i == currentGame.size - 1) {
                    uint rnd = uint(keccak256(block.timestamp)) % currentGame.size;
                    playerGameMap[gameName].dealer = rnd;
                }
                playerGameMap[gameName].playerAddrs[i] = msg.sender;
                break;
            }
        }

        return playerGameMap[gameName].playerAddrs;
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


function giveCard(string gameName,int theCard,int theCheat) public  returns (bool){
  
    uint playerId = getPlayerId(gameName);
    if(playerId > playerGameMap[gameName].size)
    {
        return false;
    }

    playerGameData[gameName].CardHistory[playerId][0].push(theCard);// hash of card
    playerGameData[gameName].CardHistory[playerId][1].push(theCheat);

    return true;

}




}

