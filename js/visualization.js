/**
 * visualization.js
 * 
 * This module handles the visualization of the Prisoner's Dilemma simulation
 * using D3.js. It creates visual representations of strategies, their interactions,
 * and score distributions.
 */

/**
 * SimulationVisualizer class to handle all visualization aspects
 */
class SimulationVisualizer {
    /**
     * Create a new simulation visualizer
     * @param {string} containerId - ID of the container element for visualization
     * @param {Object} options - Visualization options
     */
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = d3.select(`#${containerId}`);
        this.width = options.width || 800;
        this.height = options.height || 400;
        this.margin = options.margin || { top: 40, right: 40, bottom: 60, left: 60 };
        
        // Visualization parameters
        this.binWidth = 5; // Default bin width
        this.minScore = 0;  // Default min score for y-axis
        this.maxScore = 50; // Default max score for y-axis
        
        // Color scale for different strategies
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        
        // Initialize the SVG
        this.svg = this.container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
            
        // Create a group for the agent pool visualization (left side)
        this.agentPoolGroup = this.svg.append('g')
            .attr('class', 'agent-pool')
            .attr('transform', `translate(${this.width * 0.22}, ${this.height / 2})`);
            
        // Create a group for the histogram (right side) - moved further right
        this.histogramGroup = this.svg.append('g')
            .attr('class', 'histogram')
            .attr('transform', `translate(${this.width * 0.7}, ${this.height / 2})`);
            
