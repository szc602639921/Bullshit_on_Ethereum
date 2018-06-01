pragma solidity ^0.4.17;

contract Game {
    struct gameInfo {
        uint size;
        address[5] playerAddrs;
        uint dealer;
    }

    mapping(string => gameInfo) private playerGameMap;

    function join(string gameName, uint256 players) public returns (address[5]) {

        if (playerGameMap[gameName].size == 0) {
            require(players >= 2 && players <= 5);
            uint rnd = uint(keccak256(block.timestamp)) % players;
            playerGameMap[gameName] = gameInfo(players,[msg.sender,0,0,0,0],rnd);

            return playerGameMap[gameName].playerAddrs;
        }

        for(uint i = 0; i<=playerGameMap[gameName].size; i++) {
            if(playerGameMap[gameName].playerAddrs[i] == msg.sender){
                break;
            }
            if(playerGameMap[gameName].playerAddrs[i] == 0){
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

    if (currentGame.playerAddrs[currentGame.size - 1] == 0){
        return false;
    }

    return true;
}
function getDealer(string gameName) public view returns (uint) {
    return playerGameMap[gameName].dealer;
}
}

