

window.addEventListener('load', function() {
  // Supports Metamask and Mist, and other wallets that provide 'web3'.
  if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet provider.
    window.web3 = new Web3(web3.currentProvider);
  } else {
    // No web3 detected. Show an error to the user or use Infura: https://infura.io/
  }
});

var Sell_eth = artifacts.require("./Sell_eth.sol");
var Buy_eth = artifacts.require("./Buy_eth.sol");

contract('Sell_eth', function(accounts) {
  eth = web3.eth;
  var a = accounts;
  var amt1 = web3.toWei(1, "ether");
  var amt2 = web3.toWei(2, "ether");
  var amt3 = web3.toWei(3, "ether");
  var amt4 = web3.toWei(4, "ether");
  var selleth;
  var buyeth;
  var expect = require("chai").expect;  
  var one_eth = web3.toWei(1, "ether");
  var price = one_eth/7000; // wei per smallest currency unit (eg. cent)

  it("should set up the sale contract", function() {
    return Sell_eth.new(price, {from: a[1], value: amt4}).then(function(instance) {
      selleth = Sell_eth.at(instance.address);
      selleth.allEvents(function(error, result) {console.log(result)}); 
      return selleth.get_cont_bal.call().then(function(bal) { 
        assert.equal(bal.toNumber(), amt4, "should be 4 ether in contract's account");
      });
    });
  }); 
  
  it("should confirm purchase of ether", function() {
    selleth.purchase({from: a[2], value: price*5000}).then(function() {
      selleth.get_cont_bal.call().then(function(bal) {
        assert.equal(bal.toNumber(), 4714285714285714000, "balance should be 4.7 ether");
      });
    });
  });
  
//  it("should confirm another purchase of ether", function(done) {
     

  it("should confirm receipt of cash", function() {
    selleth.confirmReceived(a[2], {from:a[1]}).then(function() {
      selleth.get_cont_bal.call().then(function(error, bal) { 
        assert.equal(bal.toNumber(), 3285714285714285600, "contract balance should decrease by 2*volume");
      });
    });
  });
  
  it("should increase weiForSale by 2 ether", function() {
    selleth.addEther({from:a[1], value: amt4}).then(function() {
      selleth.get_cont_bal.call().then(function(bal) { 
        assert.equal(bal.toNumber(), 7285714285714285600, "balance should be 4 ether more"); 
      });
    });
  });
  
/*  it("should change the price", function(done) {
    selleth.changePrice(one_eth/6000, {from:a[1]});
    selleth.newPrice({'nPrice': one_eth/6000}, {from: a[1]}, function(error, result) {
      assert.isOk(result);
      price = result.args.nPrice.toNumber;
      console.log("new price: " + price);
    });
    done();
  });

  it("should terminate the contract", function(done) {
    selleth.retr_funds({from: a[1]});
    selleth.get_cont_bal.call().then(function(error, bal) {
      expect(bal).to.equal(0);
    });
    done();
    console.log("balance: " + this.balance);
  });
*/
})

