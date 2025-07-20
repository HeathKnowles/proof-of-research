// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IResearchSubmission {
    function markUnderReview(uint256 studyId) external;
    function submitValidation(uint256 studyId, address validator, string calldata reportURI) external;
}

contract BountyManager {
    enum BountyStatus { Open, Claimed, Expired }

    struct Bounty {
        uint256 studyId;
        address funder;
        uint256 amount;
        uint256 deadline;
        address validator;
        BountyStatus status;
    }

    uint256 public bountyCount;
    address public agent;
    IResearchSubmission public researchContract;

    mapping(uint256 => Bounty) public bounties;

    event BountyPosted(uint256 indexed bountyId, uint256 indexed studyId, address funder, uint256 amount, uint256 deadline);
    event ValidationSubmitted(uint256 indexed bountyId, address indexed validator, string reportURI);
    event BountyClaimed(uint256 indexed bountyId, address indexed validator);

    modifier onlyAgent() {
        require(msg.sender == agent, "Only agent");
        _;
    }

    constructor(address _researchSubmission, address _agent) {
        researchContract = IResearchSubmission(_researchSubmission);
        agent = _agent;
    }

    function postBounty(uint256 studyId, uint256 durationSeconds) external payable returns (uint256) {
        require(msg.value > 0, "No funds");

        bountyCount++;
        bounties[bountyCount] = Bounty({
            studyId: studyId,
            funder: msg.sender,
            amount: msg.value,
            deadline: block.timestamp + durationSeconds,
            validator: address(0),
            status: BountyStatus.Open
        });

        // Notify ResearchSubmission that it's under review
        researchContract.markUnderReview(studyId);

        emit BountyPosted(bountyCount, studyId, msg.sender, msg.value, block.timestamp + durationSeconds);
        return bountyCount;
    }

    function submitValidation(uint256 bountyId, string calldata reportURI) external {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Open, "Bounty closed");
        require(block.timestamp <= bounty.deadline, "Bounty expired");
        require(bounty.validator == address(0), "Already validated");

        bounty.validator = msg.sender;
        bounty.status = BountyStatus.Claimed;

        // Transfer bounty to validator
        payable(msg.sender).transfer(bounty.amount);

        // Notify ResearchSubmission of validation
        researchContract.submitValidation(bounty.studyId, msg.sender, reportURI);

        emit ValidationSubmitted(bountyId, msg.sender, reportURI);
        emit BountyClaimed(bountyId, msg.sender);
    }

    function refundExpiredBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Open, "Not open");
        require(block.timestamp > bounty.deadline, "Too early");
        require(msg.sender == bounty.funder, "Not funder");

        bounty.status = BountyStatus.Expired;
        payable(msg.sender).transfer(bounty.amount);
    }

    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        return bounties[bountyId];
    }

    function updateAgent(address newAgent) external onlyAgent {
        require(newAgent != address(0), "Zero address");
        agent = newAgent;
    }
}
