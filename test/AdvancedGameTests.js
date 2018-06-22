var Game = artifacts.require("./Game.sol");
var openpgp = require('../files/openpgp.min.js');
openpgp.initWorker({ path:'../files/openpgp.worker.min.js' });

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

contract('Game', function(accounts) {

    it("Test card dealing", async () => {
        let game = await Game.new();

        for (i = 1; i < 5; i++) {
          await game.join.sendTransaction("test",5,{from: accounts[i]});
        }

        await game.join.sendTransaction("test",0,{from: accounts[5]});
        [dealer, _] = await game.getState.call("test");

        var deck = [];

        for (var i = 0; i < 52; i++) {
           deck.push(i);
        }

        deck = shuffle(deck);

        var cards = [[],[],[],[],[]];

        for (i = 0; deck.length > 0 ; (i = (i + 1) % 5)) {
          cards[i].push(deck.pop());
        }

        await game.dealCards.sendTransaction("test", cards, {from: accounts[dealer]});
        r = await game.getCards.call("test");
        console.log(r.map(Number));
    });
});
