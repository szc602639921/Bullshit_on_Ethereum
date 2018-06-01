var Game = artifacts.require("Game");
var account_one = "0x8D27cD939932a86c27A2d46f1cBc314f883ceD4c";
var account_two = "0x9aBb837096c6084F5777cfbA8A24DAdDda81b96c";

contract('Game', function(accounts) {
    
    
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
          return game.join.call("test",3,{from: account_two});
        }).then(function(players) {
            console.log(game.address);
            console.log(players);
            assert.notEqual(players[1],0, "Player 2 not created")
        });
    });

});
