pragma solidity ^0.4.21;

import "./Sell_eth.sol";
import "./Buy_eth.sol";

contract Orders {

  event LogNewSellOrder(bytes3 indexed currency, address sellorder);
  event LogNewBuyOrder(bytes3 indexed currency, address buyorder);
  event LogRemoveSellOrder(address indexed sellorder);
  event LogRemoveBuyOrder(address indexed buyorder);   
  event LogNewMessage(address indexed to, string message);

  function newSellOrder(bytes3 curr, uint price) public payable {
    require(msg.value/price >= 10000);
    address order =(new Sell_eth).value(msg.value)(price, msg.sender, this);
    emit LogNewSellOrder(curr, order);    
  }

  function newBuyOrder(bytes3 curr, uint price) public payable {
    require(msg.value/price >= 5000);
    address order =(new Buy_eth).value(msg.value)(price, msg.sender, this);
    emit LogNewBuyOrder(curr, order);
  }

  function removeSellOrder() public {  
    emit LogRemoveSellOrder(msg.sender);
  }

  function removeBuyOrder() public {
    emit LogRemoveBuyOrder(msg.sender);
  }

  function message(address to, string new_message) public {
    emit LogNewMessage(to, new_message);
  }

  function() public {revert();}
}

