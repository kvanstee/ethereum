pragma solidity ^0.4.4;

import "./Sell_eth.sol";
import "./Buy_eth.sol";

contract Orders {

  address[] SellOrders;
  address[] BuyOrders;
  //address owner;  
  //function Orders() {owner = msg.sender;}

  event NewSellOrder(address _from, address addr);
  event NewBuyOrder(address _from, address addr);
   
  function newSellOrder(uint price) payable {
    address order =(new Sell_eth).value(msg.value)(price, msg.sender, this);
    NewSellOrder(msg.sender, order);    
    SellOrders.push(order);
  }

  function newBuyOrder(uint price) payable {
    address order =(new Buy_eth).value(msg.value)(price, msg.sender, this);
    NewBuyOrder(msg.sender, order);
    BuyOrders.push(order);
  }

  function removeSellOrder(address _address) {
    for (uint i = 0; i<SellOrders.length; i++){
      if (SellOrders[i] == _address) {
        uint index = i;
        for (uint x = index; x<SellOrders.length-1; x++) {
          SellOrders[x] = SellOrders[x+1];
        }
      }    
    }
    delete SellOrders[SellOrders.length-1];
    SellOrders.length--;
  }
  
  function removeBuyOrder(address _address) {
    for (uint i = 0; i<BuyOrders.length; i++){
      if (BuyOrders[i] == _address) {
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
}  
  
