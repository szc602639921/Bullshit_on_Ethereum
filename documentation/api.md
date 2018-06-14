# Data Structures
    struct gameInfo {
        enum gameState = {JOIN, REVEAL, PLAY, DEAL, END}
        uint size;
        address[5] playerAddrs;
        uint256 dealer;
        string[5] pubKeys;
        int[50] tableCards;
        string[5] revealNonces;
    }

# Functions

uint getCurrentPlayer(String gameName)
uint getDealer(String gameName)
bool playCard(String gameName, String cardHash)
bool claimLie(String gameName)
bool dealCards(String gameName, array[])
int[] getCards(String gameName) // Address of sender is implicitly known
bool submitNonces(String gameName, String nonce)
string[5] retrieveNonces(String gameName)
bool isGameFull(String gameName);
bool joinGame(String gameName, int playerCount);