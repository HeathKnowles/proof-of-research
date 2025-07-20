// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/BountyManager.sol";

contract BountyManagerTest is Test {
    BountyManager bountyManager;
    address validator = address(0xBEEF);

    function setUp() public {
        bountyManager = new BountyManager();
        vm.deal(address(this), 10 ether);
        vm.deal(validator, 5 ether);
    }

    function testPostBountyAndClaimBNB() public {
        uint256 bountyId = bountyManager.postBountyBNB{value: 1 ether}(1, 3600);
        (, , , uint256 amount, , ,) = bountyManager.bounties(bountyId);
        assertEq(amount, 1 ether);

        vm.prank(validator);
        bountyManager.submitValidation(bountyId, "ipfs://QmValidationReport");

        (, , , , , address validatedBy, BountyManager.BountyStatus status) = bountyManager.bounties(bountyId);
        assertEq(validatedBy, validator);
        assertEq(uint8(status), 1); // Claimed
    }
}
