var Sell_eth = artifacts.require("contracts/Sell_eth.sol");

  eth = web3.eth;
  var a1 = eth.accounts[1]; // an address
  var a2 = eth.accounts[2]; // another address
  var a3 = eth.accounts[3];
  var a4 = eth.accounts[4];
  var amt1 = web3.toWei(1, "ether");
  var amt2 = web3.toWei(2, "ether");
  var amt3 = web3.toWei(3, "ether");
  var amt4 = web3.toWei(4, "ether");
  var selleth;

  Sell_eth.new( 142857142857142, {from: a1, value: amt4}).then(function(instance) {
    selleth = Sell_eth.at(instance.address);
    var events = selleth.allEvents(function(error, log) {if (!error) console.log(log);});
  })
