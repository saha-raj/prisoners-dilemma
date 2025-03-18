/**
 * main.js
 * 
 * This is the main entry point for the Prisoner's Dilemma simulation application.
 * It initializes the application, sets up event listeners, and coordinates
 * the interaction between different modules.
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const strategy1Select = document.getElementById('strategy1');
    const strategy2Select = document.getElementById('strategy2');
    const strategy1Color = document.querySelector('.strategy1-color');
    const strategy2Color = document.querySelector('.strategy2-color');
    const populationSizeInput = document.getElementById('population-size');
    const totalGamesInput = document.getElementById('total-games');
    const gamesPerPairingInput = document.getElementById('games-per-pairing');
    const startButton = document.getElementById('start-tournament');
    const stopButton = document.getElementById('stop-tournament');
    const resetButton = document.getElementById('reset-visualization');
    const runningIndicator = document.getElementById('running-indicator');
    
    // Proportion control elements
    const proportionSlider = document.getElementById('proportion-slider');
    const proportionLabelLeft = document.getElementById('proportion-label-left');
    const proportionLabelRight = document.getElementById('proportion-label-right');
    
    // Strategy colors
    const strategyColors = {
        'cooperator': '#06d6a0',
        'defector': '#ff9770',
        'tit-for-tat': '#168aad',
        'random': '#f72585',
        'grudger': '#9b5de5',
        'detective': '#565264',
        'pavlov': '#fcca46'
    };
    
    // Current proportion value (0.5 = 50% for each strategy)
    let currentProportion = 0.5;
    
    // Initialize proportion control
    updateProportionControl(currentProportion);
    
    // Add event listener for proportion slider
    proportionSlider.addEventListener('input', function() {
        currentProportion = this.value / 100;
        updateProportionControl(currentProportion);
    });
    
    // Function to update the proportion control UI
    function updateProportionControl(proportion) {
        // Update slider value
        proportionSlider.value = proportion * 100;
        
        // Update labels
        proportionLabelLeft.textContent = `${Math.round(proportion * 100)}%`;
        proportionLabelRight.textContent = `${Math.round((1 - proportion) * 100)}%`;
        
        // Get current strategy colors
        const leftColor = strategyColors[strategy1Select.value];
        const rightColor = strategyColors[strategy2Select.value];
        
        // Update slider background dynamically with actual strategy colors
        const percent = proportion * 100;
        proportionSlider.style.background = `linear-gradient(to right, 
            ${leftColor} 0%, 
            ${leftColor} ${percent}%, 
            ${rightColor} ${percent}%, 
            ${rightColor} 100%)`;
    }
    
    // Strategy descriptions
    const strategyDescriptions = {
        'cooperator': 'Always cooperates regardless of opponent\'s moves.',
        'defector': 'Always defects regardless of opponent\'s moves.',
        'random': 'Randomly chooses to cooperate or defect with equal probability.',
        'tit-for-tat': 'Starts by cooperating, then copies opponent\'s previous move.',
        'grudger': 'Cooperates until the opponent defects, then always defects.',
        'detective': 'Starts with a specific sequence, then switches to Tit for Tat if the opponent ever defects, otherwise defects.',
        'pavlov': 'Starts by cooperating, then changes strategy only when receiving a low payoff.'
    };
    
    // Simulation and visualizer instances
    let simulation = null;
    let visualizer = null;
    let isRunning = false;
    let stopRequested = false;
    let nextGameTimeout = null;
    
    // Initialize the visualizer
    visualizer = new visualizationModule.SimulationVisualizer({
        agentPoolContainer: 'agent-pool-container',
        histogramContainer: 'histogram-container'
    });
    
    // Update slider values as they change
    populationSizeInput.addEventListener('input', function() {
        // We no longer have textContent to update as the min/max values are static
        // Remove the line that tries to update the non-existent element
    });
    
    totalGamesInput.addEventListener('input', function() {
        // We no longer have textContent to update as the min/max values are static
        // Remove the line that tries to update the non-existent element
    });
    
    gamesPerPairingInput.addEventListener('input', function() {
        // We no longer have textContent to update as the min/max values are static
        // Remove the line that tries to update the non-existent element
    });
    
    // Set default strategy selections
    strategy1Select.value = 'tit-for-tat';
    strategy2Select.value = 'defector';
    
    // Update strategy colors when selections change (but not descriptions)
    strategy1Select.addEventListener('change', function() {
        strategy1Color.style.backgroundColor = strategyColors[this.value];
        updateProportionControl(currentProportion); // Update slider colors
    });
    
    strategy2Select.addEventListener('change', function() {
        strategy2Color.style.backgroundColor = strategyColors[this.value];
        updateProportionControl(currentProportion); // Update slider colors
    });
    
    // Initialize color indicators with default selected strategies
    strategy1Color.style.backgroundColor = strategyColors[strategy1Select.value];
    strategy2Color.style.backgroundColor = strategyColors[strategy2Select.value];
    
    // Start tournament button click handler
    startButton.addEventListener('click', function() {
        if (isRunning) return;
        
        // Disable controls during simulation
        startButton.disabled = true;
        stopButton.disabled = false;
        strategy1Select.disabled = true;
        strategy2Select.disabled = true;
        populationSizeInput.disabled = true;
        totalGamesInput.disabled = true;
        gamesPerPairingInput.disabled = true;
        
        // Show running indicator
        runningIndicator.classList.remove('hidden');
        
        // Get selected strategies and parameters
        const strategy1 = strategy1Select.value;
        const strategy2 = strategy2Select.value;
        const populationSize = parseInt(populationSizeInput.value);
        const totalGames = parseInt(totalGamesInput.value);
        const gamesPerPairing = parseInt(gamesPerPairingInput.value);
        
        // Create simulation configuration
        const config = {
            strategies: {},
            proportion: currentProportion,
            populationSize: populationSize,
            totalGames: totalGames,
            gamesPerPairing: gamesPerPairing
        };
        
        // Set the strategies in the config
        config.strategies[strategy1] = 0;
        config.strategies[strategy2] = 0;
        
        // Initialize simulation
        simulation = new simulationModule.PopulationSimulation(config);
        
        // Set up simulation callbacks
        simulation.onGameComplete = function(gameResult) {
            // Update visualization
            visualizer.update(simulation.getStatistics());
            
            // If simulation is not complete and not stopped, run next game after a delay
            if (!simulation.isComplete && !stopRequested) {
                nextGameTimeout = setTimeout(() => {
                    simulation.runGame();
                }, 10); // Small delay between games for UI updates
            } else {
                // Simulation is complete or stopped
                simulationComplete();
            }
        };
        
        simulation.onProgressUpdate = function(stats) {
            // Update visualization periodically
            visualizer.update(stats);
        };
        
        simulation.onSimulationComplete = function(results) {
            // Final update when simulation is complete
            visualizer.update(simulation.getStatistics());
            simulationComplete();
        };
        
        // Function to handle simulation completion
        function simulationComplete() {
            // Display final stats
            displayFinalStats(simulation);
            
            // Re-enable controls
            startButton.disabled = false;
            stopButton.disabled = true;
            strategy1Select.disabled = false;
            strategy2Select.disabled = false;
            populationSizeInput.disabled = false;
            totalGamesInput.disabled = false;
            gamesPerPairingInput.disabled = false;
            
            // Hide running indicator
            runningIndicator.classList.add('hidden');
            
            isRunning = false;
        }
        
        // Initialize simulation and visualizer
        simulation.initialize();
        visualizer.initialize(simulation);
        
        // Display initial statistics
        const initialStats = simulation.getStatistics();
        visualizer.update(initialStats);
        
        // Start the simulation
        isRunning = true;
        setTimeout(() => {
            simulation.runGame();
        }, 100);
    });
    
    // Stop tournament button click handler
    stopButton.addEventListener('click', function() {
        if (!isRunning || !simulation) return;
        
        stopRequested = true;
        stopButton.disabled = true;
        
        // If there's a pending timeout, clear it
        if (nextGameTimeout) {
            clearTimeout(nextGameTimeout);
            nextGameTimeout = null;
        }
        
        // If simulation is running, mark it as complete
        if (isRunning) {
            // Display final stats
            displayFinalStats(simulation);
            
            // Re-enable controls
            startButton.disabled = false;
            stopButton.disabled = true;
            strategy1Select.disabled = false;
            strategy2Select.disabled = false;
            populationSizeInput.disabled = false;
            totalGamesInput.disabled = false;
            gamesPerPairingInput.disabled = false;
            
            // Hide running indicator
            runningIndicator.classList.add('hidden');
            
            isRunning = false;
        }
    });
    
    // Reset visualization button click handler
    resetButton.addEventListener('click', function() {
        if (visualizer) {
            visualizer.reset();
        }
    });
    
    // Function to display final statistics
    function displayFinalStats(simulation) {
        const stats = simulation.getStatistics();
        const strategy1 = strategy1Select.value;
        const strategy2 = strategy2Select.value;
        
        // Determine the winner
        const strategy1Avg = stats.strategyStats[strategy1].averageScore;
        const strategy2Avg = stats.strategyStats[strategy2].averageScore;
        
        // Display winner on the visualization
        if (strategy1Avg > strategy2Avg) {
            visualizer.displayWinner(strategy1);
        } else if (strategy2Avg > strategy1Avg) {
            visualizer.displayWinner(strategy2);
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (visualizer) {
            // The old tournament-container no longer exists
            // Use the agent-pool and histogram containers instead
            // Let the visualizer handle its own resize logic
            visualizer.handleResize();
            
            // Update the visualization if simulation exists
            if (simulation) {
                const stats = simulation.getStatistics();
                visualizer.update(stats);
            }
        }
    });
});