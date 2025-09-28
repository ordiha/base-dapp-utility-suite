// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GiveawayNFT {
    string private _name;
    string private _symbol;
    string private _baseURI;

    uint256 private _tokenIds;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;

    address public admin;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event BaseURIChanged(string newBaseURI);

    constructor(string memory name_, string memory symbol_, string memory baseURI_) {
        _name = name_;
        _symbol = symbol_;
        _baseURI = baseURI_;
        admin = msg.sender;
    }

    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function baseURI() external view returns (string memory) {
        return _baseURI;
    }

    function setBaseURI(string memory newBase) external {
        require(msg.sender == admin, "Not admin");
        _baseURI = newBase;
        emit BaseURIChanged(newBase);
    }

    function balanceOf(address ownerAddr) external view returns (uint256) {
        require(ownerAddr != address(0), "Zero address");
        return _balances[ownerAddr];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address ownerAddr = _owners[tokenId];
        require(ownerAddr != address(0), "Invalid tokenId");
        return ownerAddr;
    }

    function giveawayMint(address[] memory recipients) external {
        require(msg.sender == admin, "Only admin can mint");
        for (uint256 i = 0; i < recipients.length; i++) {
            _tokenIds++;
            uint256 newId = _tokenIds;
            _owners[newId] = recipients[i];
            _balances[recipients[i]] += 1;
            emit Transfer(address(0), recipients[i], newId);
        }
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "Invalid tokenId");
        return string(abi.encodePacked(_baseURI, uint2str(tokenId), ".json"));
    }

    // utils
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(j - j / 10 * 10));
            bstr[k] = bytes1(temp);
            j /= 10;
        }
        return string(bstr);
    }
}
