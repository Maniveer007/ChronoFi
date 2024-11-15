// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ChronoFi is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Subscription {
        string name;
        address subscriptionOwner;
        address payable recipient;
        address paymentToken; // Address of the ERC20 token used for payment 
        uint256 amountInUSD;
        uint256 frequency; // in seconds (e.g., 30 days for monthly)
        uint256 nextPaymentDate;
        bool hasExited ;
    }

    address public solver;
    mapping(address => Subscription[]) private userSubscriptions; // Each user can have multiple subscriptions

    mapping(address => address) specificAddressDelegate;

    event SubscriptionCreated(address indexed user, uint256 indexed subscriptionId, string name, uint256 amountInUSD, address paymentToken);
    event SubscriptionCancelled(address indexed user, uint256 indexed subscriptionId);
    event PaymentProcessed(address indexed user, uint256 indexed subscriptionId, uint256 amountInTokens, uint256 nextPaymentDate, address paymentToken);

    modifier onlySolver() {
        require(msg.sender == solver, "Only the authorized solver can process payments");
        _;
    }

    constructor(address _solver) {
        solver = _solver;
    }

    /// @notice Creates a new subscription for the user
    function createSubscription(
        string memory _name,
        address payable _recipient,
        uint256 _amountInUSD,
        uint256 _frequency,
        address _paymentToken
    ) external nonReentrant {
        require(_recipient != address(0), "Invalid recipient address");
        require(_amountInUSD > 0, "Amount should be greater than 0");
        require(_frequency > 0, "Frequency must be greater than 0");

        Subscription memory newSubscription = Subscription({
            name: _name,
            subscriptionOwner: msg.sender,
            recipient: _recipient,
            paymentToken: _paymentToken,
            amountInUSD: _amountInUSD,
            frequency: _frequency,
            nextPaymentDate: block.timestamp ,
            hasExited : false
        });

        userSubscriptions[msg.sender].push(newSubscription);
        emit SubscriptionCreated(msg.sender, userSubscriptions[msg.sender].length - 1, _name, _amountInUSD, _paymentToken);
    }

    /// @notice Cancels and removes an existing subscription
    function cancelSubscription(uint256 _subscriptionId) external nonReentrant {
        require(_subscriptionId < userSubscriptions[msg.sender].length, "Invalid subscription ID");
        Subscription storage subscription = userSubscriptions[msg.sender][_subscriptionId];
        require(subscription.subscriptionOwner == msg.sender, "Only subscription owner can cancel");


        subscription.hasExited = true;

        emit SubscriptionCancelled(msg.sender, _subscriptionId);
    }

    /// @notice Processes a subscription payment for a user, callable only by the authorized solver
    function processPayment(address _user, uint256 _subscriptionId) external onlySolver nonReentrant {
        require(_subscriptionId < userSubscriptions[_user].length, "Invalid subscription ID");
        Subscription storage subscription = userSubscriptions[_user][_subscriptionId];
        require(block.timestamp >= subscription.nextPaymentDate, "Payment not due yet");
        require(subscription.amountInUSD > 0, "Subscription is inactive");

        // Payment in ERC20 token directly from user
        IERC20 token = IERC20(subscription.paymentToken);
        require(token.balanceOf(_user) >= subscription.amountInUSD, "Insufficient token balance for subscription");
        
        if(specificAddressDelegate[subscription.recipient] == address(0)){
        // Transfer subscription amount from user to recipient
        token.safeTransferFrom(_user, subscription.recipient, subscription.amountInUSD);
        } else {
            (bool success,) = subscription.recipient.delegatecall(abi.encodeWithSignature("processPayment(address,uint256)",_user,_subscriptionId));
            require(success,"Delegate Called Failed");
        }

        // Update the next payment date
        subscription.nextPaymentDate += subscription.frequency;
        emit PaymentProcessed(_user, _subscriptionId, subscription.amountInUSD, subscription.nextPaymentDate, subscription.paymentToken);
    }

    /// @notice Returns the subscription details for a user
    function getSubscription(address _user, uint256 _subscriptionId) external view returns (
        string memory name,
        address subscriptionOwner,
        address recipient,
        address paymentToken,
        uint256 amountInUSD,
        uint256 frequency,
        uint256 nextPaymentDate
    ) {
        require(_subscriptionId < userSubscriptions[_user].length, "Invalid subscription ID");
        Subscription memory subscription = userSubscriptions[_user][_subscriptionId];
        return (
            subscription.name,
            subscription.subscriptionOwner,
            subscription.recipient,
            subscription.paymentToken,
            subscription.amountInUSD,
            subscription.frequency,
            subscription.nextPaymentDate
        );
    }

    function setSpecificAddressDelegate(address recipient,address delegateAddress)public onlySolver{
        specificAddressDelegate[recipient] = delegateAddress;
    }

    function isSubscriptionActive(address _user, uint256 _subscriptionId) external view returns (bool ) {
        require(_subscriptionId < userSubscriptions[_user].length, "Invalid subscription ID");
        Subscription storage subscription = userSubscriptions[_user][_subscriptionId];
        return subscription.amountInUSD > 0 && block.timestamp < subscription.nextPaymentDate ;
    }

    function isExecutable(address _user,uint256 _subscriptionId) external view returns(bool ){
        require(_subscriptionId < userSubscriptions[_user].length, "Invalid subscription ID");
        Subscription storage subscription = userSubscriptions[_user][_subscriptionId];
        return !subscription.hasExited && subscription.amountInUSD > 0 && block.timestamp >= subscription.nextPaymentDate ;
    }

    /// @notice Checks if the user has enough balance for the next subscription payment
    function hasEnoughBalance(address _user, uint256 _subscriptionId) external view returns (bool) {
        require(_subscriptionId < userSubscriptions[_user].length, "Invalid subscription ID");
        Subscription storage subscription = userSubscriptions[_user][_subscriptionId];
        
        // Ensure the subscription is active
        if (subscription.hasExited || subscription.amountInUSD == 0) {
            return false;
        }

        // Check the user's token balance
        IERC20 token = IERC20(subscription.paymentToken);
        return token.balanceOf(_user) >= subscription.amountInUSD && token.allowance(_user, address(this)) >= subscription.amountInUSD;
    }
}


