// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Crowdfunding {
    address public creator;
    uint256 public goal;
    uint256 public deadline;
    uint256 public raised;
    mapping(address => uint256) public contributions;

    constructor(uint256 _goal, uint256 _durationSeconds) {
        creator = msg.sender;
        goal = _goal;
        deadline = block.timestamp + _durationSeconds;
    }

    function contribute() external payable {
        require(block.timestamp < deadline, "Campaign ended");
        require(msg.value > 0, "Send ETH");
        contributions[msg.sender] += msg.value;
        raised += msg.value;
    }

    function withdraw() external {
        require(msg.sender == creator, "Not creator");
        require(block.timestamp >= deadline, "Not ended");
        require(raised >= goal, "Goal not met");
        payable(creator).transfer(raised);
    }

    function refund() external {
        require(block.timestamp >= deadline, "Not ended");
        require(raised < goal, "Goal met");
        uint256 amount = contributions[msg.sender];
        require(amount > 0, "No contribution");
        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
