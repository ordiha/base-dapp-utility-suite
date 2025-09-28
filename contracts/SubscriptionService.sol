// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SubscriptionService {
    uint256 public monthlyFee;
    mapping(address => uint256) public subscribedUntil;
    address public owner;

    event Subscribed(address indexed user, uint256 until);

    constructor(uint256 _monthlyFee) {
        monthlyFee = _monthlyFee;
        owner = msg.sender;
    }

    function subscribe(uint256 months) external payable {
        require(months > 0, "Months > 0");
        require(msg.value == months * monthlyFee, "Incorrect ETH sent");
        uint256 until = block.timestamp + months * 30 days;
        if (subscribedUntil[msg.sender] > block.timestamp) {
            subscribedUntil[msg.sender] = subscribedUntil[msg.sender] + months * 30 days;
        } else {
            subscribedUntil[msg.sender] = until;
        }
        emit Subscribed(msg.sender, subscribedUntil[msg.sender]);
    }

    function isActive(address user) external view returns (bool) {
        return block.timestamp < subscribedUntil[user];
    }

    function withdraw(address payable to, uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        require(amount <= address(this).balance, "Insufficient");
        to.transfer(amount);
    }
}
