const rows = 10;
const cols = 10;
const cellSize = 40;
const waitSecondsSearch = 100;
const waitSecondsPath = 200;
const start = { x: 0, y: 0 };
let searchInProgress = false;
let goal = { x: cols - 1, y: rows - 1 };
let grid = [];
const seedImages = [];
let seedIndex = 0;


// for initializing the canvases
const aStarCanvas = document.getElementById("aStarCanvas");
const dijkstraCanvas = document.getElementById("dijkstraCanvas");
const aStarCtx = aStarCanvas.getContext("2d");
const dijkstraCtx = dijkstraCanvas.getContext("2d");

// seed animation logic
let seedVisible = true;
let seedAnimationInterval;

function loadSeedImages() {
    const seedFiles = ["assets/images/seed_animation/seed1.png", "assets/images/seed_animation/seed2.png", "assets/images/seed_animation/seed3.png"];
    seedImages.length = 0;
    for (let file of seedFiles) {
        const img = new Image();
        img.src = file;
        seedImages.push(img);
    }
}

function animateSeed() {
    if (!seedVisible) return;
    seedIndex = (seedIndex + 1) % seedImages.length;
    const seedImage = seedImages[seedIndex];
    const goalX = goal.x * cellSize;
    const goalY = goal.y * cellSize;

    const spriteWidth = 40, spriteHeight = 40, grassSx = 40, grassSy = 40;
    const seedScaleFactor = Math.min(cellSize / 48, cellSize / 26);
    const scaledWidth = 26 * seedScaleFactor;
    const scaledHeight = 48 * seedScaleFactor;

    aStarCtx.clearRect(goalX, goalY, cellSize, cellSize);
    dijkstraCtx.clearRect(goalX, goalY, cellSize, cellSize);

    aStarCtx.drawImage(spriteSheet, grassSx, grassSy, spriteWidth, spriteHeight, goalX, goalY, cellSize, cellSize);
    dijkstraCtx.drawImage(spriteSheet, grassSx, grassSy, spriteWidth, spriteHeight, goalX, goalY, cellSize, cellSize);

    aStarCtx.drawImage(seedImage, goalX + (cellSize - scaledWidth) / 2, goalY + (cellSize - scaledHeight) / 2, scaledWidth, scaledHeight);
    dijkstraCtx.drawImage(seedImage, goalX + (cellSize - scaledWidth) / 2, goalY + (cellSize - scaledHeight) / 2, scaledWidth, scaledHeight);
}

function startSeedAnimation() {
    loadSeedImages();
    seedVisible = true;
    seedAnimationInterval = setInterval(animateSeed, 300);
}

function stopSeedAnimation() {
    clearInterval(seedAnimationInterval);
    seedVisible = false;
}

// create grid
function initializeGrid() {
    grid = [];
    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
            row.push({ wall: Math.random() < 0.2, x, y });
        }
        grid.push(row);
    }

    let goalPlaced = false;
    while (!goalPlaced) {
        const randomX = Math.floor(Math.random() * cols);
        const randomY = Math.floor(Math.random() * rows);
        if ((randomX !== start.x || randomY !== start.y) && !grid[randomY][randomX].wall) {
            goal = { x: randomX, y: randomY };
            goalPlaced = true;
        }
    }

    grid[start.y][start.x].wall = false;
    grid[goal.y][goal.x].wall = false;
    drawGrid();

    const hamsterWidth = 69, hamsterHeight = 82;
    const scaleFactor = Math.min(cellSize / hamsterHeight, cellSize / hamsterWidth);
    const scaledWidth = hamsterWidth * scaleFactor;
    const scaledHeight = hamsterHeight * scaleFactor;

    aStarCtx.drawImage(hamsterImage, start.x * cellSize + (cellSize - scaledWidth) / 2, start.y * cellSize + (cellSize - scaledHeight) / 2, scaledWidth, scaledHeight);
    dijkstraCtx.drawImage(hamsterImage, start.x * cellSize + (cellSize - scaledWidth) / 2, start.y * cellSize + (cellSize - scaledHeight) / 2, scaledWidth, scaledHeight);

    seedVisible = true;
    startSeedAnimation();
}

