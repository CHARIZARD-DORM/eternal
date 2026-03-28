// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Leaderboard
 * @dev Points and Ranking System for the Eternal game.
 */
contract Leaderboard {
    address public owner;
    address public arenaContract;

    mapping(address => uint256) public points;
    address[] public allPlayers;
    mapping(address => bool) public isPlayer;

    event RankUpdated(address indexed player, uint256 newPoints, uint256 newRank);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    modifier onlyArena() {
        require(msg.sender == arenaContract, "Only Arena can call");
        _;
    }

    function setArenaContract(address _arenaContract) external onlyOwner {
        arenaContract = _arenaContract;
    }

    /**
     * @dev Adds points to a player's score. Only callable by BattleArena.
     */
    function addPoints(address player, uint256 _points) external onlyArena {
        if (!isPlayer[player]) {
            isPlayer[player] = true;
            allPlayers.push(player);
        }
        points[player] += _points;
        uint256 currentRank = getRank(player);
        emit RankUpdated(player, points[player], currentRank);
    }

    /**
     * @dev Returns the rank of a player based on their points (1-indexed).
     * Compares points of the player with all other registered players.
     */
    function getRank(address player) public view returns (uint256) {
        if (!isPlayer[player]) return 0; // 0 means unranked
        
        uint256 playerPoints = points[player];
        uint256 rank = 1;
        
        for(uint256 i = 0; i < allPlayers.length; i++) {
            if(points[allPlayers[i]] > playerPoints) {
                rank++;
            } else if (points[allPlayers[i]] == playerPoints && allPlayers[i] != player) {
                // Tie-breaker by address to maintain strict ordering
                if (uint160(allPlayers[i]) < uint160(player)) {
                    rank++;
                }
            }
        }
        return rank;
    }

    /**
     * @dev Returns the number of ability slots a player has unlocked based on their rank.
     */
    function getAbilitySlots(address player) public view returns (uint256) {
        if (!isPlayer[player]) return 0;
        uint256 rank = getRank(player);
        
        if (rank >= 1 && rank <= 50) return 1;
        if (rank >= 51 && rank <= 100) return 2;
        if (rank >= 101 && rank <= 200) return 3;
        return 4; // rank 200+
    }

    struct PlayerRankInfo {
        address player;
        uint256 points;
        uint256 rank;
    }

    /**
     * @dev Returns the top N players.
     */
    function getTopPlayers(uint256 count) external view returns (PlayerRankInfo[] memory) {
        uint256 total = allPlayers.length;
        uint256 size = count > total ? total : count;
        PlayerRankInfo[] memory topPlayers = new PlayerRankInfo[](size);
        
        for (uint256 i = 0; i < total; i++) {
            address p = allPlayers[i];
            uint256 r = getRank(p);
            if (r <= size && r > 0) {
                topPlayers[r - 1] = PlayerRankInfo({
                    player: p,
                    points: points[p],
                    rank: r
                });
            }
        }
        return topPlayers;
    }
}
