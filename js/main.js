/**
 * main.js
 * 
 * This is the main entry point for the Prisoner's Dilemma simulation application.
 * It initializes the application, sets up event listeners, and coordinates
 * the interaction between different modules.
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const strategy1Select = document.getElementById('strategy1');
    const strategy2Select = document.getElementById('strategy2');
    const strategy1Description = document.getElementById('strategy1-description');
    const strategy2Description = document.getElementById('strategy2-description');
    const proportion1Input = document.getElementById('proportion1');
    const proportion2Input = document.getElementById('proportion2');
    const proportion1Value = document.getElementById('proportion1-value');
    const proportion2Value = document.getElementById('proportion2-value');
    const populationSizeInput = document.getElementById('population-size');
    const gamesPerRoundInput = document.getElementById('games-per-round');
    const gamesPerPairingInput = document.getElementById('games-per-pairing');
    const startSimulationButton = document.getElementById('start-tournament');
    const stopSimulationButton = document.getElementById('stop-tournament');
    const runningIndicator = document.getElementById('running-indicator');
    
    // Simulation and visualizer instances
    let simulation = null;
    let visualizer = null;
    let simulationRunning = false;
    let stopRequested = false;
    let nextGameTimeout = null;
    
    // Initialize the visualizer
    visualizer = new visualizationModule.SimulationVisualizer('tournament-container', {
        width: document.getElementById('tournament-container').clientWidth,
        height: 400
    });
    
    // Update proportion display when slider changes
    proportion1Input.addEventListener('input', () => {
        const value = proportion1Input.value;
        proportion1Value.textContent = `${value}%`;
        proportion2Value.textContent = `${100 - value}%`;
    });
    
    // Update strategy descriptions when selections change
    strategy1Select.addEventListener('change', () => {
        updateStrategyDescription(strategy1Select.value, strategy1Description);
    });
    
    strategy2Select.addEventListener('change', () => {
        updateStrategyDescription(strategy2Select.value, strategy2Description);
    });
    
    // Function to update strategy description
    function updateStrategyDescription(strategyId, descriptionElement) {
        const strategy = strategiesModule.strategies[strategyId];
        if (strategy && strategy.description) {
            descriptionElement.textContent = strategy.description;
        }
    }
    
    // Initialize strategy descriptions
    updateStrategyDescription(strategy1Select.value, strategy1Description);
    updateStrategyDescription(strategy2Select.value, strategy2Description);
    
    // Enable population size input
    document.querySelector('.param-group:nth-child(1)').style.display = 'block';
    
    // Update the games per round label to be more descriptive
    document.querySelector('label[for="games-per-round"]').textContent = 'Total games to play:';
    
    // Start simulation button click handler
    startSimulationButton.addEventListener('click', () => {
        // Reset stop flag
        stopRequested = false;
        
        // Show running indicator
        runningIndicator.classList.remove('hidden');
        
        // Disable controls during simulation
        startSimulationButton.disabled = true;
        stopSimulationButton.disabled = false;
        strategy1Select.disabled = true;
        strategy2Select.disabled = true;
        proportion1Input.disabled = true;
        populationSizeInput.disabled = true;
        gamesPerRoundInput.disabled = true;
        gamesPerPairingInput.disabled = true;
        
        // Get selected strategies and parameters
        const strategy1 = strategy1Select.value;
        const strategy2 = strategy2Select.value;
        const proportion = parseInt(proportion1Input.value) / 100;
        const populationSize = parseInt(populationSizeInput.value);
        const totalGames = parseInt(gamesPerRoundInput.value);
        const gamesPerPairing = parseInt(gamesPerPairingInput.value);
        
        // Create simulation configuration with the two selected strategies
        const simulationConfig = {
            strategies: {
                [strategy1]: 0,
                [strategy2]: 0
            },
            proportion: proportion,
            populationSize: populationSize,
            totalGames: totalGames,
            gamesPerPairing: gamesPerPairing
        };
        
        // Initialize simulation
        simulation = new simulationModule.PopulationSimulation(simulationConfig);
        simulationRunning = true;
        
        // Set up simulation callbacks
        simulation.onGameComplete = (gameResult) => {
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
        
        simulation.onProgressUpdate = (stats) => {
            // Update visualization periodically
            visualizer.update(stats);
        };
        
        simulation.onSimulationComplete = (results) => {
            // Final update when simulation is complete
            visualizer.update(simulation.getStatistics());
            simulationComplete();
        };
        
        // Initialize simulation and visualizer
        simulation.initialize();
        visualizer.initialize(simulation);
        
        // Display initial statistics
        const initialStats = simulation.getStatistics();
        visualizer.update(initialStats);
        
        // Start the first game after a short delay
        setTimeout(() => {
            simulation.runGame();
        }, 500);
    });
    
    // Stop simulation button click handler
    stopSimulationButton.addEventListener('click', () => {
        stopRequested = true;
        stopSimulationButton.disabled = true;
        
        // If there's a pending timeout, clear it
        if (nextGameTimeout) {
            clearTimeout(nextGameTimeout);
            nextGameTimeout = null;
        }
        
        // If simulation is running, mark it as complete
        if (simulationRunning) {
            simulationComplete();
        }
    });
    
    // Function to handle simulation completion
    function simulationComplete() {
        // Hide running indicator
        runningIndicator.classList.add('hidden');
        
        // Re-enable controls
        startSimulationButton.disabled = false;
        stopSimulationButton.disabled = true;
        strategy1Select.disabled = false;
        strategy2Select.disabled = false;
        proportion1Input.disabled = false;
        populationSizeInput.disabled = false;
        gamesPerRoundInput.disabled = false;
        gamesPerPairingInput.disabled = false;
        
        simulationRunning = false;
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (visualizer) {
            // Get the new container width
            const containerWidth = document.getElementById('tournament-container').clientWidth;
            
            // Update visualizer dimensions
            visualizer.width = containerWidth;
            visualizer.height = 400; // Keep the same height
            
            // Update the SVG dimensions
            visualizer.container.select('svg')
                .attr('width', containerWidth)
                .attr('height', 400);
            
            // Update the visualization
            if (simulation) {
                const stats = simulation.getStatistics();
                visualizer.update(stats);
            }
        }
    });
}); 