        // Create a legend (now positioned between agent pool and histogram)
        this.legendGroup = this.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width * 0.45}, ${this.height * 0.2})`);
            
        // Create axes for histogram
        this.xAxisLeft = this.histogramGroup.append('g')
            .attr('class', 'x-axis-left');
            
        this.xAxisRight = this.histogramGroup.append('g')
            .attr('class', 'x-axis-right');
            
        this.yAxis = this.histogramGroup.append('g')
            .attr('class', 'y-axis');
            
        // Add axis label for histogram - moved further down
        this.histogramGroup.append('text')
            .attr('class', 'x-axis-label')
            .attr('text-anchor', 'middle')
            .attr('x', 0)
            .attr('y', this.height * 0.45) // Moved down
            .text('Number of Agents');
            
        // Add total score displays for each side
        this.leftTotalScore = this.histogramGroup.append('text')
            .attr('class', 'total-score left-score')
            .attr('text-anchor', 'end')
            .attr('x', -this.width * 0.05)
            .attr('y', -this.height * 0.35)
            .text('Total: 0')
            .style('font-size', '12px')
            .style('font-weight', 'bold');
            
        this.rightTotalScore = this.histogramGroup.append('text')
            .attr('class', 'total-score right-score')
            .attr('text-anchor', 'start')
            .attr('x', this.width * 0.05)
            .attr('y', -this.height * 0.35)
            .text('Total: 0')
            .style('font-size', '12px')
            .style('font-weight', 'bold');
            
        // Add a title for the agent pool
        this.agentPoolGroup.append('text')
            .attr('class', 'agent-pool-title')
            .attr('text-anchor', 'middle')
            .attr('x', 0)
            .attr('y', -this.height * 0.4)
            .text('Agent Pool')
            .style('font-size', '14px')
            .style('font-weight', 'bold');
            
        // Add a title for the histogram
        this.histogramGroup.append('text')
            .attr('class', 'histogram-title')
            .attr('text-anchor', 'middle')
            .attr('x', 0)
            .attr('y', -this.height * 0.4)
            .text('Score Distribution')
            .style('font-size', '14px')
            .style('font-weight', 'bold');
            
        // Add controls
        this.addControls();
            
        // Set up scales for the population pyramid histogram
        this.setupHistogramScales();
        
        // Set up the force simulation for agent movement
        this.setupForceSimulation();
    }
    
    /**
     * Add visualization controls (bin width, min/max score)
     */
    addControls() {
        // Create a container for the controls
        const controlsContainer = this.container.append('div')
            .attr('class', 'viz-controls')
            .style('margin-top', '10px')
            .style('text-align', 'center')
            .style('display', 'flex')
            .style('justify-content', 'center')
            .style('gap', '20px');
            
        // Add bin width slider
        const binWidthControl = controlsContainer.append('div')
            .style('display', 'inline-block')
            .style('margin-right', '20px');
            
        binWidthControl.append('label')
            .attr('for', 'bin-width-slider')
            .text('Bin Width: ')
            .style('margin-right', '10px');
            
        const binWidthSlider = binWidthControl.append('input')
            .attr('type', 'range')
            .attr('id', 'bin-width-slider')
            .attr('min', '1')
            .attr('max', '10')
            .attr('step', '1')
            .attr('value', this.binWidth)
            .style('vertical-align', 'middle');
            
        const binWidthValue = binWidthControl.append('span')
            .attr('id', 'bin-width-value')
            .text(this.binWidth)
            .style('margin-left', '5px');
            
        // Add min score slider
        const minScoreControl = controlsContainer.append('div')
            .style('display', 'inline-block')
            .style('margin-right', '20px');
            
        minScoreControl.append('label')
            .attr('for', 'min-score-slider')
            .text('Min Score: ')
            .style('margin-right', '10px');
            
        const minScoreSlider = minScoreControl.append('input')
            .attr('type', 'range')
            .attr('id', 'min-score-slider')
            .attr('min', '0')
            .attr('max', '30')
            .attr('step', '1')
            .attr('value', this.minScore)
            .style('vertical-align', 'middle');
            
        const minScoreValue = minScoreControl.append('span')
            .attr('id', 'min-score-value')
            .text(this.minScore)
            .style('margin-left', '5px');
            
        // Add max score slider
        const maxScoreControl = controlsContainer.append('div')
            .style('display', 'inline-block');
            
        maxScoreControl.append('label')
            .attr('for', 'max-score-slider')
            .text('Max Score: ')
            .style('margin-right', '10px');
            
        const maxScoreSlider = maxScoreControl.append('input')
            .attr('type', 'range')
            .attr('id', 'max-score-slider')
            .attr('min', '10')
            .attr('max', '100')
            .attr('step', '5')
            .attr('value', this.maxScore)
            .style('vertical-align', 'middle');
            
        const maxScoreValue = maxScoreControl.append('span')
            .attr('id', 'max-score-value')
            .text(this.maxScore)
            .style('margin-left', '5px');
            
        // Add event listeners
        binWidthSlider.on('input', () => {
            this.binWidth = parseInt(binWidthSlider.property('value'));
            binWidthValue.text(this.binWidth);
            
            // Update histogram if we have data
            if (this.simulation && this.lastStats) {
                this.updateHistogram(this.lastStats.scoreDistributions, this.lastStats.strategyStats);
            }
        });
        
        minScoreSlider.on('input', () => {
            const newMinScore = parseInt(minScoreSlider.property('value'));
            // Ensure min score is less than max score
            if (newMinScore < this.maxScore) {
                this.minScore = newMinScore;
                minScoreValue.text(this.minScore);
                
                // Update scales and histogram
                this.setupHistogramScales();
                if (this.simulation && this.lastStats) {
                    this.updateHistogram(this.lastStats.scoreDistributions, this.lastStats.strategyStats);
                }
            }
        });
        
        maxScoreSlider.on('input', () => {
            const newMaxScore = parseInt(maxScoreSlider.property('value'));
            // Ensure max score is greater than min score
            if (newMaxScore > this.minScore) {
                this.maxScore = newMaxScore;
                maxScoreValue.text(this.maxScore);
                
                // Update scales and histogram
                this.setupHistogramScales();
                if (this.simulation && this.lastStats) {
                    this.updateHistogram(this.lastStats.scoreDistributions, this.lastStats.strategyStats);
                }
            }
        });
    }
    
    /**
     * Set up scales for the population pyramid histogram
     */
    setupHistogramScales() {
        // X scales for left and right sides of the histogram with fixed limits
        this.histogramXScaleLeft = d3.scaleLinear()
            .domain([30, 0])  // Fixed limit of 30 agents in a bin
            .range([-this.width * 0.15, 0]);  // Negative range for left side
            
        this.histogramXScaleRight = d3.scaleLinear()
            .domain([0, 30])  // Fixed limit of 30 agents in a bin
            .range([0, this.width * 0.15]);  // Positive range for right side
            
        // Y scale for scores with user-defined limits
        this.histogramYScale = d3.scaleLinear()
            .domain([this.minScore, this.maxScore])  // User-defined limits
            .range([this.height * 0.35, -this.height * 0.35]);
            
        // Remove existing center line if it exists
        this.histogramGroup.select('.center-line').remove();
        
        // Create a center line
        this.histogramGroup.append('line')
            .attr('class', 'center-line')
            .attr('x1', 0)
            .attr('y1', this.histogramYScale(this.minScore))
            .attr('x2', 0)
            .attr('y2', this.histogramYScale(this.maxScore))
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1);
            
        // Set up axes
        // X-axis at the bottom (y=0) for both left and right sides
        // Position at min score or 0, whichever is higher
        const xAxisYPos = this.histogramYScale(Math.max(0, this.minScore));
        
        this.xAxisLeft
            .attr('transform', `translate(0, ${xAxisYPos})`)
            .call(d3.axisBottom(this.histogramXScaleLeft).ticks(3));
            
        this.xAxisRight
            .attr('transform', `translate(0, ${xAxisYPos})`)
            .call(d3.axisBottom(this.histogramXScaleRight).ticks(3));
            
        this.yAxis
            .attr('transform', `translate(0, 0)`)
            .call(d3.axisLeft(this.histogramYScale).ticks(5));
    }
    
    /**
     * Set up the force simulation for agent movement
     */
    setupForceSimulation() {
        // Create a force simulation with balanced forces
        this.forceSimulation = d3.forceSimulation()
            // Light repulsion to prevent perfect overlap
            .force('charge', d3.forceManyBody().strength(-5).distanceMax(50))
            // Collision detection to prevent overlap
            .force('collision', d3.forceCollide().radius(d => d.radius * 1.1).strength(0.3))
            // Add a gentle center-directed force to keep agents from all migrating to the edge
            .force('center', d3.forceCenter(0, 0).strength(0.01))
            // Custom force for pairing - only applied when agentData exists
            .force('pairing', alpha => {
                if (!this.agentData) return; // Skip if agentData doesn't exist yet
                
                // Apply attraction force between paired agents
                for (let i = 0; i < this.agentData.length; i++) {
                    const agent = this.agentData[i];
                    if (!agent || !agent.isInPairing || agent.currentPairingId === null) continue;
                    
                    // Find the paired agent
                    const pairedAgent = this.agentData.find(a => a && a.id === agent.currentPairingId);
                    if (!pairedAgent) continue;
                    
                    // Calculate vector between agents considering periodic boundaries
                    const [dx, dy] = this.getPeriodicVector(agent, pairedAgent);
                    
                    // Skip if any values are NaN
                    if (isNaN(dx) || isNaN(dy)) continue;
                    
                    // Apply a stronger attraction force for paired agents
                    const strength = 0.2 * alpha;
                    agent.vx += dx * strength;
                    agent.vy += dy * strength;
                }
            })
            // Custom force for general agent movement - random walks within the space
            .force('random-walk', alpha => {
                if (!this.agentData) return;
                
                this.agentData.forEach(agent => {
                    if (!agent) return;
                    
                    // Add a small random movement to each agent
                    const randomAngle = Math.random() * 2 * Math.PI;
                    const randomStrength = 0.1 * alpha;
                    agent.vx += Math.cos(randomAngle) * randomStrength;
                    agent.vy += Math.sin(randomAngle) * randomStrength;
                    
                    // Add a small inward force for agents near the boundary
                    const dist = Math.sqrt(agent.x * agent.x + agent.y * agent.y);
                    if (dist > this.areaRadius * 0.8) {
                        const angle = Math.atan2(agent.y, agent.x);
                        const inwardStrength = 0.05 * alpha * (dist / this.areaRadius);
                        agent.vx -= Math.cos(angle) * inwardStrength;
                        agent.vy -= Math.sin(angle) * inwardStrength;
                    }
                });
            })
            // Moderate decay values for stability
            .alphaDecay(0.02)
            .velocityDecay(0.3);
    }
    
    /**
     * Calculate the vector between two agents considering periodic boundaries
     * @param {Object} agent1 - First agent
     * @param {Object} agent2 - Second agent
     * @returns {Array} [dx, dy] - The vector from agent1 to agent2
     */
    getPeriodicVector(agent1, agent2) {
        // Safety check
        if (!agent1 || !agent2) return [0, 0];
        if (isNaN(agent1.x) || isNaN(agent1.y) || isNaN(agent2.x) || isNaN(agent2.y)) return [0, 0];
        
        // Calculate direct vector
        let dx = agent2.x - agent1.x;
        let dy = agent2.y - agent1.y;
        
        // Calculate direct distance
        const directDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Only consider periodic boundaries if both agents are near the edge
        // and on opposite sides of the circle
        const r1 = Math.sqrt(agent1.x * agent1.x + agent1.y * agent1.y);
        const r2 = Math.sqrt(agent2.x * agent2.x + agent2.y * agent2.y);
        
        // Only consider periodic boundaries if both agents are near the edge
        if (r1 > this.areaRadius * 0.75 && r2 > this.areaRadius * 0.75) {
            // Calculate the angles of the agents
            const theta1 = Math.atan2(agent1.y, agent1.x);
            const theta2 = Math.atan2(agent2.y, agent2.x);
            
            // Calculate the angular difference
            let dTheta = Math.abs(theta1 - theta2);
            if (dTheta > Math.PI) dTheta = 2 * Math.PI - dTheta;
            
            // If the agents are on nearly opposite sides of the circle
            if (dTheta > Math.PI * 0.75) {
                // For visualization purposes, we'll still return the direct vector
                // but we'll mark this as a cross-boundary pairing in the updatePairingLines method
                agent1.crossBoundaryWith = agent2.id;
                agent2.crossBoundaryWith = agent1.id;
            } else {
                // Clear cross-boundary flag if it exists
                agent1.crossBoundaryWith = null;
                agent2.crossBoundaryWith = null;
            }
        } else {
            // Clear cross-boundary flag if it exists
            if (agent1.crossBoundaryWith === agent2.id) agent1.crossBoundaryWith = null;
            if (agent2.crossBoundaryWith === agent1.id) agent2.crossBoundaryWith = null;
        }
        
        return [dx, dy];
    }
    
    /**
     * Tick function for the force simulation
     * Handles agent movement and boundary constraints
     */
    tickFunction() {
        if (!this.agentData) return; // Safety check
        
        // Apply boundary constraints (not periodic boundaries)
        this.agentData.forEach(d => {
            // Safety check for NaN values
            if (isNaN(d.x) || isNaN(d.y)) {
                // Reset to a valid position if NaN is detected
                d.x = 0;
                d.y = 0;
                d.vx = 0;
                d.vy = 0;
                return;
            }
            
            // Calculate distance from center
            const dist = Math.sqrt(d.x * d.x + d.y * d.y);
            
            // If agent is beyond the boundary, gently push it back
            if (dist > this.areaRadius) {
                // Calculate angle
                const angle = Math.atan2(d.y, d.x);
                
                // Place agent just inside the boundary
                const newDist = this.areaRadius * 0.98;
                d.x = Math.cos(angle) * newDist;
                d.y = Math.sin(angle) * newDist;
                
                // Reduce velocity slightly to prevent bouncing
                d.vx *= 0.8;
                d.vy *= 0.8;
            }
        });
        
        // Update agent positions with safety checks
        this.agentNodes
            .attr('cx', d => isNaN(d.x) ? 0 : d.x)
            .attr('cy', d => isNaN(d.y) ? 0 : d.y);
            
        // Update pairing lines
        this.updatePairingLines();
    }
    
    /**
     * Update the pairing lines between agents
     */
    updatePairingLines() {
        if (!this.agentData || !this.pairingLinesGroup) return; // Safety check
        
        // Create array of active pairings
        const activePairings = [];
        
        // Only process each pairing once (by the lower ID agent)
        this.agentData.forEach(agent => {
            if (!agent || !agent.isInPairing || agent.currentPairingId === null || agent.id >= agent.currentPairingId) return;
            
            const pairedAgent = this.agentData.find(a => a && a.id === agent.currentPairingId);
            if (!pairedAgent) return;
            
            // Safety check for NaN values
            if (isNaN(agent.x) || isNaN(agent.y) || isNaN(pairedAgent.x) || isNaN(pairedAgent.y)) return;
            
            // Check if this is a cross-boundary pairing
            const isCrossBoundary = agent.crossBoundaryWith === pairedAgent.id;
            
            if (isCrossBoundary) {
                // For cross-boundary pairings, we'll draw a dotted line directly between them
                // This indicates that they're interacting across the boundary
                activePairings.push({
                    source: agent,
                    target: pairedAgent,
                    isCrossBoundary: true
                });
            } else {
                // Regular pairing line - direct connection
                activePairings.push({
                    source: agent,
                    target: pairedAgent,
                    isCrossBoundary: false
                });
            }
        });
        
        // Update pairing lines
        const lines = this.pairingLinesGroup.selectAll('.pairing-line')
            .data(activePairings);
            
        // Remove old lines
        lines.exit().remove();
        
        // Add new lines
        const enterLines = lines.enter()
            .append('line')
            .attr('class', 'pairing-line');
            
        // Update all lines (new and existing)
        enterLines.merge(lines)
            .attr('stroke', d => d.isCrossBoundary ? '#ff9900' : '#777')
            .attr('stroke-width', 0.8) // Thinner lines
            .attr('stroke-dasharray', d => d.isCrossBoundary ? '1,3' : '1,2') // Different pattern for cross-boundary
            .attr('opacity', 0.6) // Slightly more transparent
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
    }
    
    /**
     * Initialize the visualization with simulation data
     * @param {PopulationSimulation} simulation - The simulation instance
     */
    initialize(simulation) {
        this.simulation = simulation;
        this.updateLegend();
        
        // Initialize agent pool visualization
        if (this.simulation && this.simulation.agents) {
            this.initializeAgentPool();
        }
    }
    
    /**
     * Initialize the agent pool visualization
     */
    initializeAgentPool() {
        const agents = this.simulation.agents;
        
        // Define the radius of the circular area
        const areaRadius = Math.min(this.width * 0.2, this.height / 2) * 0.8;
        
        // Create a boundary circle
        this.agentPoolGroup.append('circle')
            .attr('class', 'boundary-circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', areaRadius)
            .attr('fill', 'none')
            .attr('stroke', '#ddd')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '3,3');
        
        // Create pairing lines container FIRST (so it appears below the agents)
        this.pairingLinesGroup = this.agentPoolGroup.append('g')
            .attr('class', 'pairing-lines');
        
        // Create agent data with random positions inside the circular area
        this.agentData = agents.map((agent, i) => {
            // Use true random positioning but with a better distribution
            // Generate random angle
            const angle = Math.random() * 2 * Math.PI;
            
            // Use square root of random value for distance to ensure uniform area distribution
            // (Without sqrt, points would cluster in the center)
            const distance = Math.sqrt(Math.random()) * areaRadius * 0.9;
            
            // Convert to cartesian coordinates
            const x = distance * Math.cos(angle);
            const y = distance * Math.sin(angle);
            
            return {
                id: agent.id,
                strategyId: agent.strategyId,
                score: 0,
                x: x,
                y: y,
                radius: 2,  // Start with smaller dots
                currentPairingId: null, // ID of current pairing partner
                playedWith: new Set(), // Set of agent IDs this agent has played with
                isInPairing: false, // Whether agent is currently in a pairing
                crossBoundaryWith: null // ID of agent this agent is paired with across boundary
            };
        });
        
        // Create agent circles AFTER the pairing lines (so they appear on top)
        this.agentNodes = this.agentPoolGroup.selectAll('.agent')
            .data(this.agentData, d => d.id)
            .enter()
            .append('circle')
            .attr('class', 'agent')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.radius)
            .attr('fill', d => this.colorScale(strategiesModule.strategies[d.strategyId].name))
            .attr('opacity', 0.8);
            
        // Store the area radius for use in the tick function
        this.areaRadius = areaRadius;
        
        // Start the simulation
        this.forceSimulation
            .nodes(this.agentData)
            .on('tick', () => this.tickFunction());
    }
    
    /**
     * Update the legend showing different strategies
     */
    updateLegend() {
        // Clear existing legend
        this.legendGroup.selectAll('*').remove();
        
        if (!this.simulation) return;
        
        // Get the two strategies
        const strategies = Object.keys(this.simulation.strategyStats);
        
        // Add title
        this.legendGroup.append('text')
            .attr('x', 0)
            .attr('y', -10)
            .text('Strategies')
            .style('font-size', '14px')
            .style('font-weight', 'bold');
        
        // Create legend items
        const legendItems = this.legendGroup.selectAll('.legend-item')
            .data(strategies)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0, ${i * 25 + 10})`);
            
        // Add colored circles
        legendItems.append('circle')
            .attr('r', 7)
            .attr('cx', 7)
            .attr('cy', 7)
            .attr('fill', d => this.colorScale(strategiesModule.strategies[d].name))
            .attr('opacity', 0.8);
            
        // Add strategy names
        legendItems.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .text(d => strategiesModule.strategies[d].name)
            .style('font-size', '14px');
    }
    
    /**
     * Update the visualization with the current simulation state
     * @param {Object} stats - Simulation statistics
     */
    update(stats) {
        if (!this.simulation || !stats) return;
        
        // Store the stats for potential reuse (e.g., when bin width changes)
        this.lastStats = stats;
        
        // Update agent pairings if there's an active pairing
        if (stats.currentPairing) {
            this.updateAgentPairings(stats.currentPairing);
        }
        
        this.updateAgentPool();
        this.updateHistogram(stats.scoreDistributions, stats.strategyStats);
        this.updateStats(stats);
    }
    
    /**
     * Update agent pairings based on current pairing information
     * @param {Object} pairingInfo - Information about the current pairing
     */
    updateAgentPairings(pairingInfo) {
        if (!this.agentData || !this.simulation || !this.simulation.possiblePairings) return;
        
        // Reset pairing status if we're starting a new pairing
        if (pairingInfo.gamesPlayed === 0) {
            // Reset all agents' pairing status
            this.agentData.forEach(agent => {
                if (!agent) return;
                agent.isInPairing = false;
                agent.currentPairingId = null;
            });
            
            // Get the current pairing from the simulation
            const currentPairing = this.simulation.possiblePairings[pairingInfo.index];
            if (currentPairing) {
                // Find the agents in our data
                const agent1Index = currentPairing.agent1Index;
                const agent2Index = currentPairing.agent2Index;
                
                if (agent1Index < this.simulation.agents.length && 
                    agent2Index < this.simulation.agents.length) {
                    
                    const agent1Id = this.simulation.agents[agent1Index].id;
                    const agent2Id = this.simulation.agents[agent2Index].id;
                    
                    const agent1 = this.agentData.find(a => a && a.id === agent1Id);
                    const agent2 = this.agentData.find(a => a && a.id === agent2Id);
                    
                    if (agent1 && agent2) {
                        // Set up the new pairing
                        agent1.isInPairing = true;
                        agent1.currentPairingId = agent2.id;
                        agent1.playedWith.add(agent2.id);
                        
                        agent2.isInPairing = true;
                        agent2.currentPairingId = agent1.id;
                        agent2.playedWith.add(agent1.id);
                        
                        // Apply a gentle attraction force to bring them together
                        this.forceSimulation.alpha(0.3).restart();
                    }
                }
            }
        } else if (pairingInfo.gamesPlayed >= pairingInfo.totalGames) {
            // Pairing is complete, find new partners
            this.findNewPairings();
        }
    }
    
    /**
     * Find new pairings for agents after completing a round
     */
    findNewPairings() {
        if (!this.agentData) return;
        
        // First, reset all current pairings
        this.agentData.forEach(agent => {
            if (!agent) return;
            agent.isInPairing = false;
            agent.currentPairingId = null;
            agent.crossBoundaryWith = null; // Reset cross-boundary flag
        });
        
        // Create a copy of agents to work with
        const availableAgents = [...this.agentData].filter(a => a);
        
        // Shuffle to ensure random initial selection
        this.shuffleArray(availableAgents);
        
        // For each agent, find the closest unplayed partner
        while (availableAgents.length >= 2) {
            const agent = availableAgents.shift(); // Take the first agent
            
            // Find potential partners (agents that haven't played with this agent yet)
            const potentialPartners = availableAgents.filter(a => !agent.playedWith.has(a.id));
            
            if (potentialPartners.length === 0) {
                // No available partners, skip this agent
                continue;
            }
            
            // Sort potential partners by distance (considering direct distance only)
            potentialPartners.sort((a, b) => {
                const dxA = a.x - agent.x;
                const dyA = a.y - agent.y;
                const distA = Math.sqrt(dxA * dxA + dyA * dyA);
                
                const dxB = b.x - agent.x;
                const dyB = b.y - agent.y;
                const distB = Math.sqrt(dxB * dxB + dyB * dyB);
                
                return distA - distB;
            });
            
            // Select the closest partner
            const partner = potentialPartners[0];
            
            // Remove the partner from available agents
            const partnerIndex = availableAgents.indexOf(partner);
            if (partnerIndex !== -1) {
                availableAgents.splice(partnerIndex, 1);
                
                // Set up the new pairing
                agent.isInPairing = true;
                agent.currentPairingId = partner.id;
                agent.playedWith.add(partner.id);
                
                partner.isInPairing = true;
                partner.currentPairingId = agent.id;
                partner.playedWith.add(agent.id);
                
                // Check if this is a cross-boundary pairing
                const dx = partner.x - agent.x;
                const dy = partner.y - agent.y;
                const directDistance = Math.sqrt(dx * dx + dy * dy);
                
                // Calculate positions relative to center
                const r1 = Math.sqrt(agent.x * agent.x + agent.y * agent.y);
                const r2 = Math.sqrt(partner.x * partner.x + partner.y * partner.y);
                
                // Calculate angles
                const theta1 = Math.atan2(agent.y, agent.x);
                const theta2 = Math.atan2(partner.y, partner.x);
                
                // Calculate angular difference
                let dTheta = Math.abs(theta1 - theta2);
                if (dTheta > Math.PI) dTheta = 2 * Math.PI - dTheta;
                
                // If both agents are near the edge and on opposite sides
                if (r1 > this.areaRadius * 0.75 && r2 > this.areaRadius * 0.75 && dTheta > Math.PI * 0.75) {
                    agent.crossBoundaryWith = partner.id;
                    partner.crossBoundaryWith = agent.id;
                }
                
                // Move agents slightly toward each other to initiate pairing
                const moveStrength = 0.5;
                const distance = directDistance || 1; // Avoid division by zero
                
                agent.vx += (dx / distance) * moveStrength;
                agent.vy += (dy / distance) * moveStrength;
                partner.vx -= (dx / distance) * moveStrength;
                partner.vy -= (dy / distance) * moveStrength;
            }
        }
        
        // Apply a gentle attraction force to bring paired agents together
        this.forceSimulation.alpha(0.3).restart();
    }
    
    /**
     * Shuffle an array in place using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    /**
     * Update the agent pool visualization
     */
    updateAgentPool() {
        if (!this.simulation || !this.simulation.agents || !this.agentData) return;
        
        // Update agent data with current scores
        this.simulation.agents.forEach(agent => {
            const agentData = this.agentData.find(d => d && d.id === agent.id);
            if (agentData) {
                agentData.score = agent.score;
            }
        });
        
        // Find max score for scaling
        const maxScore = Math.max(1, d3.max(this.agentData, d => d.score));
        
        // Scale for agent size based on score
        const sizeScale = d3.scaleSqrt()
            .domain([0, maxScore])
            .range([3, 12]);  // Slightly larger dots for better visibility
        
        // Update agent circles
        this.agentNodes
            .data(this.agentData, d => d.id)
            .transition()
            .duration(200)
            .attr('r', d => {
                const radius = sizeScale(d.score);
                d.radius = radius;  // Update radius in data for collision detection
                return radius;
            })
            .attr('stroke', d => d.isInPairing ? '#fff' : 'none')
            .attr('stroke-width', d => d.isInPairing ? 1.5 : 0);
            
        // Update force simulation with new radii
        this.forceSimulation.force('collision', d3.forceCollide().radius(d => d.radius * 1.2).strength(0.5));
        
        // Gently restart the simulation
        this.forceSimulation.alpha(0.05).restart();
    }
    
    /**
     * Update the histogram visualization
     * @param {Object} scoreDistributions - Score distributions for each strategy
     * @param {Object} strategyStats - Statistics for each strategy
     */
    updateHistogram(scoreDistributions, strategyStats) {
        if (!scoreDistributions) return;
        
        // Get the strategies
        const strategies = Object.keys(scoreDistributions);
        if (strategies.length !== 2) return;
        
        // Use the current bin width
        const binWidth = this.binWidth;
        
        // Create histogram bins
        const strategyBins = {};
        
        // Track total scores for each strategy
        const totalScores = {};
        
        // Initialize bins for each strategy
        strategies.forEach(strategyId => {
            strategyBins[strategyId] = [];
            totalScores[strategyId] = 0;
            
            // Create bins from min to max score with the current bin width
            for (let score = this.minScore; score <= this.maxScore; score += binWidth) {
                strategyBins[strategyId].push({
                    score: score,
                    count: 0
                });
            }
            
            // Fill bins with actual data
            Object.entries(scoreDistributions[strategyId]).forEach(([score, count]) => {
                const numScore = Number(score);
                
                // Only include scores within our range
                if (numScore >= this.minScore && numScore <= this.maxScore) {
                    const binIndex = Math.floor((numScore - this.minScore) / binWidth);
                    if (binIndex >= 0 && binIndex < strategyBins[strategyId].length) {
                        strategyBins[strategyId][binIndex].count += count;
                    }
                    
                    // Add to total score
                    totalScores[strategyId] += numScore * count;
                }
            });
        });
        
        // Update total score displays
        if (strategies.length === 2) {
            const strategy1 = strategies[0];
            const strategy2 = strategies[1];
            
            this.leftTotalScore
                .text(`Total: ${totalScores[strategy1].toLocaleString()}`)
                .style('fill', this.colorScale(strategiesModule.strategies[strategy1].name));
                
            this.rightTotalScore
                .text(`Total: ${totalScores[strategy2].toLocaleString()}`)
                .style('fill', this.colorScale(strategiesModule.strategies[strategy2].name));
        }
        
        // Update x-axis positions
        const xAxisYPos = this.histogramYScale(Math.max(0, this.minScore));
        
        this.xAxisLeft
            .attr('transform', `translate(0, ${xAxisYPos})`)
            .call(d3.axisBottom(this.histogramXScaleLeft).ticks(3));
            
        this.xAxisRight
            .attr('transform', `translate(0, ${xAxisYPos})`)
            .call(d3.axisBottom(this.histogramXScaleRight).ticks(3));
        
        // Clear existing histogram elements
        this.histogramGroup.selectAll('.histogram-bar').remove();
        
        // Create bars for each strategy
        strategies.forEach((strategyId, index) => {
            const bins = strategyBins[strategyId];
            const isFirstStrategy = index === 0;
            
            // Filter bins to only include bins with counts
            const visibleBins = bins.filter(bin => bin.count > 0);
            
            // Create bars
            this.histogramGroup.selectAll(`.histogram-bar-${index}`)
                .data(visibleBins)
                .enter()
                .append('rect')
                .attr('class', 'histogram-bar')
                .attr('x', d => {
                    // Position bars directly against the center line
                    if (isFirstStrategy) {
                        // For left side, x is the negative value from the scale
                        return this.histogramXScaleLeft(d.count);
                    } else {
                        // For right side, x is 0 (center line)
                        return 0;
                    }
                })
                .attr('y', d => this.histogramYScale(d.score + binWidth))
                .attr('width', d => {
                    // Calculate width as the absolute distance from the center
                    if (isFirstStrategy) {
                        return Math.abs(this.histogramXScaleLeft(d.count));
                    } else {
                        return this.histogramXScaleRight(d.count);
                    }
                })
                .attr('height', d => Math.abs(this.histogramYScale(d.score) - this.histogramYScale(d.score + binWidth)) - 1)
                .attr('fill', d => this.colorScale(strategiesModule.strategies[strategyId].name))
                .attr('opacity', 0.8);
        });
    }
    
    /**
     * Update the statistics display
     * @param {Object} stats - Simulation statistics
     */
    updateStats(stats) {
        // Get the stats container
        const statsContainer = d3.select('#stats-container');
        
        // Clear existing content
        statsContainer.html('');
        
        // Add simulation progress
        statsContainer.append('div')
            .attr('class', 'stat-item')
            .html(`<strong>Progress:</strong> ${stats.gamesPlayed} / ${stats.totalGames} games (${Math.round(stats.progress)}%)`);
            
        // Add strategy statistics
        const scoresDiv = statsContainer.append('div')
            .attr('class', 'stat-item strategy-scores');
            
        scoresDiv.append('div')
            .html('<strong>Strategy Statistics:</strong>');
            
        const scoresList = scoresDiv.append('ul');
        
        // Sort strategies by average score (highest first)
        const sortedStats = Object.entries(stats.strategyStats)
            .map(([strategyId, stratStats]) => ({
                strategyId,
                name: strategiesModule.strategies[strategyId].name,
                stats: stratStats
            }))
            .sort((a, b) => b.stats.averageScore - a.stats.averageScore);
            
        sortedStats.forEach(strategy => {
            const stats = strategy.stats;
            scoresList.append('li')
                .style('color', this.colorScale(strategy.name))
                .html(`${strategy.name}: ${stats.count} agents, Avg: ${stats.averageScore.toFixed(2)} points, Min: ${stats.minScore}, Max: ${stats.maxScore}`);
        });
        
        // Add simulation status
        if (stats.isComplete) {
            statsContainer.append('div')
                .attr('class', 'stat-item simulation-complete')
                .html('<strong>Simulation Complete!</strong>');
                
            // Show the winner
            if (sortedStats.length > 0) {
                const winner = sortedStats[0];
                
                statsContainer.append('div')
                    .attr('class', 'stat-item simulation-winner')
                    .style('color', this.colorScale(winner.name))
                    .html(`<strong>Winner:</strong> ${winner.name} (${winner.stats.averageScore.toFixed(2)} points average)`);
            }
        }
    }
}

// Create a global visualizationModule object
window.visualizationModule = {
    SimulationVisualizer
}; 