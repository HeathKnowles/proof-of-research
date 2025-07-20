// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/ResearchSubmission.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        address agent = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        new ResearchSubmission(agent);

        vm.stopBroadcast();
    }
}
