// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AxurriStaking is ReentrancyGuard {
    IERC20 public immutable axrToken;

    uint16 public rewardRate = 100; // 10% annual (100/1000 = 10%)
    uint256 public constant REWARD_DENOMINATOR = 1000;
    uint256 public constant SECONDS_IN_YEAR = 365 days;

    uint256 public minimumStakingTime = 1 days;
    bool public stakingEnabled = true;

    address public governance;
    bool public ownershipRenounced = false;

    uint256 public totalStaked;

    struct StakeInfo {
        uint256 amount;
        uint256 stakingTime;
        uint256 rewardsClaimed;
        bool isStaked;
    }

    mapping(address => StakeInfo) public stakes;

    event Staked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event StakingToggled(bool enabled);
    event RewardRateUpdated(uint256 newRate);
    event OwnershipRenounced(address indexed formerOwner);
    event ERC20Recovered(address token, uint256 amount);

    modifier onlyGovernance() {
        require(msg.sender == governance, "Not authorized");
        _;
    }

    modifier onlyWhenStakingEnabled() {
        require(stakingEnabled, "Staking is disabled");
        _;
    }

    modifier minimumStakeTime(address user) {
        require(
            block.timestamp - stakes[user].stakingTime >= minimumStakingTime,
            "Minimum staking time not met"
        );
        _;
    }

    constructor(address _tokenAddress, address _governance) {
        require(_tokenAddress != address(0), "Invalid token address");
        require(_governance != address(0), "Invalid governance address");
        axrToken = IERC20(_tokenAddress);
        governance = _governance;
    }

    function stake(uint256 amount) external nonReentrant onlyWhenStakingEnabled {
        require(amount > 0, "Cannot stake zero tokens");
        require(axrToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        StakeInfo storage userStake = stakes[msg.sender];

        if (userStake.isStaked) {
            _claimReward(msg.sender);
            userStake.amount += amount;
        } else {
            userStake.amount = amount;
            userStake.isStaked = true;
        }

        userStake.stakingTime = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function claimReward() external nonReentrant minimumStakeTime(msg.sender) {
        _claimReward(msg.sender);
    }

    function withdraw(uint256 amount) external nonReentrant minimumStakeTime(msg.sender) {
        StakeInfo storage userStake = stakes[msg.sender];
        require(amount > 0 && amount <= userStake.amount, "Invalid withdrawal amount");

        _claimReward(msg.sender);
        userStake.amount -= amount;
        totalStaked -= amount;

        if (userStake.amount == 0) {
            userStake.isStaked = false;
        }

        require(axrToken.transfer(msg.sender, amount), "Token transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function withdrawAll() external nonReentrant minimumStakeTime(msg.sender) {
        StakeInfo storage userStake = stakes[msg.sender];
        uint256 amount = userStake.amount;
        require(amount > 0, "Nothing to withdraw");

        _claimReward(msg.sender);

        userStake.amount = 0;
        userStake.isStaked = false;
        totalStaked -= amount;

        require(axrToken.transfer(msg.sender, amount), "Token transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function _claimReward(address user) internal {
        StakeInfo storage userStake = stakes[user];
        if (userStake.amount == 0) return;

        uint256 stakedDuration = block.timestamp - userStake.stakingTime;
        uint256 reward = (userStake.amount * rewardRate * stakedDuration) /
                         REWARD_DENOMINATOR / SECONDS_IN_YEAR;

        uint256 contractBalance = axrToken.balanceOf(address(this)) - totalStaked;
        if (reward > contractBalance) {
            reward = contractBalance;
        }

        if (reward > 0) {
            userStake.stakingTime = block.timestamp;
            userStake.rewardsClaimed += reward;
            require(axrToken.transfer(user, reward), "Reward transfer failed");
            emit RewardsClaimed(user, reward);
        }
    }

    // Governance Functions

    function setRewardRate(uint16 newRate) external onlyGovernance {
        require(newRate <= 300, "Max 30% annual rate");
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }

    function toggleStaking(bool enable) external onlyGovernance {
        stakingEnabled = enable;
        emit StakingToggled(enable);
    }

    function emergencyWithdrawTokens(address to, uint256 amount) external onlyGovernance {
        require(to != address(0), "Invalid recipient");
        require(axrToken.transfer(to, amount), "Transfer failed");
    }

    function recoverERC20(address tokenAddress, uint256 amount) external onlyGovernance {
        require(tokenAddress != address(axrToken), "Cannot recover staking token");
        IERC20(tokenAddress).transfer(governance, amount);
        emit ERC20Recovered(tokenAddress, amount);
    }

    function renounceOwnership() external onlyGovernance {
        governance = address(0);
        ownershipRenounced = true;
        emit OwnershipRenounced(msg.sender);
    }
}
