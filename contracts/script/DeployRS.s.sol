// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/ResearchSubmission.sol";

contract DeployResearchSubmission is Script {
    function run() external {
        vm.startBroadcast();

        ResearchSubmission research = new ResearchSubmission();
        console.log("ResearchSubmission deployed at:", address(research));

        vm.stopBroadcast();
    }
}
