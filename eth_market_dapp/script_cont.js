
personal.unlockAccount(eth.accounts[0], "hello1", 0);
personal.unlockAccount(eth.accounts[1], "hello2", 0);
//personal.unlockAccount(eth.accounts[2], "hello3", 0);
//personal.unlockAccount(eth.accounts[3], "hello4", 0);
//personal.unlockAccount(eth.accounts[4], "hello5", 0);

cont = eth.compile.solidity(source).sellEth;
abi = cont.info.abiDefinition;
code = cont.code;


amt = web3.toWei(10 , "ether");
arg1 = 1600;
//arg2 = 10;

eth.contract(abi).new(arg1, {from: eth.accounts[0], data: code, value: amt, gas: 500000}, function(err, contract) {
    if (!err) {
        if (!contract.address) console.log("mining....");
        else {console.log("mined! " + contract.address)};
        buy_eth = eth.contract(abi).at(contract.address);
    }
    else console.log(err);
});


eth.getBlock("pending", true).transactions;

miner.start(1); admin.sleepBlocks(1); miner.stop();

//buy_eth.confirmPurchase.sendTransaction({from: eth.accounts[1], value: web3.toWei(5000/arg1, "ether"), gas: 200000});

//pred.newBet(function(error, result) { if (!error) {console.log(result.args.tbt, result.args.tbf)}});
buy_eth.
buy_eth.aborted(function(error) { if (!error) {console.log("contract aborted")}});
buy_eth.newPrice(function(error, result) { if (!error) {console.log("new price " + result)}});
buy_eth.purchaseConfirmed(function(error, result) { if (!error) {console.log("pending purchase " + result)}});
buy_eth.cashReceived(function(error) { if (!error) {console.log("cash received. thank you")}});
