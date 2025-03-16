/**
 * strategies.js
 * 
 * This module defines different strategies for the Prisoner's Dilemma game.
 * Each strategy is a function that takes the history of moves and returns
 * either 'cooperate' or 'defect'.
 * 
 * The history parameter is an array of objects, each containing:
 * - myMove: The player's previous move ('cooperate' or 'defect')
 * - opponentMove: The opponent's previous move ('cooperate' or 'defect')
 */

// Constants for moves
const COOPERATE = 'cooperate';
const DEFECT = 'defect';

/**
 * Strategy: Always Cooperate
 * This strategy always cooperates regardless of the opponent's moves.
 * 
 * @param {Array} history - Array of previous moves
 * @returns {string} Always returns 'cooperate'
 */
function alwaysCooperate(history) {
    return COOPERATE;
}

/**
 * Strategy: Always Defect
 * This strategy always defects regardless of the opponent's moves.
 * 
 * @param {Array} history - Array of previous moves
 * @returns {string} Always returns 'defect'
 */
function alwaysDefect(history) {
    return DEFECT;
}

/**
 * Strategy: Tit for Tat
 * This strategy starts by cooperating, then mimics the opponent's previous move.
 * 
 * @param {Array} history - Array of previous moves
 * @returns {string} 'cooperate' or 'defect' based on opponent's last move
 */
function titForTat(history) {
    // If this is the first move (no history), cooperate
    if (history.length === 0) {
        return COOPERATE;
    }
    
    // Otherwise, do what the opponent did last time
    const lastMove = history[history.length - 1];
    return lastMove.opponentMove;
}

/**
 * Strategy: Random
 * This strategy randomly chooses to cooperate or defect.
 * 
 * @param {Array} history - Array of previous moves
 * @returns {string} Randomly returns 'cooperate' or 'defect'
 */
function random(history) {
    return Math.random() < 0.5 ? COOPERATE : DEFECT;
}

/**
 * Map of strategy IDs to their implementation functions
 */
const strategies = {
    'always-cooperate': {
        name: 'Always Cooperate',
        function: alwaysCooperate,
        description: 'Always cooperates regardless of what the opponent does.'
    },
    'always-defect': {
        name: 'Always Defect',
        function: alwaysDefect,
        description: 'Always defects regardless of what the opponent does.'
    },
    'tit-for-tat': {
        name: 'Tit for Tat',
        function: titForTat,
        description: 'Starts by cooperating, then mimics the opponent\'s previous move.'
    },
    'random': {
        name: 'Random',
        function: random,
        description: 'Randomly chooses to cooperate or defect.'
    }
};

// Create a global strategiesModule object
window.strategiesModule = {
    COOPERATE,
    DEFECT,
    strategies
}; 