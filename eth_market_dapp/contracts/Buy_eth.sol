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
    event salePending(address indexed _seller, uint value, uint price);
    event cashReceived(address indexed _seller);

    function Buy_eth(uint _price, address _buyer) payable {
        buyer = _buyer;
        price = _price;
        weiToBuy = msg.value;
    }
    function sell() payable {
        if (msg.value/2 > weiToBuy || (msg.value/2/price)%5000 != 0 || sellers[msg.sender].pending == true) throw;
        uint amt = msg.value/2;
        salePending(msg.sender, amt, price);
        sellers[msg.sender] = Seller (amt, price, true);
        weiToBuy -= amt;
        newWeiToBuy(weiToBuy);
    }

    function confirmReceived() payable {
        Seller seller = sellers[msg.sender];
        if (seller.pending != true) throw;
        seller.pending = false;
        uint amt = seller.amount;
        seller.amount = 0;
        if (!msg.sender.send(amt)) throw;
        cashReceived(msg.sender);
    }
    
    function buy_more() onlyBuyer payable {  
        weiToBuy += msg.value;
        newWeiToBuy(weiToBuy);
    }
    function changePrice(uint new_price) onlyBuyer {
        price = new_price;
        newPrice(price);
    }
   
    function get_cont_bal() returns(uint balance) {
        return this.balance;
    }

    function get_price() returns(uint price) {
        return price;
    }

    function get_wei_to_buy() returns(uint) {
        return weiToBuy;
    }

    function get_values() returns(uint, uint) {
        return (weiToBuy, price);
    }

    function get_buyer() returns(address) {
        return buyer;
    }

    function terminate_contract() onlyBuyer payable {
        if (this.balance < weiToBuy) selfdestruct(buyer);
    }
}
