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

    it("Test card dealing with 5 players.", async () => {
        let game = await Game.new();

        for (i = 1; i < 5; i++) {
          await game.join.sendTransaction("test",5,{from: accounts[i]});
        }

        await game.join.sendTransaction("test",0,{from: accounts[5]});
        [dealer, _, _] = await game.getState.call("test");

        var deck = [];

        for (var i = 1; i < 53; i++) {
           deck.push(i);
        }

        deck = shuffle(deck);

        var cards = [[],[],[],[],[]];

        for (i = 0; deck.length > 0 ; (i = (i + 1) % 5)) {
          cards[i].push(deck.pop());
        }

        await game.dealCards.sendTransaction("test", cards, {from: accounts[dealer]});

        for (i = 1; i < 6; i++) {
          r = await game.getCards.call("test", {from: accounts[i]});
          ret_cards = r.map(Number).filter(item => item !== 0);
          assert.deepEqual(ret_cards, cards[i - 1]);
        }
    });

     it("Test card dealing with 2 players.", async () => {
       let game = await Game.new();

       for (i = 0; i < 1; i++) {
         await game.join.sendTransaction("test",2,{from: accounts[i]});
       }

       await game.join.sendTransaction("test",0,{from: accounts[1]});
       [dealer, state, _] = await game.getState.call("test");

       var deck = [];

       for (var i = 1; i < 53; i++) {
          deck.push(i);
       }

       deck = shuffle(deck);

       var cards = [[],[]];

       for (i = 0; deck.length > 0 ; (i = (i + 1) % 2)) {
         cards[i].push(deck.pop());
       }

       await game.dealCards.sendTransaction("test", cards, {from: accounts[dealer]});

       for (i = 0; i < 2; i++) {
         r = await game.getCards.call("test", {from: accounts[i]});
         ret_cards = r.map(Number).filter(item => item !== 0);
         assert.deepEqual(ret_cards, cards[i]);
       }
    });

     it("Test card dealing with 3 players.", async () => {
       let game = await Game.new();

       for (i = 0; i < 2; i++) {
         await game.join.sendTransaction("test",3,{from: accounts[i]});
       }

       await game.join.sendTransaction("test",0,{from: accounts[2]});
       [dealer, state, _] = await game.getState.call("test");

       var deck = [];

       for (var i = 1; i < 53; i++) {
          deck.push(i);
       }

       deck = shuffle(deck);

       var cards = [[],[],[]];

       for (i = 0; deck.length > 0 ; (i = (i + 1) % 3)) {
         cards[i].push(deck.pop());
       }

       await game.dealCards.sendTransaction("test", cards, {from: accounts[dealer]});

       for (i = 0; i < 3; i++) {
         r = await game.getCards.call("test", {from: accounts[i]});
         ret_cards = r.map(Number).filter(item => item !== 0);
         assert.deepEqual(ret_cards, cards[i]);
       }
    });

     it("Test card playing.", async () => {
       let game = await Game.new();

       await game.join.sendTransaction("test",2,{from: accounts[0]});
       await game.join.sendTransaction("test",0,{from: accounts[1]});

       [dealer, state, _] = await game.getState.call("test");

       assert.equal(parseInt(state,10),1,"Game must be in DEAL state.");

       var deck = [];

       for (var i = 0; i < 52; i++) {
          deck.push(i);
       }

       deck = shuffle(deck);

       var cards = [[],[]];

       for (i = 0; deck.length > 0 ; (i = (i + 1) % 2)) {
         cards[i].push(deck.pop());
       }

      // console.log(await game.getPlayerId("test", accounts[3]));

       await game.dealCards.sendTransaction("test", cards, {from: accounts[dealer]});

       [player, state, _] = await game.getState.call("test");
       assert.equal(parseInt(state,10),2,"Game must be in PLAY state.");

       await game.playCard.sendTransaction("test", 10, {from: accounts[player]});
       [_, _, c] = await game.getState.call("test");
       assert.equal(parseInt(c,10),10,"Open card must be equal to first played card.");
       [player, state, _] = await game.getState.call("test");
       await game.playCard.sendTransaction("test", 11, {from: accounts[player]});
       [_, _, c] = await game.getState.call("test");
       assert.equal(parseInt(c,10),10,"Open card must be equal to first played card.");

    });
});
