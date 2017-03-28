pragma solidity ^0.4.0;

contract Sell_eth {
    uint weiForSale;
    uint price; //wei per smallest currency unit (eg. cent)   
    address seller;
    struct Buyer {uint amount; uint price; bool pending;}
    mapping(address => Buyer) buyers;
    
 
    function Sell_eth(uint _price) payable {
        seller = msg.sender;
        price = _price;
        weiForSale = msg.value / 2;
//        if (weiForSale/price < 5000) throw;
        newWeiForSale(weiForSale);
        newPrice(price);
    }

    modifier onlySeller() { if (msg.sender != seller) throw;  _; }
    
    event newWeiForSale(uint wei_for_sale);
    event newPrice(uint price);
    event purchaseConfirmed(address _buyer, uint value, uint price);
    event cashReceived(address rec_buyer);

    function changePrice(uint newPrice) onlySeller {
        price = newPrice;
    }

    function purchase() payable {
        if (msg.value > weiForSale || (msg.value/price)%5000 != 0) throw;
        purchaseConfirmed(msg.sender, msg.value, price);
        buyers[msg.sender] = Buyer (msg.value, price, true);
        weiForSale -= buyers[msg.sender].amount;
        newWeiForSale(weiForSale);
    }

    function confirmReceived(address addr_buyer) onlySeller payable {
        Buyer rec_buyer = buyers[addr_buyer];
        cashReceived(addr_buyer);
        if (rec_buyer.pending != true) throw;
        rec_buyer.pending = false;
        uint amt = rec_buyer.amount;
        rec_buyer.amount = 0;
        if (amt != 0) {if (!addr_buyer.send(amt)) throw;}
    }
    
    function addEther() onlySeller payable {  
            weiForSale += msg.value/2;
            newWeiForSale(weiForSale);
    }
}

    
