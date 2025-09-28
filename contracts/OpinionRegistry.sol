// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OpinionRegistry {
    struct Opinion { address author; string text; uint256 timestamp; }
    Opinion[] public opinions;
    event NewOpinion(address indexed author, string text, uint256 timestamp);

    function addOpinion(string calldata _text) external {
        opinions.push(Opinion(msg.sender, _text, block.timestamp));
        emit NewOpinion(msg.sender, _text, block.timestamp);
    }

    function getOpinion(uint256 idx) external view returns (address, string memory, uint256) {
        Opinion memory o = opinions[idx];
        return (o.author, o.text, o.timestamp);
    }

    function totalOpinions() external view returns (uint256) {
        return opinions.length;
    }
}
