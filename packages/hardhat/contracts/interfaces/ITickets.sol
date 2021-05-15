// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

import "./IProjects.sol";
import "./IOperatorStore.sol";
import "./IERC20Ticket.sol";

interface ITickets is IERC1155 {
    event Issue(
        uint256 indexed projectId,
        string name,
        string symbol,
        address operator
    );

    event Convert(
        address indexed account,
        uint256 indexed projectId,
        uint256 amount,
        address operator
    );

    event AddController(
        address indexed controller,
        uint256 indexed projectId,
        address operator
    );
    event RemoveController(
        address indexed controller,
        uint256 indexed projectId,
        address operator
    );

    event Initialize(uint256 indexed projectId, address indexed controller);

    function operatorStore() external view returns (IOperatorStore);

    function projects() external view returns (IProjects);

    function erc20Tickets(uint256 _projectId)
        external
        view
        returns (IERC20Ticket);

    function isController(uint256 _projectId, address _controller)
        external
        view
        returns (bool);

    function totalSupply(uint256 _projectId) external view returns (uint256);

    function totalBalanceOf(address _holder, uint256 _projectId)
        external
        view
        returns (uint256 _result);

    function issue(
        uint256 _projectId,
        string memory _name,
        string memory _symbol
    ) external;

    function print(
        address _for,
        uint256 _projectId,
        uint256 _amount
    ) external;

    function redeem(
        address _holder,
        uint256 _projectId,
        uint256 _amount,
        bool _erc20
    ) external;

    function convert(address _account, uint256 _projectId) external;

    function addController(address _controller, uint256 _projectId) external;

    function removeController(address _controller, uint256 _projectId) external;
}
