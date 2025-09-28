// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Lottery {
    address[] public players;
    address public lastWinner;

    // Enter lottery with any amount of ETH (even very small)
    function enter() public payable {
        require(msg.value > 0, "Must send some ETH");
        players.push(msg.sender);
    }

    // Pick a random winner and transfer all balance
    function pickWinner() public {
        require(players.length > 0, "No players yet");

        uint256 index = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.prevrandao, players.length)
            )
        ) % players.length;

        address winner = players[index];
        lastWinner = winner;

        payable(winner).transfer(address(this).balance);

        // Reset players
        delete players;
    }

    // Helper: get all current players
    function getPlayers() public view returns (address[] memory) {
        return players;
    }
}