// visuals of grid
function drawGrid() {
    aStarCtx.clearRect(0, 0, aStarCanvas.width, aStarCanvas.height);
    dijkstraCtx.clearRect(0, 0, dijkstraCanvas.width, dijkstraCanvas.height);

    const spriteWidth = 40;  // Each sprite in the sheet is 40x40
    const spriteHeight = 40;

    for (const row of grid) {
        for (const cell of row) {
            let sx, sy; // Source coordinates for the sprite

            if (cell.wall) {
                // Handle obstacles (right 3x3 of the sprite sheet)
                if (cell.x === 0 && cell.y === 0) {
                    // Top-left corner of obstacles
                    sx = 3 * spriteWidth;
                    sy = 0;
                } else if (cell.x === cols - 1 && cell.y === rows - 1) {
                    // Bottom-right corner of obstacles
                    sx = 5 * spriteWidth;
                    sy = 2 * spriteHeight;
                } else if (cell.x === 0) {
                    // Left edge (but not corners)
                    sx = 3 * spriteWidth;
                    sy = spriteHeight;
                } else if (cell.y === 0) {
                    // Top edge (but not corners)
                    sx = 4 * spriteWidth;
                    sy = 0;
                } else if (cell.x === cols - 1) {
                    // Right edge (but not corners)
                    sx = 5 * spriteWidth;
                    sy = spriteHeight;
                } else if (cell.y === rows - 1) {
                    // Bottom edge (but not corners)
                    sx = 4 * spriteWidth;
                    sy = 2 * spriteHeight;
                } else {
                    // Middle obstacle tile
                    sx = 4 * spriteWidth;
                    sy = spriteHeight;
                }
            } else {
                // Handle grass (left 3x3 of the sprite sheet)
                if (cell.x === 0 && cell.y === 0) {
                    // Top-left corner of grass
                    sx = 0;
                    sy = 0;
                } else if (cell.x === cols - 1 && cell.y === rows - 1) {
                    // Bottom-right corner of grass
                    sx = 2 * spriteWidth;
                    sy = 2 * spriteHeight;
                } else if (cell.x === 0) {
                    // Left edge (but not corners)
                    sx = 0;
                    sy = spriteHeight;
                } else if (cell.y === 0) {
                    // Top edge (but not corners)
                    sx = spriteWidth;
                    sy = 0;
                } else if (cell.x === cols - 1) {
                    // Right edge (but not corners)
                    sx = 2 * spriteWidth;
                    sy = spriteHeight;
                } else if (cell.y === rows - 1) {
                    // Bottom edge (but not corners)
                    sx = spriteWidth;
                    sy = 2 * spriteHeight;
                } else {
                    // Middle grass tile
                    sx = spriteWidth;
                    sy = spriteHeight;
                }
            }

            // draw the sprite on the grid
            aStarCtx.drawImage(spriteSheet, sx, sy, spriteWidth, spriteHeight, cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
            dijkstraCtx.drawImage(spriteSheet, sx, sy, spriteWidth, spriteHeight, cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);

             // draw the hamster if this is the start cell
             if (cell.x === start.x && cell.y === start.y) {
                const hamsterWidth = 69, hamsterHeight = 82;
                const scaleFactor = Math.min(cellSize / hamsterHeight, cellSize / hamsterWidth);
                const scaledWidth = hamsterWidth * scaleFactor;
                const scaledHeight = hamsterHeight * scaleFactor;

            aStarCtx.drawImage(hamsterImage, start.x * cellSize + (cellSize - scaledWidth) / 2, start.y * cellSize + (cellSize - scaledHeight) / 2, scaledWidth, scaledHeight);
            dijkstraCtx.drawImage(hamsterImage, start.x * cellSize + (cellSize - scaledWidth) / 2, start.y * cellSize + (cellSize - scaledHeight) / 2, scaledWidth, scaledHeight);
        }
    }
}
}
// clicking cells to toggle behavior (if wall or not)
function handleCanvasClick(event, ctx) {
    if (searchInProgress) return;  //prevent toggling when searching
    const rect = ctx.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    // prevent toggling the start or goal cells
    if ((x === start.x && y === start.y) || (x === goal.x && y === goal.y)) return;

    // toggle the wall property and redraw the grid
    grid[y][x].wall = !grid[y][x].wall;
    drawGrid();
}

// click event listeners
aStarCanvas.addEventListener('click', (event) => handleCanvasClick(event, aStarCtx));
dijkstraCanvas.addEventListener('click', (event) => handleCanvasClick(event, dijkstraCtx));

let draggingGoal = false;
function handleCanvasMouseDown(event, ctx) {
    if (searchInProgress) return; // disable dragging while searching

    const rect = ctx.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    // if the clicked cell is a goal
    if (x === goal.x && y === goal.y) {
        draggingGoal = true;
    }
}

function handleCanvasMouseMove(event, ctx) {
    if (!draggingGoal || searchInProgress) return; // disable dragging while searching

    const rect = ctx.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    // if the new cell is within bounds and not a wall/start cell
    if (x >= 0 && x < cols && y >= 0 && y < rows && !grid[y][x].wall && (x !== start.x || y !== start.y)) {
        goal = { x, y };
        drawGrid();
    }
}

function handleCanvasMouseUp() {
    draggingGoal = false;
}


// mouse event listeners to enable dragging
aStarCanvas.addEventListener('mousedown', (event) => handleCanvasMouseDown(event, aStarCtx));
aStarCanvas.addEventListener('mousemove', (event) => handleCanvasMouseMove(event, aStarCtx));
aStarCanvas.addEventListener('mouseup', handleCanvasMouseUp);
dijkstraCanvas.addEventListener('mousedown', (event) => handleCanvasMouseDown(event, dijkstraCtx));
dijkstraCanvas.addEventListener('mousemove', (event) => handleCanvasMouseMove(event, dijkstraCtx));
dijkstraCanvas.addEventListener('mouseup', handleCanvasMouseUp);


// utility functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors({ x, y }) {
    const neighbors = [];
    if (x > 0 && !grid[y][x - 1].wall) neighbors.push(grid[y][x - 1]);
    if (x < cols - 1 && !grid[y][x + 1].wall) neighbors.push(grid[y][x + 1]);
    if (y > 0 && !grid[y - 1][x].wall) neighbors.push(grid[y - 1][x]);
    if (y < rows - 1 && !grid[y + 1][x].wall) neighbors.push(grid[y + 1][x]);
    return neighbors;
}

function restartSeedAnimation() {
    if (!goal) return;

    // clear any existing animation frames to avoid multiple loops
    cancelAnimationFrame(seedAnimationFrameId);

    // restart the seed animation
    animateSeed();
}


window.onload = function() {
    initializeGrid();
};
