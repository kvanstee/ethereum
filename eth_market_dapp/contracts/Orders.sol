pragma solidity ^0.4.4;

import "./Sell_eth.sol";

contract Orders {

  address[] SellOrders;
  address[] BuyOrders;
//  address owner;  
//  function Orders() {owner = msg.sender;}
  
  function newSellOrder(uint price) payable returns(address) {
    address order = (new Sell_eth).value(msg.value)(price, msg.sender);
    SellOrders.push(order);
    return order;
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
 
  function addBuyOrder(address _contract) {
    BuyOrders.push(_contract);
  }
  
  function removeBuyOrder(address _address) {
    for (uint i = 0; i<BuyOrders.length; i++){
      if (BuyOrders[i] == _address) {
        uint index = i;
        for (uint x = index; x<BuyOrders.length; x++) {
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
  
