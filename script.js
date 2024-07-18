const ROWS = 150
const COLS = 150

const CELL_DEAD = 0
const CELL_FALLING = 1
const CELL_STABLE = 2

const canvas = document.querySelector('canvas')
const canvasRect = canvas.getBoundingClientRect()
const ctx = canvas.getContext('2d')

canvas.width = COLS
canvas.height = ROWS

const fpsButton = document.querySelector('#fpsButton')
const fpsDisplay = document.querySelector('div span')
let FRAME_COUNTER = false
let frame = 1
let lastTime = performance.now()

let grid = generateInitialGrid()
let clickInterval
let mouseX
let mouseY

fpsButton.addEventListener('click', toggleFrameCounter)
canvas.addEventListener("mousemove", updateMousePosition)
canvas.addEventListener('mousedown', startDrawing)
canvas.addEventListener('mouseup', stopDrawing)

requestAnimationFrame(nextGeneration)

function toggleFrameCounter() {
    FRAME_COUNTER = !FRAME_COUNTER
    document.querySelector('#fpsCounter').classList.toggle('hidden')
}

function updateMousePosition(e) {
    mouseX = Math.floor(e.clientX - canvasRect.left)
    mouseY = Math.floor(e.clientY - canvasRect.top)
}

function startDrawing(e) {
    const x = Math.floor(e.clientX - canvasRect.left)
    const y = Math.floor(e.clientY - canvasRect.top)
    grid[y][x] = 1

    clickInterval = setInterval(() => {
        grid[mouseY][mouseX] = 1
    }, 10)
}

function stopDrawing() {
    clearInterval(clickInterval)
}

function nextGeneration() {
    const currentTime = performance.now()
    const elapsedTime = currentTime - lastTime

    if (FRAME_COUNTER && elapsedTime >= 1000) {
        fpsDisplay.textContent = frame
        frame = 0
        lastTime = currentTime
    }

    const gridClone = grid.map(row => row.slice())

    if (FRAME_COUNTER) {
        frame++
    }

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cellIsFalling = grid[y][x] === CELL_FALLING

            if (cellIsFalling) {
                updateCell(y, x, grid, gridClone)
            }
        }
    }

    grid = gridClone

    renderCanvas(ctx, grid)
    requestAnimationFrame(nextGeneration)
}

function updateCell(y, x, grid, gridClone) {
    const cellIsAtBottom = y >= ROWS - 1

    if (cellIsAtBottom) {
        gridClone[y][x] = CELL_STABLE
        return
    }

    const cellUnderIsDead = grid[y + 1][x] === CELL_DEAD
    const cellUnderIsFalling = grid[y + 1][x] === CELL_FALLING
    const cellUnderIsStable = grid[y + 1][x] === CELL_STABLE

    if (cellUnderIsDead) {
        moveCellDown(y, x, gridClone)
    } else if (cellUnderIsFalling) {
        gridClone[y][x] = CELL_FALLING
    } else if (cellUnderIsStable) {
        gridClone[y][x] = CELL_STABLE
        if (canMoveDiagonally(y, x, grid)) {
            moveCellDiagonally(y, x, grid, gridClone)
        }
    }
}

function moveCellDown(y, x, gridClone) {
    gridClone[y + 1][x] = CELL_FALLING
    gridClone[y][x] = CELL_DEAD
}

function canMoveDiagonally(y, x, grid) {
    const diagonalLeftIsDead = x > 0 && grid[y + 1][x - 1] === CELL_DEAD
    const diagonalRightIsDead = x < COLS - 1 && grid[y + 1][x + 1] === CELL_DEAD
    return diagonalLeftIsDead || diagonalRightIsDead
}

function moveCellDiagonally(y, x, grid, gridClone) {
    const diagonalLeftIsDead = x > 0 && grid[y + 1][x - 1] === CELL_DEAD
    const diagonalRightIsDead = x < COLS - 1 && grid[y + 1][x + 1] === CELL_DEAD

    if (diagonalLeftIsDead && diagonalRightIsDead) {
        const randomSide = Math.random() < 0.5 ? -1 : 1
        gridClone[y + 1][x + randomSide] = CELL_FALLING
    } else if (diagonalLeftIsDead) {
        gridClone[y + 1][x - 1] = CELL_FALLING
    } else if (diagonalRightIsDead) {
        gridClone[y + 1][x + 1] = CELL_FALLING
    }

    gridClone[y][x] = CELL_DEAD
}

function renderCanvas(ctx, grid) {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = grid[y][x]

            if (cell === CELL_FALLING) {
                ctx.fillStyle = '#00ff00'
                ctx.fillRect(x, y, 1, 1)
            } else if (cell === CELL_STABLE) {
                ctx.fillStyle = '#007700'
                ctx.fillRect(x, y, 1, 1)
            } else {
                ctx.fillStyle = '#000'
                ctx.fillRect(x, y, 1, 1)
            }
        }
    }
}

function generateInitialGrid() {
    const grid = []
    for (let i = 0; i < ROWS; i++) {
        grid[i] = new Array(COLS).fill(CELL_DEAD)
    }
    return grid
}
