let dijkstraComplete = false;
let aStarComplete = false;
const SPRITE_WIDTH = 69, SPRITE_HEIGHT = 82, ANIMATION_FRAMES = 2;
hamsterPosition = { x: 0, y: 0 };
const SPRITE_MAP = {
    front: { transition: [0, 0], animation: [[0, 1], [0, 2]] },
    back: { transition: [0, 3], animation: [[0, 4], [0, 5]] },
    left: { transition: [1, 0], animation: [[1, 1], [1, 2]] },
    right: { transition: [1, 3], animation: [[1, 4], [1, 5]] }
};
const scaleFactor = Math.min(cellSize / SPRITE_HEIGHT, cellSize / SPRITE_WIDTH);
const scaledWidth = SPRITE_WIDTH * scaleFactor;
const scaledHeight = SPRITE_HEIGHT * scaleFactor;
const visitedCells = [];
const sparkleFrames = [];
const totalFrames = 8;
const fillColor = "rgba(255, 127, 80, 0.5)";
localStorage.setItem("hueValue", hueValue);


// initialize sparkle frames for the trail animation
for (let i = 0; i < totalFrames; i++) {
    const img = new Image();
    img.src = `assets/images/path_trails/sparkle${i}.gif`;
    sparkleFrames.push(img);
}
let sparkleFrameIndex = 0; 


document.addEventListener("DOMContentLoaded", function () {
    
    // retrieve the selected hamster from localStorage
    const selectedHamster = localStorage.getItem("selectedHamster");

    // set the background image based on the selected hamster
    const assets = hamsterAssets[selectedHamster] || hamsterAssets.null;

    // apply background change (change the body background image)
    document.body.style.backgroundImage = `${assets.background}, ${assets.background}`;

    localStorage.setItem("hueValue", hueValue);

    // apply the background music
    console.log("Background image set to:", assets.background);
    const audioElement = document.createElement("audio");
    audioElement.setAttribute("autoplay", "autoplay");
    audioElement.setAttribute("loop", "loop"); 
    const sourceElement = document.createElement("source");
    sourceElement.src = assets.music;
    sourceElement.type = "audio/mpeg";
    audioElement.volume = 0.3;
    // append the source to the audio element
    audioElement.appendChild(sourceElement);
    // append the audio element to the body
    document.body.appendChild(audioElement);
});

// update the pathfinding logo according to the hamster from the selectedHamster.js
const pathfindLogo = document.getElementById('pathfindLogo');
const imagePaths = window.pathfindImages || ["assets/images/pathfinding_logos/pathfinding_hamu_1.png", "assets/images/pathfinding_logos/pathfinding_hamu_2.png"];

// animate the pathfinding logo
let currentImageIndex = 0;
function toggleHamsterImage() {
    currentImageIndex = 1 - currentImageIndex; // switch between 0 and 1
    pathfindLogo.src = imagePaths[currentImageIndex]; // update the image source
}
setInterval(toggleHamsterImage, 500);

// update the UI according to the selected hamster from selectedHamster.js
const hamsterTheme = window.hamsterTheme || {};
function updateThemeVariables() {
    const root = document.documentElement;
    root.style.setProperty('--outline', hamsterTheme.outline);
    root.style.setProperty('--shadow', hamsterTheme.shadow);
    root.style.setProperty('--gradient', hamsterTheme.gradient);
    root.style.setProperty('--hover-gradient', hamsterTheme.hoverGradient);
    root.style.setProperty('--hover-outline', hamsterTheme.hoverOutline);
}
updateThemeVariables();

// update the warning / hamster pathfinding state
function updateWarningMessage(customMessage = "") {
    const warningElement = document.getElementById("warning");
    console.log("Updating warning message...");

    if (customMessage) {
        warningElement.textContent = customMessage;
    } 
    else if (aStarComplete && dijkstraComplete) {
        warningElement.textContent = "Hamu goal is reached!! Yahoo-hamu!";
    } else if (aStarComplete) {
        warningElement.textContent = "A* hamster reaches its goal! Dijkstra hamster's pursuit is ongoing!";
    } else if (dijkstraComplete) {
        warningElement.textContent = "Dijkstra hamster reaches its goal! A* hamster's pursuit is ongoing!";
    } else {
        warningElement.textContent = "Both hamsters are still on their journey!";
    }
}

