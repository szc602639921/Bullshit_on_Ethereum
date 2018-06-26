var Game = artifacts.require("./Game.sol");
//var openpgp = require('../files/openpgp.min.js');
//openpgp.initWorker({ path:'../files/openpgp.worker.min.js' });

contract('Game', function(accounts) {
    var account_one = accounts[0];
    var account_two = accounts[1];
    var account_three = accounts[2];
    var account_four = accounts[3];
    var account_five = accounts[4];

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
        [dealer, state] = await game.getState.call("test");
        assert.equal(dealer,5,"Dealer");
        await game.join.sendTransaction("test",0,{from: account_two});
        [dealer,_] = await game.getState.call("test");
        assert.equal(dealer,5,"Dealer");
        await game.join.sendTransaction("test",0,{from: account_three});
        [dealer,_] = await game.getState.call("test");
        assert.equal(dealer,5,"Dealer");
        await game.join.sendTransaction("test",0,{from: account_four});
        [dealer,_] = await game.getState.call("test");
        assert.equal(dealer,5,"Dealer");
        assert.equal(state, 0)
        await game.join.sendTransaction("test",0,{from: account_five});
        [_,state] = await game.getState.call("test"), 10;
        assert.equal(state, 1, "Game should transition to deal state after all players joined.");
        [dealer,_] = await game.getState.call("test");
        assert.isAtLeast(parseInt(dealer,10),0,"Dealer Id must be in expected range of player Ids.");
        assert.isBelow(parseInt(dealer, 10),5,"Dealer Id must be in expected range of player Ids.");
    });
});
