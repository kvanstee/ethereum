var Sell_eth = artifacts.require("./Sell_eth.sol");
var Orders = artifacts.require("./Orders.sol");
var Buy_eth = artifacts.require("./Buy_eth.sol");

module.exports = function(deployer) {
  deployer.deploy(Orders);
  deployer.deploy(Sell_eth);
  deployer.deploy(Buy_eth);
};

