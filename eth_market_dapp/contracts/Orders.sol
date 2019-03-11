pragma solidity >=0.4.22 <0.6.0;

import "./Sell_eth.sol";
import "./Buy_eth.sol";

contract Orders {

  event LogNewSellOrder(bytes3 indexed currency, address sellorder);
  event LogNewBuyOrder(bytes3 indexed currency, address buyorder);
  event LogRemoveSellOrder(address indexed sellorder);
  event LogRemoveBuyOrder(address indexed buyorder);   
  function newSellOrder(bytes3 curr, uint price) public payable {
    require(msg.value/price >= 10000);
    Sell_eth newselleth = (new Sell_eth).value(msg.value)(price, msg.sender, address(this));
    emit LogNewSellOrder(curr, address(newselleth));    
  }

  function newBuyOrder(bytes3 curr, uint price) public payable {
    require(msg.value/price >= 5000);
    Buy_eth newbuyeth =(new Buy_eth).value(msg.value)(price, msg.sender, address(this));
    emit LogNewBuyOrder(curr, address(newbuyeth));
  }

  function removeSellOrder() public {  
    emit LogRemoveSellOrder(msg.sender);
  }

  function removeBuyOrder() public {
    emit LogRemoveBuyOrder(msg.sender);
  }

  function() external {revert();}
}

