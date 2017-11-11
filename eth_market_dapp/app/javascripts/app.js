// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import selleth_artifacts from '../../build/contracts/Sell_eth.json';
import buyeth_artifacts from '../../build/contracts/Buy_eth.json';
import orders_artifacts from '../../build/contracts/Orders.json';

// usable abstractions, which we'll use through the code below.
var Sell_eth = contract(selleth_artifacts);
var Buy_eth = contract(buyeth_artifacts);
var Orders = contract(orders_artifacts);
var account;

window.App = {
  start: function(_account) {
    account = _account;
    var self = this;
    // Bootstrap the Buy_eth, Sell_eth and Orders abstraction for use.
    Sell_eth.setProvider(web3.currentProvider);
    Buy_eth.setProvider(web3.currentProvider);
    Orders.setProvider(web3.currentProvider);
    // retrieve Buy and Sell order values from contracts using logged events from Orders.sol
    Orders.deployed().then(function(instance) {
      /////SELL SELL SELL\\\\\\\
      instance.LogNewSellOrder({}, {fromBlock:0}, function(err, result) {
       if (!err) {
        var address = result.args.sellorder;
        //console.log(web3.eth.getCode(address)); //==  null) return;
        Sell_eth.at(address).then(function(inst) {
          inst.get_vars.call().then(function(vars) {
            var volume = vars[0];
            var price = vars[1];
            //populate sell order contract table
            if (price > 0) {
              self.populate_row_cells("sell_orders", inst.address, price, volume);
              self.sortTable("sell_orders");
              inst.is_party.call({from:account}).then(function(party) {
                if (party == null)  return;
                else if (party == "seller") {
		  inst.has_pending.call({from:account}).then(function(pending) {
		    if (pending) {
                      var eventPend = inst.LogSalePending({}, {fromBlock:0});
                      eventPend.get(function(err, eventsPend) {
                        if (!err) {
                          for (var i=eventsPend.length-1; i>=0; i--) {
                            for (var k=i+1; k<eventsPend.length; k++) {
                              if (eventsPend[i].args._buyer = eventsPend[k].args._buyer) return;
                            }
	                    self.writePending("sell_contract", "seller", eventsPend[i]);
		            var eventCashRec = inst.LogCashReceived({_buyer: eventsPend[i].args._buyer}, {fromBlock:eventsPend[i]});
			    eventCashRec.watch(function(err,res) {
			      if (!err) {
  			        eventCashRec.stopWatching();
                                var pend_tx_id = res.address.substring(2,5)+res.args._buyer.substring(2,5)+res.args._seller.substring(2,5); 
			        document.getElementById(pend_tx_id).parentNode.innerHTML = "complete";
                              };
			    });
                          };
			};
                      });
                    };
		  });
                } else if (party == "buyer") {
                //there must be only one pending here: the last
                  var eventPend = inst.LogSalePending({_buyer:account}, {fromBlock:0});
                  eventPend.get(function(err, eventsPending) {
                    if (!err) {
		      var lastEvent = eventsPending[eventsPending.length-1];
                      self.writePending("sell_contract", "buyer", lastEvent);
		      var eventCashRec = inst.LogCashReceived({_buyer:account}, {fromBlock:lastEvent.blockNumber});
                      eventCashRec.watch(function(err, res) {
                        var pend_tx_id = res.address.substring(2,5)+res.args._buyer.substring(2,5)+res.args._seller.substring(2,5);
                        document.getElementById(pend_tx_id).parentNode.innerHTML = "complete";
	                console.log(inst.LogCashReceived().stopWatching());
		      });
                    };
                  });
		//it's pending so watch for seller confirmation
	        };
              });
            };
          });
        });
       };
      });
          /////////BUY BUY BUY \\\\\\\\\\\
      instance.LogNewBuyOrder({}, {fromBlock:0}, function(err, result) {
        if (!err) {
          var address = result.args.buyorder;
          //console.log(web3.eth.getCode(address)); //== null) return;
          Buy_eth.at(address).then(function(inst) {
            inst.get_vars.call().then(function(vars) {
              var volume = parseInt(vars[0]);
              var price = parseInt(vars[1]);
              //populate buy order table
              if (price > 0) {
                self.populate_row_cells("buy_orders", inst.address, price, volume);
                self.sortTable("buy_orders");
                inst.is_party.call({from:account}).then(function(party) {
                  if (party == "buyer") {
		    inst.has_pending.call({from:account}).then(function(pending) {
                     if (pending) {
                       var eventPend = inst.LogSalePending({}, {fromBlock:0});
                       eventPend.get(function(err, eventsPend) {
                        if (!err) {
                          for (var i=eventsPend.length-1; i>=0; i--) {
                            for (var k=i+1; k<eventsPend.length; k++) {
                              if (eventsPend[i].args._seller = eventsPend[k].args._seller) return;
                            }
                            self.writePending("buy_contract", "buyer", eventsPend[i]);
                            var eventCashRec = inst.LogCashReceived({_seller: eventsPend[i].args._seller}, {fromBlock:eventsPend[i].blockNumber});
                            eventCashRec.watch(function(err,res) {
                              if (!err) {
                                eventCashRec.stopWatching();
                                var pend_tx_id = res.address.substring(2,5)+res.args._buyer.substring(2,5)+res.args._seller.substring(2,5);
                                document.getElementById(pend_tx_id).parentNode.innerHTML = "complete";
                              };
                            });
                          };
                        };
                       });
		     };
		    });
                  } else if (party == "seller") {
		  //there can be only one pending here: the last
                    var eventPending = inst.LogSalePending({_seller:account}, {fromBlock:0});
                    eventPending.get(function(err,eventsPending) {
                      if (!err) {
                        self.writePending("buy_contract", "seller", eventsPending[eventsPending.length-1]);
                      };
                    });
                  };
                });
              };
            });
          });
        };
      });
    });
  },

  writePending: function(contract, party, _result) {
    var tx = document.createElement("tr");
    tx.innerHTML = '<td align="right"></td><td align="right"></td><td align="right"></td><td align="right"></td>';
    var trans = tx.getElementsByTagName('td');
    if (contract == "buy_contract") {
      if (party == "seller") {
        var pend_tx_id = _result.address.substring(2,5)+_result.args._buyer.substring(2,5)+_result.args._seller.substring(2,5);
        trans[0].innerHTML = parseInt(_result.args.value/_result.args._price/100);
        trans[1].innerHTML = "from";
        trans[2].innerHTML = "<input value=" + _result.args._buyer + ">";
        trans[3].innerHTML = "<button id=" + pend_tx_id  + ">payment received</button>";
      } else if (party == "buyer") {
        trans[1].innerHTML = "to";
        trans[2].innerHTML = "<input value=" + _result.args._seller + ">";
        trans[3].innerHTML = "pending";
        trans[0].innerHTML = parseInt(_result.args.value/_result.args._price/100);
      };
      document.getElementById("buy_pending_txs").prepend(tx);
      document.getElementById(_result.address).className = "pending";
      if (document.getElementById(pend_tx_id)) {
        document.getElementById(pend_tx_id).onclick = function() {self.buy_order_payment_received(_result.address, _result.args._buyer)};
      };
    } else if (contract == "sell_contract") {
      if (party == "buyer") {
        trans[1].innerHTML = "to";
        trans[2].innerHTML = "<input value=" + _result.args._seller + " readonly>";
        trans[3].innerHTML = "pending";
        trans[0].innerHTML = parseInt(_result.args.value/_result.args._price/100);
      } else if (party == "seller") {
        var buyer = _result.args._buyer;
        var pend_tx_id = _result.address.substring(2,5)+buyer.substring(2,5)+_result.args._seller.substring(2,5); 
        trans[0].innerHTML = parseInt(_result.args.value/_result.args._price/100);
        trans[1].innerHTML = "from";
        trans[2].innerHTML = "<input value=" + buyer +" readonly>";
        trans[3].innerHTML = "<button id=" + pend_tx_id + ">payment received</button>";
      };
      document.getElementById("sell_pending_txs").prepend(tx);
      document.getElementById(_result.address).className = "pending";
      if (document.getElementById(pend_tx_id)) {
        document.getElementById(pend_tx_id).onclick = function() {self.sell_order_payment_received(_result.address, _result.args._buyer)};
      };
    };
  },

  //catch events for sell orders and update order values
  catchSellEvents: function(addr) {
    self = this;
    Sell_eth.at(addr).then(function(instance) {
      var contr = document.getElementById(addr).getElementsByTagName("td");
      instance.allEvents(function(err, result) {
        if (!err) {
          switch (result.event) {
            case "LogNewWeiForSale":
              var price = parseFloat(contr[0].innerHTML);
              var volume = result.args.wei_for_sale/1e18;
              contr[1].innerHTML = volume.toFixed(8);
              contr[2].innerHTML = (volume*price).toFixed(2);
              break;
            case "LogNewPrice":
              var volume = parseFloat(contr[1].innerHTML);
              var price = 1e16/result.args.nprice;
              contr[0].innerHTML = price.toFixed(2);
              contr[2].innerHTML = (volume*price).toFixed(2);
              self.sortTable("sell_orders");
          };
        };
      });
    });
  },

    //catch events for buy order
  catchBuyEvents: function(addr) {
    self = this;
    Buy_eth.at(addr).then(function(instance) {
      var contr = document.getElementById(addr).getElementsByTagName("td");
      instance.allEvents(function(err, result	) {
        if (!err) {
          switch (result.event) {
            case "LogNewWeiToBuy":
              var price = parseFloat(contr[0].innerHTML);
              var volume = result.args.wei_to_buy/1e18;
              contr[1].innerHTML = volume.toFixed(8);
              contr[2].innerHTML = (volume*price).toFixed(2);
              break;
            case "LogNewPrice":
              var volume = parseFloat(contr[1].innerHTML);
              var price = 1e16/result.args.nprice;
              contr[0].innerHTML = price.toFixed(2);
              contr[2].innerHTML = (volume*price).toFixed(2);
              self.sortTable("buy_orders");
          }
        };
      });
    });
  },

  //create and populate row of contract info
  populate_row_cells: function(_orders, _addr, _price, _volume) {
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
    if (_orders == "sell_orders") self.catchSellEvents(_addr);
    if (_orders == "buy_orders") self.catchBuyEvents(_addr);

    ////CLICK ON TABLE ROW EVENT////
    contract.addEventListener("click", function () {
      //give row "selected" classname
      var selected = document.getElementsByClassName('selected');
      if (selected[0]) selected[0].className = '';
      contract.className = 'selected';
      ///SELL////
      if (_orders == "sell_orders") {
        document.getElementById("new_sell_price").value = '';
        document.getElementById("add_ether").value = '';
        document.getElementById("selected_sell_address").value = contract.id;
        document.getElementById("selSellAddr").className = 'shown';
        document.getElementById("new_sell_contract").className = 'hidden';
        document.getElementById("buy_contract_functions").className = "hidden";
        document.getElementById("sell_ether").className = "hidden";
        document.getElementById("selBuyAddr").className = "hidden";
        // see if user is seller and load appropriate div
        Sell_eth.at(_addr).then(function(inst) {
          inst.is_party.call({from:account}).then(function(party) {
            if (party == "seller") {
              document.getElementById("sell_contract_functions").className = 'shown';
              document.getElementById("buy_ether").className = 'hidden';
              inst.has_pending.call({from:account}).then(function(pending) {
                if (pending) {
                  document.getElementById("terminate_sell_contract").className = 'hidden';//if (res) get pending txs *******TODO*******
                } else {
                  document.getElementById("terminate_sell_contract").className = 'shown';
                }
              });
            } else if (party == "buyer") {
                document.getElementById("terminate_sell_contract").className = 'hidden';
                document.getElementById("buy_ether").className = 'hidden';
            } else document.getElementById("buy_ether").className = 'shown';;
          });
        });
      /////BUY/////
      } else if (_orders == "buy_orders") {
        document.getElementById("new_buy_price").value = '';
        document.getElementById("remove_ether").value = '';
        document.getElementById("selected_buy_address").value = contract.id;
        document.getElementById("selBuyAddr").className = 'shown';
        document.getElementById("new_buy_contract").className = 'hidden';
        document.getElementById("new_sell_contract").className = "shown";
        document.getElementById("sell_contract_functions").className = "hidden";
        document.getElementById("buy_ether").className = "hidden";
        document.getElementById("selSellAddr").className = "hidden";
        // see if user is buyer and load appropriate div
        Buy_eth.at(_addr).then(function(inst) {
          inst.is_party.call({from:account}).then(function(party) {
            if (party == "buyer") {
              document.getElementById("buy_contract_functions").className = 'shown';
              document.getElementById("sell_ether").className = 'hidden';
              inst.has_pending.call({from:account}).then(function(pending) {
                if (pending) {
                  document.getElementById("terminate_buy_contract").className = "hidden";
                } else {
                  document.getElementById("terminate_buy_contract").className = "shown";
                }
              });
            } else if (party == "seller") {
              document.getElementById("sell_ether").className = 'hidden'
              document.getElementById("buy_contract_functions").className = 'hidden';
            } else document.getElementById("sell_ether").className = 'shown';
          });
        });
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
    Orders.deployed().then(function(inst) {
      inst.newSellOrder(price, {from: account, value: 2*volume, gas:1e6}).then(function(err, res) { 
          if (!err) {
            inst.LogCashReceived({_buyer:account}, function(err, res) {
               console.log(res.args);
            });
          };
      });
    });
  },

  //buy from the selected contract
  buy: function() {
    var self = this;
    var address = document.getElementById("selected_sell_address").value;
    var contr = Sell_eth.at(address);
    var price = 1e16/parseFloat(document.getElementById(address).getElementsByTagName("td")[0].innerHTML);
    var volume = document.getElementById("buy_val").value*100*price;
    var sale_pending = contr.LogSalePending({_buyer:account});
    sale_pending.watch(function(err, result) {
      if (!err) {
        self.writePending("sell_contract", "buyer", result);console.log(parseInt(result.args._price),parseInt(result.args.value));
        sale_pending.stopWatching();
      };
    });
    contr.buy({from: account, value: volume, gas: 600000}).then(function(res) {
      console.log("transaction successful!");
    });
  },

  //Add a new buy order in the form of an individual contract
  setup_buy: function() {
    var self = this;
    var price = 1e16/document.getElementById("bid_price").value;
    var volume = document.getElementById("bid_value").value*100*price;
    Orders.deployed().then(function(inst) {
      inst.newBuyOrder(price, {from:account, value:volume, gas:1e6}).then(function(err, res) {
          if (!err) console.log("buy order contract deployed");
      });
    });
  },

  //sell to the selected contract
  sell: function() {
    var self = this;
    var address = document.getElementById("selected_buy_address").value;
    var contr = Buy_eth.at(address);
    var price = 1e16/parseFloat(document.getElementById(address).getElementsByTagName("td")[0].innerHTML);
    var volume = document.getElementById("sell_val").value*100*price;
    var eventPend = contr.LogSalePending({_seller:account});
    eventPend.watch(function(err, result) {
      if (!err) {
        self.writePending("buy_contract", "seller", result);
        eventPend.stopWatching();
      };
    });
    contr.sell({from: account, value: 2*volume, gas: 600000}).then(function(res) {
      console.log("transaction successful!");
    });
  },

  sell_order_payment_received: function(_contract, rec_address) {
    self = this;
    var contr = Sell_eth.at(_contract);
    contr.LogCashReceived({_seller:account}, function(err, res) {
      if (!err) {
        var tx_id = res.address.substring(2,5)+res.args._buyer.substring(2,5)+res.args._seller.substring(2,5);
        document.getElementById(_contract).className="";
        document.getElementById(tx_id).parentNode.innerHTML = "complete";
      };
    });
    contr.confirmReceived(rec_address, {from: account}).then(function(err, res) {
      if (!err) console.log("purchase + deposit sent to " + rec_address);
      contr.LogCashReceived().stopWatching();
    });
  },

  buy_order_payment_received: function(_contract) {
    var contr = Buy_eth.at(_contract);
    contr.LogCashReceived({_seller:account}, function(err, res) {
      if (!err) {
        var tx_id = res.address.substring(2,5)+res.args._buyer.substring(2,5)+res.args._seller.substring(2,5);
        console.log(tx_id);
        document.getElementById(_contract).className="";
        document.getElementById(tx_id).parentNode.innerHTML = "complete";
      };
    });
    contr.confirmReceived({from:account}).then(function(res) {
      console.log("transaction successful; deposit returned to your account");
      contr.LogCashReceived().stopWatching();
    });
  },

  change_price: function() {
    var contr = document.getElementsByClassName("selected")[0];
    var address = contr.id;
    var contract;
    if (contr.parentNode.id == "sell_orders") {
      contract = Sell_eth.at(address);
      var nprice = parseInt(1e16/document.getElementById("new_sell_price").value);
    }
    else if (contr.parentNode.id == "buy_orders") {
      contract = Buy_eth.at(address);
      var nprice = parseInt(1e16/document.getElementById("new_buy_price").value);
    }
    contract.changePrice(nprice, {from: account}).then(function(err, res) {
      if (!err) console.log("selected contract has changed price to: " + (1e16/nprice).toFixed(2));
    });
    //self.sortTable(contr.parentNode.id);
  },

  add_ether: function() {
    var self = this;
    var contr = document.getElementsByClassName("selected")[0];
    var addr = contr.id;
    var contract = Sell_eth.at(addr);
    var volume = parseInt(document.getElementById("add_ether").value*1e18);
    contract.addEther({from: account, value: volume }).then(function(err, res) {
     if (!err) console.log(volume/1e18 + " ether added to contract at " + addr);
    });
  },

  remove_ether: function() {
    var self = this;
    var contr = document.getElementsByClassName("selected")[0];
    var addr = contr.id;
    var contract = Buy_eth.at(addr);
    var volume = parseInt(document.getElementById("remove_ether").value*1e18);
    contract.retreive_eth(volume, {from: account}).then(function(err, res) {
     if (!err) console.log(volume + " ether removed from contract at " + addr);
     });
  },

  terminate_contract: function() {
    var self = this;
    var contr = document.getElementsByClassName("selected")[0];
    var addr = contr.id;
    var order;
    if (contr.parentNode.id == "sell_orders") {
      Sell_eth.at(addr).then(function(instance) {
        instance.retr_funds({from: account, gas:900000}).then(function() {
            console.log("contract terminated, funds returned to your account.");
            var contract = document.getElementById(addr);
            contract.parentNode.removeChild(contract);
        });
      });
    }
    else if (contr.parentNode.id == "buy_orders") {
      Buy_eth.at(addr).then(function(instance) {
        instance.terminate_contract({from: account}).then(function() {
            console.log("contract terminated, funds returned.");
            var contract = document.getElementById(instance.address);
            contract.parentNode.removeChild(contract);
        });
      });
    };
  },
},

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  web3.version.getNetwork((err, netId) => {
    switch (netId) {
      case "1":
        console.log('This is mainnet')
        break
      case "2":
        console.log('This is the deprecated Morden test network.')
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
  App.start(web3.eth.accounts[1]);
});
