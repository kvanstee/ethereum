var Sell_eth = artifacts.require("./Sell_eth.sol");
var Buy_eth = artifacts.require("./Buy_eth.sol");


module.exports = function(deployer) {
  deployer.deploy(Sell_eth);
};

module.exports = function(deployer) {
  deployer.deploy(Buy_eth);
};
