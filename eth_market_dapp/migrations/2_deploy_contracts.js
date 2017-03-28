var Sell_eth = artifacts.require("./Sell_eth.sol");

module.exports = function(deployer) {
  deployer.deploy(Sell_eth);
};
