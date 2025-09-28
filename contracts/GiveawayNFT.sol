// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GiveawayNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    constructor() ERC721("GiveawayNFT", "GNFT") Ownable(msg.sender) {}

    function giveawayMint(address[] calldata recipients, string memory baseURI) external onlyOwner {
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], nextTokenId);
            _setTokenURI(nextTokenId, string(abi.encodePacked(baseURI, "/", Strings.toString(nextTokenId))));
            nextTokenId++;
        }
    }
}
