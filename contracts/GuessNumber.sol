// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GuessNumber {
    address public owner;
    uint256 private target;

    event Guess(address indexed who, uint256 guess, bool correct);

    constructor(uint256 _target) {
        owner = msg.sender;
        target = _target;
    }

    function setTarget(uint256 _target) external {
        require(msg.sender == owner, "Not owner");
        target = _target;
    }

    function guess(uint256 _g) external {
        bool ok = (_g == target);
        emit Guess(msg.sender, _g, ok);
    }

    function getTarget() external view returns (uint256) {
        return target;
    }
}
