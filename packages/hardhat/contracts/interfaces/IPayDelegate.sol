// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

interface IPayDelegate {
    function didPay(
        address _payer,
        uint256 _amount,
        uint256 _weight,
        uint256 _count,
        address _beneficiary,
        string calldata memo
    ) external;
}