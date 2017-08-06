pragma solidity ^0.4.4;

import "./Orders.sol";

contract Sell_eth {
    Orders orders;
    uint weiForSale;
    uint price; //wei per smallest currency unit (eg. cent)
    address seller;
    struct Buyer {uint amount; uint price; bool pending;}
    mapping(address => Buyer) buyers;
    modifier onlySeller() { require(msg.sender == seller);  _; }

    event NewWeiForSale(uint indexed wei_for_sale);
    event NewPrice(uint indexed nprice);
    event PurchasePending(address  _buyer, uint value, uint price);
    event CashReceived(address rec_buyer);

    function Sell_eth(uint _price, address _seller, address _orders) payable {
	orders = Orders(_orders);
        seller = _seller;
        price = _price;
        weiForSale = msg.value / 2;
    }
    
    function purchase() payable {
        require(buyers[msg.sender].pending == false && (msg.value/price)%5000 == 0);
        buyers[msg.sender] = Buyer (msg.value, price, true);
        weiForSale -= msg.value/2;
        NewWeiForSale(weiForSale);
        PurchasePending(msg.sender, msg.value, price);
    }

    function confirmReceived(address addr_buyer) onlySeller payable {
        Buyer storage rec_buyer = buyers[addr_buyer];
        require(rec_buyer.pending == true);
        rec_buyer.pending = false;
        uint amt = rec_buyer.amount;
        rec_buyer.amount = 0;
        addr_buyer.transfer(2*amt);
        CashReceived(addr_buyer);
    }

    function addEther() onlySeller payable {
        weiForSale += msg.value/2;
        NewWeiForSale(weiForSale);
    }

    function changePrice(uint new_price) onlySeller {
        price = new_price;
        NewPrice(price);
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

    function get_seller() constant returns(address) {
        return seller;
    }    

    function retr_funds() onlySeller {
      require(this.balance <= 2*weiForSale);
      orders.removeSellOrder(this);
      selfdestruct(seller);
    }
}        
    
        
