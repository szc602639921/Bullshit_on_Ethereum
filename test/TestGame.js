var Game = artifacts.require("Game");

contract('Game', function(accounts) {
  it("should allow a user to create a game", function() {
    return Game.deployed().then(function(instance) {
      return instance.join.call("test",3);
    }).then(function(players) {
      assert.notEqual(players[0], 0, "Player 1 creation did not work!");
      assert.equal(players[1], 0, "Player 2 exists already!");
      assert.equal(players[2], 0, "Player 3 exists already!");
    });
  });

    it("should not be allowed to join twice", function() {
        return Game.deployed().then(function(instance) {
          return instance.join.call("test",3);
        }).then(function(players) {
          assert.equal(players[1], 0, "Player 2 exists already!");
          assert.equal(players[2], 0, "Player 3 exists already!");
        });

  });
});
