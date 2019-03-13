// Import the page's CSS. Webpack will know what to do with it.
require('../stylesheets/app.css');
// Import libraries we need.
var jQuery = require('./libs/jquery-3.2.1.min.js');
window.$ = window.jQuery = jQuery;
var Mustache = require('./libs/mustache.js');
var deparam = require ('./libs/deparam.js');

//import { default as Web3} from 'web3';

// Import our contract artifacts and turn them into usable abstractions.
const selleth_abi = require('../../build/contracts/selleth.json').abi;
const buyeth_abi = require('../../build/contracts/buyeth.json').abi;
const orders_abi = require('../../build/contracts/orders.json').abi;


// usable abstractions, which we'll use through the code below.
var account;
var fiat_curr; //fiat currency
var orders_addr = '0x2abc27595ce8e46dd0f4698ec1c658957520180b';
var Sell_eth;
var Buy_eth;
var Orders;
var startBlock = '';
window.App = {
  start: function(_account) {
    var self = this;
    // Bootstrap the Buy_eth, Sell_eth and Orders abstraction for use.
    account = _account;
    //CURRENCY egAUD
    fiat_curr = document.getElementById("currency").value;
    //change currency
    var curr_text = document.getElementsByClassName("curren");
    var i = curr_text.length;
    while(i--) {curr_text[i].innerHTML = document.getElementById("currency").value};
    // retrieve Buy and Sell order values from contracts using logged events from Orders.sol
    var orders = Orders.at(orders_addr);
      //VVVVVV SELL SELL SELL VVVVVV
      orders.LogNewSellOrder({currency:fiat_curr}, {fromBlock:startBlock}, function(err, result) {
        if (err) return;
        var address = result.args.sellorder;
        var removeEvent = orders.LogRemoveSellOrder({sellorder:address}, {fromBlock:result.blockNumber});
        removeEvent.get(function(err, result) {
       	  if (err) return;
	  if (result.length === 1) return;
          var selleth = Sell_eth.at(address);
            selleth.get_vars.call({from:account}, function(err, vars) {
       	      if (err) return;
              var volume = vars[0];
              var price = vars[1];
              //populate sell order contract table
              if (price > 0) {
                self.populate_row_cells("sell_orders", selleth.address, price, volume);
                self.sortTable("sell_orders");
                selleth.is_party.call({from:account}, function(err, party) {
		  if (err) return;
                  if (party === "seller") {
                    selleth.LogSalePending({}, {fromBlock:startBlock}, function(err,res) {
                      if (err) return;
                      var eventCashRec = selleth.LogCashReceived({_buyer:res.args._buyer}, {fromBlock:res.blockNumber});
                      eventCashRec.get(function(err, events) {
                        if (err) return;
                        if (events.length === 0) {
                          self.writePending("sell_contract", "seller", res);
	                };
               	      });
		    });
                  } else if (party === "buyer") {
                  //there must be only one pending here: the last
                    var eventPend = selleth.LogSalePending({_buyer:account}, {fromBlock:startBlock});
                    eventPend.get(function(err, eventsPending) {
                      if (err) return;
             	      var lastEvent = eventsPending[eventsPending.length-1];
                      self.writePending("sell_contract", "buyer", lastEvent);
		      var eventCashRec = selleth.LogCashReceived({_buyer:account}, {fromBlock:lastEvent.blockNumber});
                      eventCashRec.watch(function(err, res) {
			if (err) return;
                        eventCashRec.stopWatching();
                        var pend_tx_id = res.address.substring(2,5)+res.args._buyer.substring(2,5)+res.args._seller.substring(2,5);console.log(pend_tx_id);
                        document.getElementById(pend_tx_id).innerHTML = "complete";
			document.getElementById(res.address).classList.remove("pending");
		      });
                    });
		  };
                });
              };
            });
	    removeEvent.watch(function(err,res) {
	      if (err) return;
	      removeEvent.stopWatching();
	      var contr = document.getElementById(address);
	      contr.parentNode.removeChild(contr);
	      document.getElementById("sell_contract_functions").className = "hidden";
              document.getElementById("new_sell_contract").className = "shown";
	      document.getElementById("terminate_sell_contract").className = "hidden"; 
	      document.getElementById("selSellAddr").className = "hidden";
	    });
          //});
        });
      });
      //^^^^^^^ SELL SELL SELL ^^^^^^^

      //VVVVVVV BUY BUY BUY VVVVVVV
      orders.LogNewBuyOrder({currency:fiat_curr}, {fromBlock:startBlock}, function(err, result) {
        if (err) return;
        var address = result.args.buyorder;
        var removeEvent = orders.LogRemoveBuyOrder({buyorder:address}, {fromBlock:result.blockNumber});
        removeEvent.get(function(err, result) {
          if (err) return;
          if (result.length === 1) return;
          var buyeth =Buy_eth.at(address);
            buyeth.get_vars.call({from:account}, function(err, vars) {
	      if (err) return;
              var volume = parseInt(vars[0]);
              var price = parseInt(vars[1]);
              //populate buy order table
              if (price > 0) {
                self.populate_row_cells("buy_orders", buyeth.address, price, volume);
                self.sortTable("buy_orders");
                buyeth.is_party.call({from:account}, function(err, party) {
		  if (err) return;
                  if (party === "buyer") {
		    buyeth.LogSalePending({}, {fromBlock:startBlock}, function(err,res) {
		      if (err) return;
	              var eventCashRec = buyeth.LogCashReceived({_seller:res.args._seller}, {fromBlock:res.blockNumber});
		      eventCashRec.get(function(err, events) {
			if (err) return;
		        if (events.length === 0) {
		          self.writePending("buy_contract", "buyer", res);
	          	  eventCashRec.watch(function(err, event) {
			    if (err) return;
		            eventCashRec.stopWatching();
                            var pend_tx_id = event.address.substring(2,5)+event.args._buyer.substring(2,5)+event.args._seller.substring(2,5); console.log(pend_tx_id);
                            document.getElementById(pend_tx_id).parentNode.innerHTML = "complete";
                            buyeth.has_pending.call({from:account}, function(err, pending) {
		              if (err) return;
                              if (!pending) {
           		        document.getElementById(event.address).classList.remove("pending");
		              };
                            });
			  });
			};
		      });
                    });
		  //buyer can have multiple previous pending as well as multiple previous sellers.
                  } else if (party === "seller") {
		  //there can be only one pending here: the last
                    var eventPending = buyeth.LogSalePending({_seller:account}, {fromBlock:startBlock});
                    eventPending.get(function(err,eventsPending) {
                      if (err) return;
                      self.writePending("buy_contract", "seller", eventsPending[eventsPending.length-1]);
                      eventPending.stopWatching();
                    });
                  };
                });
              };
            });
	    removeEvent.watch(function(err,res) {
              removeEvent.stopWatching();
              var contr = document.getElementById(address);
              contr.parentNode.removeChild(contr);
	      document.getElementById("buy_contract_functions").className = "hidden";
              document.getElementById("new_buy_contract").className = "shown";
              document.getElementById("terminate_buy_contract").className = "hidden";
	      document.getElementById("selBuyAddr").className = "hidden";
            });
          //});
        });
      });
      //^^^^^^^^^ BUY BUY BUY BUY ^^^^^^^^^
    //});
  },

  writePending: function(contract, party, _result) {
    var tx = document.createElement("tr");
    tx.innerHTML = '<td align="right"></td><td align="right"></td><td align="right"></td><td align="right"></td>';
    var trans = tx.getElementsByTagName('td');
    var pend_tx_id = _result.address.substring(2,5)+_result.args._buyer.substring(2,5)+_result.args._seller.substring(2,5);
    if (document.getElementById(pend_tx_id)) return;
    if (contract == "buy_contract") {
      if (party == "seller") {
        trans[0].innerHTML = parseInt(_result.args.value/_result.args._price/100);
        trans[1].innerHTML = "from";
        trans[2].innerHTML = "<input value=" + _result.args._buyer + " readonly>";
        trans[3].innerHTML = "<button id=" + pend_tx_id  + ">payment received</button>";
      } else if (party == "buyer") {
        trans[1].innerHTML = "to";
        trans[2].innerHTML = "<input value=" + _result.args._seller + " readonly>";
        trans[3].innerHTML = "<span id=" + pend_tx_id +">pending</span>";
        trans[0].innerHTML = parseInt(_result.args.value/_result.args._price/100);
      };
      document.getElementById("buy_pending_txs").prepend(tx);
      document.getElementById(_result.address).classList.add("pending");
      if (document.getElementById(pend_tx_id)) {
        document.getElementById(pend_tx_id).onclick = function() {self.buy_order_payment_received(_result.address, _result.args._buyer)};
      };
    } else if (contract == "sell_contract") {
      if (party == "buyer") {
        trans[1].innerHTML = "to";
        trans[2].innerHTML = "<input value=" + _result.args._seller + " readonly>";
        trans[3].innerHTML = "<span id=" + pend_tx_id +">pending</span>";;
        trans[0].innerHTML = parseInt(_result.args.value/_result.args._price/100);
      } else if (party == "seller") {
        var buyer = _result.args._buyer;
        trans[0].innerHTML = parseInt(_result.args.value/_result.args._price/100);
        trans[1].innerHTML = "from";
        trans[2].innerHTML = "<input value=" + buyer +" readonly>";
        trans[3].innerHTML = "<button id=" + pend_tx_id + ">payment received</button>";
      };
      document.getElementById("sell_pending_txs").prepend(tx);
      document.getElementById(_result.address).classList.add("pending");
      if (document.getElementById(pend_tx_id)) {
        document.getElementById(pend_tx_id).onclick = function() {self.sell_order_payment_received(_result.address, _result.args._buyer)};
      };
    };
  },

  //catch events for sell orders and update order values
  catchSellEvents: function(addr) {
    self = this;
    var selleth = Sell_eth.at(addr);
      var contr = document.getElementById(addr).getElementsByTagName("td");
      selleth.LogNewWeiForSale(function(err, result) {
        var price = parseFloat(contr[0].innerHTML);
        var volume = result.args.wei_for_sale/1e18;
        contr[1].innerHTML = volume.toFixed(8);
        contr[2].innerHTML = (volume*price).toFixed(2);
      });
      selleth.LogNewPrice(function(err, result) {
        var volume = parseFloat(contr[1].innerHTML);
        var price = 1e16/result.args.nprice;
        contr[0].innerHTML = price.toFixed(2);
        contr[2].innerHTML = (volume*price).toFixed(2);
        self.sortTable("sell_orders");
      });
    //});
  },

    //catch events for buy order
  catchBuyEvents: function(addr) {
    self = this;
    var buyeth = Buy_eth.at(addr);
      var contr = document.getElementById(addr).getElementsByTagName("td");
      buyeth.LogNewWeiToBuy(function(err, result) {
        var price = parseFloat(contr[0].innerHTML);
        var volume = result.args.wei_to_buy/1e18;
        contr[1].innerHTML = volume.toFixed(8);
        contr[2].innerHTML = (volume*price).toFixed(2);
      });
      buyeth.LogNewPrice(function(err, result) {
        var volume = parseFloat(contr[1].innerHTML);
        var price = 1e16/result.args.nprice;
        contr[0].innerHTML = price.toFixed(2);
        contr[2].innerHTML = (volume*price).toFixed(2);
        self.sortTable("buy_orders");
      });
    //});
  },

  //create and populate row of contract info
  populate_row_cells: function(_orders, _addr, _price, _volume) {
    if (document.getElementById(_addr)) return;
    self = this;
    var contract = document.createElement("tr");
    contract.innerHTML = '<td align="right"></td><td align="right"></td><td align="right"></td>';
    contract.id = _addr;
    var contr = contract.getElementsByTagName("td");
    contr[0].innerHTML = (1e16/_price).toFixed(2);
    contr[1].innerHTML = (_volume/1e18).toFixed(8);
    contr[2].innerHTML = (_volume/_price/100).toFixed(2);
    ////Append new contract row
    document.getElementById(_orders).append(contract);
    self.sortTable(_orders);
    if (_orders === "sell_orders") self.catchSellEvents(_addr);
    if (_orders === "buy_orders") self.catchBuyEvents(_addr);

    ////CLICK ON TABLE ROW EVENT////
    contract.addEventListener("click", function () {
      //give row "selected" classname
      var selected = document.getElementsByClassName('selected');
      if (selected[0]) selected[0].classList.remove("selected");
      contract.classList.add("selected");
      ///SELL////
      if (_orders === "sell_orders") {
        document.getElementById("new_sell_price").value = '';
        document.getElementById("add_ether").value = '';
        document.getElementById("selected_sell_address").value = contract.id;
        document.getElementById("selSellAddr").className = 'shown';
        document.getElementById("new_sell_contract").className = 'hidden';
	document.getElementById("new_buy_contract").className = 'shown';
        document.getElementById("buy_contract_functions").className = "hidden";
        document.getElementById("sell_ether").className = "hidden";
        document.getElementById("selBuyAddr").className = "hidden";
	document.getElementById("terminate_buy_contract").className = "hidden";
        // see if user is seller and load appropriate div
        var selleth = Sell_eth.at(_addr);
          selleth.is_party.call({from:account}, function(err, party) {
	    if (err) return;
            if (party === "seller") {
              document.getElementById("sell_contract_functions").className = 'shown';
              document.getElementById("buy_ether").className = 'hidden';
              selleth.has_pending.call({from:account}, function(err, pending) {
       	        if (err) return;
                if (pending) {
                  document.getElementById("terminate_sell_contract").className = 'hidden';
                } else {
                  document.getElementById("terminate_sell_contract").className = 'shown';
                }
              });
            } else if (party === "buyer") {
                document.getElementById("terminate_sell_contract").className = 'hidden';
                document.getElementById("sell_contract_functions").className = 'hidden';
		document.getElementById("buy_ether").className = 'hidden';
            } else {
		document.getElementById("buy_ether").className = 'shown';
		document.getElementById("terminate_sell_contract").className = 'hidden';
		document.getElementById("sell_contract_functions").className = 'hidden';
            };
	  });

      /////BUY/////
      } else if (_orders === "buy_orders") {
        document.getElementById("new_buy_price").value = '';
        document.getElementById("remove_ether").value = '';
        document.getElementById("selected_buy_address").value = contract.id;
        document.getElementById("selBuyAddr").className = 'shown';
        document.getElementById("new_buy_contract").className = 'hidden';
        document.getElementById("new_sell_contract").className = "shown";
        document.getElementById("sell_contract_functions").className = "hidden";
        document.getElementById("buy_ether").className = "hidden";
        document.getElementById("selSellAddr").className = "hidden";
	document.getElementById("terminate_sell_contract").className = "hidden";
        // see if user is buyer and load appropriate div
        var buyeth = Buy_eth.at(_addr);
          buyeth.is_party.call({from:account}, function(err, party) {
	    if (err) return;
            if (party === "buyer") {
              document.getElementById("buy_contract_functions").className = 'shown';
              document.getElementById("sell_ether").className = 'hidden';
              buyeth.has_pending.call({from:account}, function(err, pending) {
	        if (err) return;
                if (pending) {
                  document.getElementById("terminate_buy_contract").className = "hidden";
                } else {
                  document.getElementById("terminate_buy_contract").className = "shown";
                }
              });
            } else if (party === "seller") {
              document.getElementById("sell_ether").className = 'hidden';
              document.getElementById("buy_contract_functions").className = 'hidden';
              document.getElementById("terminate_buy_contract").className = 'hidden';

            } else {
	      document.getElementById("terminate_buy_contract").className = 'hidden';
	      document.getElementById("sell_ether").className = 'shown';
	      document.getElementById("buy_contract_functions").className = 'hidden';
	    };
          });
        //});
      };
    });
  },

  sortTable: function(_table) {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById(_table);
    switching = true;
    while (switching) {
      switching = false;
      rows = table.getElementsByTagName("tr");
      //Loop through all table rows:
      for (i = 0; i < rows.length-1; i++) {
        shouldSwitch = false;
        //Get the two elements to compare, one from current row and one from the next:
        x = rows[i].getElementsByTagName("td")[0];
        y = rows[i + 1].getElementsByTagName("td")[0];
        //check if the two rows should switch place:
        if (_table == "buy_orders") {
          if (parseFloat(x.innerHTML) < parseFloat(y.innerHTML)) {
            //if so, mark as a switch and break the loop:
            shouldSwitch= true;
            break;
          }
        } else if (_table == "sell_orders") {
          if (parseFloat(x.innerHTML) > parseFloat(y.innerHTML)) {
            shouldSwitch= true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      };
    };
  },

  //Add a new sell order in the form of an individual contract
  setup_sell: function() {
    var self = this;
    var price = 1e16/document.getElementById("ask_price").value;
    var volume = document.getElementById("ask_value").value*100*price;
    var orders = Orders.at(orders_addr);
    orders.newSellOrder.sendTransaction(fiat_curr, price, {from: account, value: 2*volume, gas:1e6}, function(res) {
      if (res) console.log("new sell order created");
    });
  },

  //buy from the selected contract
  buy: function() {
    var self = this;
    var address = document.getElementById("selected_sell_address").value;
    var selleth = Sell_eth.at(address);
    var price = 1e16/parseFloat(document.getElementById(address).getElementsByTagName("td")[0].innerHTML);
    var volume = document.getElementById("buy_val").value*100*price;
    var sale_pending = selleth.LogSalePending({_buyer:account});
    sale_pending.watch(function(err, result) {
      if (err) return;
      sale_pending.stopWatching();
      self.writePending("sell_contract", "buyer", result);
      var eventCashRec = selleth.LogCashReceived({_buyer:account}, {fromBlock:result.blockNumber});
      eventCashRec.watch(function(err, res) {
        if (err) return;
        var pend_tx_id = res.address.substring(2,5)+res.args._buyer.substring(2,5)+res.args._seller.substring(2,5);console.log(pend_tx_id);
        document.getElementById(pend_tx_id).innerHTML = "complete";
	document.getElementById(res.address).classList.remove("pending");
        eventCashRec.stopWatching();
      });
    });
    selleth.buy.sendTransaction({from: account, value: volume, gas: 600000}, function(res) {
      console.log("transaction successful!");
    });
  },

  //Add a new buy order in the form of an individual contract
  setup_buy: function() {
    var self = this;
    var price = 1e16/document.getElementById("bid_price").value;
    var volume = document.getElementById("bid_value").value*100*price;
    var orders = Orders.at(orders_addr);
    orders.newBuyOrder.sendTransaction(fiat_curr, price, {from:account, value:volume, gas:1e6}, function(res) {
      if (res) console.log("buy order contract deployed");
    });
  },

  //sell to the selected contract
  sell: function() {
    var self = this;
    var address = document.getElementById("selected_buy_address").value;
    var buyeth = Buy_eth.at(address);
    var price = 1e16/parseFloat(document.getElementById(address).getElementsByTagName("td")[0].innerHTML);
    var volume = document.getElementById("sell_val").value*100*price;
    var eventPend = buyeth.LogSalePending({_seller:account});
    eventPend.watch(function(err, result) {
      if (err) return;
      eventPend.stopWatching();
      self.writePending("buy_contract", "seller", result);
    });
    buyeth.sell.sendTransaction({from: account, value: 2*volume, gas: 600000}, function(res) {
      console.log("transaction successful!");
    });
  },

  sell_order_payment_received: function(_contract, rec_address) {
    self = this;
    var selleth = Sell_eth.at(_contract);
    var eventCashReceived = selleth.LogCashReceived({_buyer:rec_address});
    eventCashReceived.watch(function(err, res) {
      if (err) return;
      eventCashReceived.stopWatching();
      var tx_id = res.address.substring(2,5)+res.args._buyer.substring(2,5)+res.args._seller.substring(2,5);
      document.getElementById(tx_id).parentNode.innerHTML = "complete";
      selleth.has_pending.call({from:account}, function(err, pending) { 
        if (err) return;
        if (!pending) document.getElementById(_contract).classList.remove("pending");
      });
    });
    selleth.confirmReceived.sendTransaction(rec_address, {from: account}, function(res) {
      console.log("purchase + deposit sent to " + rec_address);
    });
  },

  buy_order_payment_received: function(_contract) {
    var buyeth = Buy_eth.at(_contract);
    var eventCashReceived = buyeth.LogCashReceived({_seller:account});
    eventCashReceived.watch(function(err, res) {
      if (err) return;
      eventCashReceived.stopWatching();
      var tx_id = res.address.substring(2,5)+res.args._buyer.substring(2,5)+res.args._seller.substring(2,5);
      document.getElementById(tx_id).parentNode.innerHTML = "complete";
      document.getElementById(_contract).classList.remove("pending");
    });
    buyeth.confirmReceived.sendTransaction({from:account}, function(res) {
      console.log("transaction successful; deposit returned to your account");
    });
  },

  change_price: function() {
    var contr = document.getElementsByClassName("selected")[0];
    var contr_elements = contr.getElementsByTagName("td");
    var address = contr.id;
    var contract;
    if (contr.parentNode.id == "sell_orders") {
      contract = Sell_eth.at(address);
      var nprice = parseInt(1e16/document.getElementById("new_sell_price").value);
    } else if (contr.parentNode.id == "buy_orders") {
      contract = Buy_eth.at(address);
      var nprice = parseInt(1e16/document.getElementById("new_buy_price").value);
    }
    var eventNewPrice = contract.LogNewPrice();
    eventNewPrice.watch(function(err,res) {
      eventNewPrice.stopWatching();
      var newPrice = 1e16/res.args.nprice;
      var vol = parseFloat(contr_elements[1].innerHTML)
      contr_elements[0].innerHTML = newPrice.toFixed(2);
      contr_elements[2].innerHTML = (vol*newPrice).toFixed(2);
      self.sortTable(contr.parentNode.id);
    });
    contract.changePrice.sendTransaction(nprice, {from: account}, function(err, res) {
      if (!err) {
        console.log("selected contract has changed price to: " + (1e16/nprice).toFixed(2));
      };
    });
  },

  add_ether: function() {
    var self = this;
    var contr = document.getElementsByClassName("selected")[0];
    var contr_elements = contr.getElementsByTagName("td");
    var address = contr.id;
    var selleth = Sell_eth.at(address);
    var eventNewWeiForSale = selleth.LogNewWeiForSale();
    eventNewWeiForSale.watch(function(err,result) {
      eventNewWeiForSale.stopWatching();
      var price = parseFloat(contr_elements[0].innerHTML);
      var vol = result.args.wei_for_sale/1e18;
      contr_elements[1].innerHTML = vol.toFixed(8);
      contr_elements[2].innerHTML = (vol*price).toFixed(2);
    });
    var volume = parseInt(document.getElementById("add_ether").value*1e18);
    selleth.addEther.sendTransaction({from: account, value: volume }, function(err, res) {
     if (!err) console.log(volume/1e18 + " ether added to contract");
    });
  },

  remove_ether: function() {
    var self = this;
    var contr = document.getElementsByClassName("selected")[0];
    var contr_elements = contr.getElementsByTagName("td");
    var address = contr.id;
    var buyeth = Buy_eth.at(address);
    var eventNewWeiToBuy = buyeth.LogNewWeiToBuy();
    eventNewWeiToBuy.watch(function(err,result) {
      eventNewWeiToBuy.stopWatching();
      var price = parseFloat(contr_elements[0].innerHTML);
      var vol = result.args.wei_to_buy/1e18;
      contr_elements[1].innerHTML = vol.toFixed(8);
      contr_elements[2].innerHTML = (vol*price).toFixed(2);
    });
    var volume = parseInt(document.getElementById("remove_ether").value*1e18);
    buyeth.retreive_eth.sendTransaction(volume, {from: account}, function(err, res) {
      if (!err) console.log(volume/1e18 + " ether removed from contract");
    });
  },

  terminate_contract: function(fiat_curr) {
    var self = this;
    var contr = document.getElementsByClassName("selected")[0];
    var addr = contr.id;
    var order;
    if (contr.parentNode.id == "sell_orders") {
      var selleth = Sell_eth.at(addr);
        selleth.retr_funds.sendTransaction({from: account, gas:900000}, function() {
          console.log("contract terminated, funds returned to your account.");
        });
    }
    else if (contr.parentNode.id == "buy_orders") {
      var buyeth = Buy_eth.at(addr);
        buyeth.terminate_contract.sendTransaction({from: account}, function() {
          console.log("contract terminated, funds returned.");
        });
    };
  },
},

window.addEventListener('load', async function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (window.ethereum) {
    window.web3 = new Web3(ethereum);
    try {
      // Request account access if needed
      await ethereum.enable();
      // Acccounts now exposed
      //web3.eth.sendTransaction({/* ... */});
    } catch (error) {
      // User denied account access...
      console.log(error);
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
    // Acccounts always exposed
    //web3.eth.sendTransaction({/* ... */});
  }
    // Non-dapp browsers...
  else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
 /* if (typeof web3 !== 'undefined') {
    //console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545.");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }*/
  window.web3.version.getNetwork((err, netId) => {
    switch (netId) {
      case "1":
        console.log('This is mainnet')
        break
      case "3":
        console.log('This is the ropsten test network.')
        break
      case "4":
        console.log('This is the rinkeby test network.')
        break
      default:
        console.log('This is an unknown network.')
    }
  })
  document.getElementById("currency").onchange = function() {
    var newcurr = this.value;
    var sell = document.getElementById("sell_orders");
    while (sell.hasChildNodes()) sell.removeChild(sell.lastChild);
    document.getElementById("new_sell_contract").className = 'shown';
    document.getElementById("sell_contract_functions").className = 'hidden';
    document.getElementById("selSellAddr").className = 'hidden';
    document.getElementById("terminate_sell_contract").className = 'hidden';
    var buy = document.getElementById("buy_orders");
    while (buy.hasChildNodes()) buy.removeChild(buy.lastChild);
    document.getElementById("new_buy_contract").className = 'shown';
    document.getElementById("buy_contract_functions").className = 'hidden';
    document.getElementById("selBuyAddr").className = 'hidden';
    document.getElementById("terminate_buy_contract").className = 'hidden';
    /*socket.emit('join', {account:account.substring(2,7), curr:newcurr}, function(err){
      if(err) alert(err);
      else console.log('connected to server');
    });*/
    App.start(account);
  };
  Sell_eth = web3.eth.contract(selleth_abi);
  Buy_eth = web3.eth.contract(buyeth_abi);
  Orders = web3.eth.contract(orders_abi);
  App.start(web3.eth.accounts[0]);
});
