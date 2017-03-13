pragma solidity ^0.4.0;

contract Prediction {

    uint claimtime = 10; //mins
    address admin = 0x8472dc97deeae78f04f9c8470ee70ecb8df0009c;
    bool win;
    uint deadline;
    bytes32 descr;
    bool cl;
    uint claimdl; //mins
    uint tbt;
    uint tbf;
    bool abort;
    bool conflict;
    address maker;
 
    struct Bettor {bool side; uint account; bool claimer;}
    mapping(address => Bettor) bettors;

    event claim(bool cl);
    event conflicting_claim();
    event newBet(uint tbt, uint tbf);
    event conflict_resolved();
    event paid(address sender, uint payout);

    function Prediction(bytes32 _descr, uint _duration) payable {
        descr = _descr;
        Bettor bettor = bettors[msg.sender];
        bettor.account = msg.value;
        bettor.side = true;
        tbt = bettor.account/2;
        tbf = 0;
        if (tbt != msg.value/2) throw;
        maker = msg.sender;
        deadline = now + _duration * 1 minutes;
    }

    function bet(bool _side) payable {
        if (now < deadline && msg.value > 1 ether) {
            bool side = _side;
            uint account;
            Bettor bettor = bettors[msg.sender];
            if (bettor.account == 0) account = msg.value;
            else { 
                if (side != bettor.side) throw; 
                account = bettor.account + msg.value;
            }
            if (side == true) tbt += msg.value/2;
            else tbf += msg.value/2;
            bettors[msg.sender] = Bettor (side, account, false);
            newBet(tbt, tbf);
        }
        else throw;
    }

    function get_stat() returns (uint, uint, bool, bool, uint) {return (tbt, tbf, cl, conflict, this.balance);}

    function claimWin() {
        if (bettors[msg.sender].account == 0) throw;
        if (now > deadline) {
            bettors[msg.sender].claimer = true;
            if (claimdl == 0) {
                claimdl = now + claimtime * 1 minutes;
                cl = bettors[msg.sender].side;
                claim(cl); 
            }
            if (bettors[msg.sender].side != cl) {
                conflicting_claim();
                conflict = true;
            }
        }
        else throw;
    }

    function resolveConflict(bool _side) {
        if (now > claimdl && msg.sender == admin && conflict == true) {
            cl = _side;
            conflict = false;
            conflict_resolved();
        }
        else throw;
    }

    function abortContract() {
        if (now > claimdl && msg.sender == admin && conflict == true) {
            abort = true;
            conflict = false;
        }
        else throw;
    }

    function pay() {
        if (bettors[msg.sender].account == 0) throw;
        if (conflict == false && now > claimdl) {
            uint payout;
            address sender = msg.sender;
            Bettor bettor = bettors[sender];
              if (abort == true) payout = bettor.account;
              else {
                win = cl;
                if (bettor.side == win) {
                    if (win == true) payout = (bettor.account/2)*(tbf/tbt + 2);
                    else if (win == false) payout = (bettor.account/2)*(tbt/tbf + 2);
                }
                else if (bettor.side != win) {
                    if (bettor.claimer == true) payout = 0;
                    else payout = bettor.account/2;
                }
              } 
            bettor.account = 0;
            if (payout != 0) {if (!sender.send(payout)) throw; else paid(sender, payout);}
        }
    }
    function sd() { if (now > claimdl + 30 minutes && msg.sender == maker) selfdestruct(maker);}
    function() { throw;}
}
