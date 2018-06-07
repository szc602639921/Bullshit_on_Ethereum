var Game = artifacts.require("./Game.sol");
var openpgp = require('../files/openpgp.min.js');
openpgp.initWorker({ path:'../files/openpgp.worker.min.js' })

contract('Game', function(accounts) {

    var account_one = accounts[0];
    var account_two = accounts[1];
    var account_three = accounts[2];
    var account_four = accounts[4];
    var account_five = accounts[5];

    it("should be possible for two players to join", async () => {
        let game = await Game.new();
        let players = await game.join.sendTransaction("test",3,{from: account_one});
        players = await game.getPlayers.call("test",{from: account_one});
        //console.log(players);
        assert.notEqual(players[0],0, "Player 1 not created");
        players = await game.join.sendTransaction("test",3,{from: account_two});
        players = await game.getPlayers.call("test",{from: account_one});
        //console.log(players);
        assert.notEqual(players[1],0, "Player 2 not created");
    });

    it("should not be possible for a player to join twice", async () => {
        let game = await Game.new();
        await game.join.sendTransaction("test",3,{from: account_one});
        let players = await game.getPlayers.call("test",{from: account_one});
        assert.notEqual(players[0],0, "Player 1 not created");
        await game.join.sendTransaction("test",3,{from: account_one});
        players = await game.getPlayers.call("test",{from: account_one});
        assert.equal(players[1],0, "Player joined twice");
    });

    it("should recognize if round is full", async () => {
        let game = await Game.new();
        await game.join.sendTransaction("test",2,{from: account_one});
        let gameFull = await game.isGameFull.call("test",{from: account_one});
        assert.equal(gameFull,false, "Not full");
        await game.join.sendTransaction("test",2,{from: account_two});
        gameFull = await game.isGameFull.call("test");
        assert.equal(gameFull,true, "Game full check failed");
    });

    it("The dealer should only be determined after the last player joins.", async () => {
        let game = await Game.new();
        await game.join.sendTransaction("test",5,{from: account_one});
        dealer = await game.getDealer.call("test");
        assert.equal(dealer,5,"Dealer");
        await game.join.sendTransaction("test",0,{from: account_two});
        dealer = await game.getDealer.call("test");
        assert.equal(dealer,5,"Dealer");
        await game.join.sendTransaction("test",0,{from: account_three});
        dealer = await game.getDealer.call("test");
        assert.equal(dealer,5,"Dealer");
        await game.join.sendTransaction("test",0,{from: account_four});
        dealer = await game.getDealer.call("test");
        assert.equal(dealer,5,"Dealer");
        await game.join.sendTransaction("test",0,{from: account_five});
        dealer = await game.getDealer.call("test");
        assert.isAtLeast(dealer,0,"Dealer");
        assert.isBelow(dealer,5,"Dealer");
    });

    
    it("should recognize which round the game is ", async () => {
        let game = await Game.new();
	let  players = await game.join.sendTransaction("test",2,{from: account_one});
        await game.giveCard.sendTransaction("test",2,1,{from: account_one});
	let round = await game.getRound.call("test",{from: account_one});
	//console.log(round);
	//await game.giveCard.sendTransaction("test",2,1,{from: account_one});
	//round = await game.getRound.call("test",{from: account_one});
        //console.log(round);

    });


});
