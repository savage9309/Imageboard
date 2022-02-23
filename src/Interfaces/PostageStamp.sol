// SPDX-License-Identifier: AGPL-1.0
pragma solidity 0.8.9;

interface PostageStamp {
    function createBatch(
        address _owner,
        uint256 _initialBalancePerChunk,
        uint8 _depth,
        uint8 _bucketDepth,
        bytes32 _nonce,
        bool _immutable
    ) external;
}
