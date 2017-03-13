pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Prediction.sol";

contract TestPredict {

  function testInitialBalanceWithNewPredicton() {
    Prediction pred = new Prediction("hello", 10, value: 50000000000);

    uint  expected = 5;

    Assert.equal(pred.balance, expected, "contract should have balance of 5");
  }

}
