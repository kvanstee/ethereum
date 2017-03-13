web3.personal.unlockAccount(eth.accounts[0], "hello1", 0)
cont = eth.compile.solidity(source).sellEth;
abi = cont.info.abiDefinition;
code = cont.code;

eth.contract(abi).new(arg1, {from: eth.accounts[0], data: code, value: web3.toWei(amt, "ether") gas: 500000}, function(err, contract) {
    if (!err) {
        if (!contract.address) console.log("mining....");
        else {console.log("mined! " + contract.address)};
        buyEth = eth.contract(abi).at(contract.address);
    }
    else console.log(err);
});

eth.getBlock("pending", true).transactions;

miner.start(1); admin.sleepBlocks(1); miner.stop();
