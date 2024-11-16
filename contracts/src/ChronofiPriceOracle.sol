// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ChronofiPriceOracle is Ownable {

    // Mapping from token address to Chainlink price feed address
    mapping(address => IChronicle) public priceFeeds;

    ISelfKisser public selfKisser = ISelfKisser(address(0x0Dcc19657007713483A5cA76e6A7bbe5f56EA37d));

    // Event emitted when a new price feed is added
    event PriceFeedAdded(address indexed token, address indexed priceFeed);
    
    // Event emitted when a price feed is removed
    event PriceFeedRemoved(address indexed token);

    // Constructor to initialize the contract with some default price feeds
    constructor() Ownable(msg.sender){}

    // Function to add or update a price feed for a token address (only owner can call)
    function addPriceFeed(address token, address priceFeed) external onlyOwner {
        require(priceFeed != address(0), "Invalid price feed address");
        selfKisser.selfKiss(priceFeed);
        priceFeeds[token] = IChronicle(priceFeed);
        emit PriceFeedAdded(token, priceFeed);
    }

    // Function to remove a price feed for a token address (only owner can call)
    function removePriceFeed(address token) external onlyOwner {
        delete priceFeeds[token];
        emit PriceFeedRemoved(token);
    }

    // Internal function to get the price feed contract for a given token address
    function getPriceFeed(address token) internal view returns (IChronicle) {
        IChronicle priceFeed = priceFeeds[token];
        require(address(priceFeed) != address(0), "Price feed not available");
        return priceFeed;
    }

    // Function to get the latest price of a token by its address
    function getLatestPrice(address token) public view returns (uint256) {
        IChronicle priceFeed = getPriceFeed(token);
        uint256 price = priceFeed.read();
        return price;
    }

    // Function to get the address of the price feed for a given token
    function getPriceFeedAddress(address token) public view returns (IChronicle) {
        return priceFeeds[token];
    }

    function isPriceFeedWhiteListed(address token) public view returns(bool){
        if(address(priceFeeds[token]) != address(0)){
            return true;
        }
        return false;
    }
}


interface IChronicle { 
    function read() external view returns (uint256 value);
    function readWithAge() external view returns (uint256 value, uint256 age);
}


interface ISelfKisser {
    /// @notice Kisses caller on oracle `oracle`.
    function selfKiss(address oracle) external;
}