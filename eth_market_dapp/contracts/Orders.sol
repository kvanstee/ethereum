pragma solidity ^0.4.4;

import "./Sell_eth.sol";
import "./Buy_eth.sol";

contract Orders {

  event LogNewSellOrder(address sellorder);
  event LogNewBuyOrder(address buyorder);
  event LogRemoveSellOrder(address sellorder);
  event LogRemoveBuyOrder(address buyorder);   

  function newSellOrder(uint price) payable {
    require(msg.value/2 > price*5000);
    address order =(new Sell_eth).value(msg.value)(price, msg.sender, this);
    LogNewSellOrder(order);    
  }

  function newBuyOrder(uint price) payable {
    require(msg.value > price*5000);
    address order =(new Buy_eth).value(msg.value)(price, msg.sender, this);
    LogNewBuyOrder(order);
  }

  function removeSellOrder() {  
    LogRemoveSellOrder(msg.sender);
  }

  function removeBuyOrder() {
    LogRemoveBuyOrder(msg.sender);
  }

  function() {revert();}
}
