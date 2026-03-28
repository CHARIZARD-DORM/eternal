// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Leaderboard.sol";

/**
 * @title BattleArena
 * @dev Core Battle Engine for Eternal game with Live Coding Battle Flow.
 */
contract BattleArena {
    Leaderboard public leaderboard;

    uint256 public battleCounter;
    uint256 public constant STAKE_AMOUNT = 0.01 ether;

    struct Battle {
        address player1;
        address player2;
        uint256 p1Hp;
        uint256 p1Attack;
        uint256 p1Defense;
        uint256 p1Special;
        bool p1Submitted;
        uint256 p2Hp;
        uint256 p2Attack;
        uint256 p2Defense;
        uint256 p2Special;
        bool p2Submitted;
        bool isActive;
        bool isComplete;
        address winner;
    }

    mapping(uint256 => Battle) public battles;
    uint256 public pendingBattleId;

    event BattleStarted(uint256 indexed battleId, address indexed player1, address indexed player2);
    event StatsSubmitted(uint256 indexed battleId, address indexed player);
    event RoundComplete(uint256 indexed battleId, uint256 round, uint256 fighter1Health, uint256 fighter2Health, uint256 damageDealtP1, uint256 damageDealtP2);
    event BattleComplete(uint256 indexed battleId, address indexed winner, uint256 finalRound);

    constructor(address _leaderboard) {
        leaderboard = Leaderboard(_leaderboard);
    }

    /**
     * @dev Two players commit to a battle by sending 0.01 MON stake.
     */
    function joinMatchmaking() external payable {
        require(msg.value == STAKE_AMOUNT, "Must stake exactly 0.01 MON");

        if (pendingBattleId == 0) {
            // Player 1 joining
            battleCounter++;
            pendingBattleId = battleCounter;
            
            Battle storage b = battles[pendingBattleId];
            b.player1 = msg.sender;
            b.isActive = true;
        } else {
            // Player 2 joining
            uint256 currentBattleId = pendingBattleId;
            pendingBattleId = 0; // Reset for next pair

            Battle storage b = battles[currentBattleId];
            require(b.player1 != msg.sender, "Cannot battle yourself");
            
            b.player2 = msg.sender;

            emit BattleStarted(currentBattleId, b.player1, b.player2);
        }
    }

    /**
     * @dev Cancel matchmaking strictly if the user is in the pending queue alone.
     */
    function cancelMatchmaking() external {
        require(pendingBattleId != 0, "No pending battle");
        Battle storage b = battles[pendingBattleId];
        require(b.player1 == msg.sender, "You are not in queue");

        b.isActive = false;
        pendingBattleId = 0;

        (bool success, ) = msg.sender.call{value: STAKE_AMOUNT}("");
        require(success, "Refund failed");
    }

    /**
     * @dev Submit stats derived from the live-coding evaluation.
     */
    function submitCodeStats(uint256 battleId, uint256 hp, uint256 attack, uint256 defense, uint256 special) external {
        Battle storage b = battles[battleId];
        require(b.isActive, "Battle not active");
        require(msg.sender == b.player1 || msg.sender == b.player2, "Not part of this battle");

        // Stat caps
        require(hp <= 500, "HP too high");
        require(attack <= 200, "Attack too high");
        require(defense <= 200, "Defense too high");
        require(special <= 200, "Special too high");

        if (msg.sender == b.player1) {
            require(!b.p1Submitted, "Already submitted");
            b.p1Hp = hp;
            b.p1Attack = attack;
            b.p1Defense = defense;
            b.p1Special = special;
            b.p1Submitted = true;
        } else {
            require(!b.p2Submitted, "Already submitted");
            b.p2Hp = hp;
            b.p2Attack = attack;
            b.p2Defense = defense;
            b.p2Special = special;
            b.p2Submitted = true;
        }

        emit StatsSubmitted(battleId, msg.sender);

        if (b.p1Submitted && b.p2Submitted) {
            _processBattle(battleId);
        }
    }

    /**
     * @dev Surrender the match, forfeiting the stake to the opponent.
     */
    function forfeit(uint256 battleId) external {
        Battle storage b = battles[battleId];
        require(b.isActive, "Battle not active");
        require(msg.sender == b.player1 || msg.sender == b.player2, "Not part of this battle");

        b.isActive = false;
        b.isComplete = true;

        if (msg.sender == b.player1) {
            b.winner = b.player2;
        } else {
            b.winner = b.player1;
        }

        emit BattleComplete(battleId, b.winner, 0);

        // Award points to the opponent
        leaderboard.addPoints(b.winner, 100);

        // Send Payout (0.02 MON) to the opponent
        uint256 payout = STAKE_AMOUNT * 2;
        (bool success, ) = b.winner.call{value: payout}("");
        require(success, "Payout failed");
    }

    /**
     * @dev Process the turn-based battle fully on-chain up to 10 rounds.
     */
    function _processBattle(uint256 battleId) internal {
        Battle storage b = battles[battleId];

        uint256 round = 1;
        uint256 currentP1Hp = b.p1Hp;
        uint256 currentP2Hp = b.p2Hp;
        
        while (round <= 10 && currentP1Hp > 0 && currentP2Hp > 0) {
            // Player 1 attacks Player 2
            uint256 damage1 = _calculateDamage(b.p1Attack, b.p2Defense, round, b.player1, b.player2);
            
            // Special ability triggers if P1 health < 30%
            if (currentP1Hp < (b.p1Hp * 3) / 10) {
                damage1 += b.p1Special;
            }

            if (damage1 > currentP2Hp) {
                currentP2Hp = 0;
            } else {
                currentP2Hp -= damage1;
            }

            uint256 damage2 = 0;
            
            // Player 2 attacks Player 1
            if (currentP2Hp > 0) {
                damage2 = _calculateDamage(b.p2Attack, b.p1Defense, round, b.player2, b.player1);
                
                // Special ability triggers if P2 health < 30%
                if (currentP2Hp < (b.p2Hp * 3) / 10) {
                    damage2 += b.p2Special;
                }

                if (damage2 > currentP1Hp) {
                    currentP1Hp = 0;
                } else {
                    currentP1Hp -= damage2;
                }
            }

            emit RoundComplete(battleId, round, currentP1Hp, currentP2Hp, damage1, damage2);
            
            if (currentP1Hp == 0 || currentP2Hp == 0) {
                break;
            }
            round++;
        }

        b.isComplete = true;
        b.isActive = false;

        // Determine Winner
        if (currentP1Hp > currentP2Hp) {
            b.winner = b.player1;
        } else if (currentP2Hp > currentP1Hp) {
            b.winner = b.player2;
        } else {
            // Draw - P1 wins tie breaker
            b.winner = b.player1;
        }

        emit BattleComplete(battleId, b.winner, round > 10 ? 10 : round);

        // Award points
        leaderboard.addPoints(b.winner, 100);

        // Send Payout (0.02 MON)
        uint256 payout = STAKE_AMOUNT * 2;
        (bool success, ) = b.winner.call{value: payout}("");
        require(success, "Payout failed");
    }

    /**
     * @dev Pseudo-random damage calculation
     */
    function _calculateDamage(uint256 attack, uint256 defense, uint256 round, address attacker, address defender) internal view returns (uint256) {
        uint256 randomHash = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, round, attacker, defender)));
        uint256 randomFactor = 80 + (randomHash % 41); // 80 to 120

        uint256 baseDamage = (attack * randomFactor) / 100;
        uint256 defReduction = defense / 2;
        
        if (baseDamage > defReduction) {
            return baseDamage - defReduction;
        }
        
        return 1; // Minimum 1 damage
    }
}
