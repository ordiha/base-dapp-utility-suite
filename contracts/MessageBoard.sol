// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MessageBoard {
    struct Message { address sender; string text; uint256 timestamp; }
    Message[] public messages;
    event NewMessage(address indexed sender, string text, uint256 timestamp);

    function postMessage(string calldata _text) external {
        messages.push(Message(msg.sender, _text, block.timestamp));
        emit NewMessage(msg.sender, _text, block.timestamp);
    }

    function getMessage(uint256 index) external view returns (address, string memory, uint256) {
        Message memory m = messages[index];
        return (m.sender, m.text, m.timestamp);
    }

    function totalMessages() external view returns (uint256) {
        return messages.length;
    }
}
