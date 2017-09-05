pragma solidity ^0.4.4;

import "./Sell_eth.sol";
import "./Buy_eth.sol";

contract Orders {

  address[] SellOrders;
  address[] BuyOrders;
  //address owner;  
  //function Orders() {owner = msg.sender;}

  event LogNewSellOrder(address _from, address addr);
  event LogNewBuyOrder(address _from, address addr);
   
  function newSellOrder(uint price) payable {
    require(msg.value/2 > price*5000);
    address order =(new Sell_eth).value(msg.value)(price, msg.sender, this);
    LogNewSellOrder(msg.sender, order);    
    SellOrders.push(order);
  }
  function newBuyOrder(uint price) payable {
    require(msg.value > price*5000);
    address order =(new Buy_eth).value(msg.value)(price, msg.sender, this);
    LogNewBuyOrder(msg.sender, order);
    BuyOrders.push(order);
  }

  function removeSellOrder() {  
    for (uint i = 0; i<SellOrders.length; i++){
      if (SellOrders[i] == msg.sender) {
        uint index = i;
        for (uint x = index; x<SellOrders.length-1; x++) {
          SellOrders[x] = SellOrders[x+1];
        }
      }    
    }
    delete SellOrders[SellOrders.length-1];
    SellOrders.length--;
  }
  function removeBuyOrder() {
    for (uint i = 0; i<BuyOrders.length; i++){
      if (BuyOrders[i] == msg.sender) {
        uint index = i;
        for (uint x = index; x<BuyOrders.length-1; x++) {
          BuyOrders[x] = BuyOrders[x+1];
        }
      }    
    }
    delete BuyOrders[BuyOrders.length-1];
    BuyOrders.length--;
  }

  function getSellOrders() returns(address[]) {
    return SellOrders;
  }

  function getBuyOrders() returns(address[]) {
    return BuyOrders;
  }

  function() {revert();}
}
