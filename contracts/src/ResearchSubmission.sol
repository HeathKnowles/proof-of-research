// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ResearchSubmission {
    uint256 public studyCount;
    address public agent;

    constructor(address _agent) {
        agent = _agent;
    }

    struct Study {
        uint256 id;
        address researcher;
        string ipfsHash;
        string metadataURI;
        uint256 timestamp;
        uint8 aiReadinessScore;
        bool scoreSet;
    }

    mapping(uint256 => Study) public studies;
    mapping(address => uint256[]) public researcherStudies;

    event StudySubmitted(
        uint256 indexed studyId,
        address indexed researcher,
        string ipfsHash,
        string metadataURI,
        uint256 timestamp
    );

    event AIReadinessScoreSet(
        uint256 indexed studyId,
        uint8 score
    );

    modifier onlyagent() {
        require(msg.sender == agent, "Not authorized");
        _;
    }

    function submitStudy(string calldata ipfsHash, string calldata metadataURI) external returns (uint256) {
        require(bytes(ipfsHash).length > 0, "Missing IPFS hash");
        require(bytes(metadataURI).length > 0, "Missing metadata");

        studyCount++;
        studies[studyCount] = Study({
            id: studyCount,
            researcher: msg.sender,
            ipfsHash: ipfsHash,
            metadataURI: metadataURI,
            timestamp: block.timestamp,
            aiReadinessScore: 0,
            scoreSet: false
        });

        researcherStudies[msg.sender].push(studyCount);
        emit StudySubmitted(studyCount, msg.sender, ipfsHash, metadataURI, block.timestamp);
        return studyCount;
    }

    function setAIReadinessScore(uint256 studyId, uint8 score) external onlyagent {
        require(score <= 100, "Score must be 0-100");
        require(!studies[studyId].scoreSet, "Already scored");

        studies[studyId].aiReadinessScore = score;
        studies[studyId].scoreSet = true;
        emit AIReadinessScoreSet(studyId, score);
    }

    function getStudiesByResearcher(address researcher) external view returns (uint256[] memory) {
        return researcherStudies[researcher];
    }

    function getStudy(uint256 studyId) external view returns (Study memory) {
        return studies[studyId];
    }

    function updateagent(address newAgent) external {
        require(msg.sender == agent, "Only current agent can update");
        agent = newAgent;
    }
}
