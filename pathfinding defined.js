const rows = 10;
const cols = 10;
const cellSize = 40;
const waitSecondsSearch = 100;
const waitSecondsPath = 200;
const start = { x: 0, y: 0 };
let searchInProgress = false;
let goal = { x: cols - 1, y: rows - 1 };  //goal is now a variable to be randomized
let grid = [];

//initialize canvases
const aStarCanvas = document.getElementById("aStarCanvas");
const dijkstraCanvas = document.getElementById("dijkstraCanvas");
const aStarCtx = aStarCanvas.getContext("2d");
const dijkstraCtx = dijkstraCanvas.getContext("2d");

//set behavior of grid
function initializeGrid() {
    grid = [];
    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
            row.push({ wall: Math.random() < 0.2, x, y });
        }
        grid.push(row);
    }

    //randomize the goal location (not start or wall)
    let goalPlaced = false;
    while (!goalPlaced) {
        const randomX = Math.floor(Math.random() * cols);
        const randomY = Math.floor(Math.random() * rows);
        if ((randomX !== start.x || randomY !== start.y) && !grid[randomY][randomX].wall) {
            goal = { x: randomX, y: randomY };
            goalPlaced = true;
        }
    }

    //start and goal positions
    grid[start.y][start.x].wall = false;
    grid[goal.y][goal.x].wall = false;
    drawGrid();
}

//visuals of grid
function drawGrid() {
    aStarCtx.clearRect(0, 0, aStarCanvas.width, aStarCanvas.height);
    dijkstraCtx.clearRect(0, 0, dijkstraCanvas.width, dijkstraCanvas.height);

    for (const row of grid) {
        for (const cell of row) {
            if (cell.wall) {
                aStarCtx.fillStyle = dijkstraCtx.fillStyle = "darkgray";
            } else if (cell.x === start.x && cell.y === start.y) {
                aStarCtx.fillStyle = dijkstraCtx.fillStyle = "lightblue";
            } else if (cell.x === goal.x && cell.y === goal.y) {
                aStarCtx.fillStyle = dijkstraCtx.fillStyle = "lightgreen";
            } else {
                aStarCtx.fillStyle = dijkstraCtx.fillStyle = "white";
            }
            
            //cell background
            aStarCtx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
            dijkstraCtx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);

                //grey outline on cells
            aStarCtx.strokeStyle = dijkstraCtx.strokeStyle = "gray";
            aStarCtx.strokeRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
            dijkstraCtx.strokeRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
        }
    }
}


//clicking cells to toggle behavior (if wall or not)
function handleCanvasClick(event, ctx) {
    if (searchInProgress) return;  //prevent toggling when searching
    const rect = ctx.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    //prevent toggling the start or goal cells
    if ((x === start.x && y === start.y) || (x === goal.x && y === goal.y)) return;

    //toggle the wall property and redraw the grid
    grid[y][x].wall = !grid[y][x].wall;
    drawGrid();
}

//click event listeners
aStarCanvas.addEventListener('click', (event) => handleCanvasClick(event, aStarCtx));
dijkstraCanvas.addEventListener('click', (event) => handleCanvasClick(event, dijkstraCtx));

let draggingGoal = false;
function handleCanvasMouseDown(event, ctx) {
    if (searchInProgress) return; //disable dragging while searching

    const rect = ctx.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    //if the clicked cell is a goal
    if (x === goal.x && y === goal.y) {
        draggingGoal = true;
    }
}

function handleCanvasMouseMove(event, ctx) {
    if (!draggingGoal || searchInProgress) return; //disable dragging while searching

    const rect = ctx.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    //if the new cell is within bounds and not a wall/start cell
    if (x >= 0 && x < cols && y >= 0 && y < rows && !grid[y][x].wall && (x !== start.x || y !== start.y)) {
        goal = { x, y };
        drawGrid();
    }
}

function handleCanvasMouseUp() {
    draggingGoal = false;
}


//mouse event listeners to enable dragging
aStarCanvas.addEventListener('mousedown', (event) => handleCanvasMouseDown(event, aStarCtx));
aStarCanvas.addEventListener('mousemove', (event) => handleCanvasMouseMove(event, aStarCtx));
aStarCanvas.addEventListener('mouseup', handleCanvasMouseUp);
dijkstraCanvas.addEventListener('mousedown', (event) => handleCanvasMouseDown(event, dijkstraCtx));
dijkstraCanvas.addEventListener('mousemove', (event) => handleCanvasMouseMove(event, dijkstraCtx));
dijkstraCanvas.addEventListener('mouseup', handleCanvasMouseUp);