// animate path
async function drawPathWithHead(cameFrom, current, ctx) {
    const path = getPath(cameFrom, current); // helper function to get the path
    const scaleFactor = Math.min(cellSize / SPRITE_HEIGHT, cellSize / SPRITE_WIDTH); 
    const scaledWidth = SPRITE_WIDTH * scaleFactor;
    const scaledHeight = SPRITE_HEIGHT * scaleFactor;
    let frameIndex = 0; 

    for (let i = 0; i < path.length; i++) {
        const cell = path[i];

        // handle cell drawing
        await handleCellDrawing(cell, i, path, scaledWidth, scaledHeight, frameIndex, ctx);

        // update frame index for animation
        if (i > 0) frameIndex = (frameIndex + 1) % ANIMATION_FRAMES;

        // wait for the animation to complete
        await sleep(waitSecondsPath);

        if (!searchInProgress) {
            return; // terminate if the search is no longer in progress
        }
    }

    // handle the final goal state
    handleGoalState(ctx, scaledWidth, scaledHeight);
}

// helper function to get the path from 'cameFrom' and 'current'
function getPath(cameFrom, current) {
    const path = [];
    while (cameFrom[`${current.x},${current.y}`]) {
        path.push(current);
        current = cameFrom[`${current.x},${current.y}`];
    }
    return path.reverse();
}

// to mark the sparkle trails on the cells the hamster has previously passed
function updateVisitedCells(cell) {
    if (!visitedCells.some(c => c.x === cell.x && c.y === cell.y)) {
        visitedCells.push(cell);
    }
}

// helper function to handle the drawing of each cell in the path
async function handleCellDrawing(cell, index, path, scaledWidth, scaledHeight, frameIndex, ctx) {
    const spriteWidth = 40;
    const spriteHeight = 40;
    const grassSx = spriteWidth; 
    const grassSy = spriteHeight;

    if (!visitedCells.some(c => c.x === cell.x && c.y === cell.y)) {
        visitedCells.push(cell);
    }

    // clear the entire cell and redraw the background (grass)
    ctx.clearRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
    ctx.drawImage(
        spriteSheet,
        grassSx,
        grassSy,
        spriteWidth,
        spriteHeight,
        cell.x * cellSize,
        cell.y * cellSize,
        cellSize,
        cellSize
    );

      // update visited cells (exclude the current cell)
      if (index > 0) {
        updateVisitedCells(path[index - 1]); // add the previous cell to visitedCells
    }

    // determine the direction of movement
    const direction = getMovementDirection(path, index, cell);

    // choose the appropriate sprite frame
    const spriteFrame = getSpriteFrame(direction, index, frameIndex);

    startSparkleAnimation(aStarCtx);
    startSparkleAnimation(dijkstraCtx);
    // draw the hamster sprite at the current path position
    drawHamsterSprite(cell, spriteFrame, scaledWidth, scaledHeight, ctx);

    // clear the previous cell after moving (except for the first frame)
    if (index > 0) {
        const prevCell = path[index - 1];
        clearAndRedrawCell(prevCell, ctx, spriteWidth, spriteHeight, grassSx, grassSy);
    }

}

function drawSparkles(ctx, algorithm) {
    if ((algorithm === "A*" && !aStarComplete) || (algorithm === "Dijkstra" && !dijkstraComplete)) {
        ctx.save();

        ctx.filter = `hue-rotate(${hueValue}deg)`;

        for (const cell of visitedCells) {
            if (cell.x !== goal.x || cell.y !== goal.y) {
                const sparkleImage = sparkleFrames[sparkleFrameIndex];
                if (sparkleImage.complete) {
                    ctx.drawImage(
                        sparkleImage,
                        cell.x * cellSize, // X position
                        cell.y * cellSize, // Y position
                        cellSize,          // Width
                        cellSize           // Height
                    );
                }
            }
        }
        //restore the canvas state
        ctx.restore();
    }
}

