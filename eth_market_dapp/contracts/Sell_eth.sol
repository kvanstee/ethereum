pragma solidity ^0.4.4;

contract Sell_eth {
    uint weiForSale;
    uint price; //wei per smallest currency unit (eg. cent)
    address seller;
    struct Buyer {uint amount; uint price; bool pending;}
    mapping(address => Buyer) buyers;
    modifier onlySeller() { if (msg.sender != seller) throw;  _; }

    event newWeiForSale(uint indexed wei_for_sale);
    event newPrice(uint indexed nprice);
    event purchasePending(address  _buyer, uint value, uint price);
    event cashReceived(address rec_buyer);

    function Sell_eth(uint _price, address _seller) payable {
        seller = _seller;
        price = _price;
        weiForSale = msg.value / 2;
        newWeiForSale(weiForSale);
        newPrice(price);
    }
    
    function purchase() payable {
        if (buyers[msg.sender].pending == true || msg.value > weiForSale || (msg.value/price)%5000 != 0) throw;
        purchasePending(msg.sender, msg.value, price);
        buyers[msg.sender] = Buyer (msg.value, price, true);
        weiForSale -= msg.value/2;
        newWeiForSale(weiForSale);
    }

    function confirmReceived(address addr_buyer) onlySeller payable {
        Buyer rec_buyer = buyers[addr_buyer];
        cashReceived(addr_buyer);
        if (rec_buyer.pending != true) throw;
        rec_buyer.pending = false;
        uint amt = rec_buyer.amount;
        rec_buyer.amount = 0;
        if (!addr_buyer.send(2*amt)) throw;
    }

    function addEther() onlySeller payable {
        weiForSale += msg.value/2;
        newWeiForSale(weiForSale);
    }

    function changePrice(uint new_price) onlySeller {
        price = new_price;
        newPrice(price);
    }

    function get_price() returns(uint) {
      return price;
    }

   function get_wei_for_sale() returns(uint) {
      return weiForSale;
    }

    function get_values() constant returns(uint, uint) {
         return (weiForSale, price);
    }

    function retr_funds() onlySeller {
      if (this.balance > 2*weiForSale) throw;
      selfdestruct(seller);
    }
}        
    
        
