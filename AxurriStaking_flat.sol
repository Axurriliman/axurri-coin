// Sources flattened with hardhat v2.24.0 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/security/ReentrancyGuard.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (security/ReentrancyGuard.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}


// File contracts/staking/AxurriStaking.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;
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
