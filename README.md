# Prisoner's Dilemma Tournament Visualization

A web-based visualization of the Prisoner's Dilemma tournament that runs entirely in the browser. This application allows users to select competing strategies and their proportions, then visualizes elimination-style tournaments until dominance or equilibrium is reached.

## Features

- Select two strategies from a predefined list (Always Cooperate, Always Defect, Tit-for-Tat, Random)
- Set the proportion of agents using each strategy within a population of 100
- Configure the number of games played per pairing
- Visualize the tournament progress with D3.js
- Track statistics and results in real-time

## How It Works

1. **Agent Creation**: The application creates a population of 100 agents distributed according to the selected strategy proportions.
2. **Tournament Rounds**: In each round, agents are randomly paired to play a series of Prisoner's Dilemma games.
3. **Elimination**: The loser of each pairing is eliminated from the tournament.
4. **Visualization**: The process is visualized using D3.js, showing agents, their interactions, and tournament statistics.
5. **Completion**: The tournament continues until one strategy dominates or an equilibrium is reached.

## Prisoner's Dilemma Payoffs

The classic Prisoner's Dilemma payoff matrix is used:

- Both cooperate: 3 points each (mutual cooperation)
- Both defect: 1 point each (mutual defection)
- One defects, one cooperates: Defector gets 5 points, cooperator gets 0 points

## Strategies

- **Always Cooperate**: Always cooperates regardless of what the opponent does.
- **Always Defect**: Always defects regardless of what the opponent does.
- **Tit for Tat**: Starts by cooperating, then mimics the opponent's previous move.
- **Random**: Randomly chooses to cooperate or defect.

## Technologies Used

- Vanilla JavaScript for simulation logic
- D3.js for visualizations
- HTML/CSS for the user interface

## How to Run

Simply open the `index.html` file in a modern web browser. No server or build process is required.

## Project Structure

- `index.html`: Main HTML file
- `css/styles.css`: Styling for the application
- `js/strategies.js`: Defines different Prisoner's Dilemma strategies
- `js/game.js`: Implements the core game mechanics
- `js/tournament.js`: Handles the tournament logic
- `js/visualization.js`: Manages the D3.js visualization
- `js/main.js`: Main application logic and initialization 