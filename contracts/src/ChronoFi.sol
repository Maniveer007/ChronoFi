// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {ISP} from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import {Attestation} from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import {DataLocation} from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";
import {ISPHook} from "@ethsign/sign-protocol-evm/src/interfaces/ISPHook.sol";
import "./lib/BrevisAppZkOnly.sol";
import "./ChronofiPriceOracle.sol";

contract ChronoFi is ReentrancyGuard, BrevisAppZkOnly, ISPHook, Ownable {
    using SafeERC20 for IERC20;

    ISP public spInstance;
    uint64 public schemaId;

    struct PaymentIntent {
        string name;
        address payer;
        address recipient;
        address paymentToken;
        uint256 amountInUSD;
        uint256 frequency;
        uint256 nextPaymentDate;
        bool isRevoked;
    }

    bytes32 public vkHash;
    address public SOLVER;
    address public PUSH_CHANNEL_ADDRESS;
    IERC20 public ChronoToken;
    ChronofiPriceOracle public priceOracle;
    mapping(address => PaymentIntent[]) private userIntents;

    mapping(address => address) specificAddressDelegate;
    mapping(address => bool) public EarlyUser;

    event IntentCreated(address indexed user, uint256 indexed intentId, string name, uint256 amountInUSD, address paymentToken);
    event IntentRevoked(address indexed user, uint256 indexed intentId);
    event PaymentProcessed(address indexed user, uint256 indexed intentId, uint256 amountInTokens, uint256 nextPaymentDate, address paymentToken);

    modifier onlySolver() {
        require(msg.sender == SOLVER, "Only the authorized SOLVER can process payments");
        _;
    }

    constructor(
        address _SOLVER, 
        address _brevisRequest, 
        address _chronoToken, 
        address _priceOracle,
        address _spInstance,
        address _pushChannelAddress
    ) BrevisAppZkOnly(_brevisRequest) Ownable(msg.sender) {
        SOLVER = _SOLVER;
        ChronoToken = IERC20(_chronoToken);
        priceOracle = ChronofiPriceOracle(_priceOracle);
        spInstance = ISP(_spInstance);
        PUSH_CHANNEL_ADDRESS = _pushChannelAddress;
        /*
        
        0xAFE08919dAC82E79ae274eb94441AA2447Bb13b6,
        0x841ce48F9446C8E281D3F1444cB859b4A6D0738C,
        0x303860D21B14B8d2072AF6FDf8345e1d9311630B,
        0x462be78d6dfaCEF20C460edBa701F66935082ca8,
        0x878c92FD89d8E0B93Dc0a3c907A2adc7577e39c5,
        0xAFE08919dAC82E79ae274eb94441AA2447Bb13b6
        

        */
    }

    function setSchemaId(uint64 _schemaId) public onlyOwner {
        schemaId = _schemaId;
    }

    function didReceiveAttestation(
        address attester,
        uint64 _schemaId,
        uint64 attestationId,
        bytes calldata extraData
    ) external payable override {
        require(schemaId == _schemaId, "Invalid Schema");

        Attestation memory a = spInstance.getAttestation(attestationId);

        (
            string memory _name,
            address _recipient,
            address _paymentToken,
            uint256 _amountInUSD,
            uint256 _frequency
        ) = abi.decode(a.data,(string,address,address,uint256,uint256));

        PaymentIntent memory newIntent = PaymentIntent({
            name: _name,
            payer: attester,
            recipient: _recipient,
            paymentToken: _paymentToken,
            amountInUSD: _amountInUSD,
            frequency: _frequency,
            nextPaymentDate: block.timestamp,
            isRevoked: false
        });

        userIntents[attester].push(newIntent);

        emit IntentCreated(attester, userIntents[attester].length - 1, _name, _amountInUSD, _paymentToken);
    }

    function convertUSDToToken(address _token, uint256 _amountInUSD) public view returns (uint256) {
        uint256 tokenPriceInUSD = priceOracle.getLatestPrice(_token);
        require(tokenPriceInUSD > 0, "Token price is zero");

        return (_amountInUSD * (10 ** ERC20(_token).decimals()) * (10 ** ERC20(_token).decimals())) / tokenPriceInUSD;
    }

    function processPayment(address _user, uint256 _intentId) external onlySolver nonReentrant {
        require(_intentId < userIntents[_user].length, "Invalid intent ID");
        PaymentIntent storage intent = userIntents[_user][_intentId];
        require(block.timestamp >= intent.nextPaymentDate, "Payment not due yet");
        require(!intent.isRevoked, "Intent has been revoked");

        uint256 amountInTokens = convertUSDToToken(intent.paymentToken, intent.amountInUSD);
        IERC20 token = IERC20(intent.paymentToken);
        require(token.balanceOf(_user) >= amountInTokens, "Insufficient token balance");

        if (specificAddressDelegate[intent.recipient] == address(0)) {
            token.safeTransferFrom(_user, intent.recipient, amountInTokens);

            IPUSHCommInterface(0x0C34d54a09CFe75BCcd878A469206Ae77E0fe6e7).sendNotification(
            PUSH_CHANNEL_ADDRESS, // from channel
            intent.payer, // to recipient, put address(this) in case you want Broadcast or Subset. For Targetted put the address to which you want to send
            bytes(
                string(
                    // We are passing identity here: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                    abi.encodePacked(
                        "0", // this is notification identity: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                        "+", // segregator
                        "3", // this is payload type: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/payload (1, 3 or 4) = (Broadcast, targetted or subset)
                        "+", // segregator
                        "Payment By ChronoFi", // this is notificaiton title
                        "+", // segregator
                        "a Payment of ",
                        amountInTokens / 10**18,
                        "in ",
                        intent.paymentToken,
                        " Payment Token Was made from your account To  :",
                        addressToString(intent.recipient),
                        " By ChronoFi"
                    )
                )
            )
        );

            IPUSHCommInterface(0x0C34d54a09CFe75BCcd878A469206Ae77E0fe6e7).sendNotification(
            PUSH_CHANNEL_ADDRESS, // from channel
            intent.recipient, // to recipient, put address(this) in case you want Broadcast or Subset. For Targetted put the address to which you want to send
            bytes(
                string(
                    // We are passing identity here: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                    abi.encodePacked(
                        "0", // this is notification identity: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                        "+", // segregator
                        "3", // this is payload type: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/payload (1, 3 or 4) = (Broadcast, targetted or subset)
                        "+", // segregator
                        "Payment By ChronoFi", // this is notificaiton title
                        "+", // segregator
                        "a Payment of ",
                        amountInTokens / 10**18,
                        " in ",
                        intent.paymentToken,
                        " Token was Recevied to your account From :",
                        addressToString(intent.payer),
                        " By ChronoFi"
                    )
                )
            )
        );
        } else {
            (bool success, ) = intent.recipient.delegatecall(abi.encodeWithSignature("processPayment(address,uint256)", _user, _intentId));
            require(success, "Delegate call failed");
        }

        if (!EarlyUser[msg.sender]) {
            ChronoToken.transferFrom(_user, SOLVER, (intent.amountInUSD * 3 * 1e18) / 1000);
        }

        intent.nextPaymentDate += intent.frequency;
        emit PaymentProcessed(_user, _intentId, amountInTokens, intent.nextPaymentDate, intent.paymentToken);
    }

    function revokeIntent(address _user, uint256 _intentId) external {
        require(_intentId < userIntents[_user].length, "Invalid intent ID");
        PaymentIntent storage intent = userIntents[_user][_intentId];
        require(!intent.isRevoked, "Intent has already been revoked");
        intent.isRevoked = true;
        emit IntentRevoked(_user, _intentId);
    }

    function getIntent(address _user, uint256 _intentId) external view returns (PaymentIntent memory) {
        require(_intentId < userIntents[_user].length, "Invalid intent ID");
        return userIntents[_user][_intentId];
    }

    function getUserIntents(address _user) public view returns (PaymentIntent[] memory) {
        return userIntents[_user];
    }

    function setSpecificAddressDelegate(address recipient, address delegateAddress) public onlyOwner {
        specificAddressDelegate[recipient] = delegateAddress;
    }

    function isIntentActive(address _user, uint256 _intentId) external view returns (bool) {
        require(_intentId < userIntents[_user].length, "Invalid intent ID");
        PaymentIntent memory intent = userIntents[_user][_intentId];
        return !intent.isRevoked && intent.amountInUSD > 0 && block.timestamp < intent.nextPaymentDate;
    }

    function isPaymentExecutable(address _user, uint256 _intentId) external view returns (bool) {
        require(_intentId < userIntents[_user].length, "Invalid intent ID");
        PaymentIntent memory intent = userIntents[_user][_intentId];
        return !intent.isRevoked && block.timestamp >= intent.nextPaymentDate;
    }

    function hasEnoughBalance(address _user, uint256 _intentId) public view returns (bool) {
        require(_intentId < userIntents[_user].length, "Invalid intent ID");
        PaymentIntent memory intent = userIntents[_user][_intentId];
        
        if (intent.isRevoked) {
            return false;
        }

        IERC20 token = IERC20(intent.paymentToken);
        uint256 tokenAmount = convertUSDToToken(intent.paymentToken, intent.amountInUSD);
        return token.balanceOf(_user) >= tokenAmount && token.allowance(_user, address(this)) >= tokenAmount;
    }

    function setVkHash(bytes32 _vkHash) external onlyOwner {
        vkHash = _vkHash;
    }

    ////////////////////////////////////////////////////////
    /////////////////// SIGN Protocol //////////////////////
    ////////////////////////////////////////////////////////

    function didReceiveAttestation(
        address attester,
        uint64, // schemaId
        uint64 attestationId,
        IERC20 reSOLVERFeeERC20Token,
        uint256 reSOLVERFeeERC20Amount,
        bytes calldata extraData
    ) external override {
        // Not implemented
    }

    function didReceiveRevocation(
        address attester,
        uint64, // schemaId
        uint64 attestationId,
        bytes calldata extraData
    ) external payable override {
        // Not implemented
    }

    function didReceiveRevocation(
        address attester,
        uint64, // schemaId
        uint64 attestationId,
        IERC20 reSOLVERFeeERC20Token,
        uint256 reSOLVERFeeERC20Amount,
        bytes calldata extraData
    ) external override {
        // Not implemented
    }

    function addressToString(
        address _address
    ) internal pure returns (string memory) {
        bytes32 _bytes = bytes32(uint256(uint160(_address)));
        bytes memory HEX = "0123456789abcdef";
        bytes memory _string = new bytes(42);
        _string[0] = "0";
        _string[1] = "x";
        for (uint i = 0; i < 20; i++) {
            _string[2 + i * 2] = HEX[uint8(_bytes[i + 12] >> 4)];
            _string[3 + i * 2] = HEX[uint8(_bytes[i + 12] & 0x0f)];
        }
        return string(_string);
    }
}

// PUSH Comm Contract Interface
interface IPUSHCommInterface {
    function sendNotification(
        address _channel,
        address _recipient,
        bytes calldata _identity
    ) external;
}


   


//