// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/ResearchSubmission.sol";

contract ResearchSubmissionTest is Test {
    ResearchSubmission research;

    function setUp() public {
        research = new ResearchSubmission();
    }

    function testSubmitStudy() public {
        string memory ipfsHash = "QmExamplePDF";
        string memory metadataURI = "ipfs://QmMetadataJSON";

        uint256 studyId = research.submitStudy(ipfsHash, metadataURI);

        (uint256 id, address researcher, string memory returnedHash, string memory returnedMetadata,,,) = research.studies(studyId);

        assertEq(id, 1);
        assertEq(researcher, address(this));
        assertEq(returnedHash, ipfsHash);
        assertEq(returnedMetadata, metadataURI);
    }

    function testSetAIReadinessScore() public {
        research.submitStudy("pdf", "meta");
        research.setAIReadinessScore(1, 80);
        (, , , , , uint8 score, bool set) = research.studies(1);

        assertEq(score, 80);
        assertTrue(set);
    }
}
