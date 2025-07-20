// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/BountyManager.sol";

contract DeployBountyManager is Script {
    function run() external {
        vm.startBroadcast();

        // Replace this with actual ResearchSubmission address you deployed earlier
        address researchSubmissionAddress = 0xccA42cc7a66f506c7FFAD677E5B11dB2e1E182C5;

        BountyManager bounty = new BountyManager(researchSubmissionAddress);
        console.log("BountyManager deployed at:", address(bounty));

        vm.stopBroadcast();
    }
}
