pragma solidity ^0.5.4;

contract BitMediaLabsToken {
    string public constant name = 'BitMediaLabs';
    string public constant symbol = 'BML';
    uint8 public constant decimals = 18;

    uint public totalSupply;

    mapping(address - > uint) balances;

    function mint(address to, uint value) public {
        require(totalSupply + value >= totalSupply && balances[to] + value >= balances[to])
        balances[to] += value;
        totalSupply += value;
    }

    function balancesOf(address owner) public view returns (uint) {
        return balances[owner]
    }

    function transfer(address to, uint value) public {
        require(balances[msg.sender] >= value && balances[to] + value >= balances[to]);
        balances[msg.sender] -= value;
        balances[to] += value;
    }