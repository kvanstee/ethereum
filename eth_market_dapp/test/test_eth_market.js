var Sell_eth = artifacts.require("./Sell_eth.sol");

contract('Sell_eth', function(accounts) {
  eth = web3.eth;
  var a1 = eth.accounts[1]; // an address
  var a2 = eth.accounts[2]; // another address fg var a3 = eth.accounts[3];
  var a3 = eth.accounts[3];
  var a4 = eth.accounts[4];
  var amt1 = web3.toWei(1, "ether");
  var amt2 = web3.toWei(2, "ether");
  var amt3 = web3.toWei(3, "ether");
  var amt4 = web3.toWei(4, "ether");
  var selleth;
  var events = selleth.allEvents(function(error, log) {if (!error) console.log(log);});

  it("should set up the sale contract", function(done) {
    Sell_eth.new( 142857142857142, {from: a1, value: amt4}).then(function(instance) {
      selleth = Sell_eth.at(instance.address);
      done();
    });
  }); 

  it("should confirm purchase of ether", function(done) {
    selleth.purchase.sendTransaction({from: a2, value: 142857142857142*5000});
//    events = selleth.allEvents(function(error, log) {if (!error) console.log(log);});
    done();
  });
  
  it("should confirm receipt of cash", function(done) {
    selleth.confirmReceived.sendTransaction(a2, {from:a1});
//    events = selleth.allEvents(function(error, log) {if (!error) console.log(log);});
    done();
  });
  
  it("should increase weiForSale by 2 ether", function(done) {
    selleth.addEther.sendTransaction({from:a1, value: amt4});
//    events = selleth.allEvents(function(error, log) {if (!error) console.log(log);});
    done();
  });
})