// handles sparkle animation
function startSparkleAnimation(ctx) {
    setInterval(() => {
        // update the sparkle frame index
        sparkleFrameIndex = (sparkleFrameIndex + 1) % totalFrames; // Loop through frames
        
        // redraw sparkles with the updated frame
        drawSparkles(ctx);
    }, 360); // 0.16 seconds per frame (adjust as needed)
}

// helper function to get the movement direction of the hamster
function getMovementDirection(path, index, cell) {
    if (index === 0) return "front";  // default to "front"
    const prevCell = path[index - 1];
    if (cell.x > prevCell.x) return "right";
    if (cell.x < prevCell.x) return "left";
    if (cell.y > prevCell.y) return "front";
    return "back";  // default to "back"
}

// helper function to get the appropriate sprite frame for the animation
function getSpriteFrame(direction, index, frameIndex) {
    const spriteFrames = SPRITE_MAP[direction];
    return index === 0 ? spriteFrames.transition : spriteFrames.animation[frameIndex];
}

// helper function to draw the hamster sprite
function drawHamsterSprite(cell, spriteFrame, scaledWidth, scaledHeight, ctx) {
    ctx.drawImage(
        hamsterSpriteSheet,
        spriteFrame[1] * SPRITE_WIDTH,
        spriteFrame[0] * SPRITE_HEIGHT,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        cell.x * cellSize + (cellSize - scaledWidth) / 2,
        cell.y * cellSize + (cellSize - scaledHeight) / 2,
        scaledWidth,
        scaledHeight
    );
}

// helper function to clear and redraw the previous cell
function clearAndRedrawCell(cell, ctx, spriteWidth, spriteHeight, grassSx, grassSy) {
    ctx.clearRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
    ctx.drawImage(
        spriteSheet,
        grassSx,
        grassSy,
        spriteWidth,
        spriteHeight,
        cell.x * cellSize,
        cell.y * cellSize,
        cellSize,
        cellSize
    );
}

// helper function to handle the final goal state
function handleGoalState(ctx, scaledWidth, scaledHeight) {
    // check which context (A* or Dijkstra) triggered the completion
    if (ctx === aStarCtx) {
        aStarComplete = true;
        stopSeedAnimation();
        seedVisible = false;
        updateWarningMessage(); // notify that A* has completed
    } else if (ctx === dijkstraCtx) {
        dijkstraComplete = true;
        stopSeedAnimation();
        seedVisible = false;
        updateWarningMessage(); // notify that Dijkstra has completed
    }

    // only update the goal and hamster if that particular algorithm has completed
    if (ctx === aStarCtx && aStarComplete) {
        // A* has completed, update the goal and hamster for A*
        ctx.clearRect(goal.x * cellSize, goal.y * cellSize, cellSize, cellSize);
        ctx.drawImage(
            spriteSheet,
            40, 40, 40, 40,
            goal.x * cellSize,
            goal.y * cellSize,
            cellSize,
            cellSize
        );
        ctx.drawImage(
            hamsterSpriteSheet,
            0, 0, SPRITE_WIDTH, SPRITE_HEIGHT,
            goal.x * cellSize + (cellSize - scaledWidth) / 2,
            goal.y * cellSize + (cellSize - scaledHeight) / 2,
            scaledWidth,
            scaledHeight
        );
    }

    if (ctx === dijkstraCtx && dijkstraComplete) {
        // dijkstra has completed, update the goal and hamster for dijkstra
        ctx.clearRect(goal.x * cellSize, goal.y * cellSize, cellSize, cellSize);
        ctx.drawImage(
            spriteSheet,
            40, 40, 40, 40,
            goal.x * cellSize,
            goal.y * cellSize,
            cellSize,
            cellSize
        );
        ctx.drawImage(
            hamsterSpriteSheet,
            0, 0, SPRITE_WIDTH, SPRITE_HEIGHT,
            goal.x * cellSize + (cellSize - scaledWidth) / 2,
            goal.y * cellSize + (cellSize - scaledHeight) / 2,
            scaledWidth,
            scaledHeight
        );
    }
}

