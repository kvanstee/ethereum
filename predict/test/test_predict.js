var Prediction = artifacts.require("./Prediction.sol");

contract('Prediction', function(accounts) {
  eth = web3.eth;
  var a1 = eth.accounts[1]; // an address
  var a2 = eth.accounts[2]; // another address
  var a3 = eth.accounts[3];
  var a4 = eth.accounts[4];
  var amt1 = web3.toWei(1, "ether");
  var amt2 = web3.toWei(2, "ether");
  var amt3 = web3.toWei(3, "ether");
  var amt4 = web3.toWei(4, "ether");

  it("should set up the contract", function(done) {
      Prediction.new("hello", 5, {from: a1, value: amt1}).then(function(instance) {
        hello = Prediction.at(instance.address);
        var events = hello.allEvents(function(error, log) {if (!error) console.log(log);});
        hello.get_tbt.call().then(function(result) {
          assert.equal(JSON.parse(result), 500000000000000000, "[E] tbt should equal half of balance");
          done();
        }).catch(done);
        it("should bet 2 ether true", function(done) {
          hello.bet.sendTransaction(true, {from:a2, value:amt2}).then(function() {
            hello.get_tbt.call().then(function(result) {
              assert.equal(web3.fromWei(JSON.parse(result), "ether"), 1.5, "[E] tbt should be 1.5 ether"); 
              done();
            }).catch(done);
          });
        });
      });
  });
  




//.then(function(result) {
    //console.log(result);// If this callback is called, the transaction was successfully processed.
    //alert("Transaction successful!")
  //}).catch(function(e) {
    //alert("There was an error! Handle it. ")
  //});
})
