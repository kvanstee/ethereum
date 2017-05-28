pragma solidity ^0.4.4;

contract Orders {

  address[] instOfSellOrders;
  address[] instOfBuyOrders;
  address owner;
  address order;
  
//  function Orders() {owner = msg.sender;}
  
  function addSellOrder(address _contract) {
     instOfSellOrders.push(_contract);
  }
  
  function removeSellOrder(address _address)  returns(address) {
    for (uint i = 0; i<instOfSellOrders.length; i++){
      if (instOfSellOrders[i] == _address) {
        uint index = i;
        for (uint x = index; x<instOfSellOrders.length; x++) {
          instOfSellOrders[x] = instOfSellOrders[x+1];
        }
      }    
    }
    delete instOfSellOrders[instOfSellOrders.length-1];
    instOfSellOrders.length--;
  }
 
  function addBuyOrder(address _contract) {
    instOfBuyOrders.push(_contract);
  }
  
  function removeBuyOrder(address _address)  returns(address) {
    for (uint i = 0; i<instOfBuyOrders.length; i++){
      if (instOfBuyOrders[i] == _address) {
        uint index = i;
        for (uint x = index; x<instOfBuyOrders.length; x++) {
          instOfBuyOrders[x] = instOfBuyOrders[x+1];
        }
      }    
    }
    delete instOfBuyOrders[instOfBuyOrders.length-1];
    instOfBuyOrders.length--;
  }

  function getSellOrders() returns(address[]) {
    return instOfSellOrders;
  }

  function getBuyOrders() returns(address[]) {
    return instOfBuyOrders;
  }
}
