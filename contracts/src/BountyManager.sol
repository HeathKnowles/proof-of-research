// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract BountyManager {
    enum BountyStatus { Open, Claimed, Expired }

    struct Bounty {
        uint256 studyId;
        address funder;
        address token; // address(0) for native BNB
        uint256 amount;
        uint256 deadline;
        address validator;
        BountyStatus status;
    }

    uint256 public bountyCount;
    mapping(uint256 => Bounty) public bounties;

    event BountyPosted(
        uint256 indexed bountyId,
        uint256 indexed studyId,
        address funder,
        address token,
        uint256 amount,
        uint256 deadline
    );

    event ValidationSubmitted(
        uint256 indexed bountyId,
        address indexed validator,
        string reportURI
    );

    event BountyClaimed(
        uint256 indexed bountyId,
        address indexed validator
    );

    /// @notice Fund a bounty for a specific study with native BNB
    function postBountyBNB(uint256 studyId, uint256 durationSeconds) external payable returns (uint256) {
        require(msg.value > 0, "No BNB sent");

        bountyCount++;
        bounties[bountyCount] = Bounty({
            studyId: studyId,
            funder: msg.sender,
            token: address(0),
            amount: msg.value,
            deadline: block.timestamp + durationSeconds,
            validator: address(0),
            status: BountyStatus.Open
        });

        emit BountyPosted(bountyCount, studyId, msg.sender, address(0), msg.value, block.timestamp + durationSeconds);
        return bountyCount;
    }

    /// @notice Fund a bounty using an ERC20 token (e.g., BUSD)
    function postBountyERC20(uint256 studyId, address token, uint256 amount, uint256 durationSeconds) external returns (uint256) {
        require(amount > 0, "Amount required");
        require(token != address(0), "Invalid token");

        // Transfer tokens to this contract
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");

        bountyCount++;
        bounties[bountyCount] = Bounty({
            studyId: studyId,
            funder: msg.sender,
            token: token,
            amount: amount,
            deadline: block.timestamp + durationSeconds,
            validator: address(0),
            status: BountyStatus.Open
        });

        emit BountyPosted(bountyCount, studyId, msg.sender, token, amount, block.timestamp + durationSeconds);
        return bountyCount;
    }

    /// @notice Submit a reproducibility proof (off-chain report stored on IPFS)
    function submitValidation(uint256 bountyId, string calldata reportURI) external {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Open, "Bounty closed");
        require(block.timestamp <= bounty.deadline, "Bounty expired");
        require(bounty.validator == address(0), "Already validated");

        // For now, accept first validator (can change to scoring system later)
        bounty.validator = msg.sender;
        bounty.status = BountyStatus.Claimed;

        // Payout
        if (bounty.token == address(0)) {
            payable(msg.sender).transfer(bounty.amount);
        } else {
            IERC20(bounty.token).transfer(msg.sender, bounty.amount);
        }

        emit ValidationSubmitted(bountyId, msg.sender, reportURI);
        emit BountyClaimed(bountyId, msg.sender);
    }

    /// @notice Get bounty data (for frontend)
    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        return bounties[bountyId];
    }

    function refundExpiredBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Open, "Not refundable");
        require(block.timestamp > bounty.deadline, "Too early");
        require(msg.sender == bounty.funder, "Only funder can refund");

        bounty.status = BountyStatus.Expired;

        if (bounty.token == address(0)) {
            payable(msg.sender).transfer(bounty.amount);
        } else {
            IERC20(bounty.token).transfer(msg.sender, bounty.amount);
        }
    }
}
