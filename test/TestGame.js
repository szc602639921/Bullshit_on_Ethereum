var Game = artifacts.require("Game");

contract('Game', function(accounts) {
   var game;
   var account_one = accounts[0];
    var account_two = accounts[1];
 
    
  it("should allow a user to create a game", function() {
        return Game.deployed().then(function(instance) {
          instance.join.call("test",3,{from: account_one});  
          return instance.join.call("test",3,{from: account_two});
        }).then(function(players) {
          console.log(players);
          assert.equal(players[1], 0, "Player 2 exists already!");
          assert.equal(players[2], 0, "Player 3 exists already!");
        });
    });

    it("should not be allowed to join twice", function() {
        return Game.deployed().then(function(instance) {
          game = instance;
          
          return game.join.call("test",3,{from: account_one});
        }).then(function(players) {
          console.log(game.address);
          console.log(players);
          assert.equal(players[1], 0, "Player 2 exists already!");
          assert.equal(players[2], 0, "Player 3 exists already!");
          return game.join.call("test",3,{from: account_one});
        }).then(function(players) {
            console.log(game.address);
            console.log(players);
            assert.equal(players[1], 0, "Player 2 exists already!");
            assert.equal(players[2], 0, "Player 3 exists already!");
        });
    });

    it("should not be allowed to join twice", function() {
        return Game.deployed().then(function(instance) {
            game = instance;
            return game.join.call("test",3,{from: account_one});
        }).then(function(players) {
            console.log(game.address);
            console.log(players);
            assert.notEqual(players[0],0, "Player 1 not created")
          return game.getPlayers.call("test",{from: account_two});
        }).then(function(players) {
            console.log(players);
            return game.join.call("test",0,{from: account_two});
        }).then(function(players) {
            console.log(game.address);
            console.log(players);
            assert.notEqual(players[1],0, "Player 2 not created")
        });
    });

});
