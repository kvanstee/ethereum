var Sell_eth = artifacts.require("./Sell_eth.sol");

contract('Sell_eth', function(accounts) {
  eth = web3.eth;
  var a = accounts;
  var amt = [0, 1, 2, 3, 4];
  var selleth;
  var expect  = require("chai").expect;  

  it("should set up the sale contract", function(done) {
      Sell_eth.new( 142857142857142, {from: a[1], value: web3.toWei(amt[4], "ether")}).then(function(instance) {
      selleth = Sell_eth.at(instance.address);
      selleth.newWeiForSale({'wei_for_sale': 2000000000000000000}, function(error, result) {
        selleth.get_cont_bal.call().then(function(error, bal) {
          if (!error && bal.toNumber != 0) expect(bal.toNumber).to.equal(web3.toWei(amt[4]));
        });
      });
      selleth.newPrice({'nPrice': 142857142857142}, function(error, result) {
        if (!error && result != null) assert.isOk(result);
      });
      done();
    });
  }); 

  it("should confirm purchase of ether", function(done) {
    selleth.purchase({from: a[2], value: 142857142857142*5000});
    selleth.purchaseConfirmed({'_buyer': a[2]}, function(error, result) {
      if (!error && result != null) {
        expect(result.args.value.toNumber()).to.equal(142857142857142*5000);
        expect(result.args.price.toNumber()).to.equal(142857142857142);
      };
    });
    selleth.newWeiForSale({'wei_for_sale': 1285714285714290000}, function(error, result) {
      if (!error && result != null) assert.isOk(result);
    });
    selleth.get_cont_bal.call().then(function(error, bal) {
      if (!error && bal.toNumber != 0) expect(bal.toNumber).to.equal(web3.toWei(amt[4]).toNumber + 142857142857142*5000);
    });
    done();
  });
  
  it("should confirm receipt of cash", function(done) {
    selleth.confirmReceived(a[2], {from:a[1]});
    selleth.cashReceived({'_buyer': a[2]}, function(error, result) {
      if (!error && result !=null) assert.isOk(result);
    });
    selleth.get_cont_bal.call().then(function(error, bal) {
      if (!error && bal.toNumber != 0) expect(bal.toNumber).to.equal(web3.toWei(amt[4]).toNumber - 142857142857142*5000);
    });
    done();
  });
  
  it("should increase weiForSale by 2 ether", function(done) {
    selleth.addEther({from:a[1], value: web3.toWei(amt[4])});
    selleth.newWeiForSale({'wei_for_sale': 3285714285714290000 }, {from: a[1]}, function(error, result) {
        if (!error && result != null) assert.isOk(result);
    });
    done();
  });
  
  it("should change the price", function(done) {
    selleth.changePrice(152857142857142, {from:a[1]});
    selleth.newPrice({'nPrice': 152857142857142}, function(error, result) {
      if (!error && result != null) assert.isOk(result);
    });
    done();
  });
})


