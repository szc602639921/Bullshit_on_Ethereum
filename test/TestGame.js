var Game = artifacts.require("./Game.sol");

contract('Game', function(accounts) {

    var account_one = accounts[0];
    var account_two = accounts[1];

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
});
