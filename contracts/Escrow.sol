// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleEscrow {
    enum State { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE, REFUNDED }
    State public state;
    address public buyer;
    address public seller;
    address public arbiter;
    uint256 public amount;

    constructor(address _seller, address _arbiter) {
        buyer = msg.sender;
        seller = _seller;
        arbiter = _arbiter;
        state = State.AWAITING_PAYMENT;
    }

    function fund() external payable {
        require(msg.sender == buyer, "Only buyer");
        require(state == State.AWAITING_PAYMENT, "Already funded");
        require(msg.value > 0, "Send ETH");
        amount = msg.value;
        state = State.AWAITING_DELIVERY;
    }

    function release() external {
        require(msg.sender == buyer || msg.sender == arbiter, "Not authorized");
        require(state == State.AWAITING_DELIVERY, "Invalid state");
        state = State.COMPLETE;
        payable(seller).transfer(amount);
    }

    function refund() external {
        require(msg.sender == seller || msg.sender == arbiter, "Not authorized");
        require(state == State.AWAITING_DELIVERY, "Invalid state");
        state = State.REFUNDED;
        payable(buyer).transfer(amount);
    }
}
