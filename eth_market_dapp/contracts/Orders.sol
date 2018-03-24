pragma solidity ^0.4.21;

import "./Sell_eth.sol";
import "./Buy_eth.sol";

contract Orders {

  event LogNewSellOrder(string indexed currency, address sellorder);
  event LogNewBuyOrder(string indexed currency, address buyorder);
  event LogRemoveSellOrder(string indexed currency, address sellorder);
  event LogRemoveBuyOrder(string indexed currency, address buyorder);   

  function newSellOrder(string curr, uint price) public payable {
    require(msg.value/price >= 10000);
    address order =(new Sell_eth).value(msg.value)(curr, price, msg.sender, this);
    emit LogNewSellOrder(curr, order);    
  }

  function newBuyOrder(string curr, uint price) public payable {
    require(msg.value/price >= 5000);
    address order =(new Buy_eth).value(msg.value)(curr, price, msg.sender, this);
    emit LogNewBuyOrder(curr, order);
  }

  function removeSellOrder(string curr) public {  
    emit LogRemoveSellOrder(curr, msg.sender);
  }

  function removeBuyOrder(string curr) public {
    emit LogRemoveBuyOrder(curr, msg.sender);
  }

  function() public {revert();}
}

