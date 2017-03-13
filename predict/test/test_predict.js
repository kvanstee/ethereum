var Prediction = artifacts.require("./Prediction.sol");

contract('Prediction', function(accounts) {
  it("should deploy new with account[2] making contract with 1 ether", function() {
    Prediction.new("I will win", 10, {from: accounts[2], value: web3.toWei(1, "ether")}).then(function(instance) {
      assert.equal(instance.balance, 1, "the contract balance is not 1 ether");
    });
  });
})