async function runAlgorithms() {
    //disabling button with warning
    document.getElementById("runButton").disabled = true;
    document.getElementById("warning").style.display = "block";
    document.getElementById("stopButton").style.display = "inline-block"; // Show the stop button
    searchInProgress = true;

    await Promise.all([animateAStar(), animateDijkstra()]);
}

function stopSearching() {
    if (searchInProgress) {
        //stop searching and reset grid
        searchInProgress = false;
        document.getElementById("runButton").disabled = false;
        document.getElementById("warning").style.display = "none";
        document.getElementById("stopButton").style.display = "none";	

        //clear grid
        aStarCtx.clearRect(0, 0, aStarCanvas.width, aStarCanvas.height);
        dijkstraCtx.clearRect(0, 0, dijkstraCanvas.width, dijkstraCanvas.height);
            
        drawGrid();
    }
}

//functionality of A* algorithm
async function animateAStar() {
    const openSet = [start];
    const cameFrom = {};
    const gScore = Array(rows).fill().map(() => Array(cols).fill(Infinity));
    gScore[start.y][start.x] = 0;
    const fScore = Array(rows).fill().map(() => Array(cols).fill(Infinity));
    fScore[start.y][start.x] = heuristic(start, goal);

    //searchInProgress for debugging
    while (openSet.length > 0 && searchInProgress) {
        openSet.sort((a, b) => fScore[a.y][a.x] - fScore[b.y][b.x]);
        const current = openSet.shift();

        if (current.x === goal.x && current.y === goal.y) {
            await drawPathWithHead(cameFrom, current, aStarCtx, "yellow", "orange");
            return;
        }

        //explored cells
        aStarCtx.fillStyle = "lightyellow";
        aStarCtx.fillRect(current.x * cellSize, current.y * cellSize, cellSize, cellSize);
        await sleep(waitSecondsSearch); //speed of searching

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
}

//functionality of Dijkstra's algorithm
async function animateDijkstra() {
    const openSet = [start];
    const cameFrom = {};
    const dist = Array(rows).fill().map(() => Array(cols).fill(Infinity));
    dist[start.y][start.x] = 0;

    //searchInProgress for debugging
    while (openSet.length > 0 && searchInProgress) {
        openSet.sort((a, b) => dist[a.y][a.x] - dist[b.y][b.x]);
        const current = openSet.shift();

        if (current.x === goal.x && current.y === goal.y) {
            await drawPathWithHead(cameFrom, current, dijkstraCtx, "orange", "red");
            return;
        }

        //explored cells
        dijkstraCtx.fillStyle = "lightcoral";
        dijkstraCtx.fillRect(current.x * cellSize, current.y * cellSize, cellSize, cellSize);
        await sleep(waitSecondsSearch); //speed of searching

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
}

//functionality of object moving
async function drawPathWithHead(cameFrom, current, ctx, lineColor, headColor) {
    const path = [];
    while (cameFrom[`${current.x},${current.y}`]) {
        path.push(current);
        current = cameFrom[`${current.x},${current.y}`];
    }
    path.reverse();

    for (let i = 0; i < path.length; i++) {
        const cell = path[i];
        
        //clear previous head (if any)
        if (i > 0) {
            ctx.fillStyle = lineColor;
            const prevCell = path[i - 1];
            ctx.fillRect(prevCell.x * cellSize, prevCell.y * cellSize, cellSize, cellSize);
        }

        //path cell
        ctx.fillStyle = lineColor;
        ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
        
        //head circle
        ctx.beginPath();
        ctx.arc(
            cell.x * cellSize + cellSize / 2,
            cell.y * cellSize + cellSize / 2,
            cellSize / 2.5,
            0,
            2 * Math.PI
        );
        ctx.fillStyle = headColor;
        ctx.fill();
        
        await sleep(waitSecondsPath); //speed of object moving on the grid

        if (!searchInProgress) {
            return; //terminate object if search is no longer in progress
        }
    }
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

initializeGrid();