pragma solidity ^0.4.0;

contract Buy_eth {
    uint weiToBuy;
    uint price; //wei per smallest currency unit (eg. cent)   
    address buyer;
    struct Seller {uint amount; uint price; bool pending;}
    mapping(address => Seller) sellers;

    modifier onlyBuyer() { if (msg.sender != buyer) throw;  _; }
    
    event newWeiToBuy(uint indexed wei_to_buy);
    event newPrice(uint indexed nprice);
    event saleConfirmed(address indexed _seller, uint value, uint price);
    event cashReceived(address indexed _seller);

    function Buy_eth(uint _price) payable {
        buyer = msg.sender;
        price = _price;
        weiToBuy = msg.value;
        newWeiToBuy(weiToBuy);
        newPrice(price);
    }

    function sell() payable {
        if (msg.value/2 > weiToBuy || (msg.value/2/price)%5000 != 0) throw;
        uint amt = msg.value/2;
        saleConfirmed(msg.sender, amt, price);
        sellers[msg.sender] = Seller (amt, price, true);
        weiToBuy -= amt;
        newWeiToBuy(weiToBuy);
    }

    function confirmReceived() payable {
        Seller seller = sellers[msg.sender];
        cashReceived(msg.sender);
        if (seller.pending != true) throw;
        seller.pending = false;
        uint amt = seller.amount;
        seller.amount = 0;
        if (!msg.sender.send(amt)) throw;
    }
    
    function buy_more() onlyBuyer payable {  
        weiToBuy += msg.value;
        newWeiToBuy(weiToBuy);
    }

    function buy_less(uint amount) onlyBuyer payable {
        weiToBuy -= amount;
        if (!buyer.send(amount)) throw;
        newWeiToBuy(weiToBuy);
    }

    function changePrice(uint new_price) onlyBuyer {
        price = new_price;
        newPrice(price);
    }
   
    function get_cont_bal() returns(uint balance) {
        return this.balance;
    }

    function terminate_contract() onlyBuyer payable {
        if (this.balance < weiToBuy) selfdestruct(buyer);
    }
}

    
