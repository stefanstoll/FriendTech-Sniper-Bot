pragma solidity ^0.8.0;

interface ITargetContract {
    function buyShares(address sharesSubject, uint256 amount) external payable;
    function sellShares(address sharesSubject, uint256 amount) external payable;
}

contract RapidFireContract {
    address public owner;
    ITargetContract public targetContract;
    mapping(address => bool) public whitelistedAddresses;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    modifier onlyWhitelisted() {
        require(whitelistedAddresses[msg.sender], "Not whitelisted");
        _;
    }

    constructor(address _targetContractAddress) {
        owner = msg.sender;
        targetContract = ITargetContract(_targetContractAddress);
    }

    function setTargetContract(address _newTarget) public onlyOwner {
        targetContract = ITargetContract(_newTarget);
    }

    function addWhitelist(address _address) public onlyOwner {
        whitelistedAddresses[_address] = true;
    }

    function removeWhitelist(address _address) public onlyOwner {
        whitelistedAddresses[_address] = false;
    }

    function depositFunds() external payable {
        require(msg.value > 0, "Must send some ether");
    }

    function withdrawFunds(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Not enough balance");
        payable(owner).transfer(amount);
    }

    function attemptToBuyShares(address sharesSubject, uint256 amount, uint256 etherAmount) external onlyWhitelisted {
        require(address(this).balance >= etherAmount, "Not enough balance in contract");
        targetContract.buyShares{value: etherAmount}(sharesSubject, amount);
    }

    function attemptToSellShares(address sharesSubject, uint256 amount, uint256 etherAmount) external onlyWhitelisted {
        require(address(this).balance >= etherAmount, "Not enough balance in contract");
        targetContract.sellShares{value: etherAmount}(sharesSubject, amount);
    }

    // Fallback function to handle unexpected Ether transfers
    fallback() external payable {}

    // Receive function to accept Ether
    receive() external payable {}
}
