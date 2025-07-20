// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ResearchSubmission {
    enum ResearchStatus { Submitted, Funded, UnderReview, Validated }

    struct Study {
        uint256 id;
        address researcher;
        string dataURI;          
        string metadataJSON;     
        uint256 timestamp;
        ResearchStatus status;
        address funder;
        address validator;
        string reportURI;
        uint8 aiReadinessScore;
    }

    uint256 public studyCount;

    mapping(uint256 => Study) public studies;
    mapping(address => uint256[]) public researcherStudies;

    event StudySubmitted(
        uint256 indexed studyId,
        address indexed researcher,
        string dataURI,
        string metadataJSON,
        uint8 aiReadinessScore
    );

    event StudyFunded(uint256 indexed studyId, address indexed funder);
    event StatusUpdated(uint256 indexed studyId, ResearchStatus newStatus);
    event ValidationSubmitted(uint256 indexed studyId, address indexed validator, string reportURI);

    function submitStudy(
        string calldata dataURI,
        string calldata metadataJSON,
        uint8 aiReadinessScore
    ) external returns (uint256) {
        studyCount++;
        studies[studyCount] = Study({
            id: studyCount,
            researcher: msg.sender,
            dataURI: dataURI,
            metadataJSON: metadataJSON,
            timestamp: block.timestamp,
            status: ResearchStatus.Submitted,
            funder: address(0),
            validator: address(0),
            reportURI: "",
            aiReadinessScore: aiReadinessScore
        });

        researcherStudies[msg.sender].push(studyCount);

        emit StudySubmitted(studyCount, msg.sender, dataURI, metadataJSON, aiReadinessScore);
        return studyCount;
    }

    function fundStudy(uint256 studyId) external payable {
        Study storage study = studies[studyId];
        require(study.status == ResearchStatus.Submitted, "Not fundable");
        require(msg.value > 0, "No ETH sent");

        study.funder = msg.sender;
        study.status = ResearchStatus.Funded;

        emit StudyFunded(studyId, msg.sender);
        emit StatusUpdated(studyId, ResearchStatus.Funded);
    }

    // Anyone can submit validation (or you can add your own access control here)
    function submitValidation(
        uint256 studyId,
        address validator,
        string calldata reportURI
    ) external {
        Study storage study = studies[studyId];
        require(study.status == ResearchStatus.Funded, "Not ready for validation");

        study.validator = validator;
        study.reportURI = reportURI;
        study.status = ResearchStatus.Validated;

        emit ValidationSubmitted(studyId, validator, reportURI);
        emit StatusUpdated(studyId, ResearchStatus.Validated);
    }

    // Anyone can mark under review (or restrict as needed)
    function markUnderReview(uint256 studyId) external {
        Study storage study = studies[studyId];
        require(study.status == ResearchStatus.Funded, "Not funded");
        study.status = ResearchStatus.UnderReview;

        emit StatusUpdated(studyId, ResearchStatus.UnderReview);
    }

    function getStudiesByResearcher(address researcher) external view returns (uint256[] memory) {
        return researcherStudies[researcher];
    }

    function getStudy(uint256 studyId) external view returns (Study memory) {
        return studies[studyId];
    }
}