// functionality of A* algorithm
async function animateAStar() {
    const openSet = [start];
    const cameFrom = {};
    const gScore = Array(rows).fill().map(() => Array(cols).fill(Infinity));
    gScore[start.y][start.x] = 0;
    const fScore = Array(rows).fill().map(() => Array(cols).fill(Infinity));
    fScore[start.y][start.x] = heuristic(start, goal);

    let goalReached = false;

    while (openSet.length > 0 && searchInProgress) {
        openSet.sort((a, b) => fScore[a.y][a.x] - fScore[b.y][b.x]);
        const current = openSet.shift();

        if (current.x === goal.x && current.y === goal.y) {
            goalReached = true;
            console.log("The goal is reached for A*");
            await drawPathWithHead(cameFrom, current, aStarCtx, "yellow", "orange");
            handleGoalState(aStarCtx, scaledWidth, scaledHeight); 
            return;
        }

        aStarCtx.fillStyle = fillColor;  // Explored cells
        aStarCtx.fillRect(current.x * cellSize, current.y * cellSize, cellSize, cellSize);
        await sleep(waitSecondsSearch);

        for (const neighbor of getNeighbors(current)) {
            const tentativeGScore = gScore[current.y][current.x] + 1;
            if (tentativeGScore < gScore[neighbor.y][neighbor.x]) {
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                gScore[neighbor.y][neighbor.x] = tentativeGScore;
                fScore[neighbor.y][neighbor.x] = tentativeGScore + heuristic(neighbor, goal);

                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    // check if goal was not reached after the loop ends
    if (!goalReached) {
        console.log("No path found for A*");
        
        updateWarningMessage("So sad-hamu! Goal can't be reached because of obstacles!");

    }
}

// functionality of Dijkstra's algorithm
async function animateDijkstra() {
    const openSet = [start];
    const cameFrom = {};
    const dist = Array(rows).fill().map(() => Array(cols).fill(Infinity));
    dist[start.y][start.x] = 0;

    let goalReached = false;

    while (openSet.length > 0 && searchInProgress) {
        openSet.sort((a, b) => dist[a.y][a.x] - dist[b.y][b.x]);
        const current = openSet.shift();

        if (current.x === goal.x && current.y === goal.y) {
            goalReached = true;
            console.log("The goal is reached for Dijkstra");
            await drawPathWithHead(cameFrom, current, dijkstraCtx, "orange", "red");
            handleGoalState(dijkstraCtx, scaledWidth, scaledHeight);
            return;
        }

        dijkstraCtx.fillStyle = fillColor;// Explored cells
        dijkstraCtx.fillRect(current.x * cellSize, current.y * cellSize, cellSize, cellSize);
        await sleep(waitSecondsSearch);

        for (const neighbor of getNeighbors(current)) {
            const newDist = dist[current.y][current.x] + 1;
            if (newDist < dist[neighbor.y][neighbor.x]) {
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                dist[neighbor.y][neighbor.x] = newDist;

                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    // if the goal wasn't reached after the loop finishes
    if (!goalReached) {
        console.log("No path found for Dijkstra");
        updateWarningMessage("So sad-hamu! Goal can't be reached because of obstacles!");
        console.log("Custom Message Received:", customMessage);

    }
}

// run algorithms with await Promise.all (it should wait for processes to start and finish)
async function runAlgorithms() {
    const generateButton = document.getElementById("generateButton");
    // disable buttons with warning
    document.getElementById("runButton").disabled = true;
    document.getElementById("warning").style.display = "block";
    document.getElementById("stopButton").style.display = "inline-block"; // Show the stop button
    searchInProgress = true;

    updateWarningMessage();

    if (generateButton) generateButton.disabled = true;

    await Promise.all([animateAStar(), animateDijkstra()]);
    updateWarningMessage();
    // after both algorithms complete, stop seed animation
    stopSeedAnimation();
    seedVisible = false;
}

function stopSearching() {
    if (searchInProgress) {
        // stop searching and reset grid
        searchInProgress = false;

        aStarComplete = false;
        dijkstraComplete = false;

        // enable buttons if they exist
        document.getElementById("runButton").disabled = false;
        
        const generateButton = document.getElementById("generateButton");
        if (generateButton) generateButton.disabled = false;

        document.getElementById("warning").style.display = "none";
        document.getElementById("stopButton").style.display = "none";	

        // clear the grid (but not the hamster or seed goal)
        aStarCtx.clearRect(0, 0, aStarCanvas.width, aStarCanvas.height);
        dijkstraCtx.clearRect(0, 0, dijkstraCanvas.width, dijkstraCanvas.height);
        
        // redraw grid
        drawGrid();
        seedVisible= true; 
        animateSeed();
        startSeedAnimation();

        // redraw hamster and seed goal (assuming these are global variables or you have access to their positions)
        if (hamsterPosition) {
            drawHamster(hamsterPosition, aStarCtx);  // draw on A* canvas
            drawHamster(hamsterPosition, dijkstraCtx); 
        }
        
        if (goal) {
            drawSeedGoal(goal); // redraw the static seed goal

            // delay animation restart slightly to ensure the grid is fully redrawn
            setTimeout(() => {
                animateSeed();
                startSeedAnimation();
            }, 50);
        }
        
        visitedCells.splice(0, visitedCells.length);  // Clear the array

        // clear the sparkle frames
        sparkleFrameIndex = 0;  // reset the sparkle frame index

        // redraw the sparkles (if needed, could be an empty state now)
        drawSparkles(aStarCtx);
        drawSparkles(dijkstraCtx); // clear all visited cells
        
        // clear the sparkle frames
    
        updateWarningMessage();
    }

    function drawHamster(position, ctx) {
        const scaleFactor = Math.min(cellSize / SPRITE_HEIGHT, cellSize / SPRITE_WIDTH); // scale to fit within cell
        const scaledWidth = SPRITE_WIDTH * scaleFactor;
        const scaledHeight = SPRITE_HEIGHT * scaleFactor;
    
        ctx.drawImage(
            hamsterSpriteSheet,
            0, 0, SPRITE_WIDTH, SPRITE_HEIGHT, // hamster's sprite location in sprite sheet
            position.x * cellSize + (cellSize - scaledWidth) / 2,
            position.y * cellSize + (cellSize - scaledHeight) / 2,
            scaledWidth,
            scaledHeight
        );
    }
    
    function drawSeedGoal(goal) {
        const goalX = goal.x * cellSize;
        const goalY = goal.y * cellSize;
    
        const spriteWidth = 40, spriteHeight = 40, grassSx = 40, grassSy = 40;
        const seedScaleFactor = Math.min(cellSize / 48, cellSize / 26);
        const scaledWidth = 26 * seedScaleFactor;
        const scaledHeight = 48 * seedScaleFactor;
    
        // clear the area where the seed will be drawn
        aStarCtx.clearRect(goalX, goalY, cellSize, cellSize);
        dijkstraCtx.clearRect(goalX, goalY, cellSize, cellSize);
    
        // redraw the background tile (e.g., grass)
        aStarCtx.drawImage(spriteSheet, grassSx, grassSy, spriteWidth, spriteHeight, goalX, goalY, cellSize, cellSize);
        dijkstraCtx.drawImage(spriteSheet, grassSx, grassSy, spriteWidth, spriteHeight, goalX, goalY, cellSize, cellSize);
    
        // draw the seed at the goal's position
        const seedImage = seedImages[seedIndex];
        aStarCtx.drawImage(seedImage, goalX + (cellSize - scaledWidth) / 2, goalY + (cellSize - scaledHeight) / 2, scaledWidth, scaledHeight);
        dijkstraCtx.drawImage(seedImage, goalX + (cellSize - scaledWidth) / 2, goalY + (cellSize - scaledHeight) / 2, scaledWidth, scaledHeight);
    
        animateSeed(); // directly trigger the animation
    }
    
}

