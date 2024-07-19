const ROWS = 150
const COLS = 150

const CELL_DEAD = 0
const CELL_FALLING = 1
const CELL_STABLE = 2

const COLOURS = [
    '#EC058E',
    '#62BBC1',
    '#FFFBFC',
    '#30332E',
    '#EAF27C'
]

let selectedColour = '#EC058E'

colourPicker()

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

function colourPicker() {
    const target = document.querySelector('#colourPicker')

    COLOURS.forEach(colour => {
        target.innerHTML += `<button class="colour" style="background-color: ${colour}" data-colour="${colour}"></button>`
    })

    const colourPickers = document.querySelectorAll('.colour')

    colourPickers.forEach(colour => {
        colour.addEventListener('click', e => selectedColour = e.target.dataset.colour)
    })
}

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
    grid[y][x].status = CELL_FALLING
    grid[y][x].colour = selectedColour

    clickInterval = setInterval(() => {
        grid[mouseY][mouseX].status = 1
        grid[mouseY][mouseX].colour = selectedColour
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

    const gridClone = grid.map(row => row.map(cell => ({ ...cell })));

    if (FRAME_COUNTER) {
        frame++
    }

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cellIsFalling = grid[y][x].status === CELL_FALLING

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
        gridClone[y][x].status = CELL_STABLE
        return
    }

    const cellUnderIsDead = grid[y + 1][x].status === CELL_DEAD
    const cellUnderIsFalling = grid[y + 1][x].status === CELL_FALLING
    const cellUnderIsStable = grid[y + 1][x].status === CELL_STABLE

    if (cellUnderIsDead) {
        moveCellDown(y, x, gridClone)
    } else if (cellUnderIsFalling) {
        gridClone[y][x].status = CELL_FALLING
    } else if (cellUnderIsStable) {
        gridClone[y][x].status = CELL_STABLE
        if (canMoveDiagonally(y, x, grid)) {
            moveCellDiagonally(y, x, grid, gridClone)
        }
    }
}

function moveCellDown(y, x, gridClone) {
    gridClone[y + 1][x].status = CELL_FALLING
    gridClone[y + 1][x].colour = gridClone[y][x].colour
    gridClone[y][x].status = CELL_DEAD
    gridClone[y][x].colour = '#000000'
}

function canMoveDiagonally(y, x, grid) {
    const diagonalLeftIsDead = x > 0 && grid[y + 1][x - 1].status === CELL_DEAD
    const diagonalRightIsDead = x < COLS - 1 && grid[y + 1][x + 1].status === CELL_DEAD
    return diagonalLeftIsDead || diagonalRightIsDead
}

function moveCellDiagonally(y, x, grid, gridClone) {
    const diagonalLeftIsDead = x > 0 && grid[y + 1][x - 1].status === CELL_DEAD
    const diagonalRightIsDead = x < COLS - 1 && grid[y + 1][x + 1].status === CELL_DEAD

    if (diagonalLeftIsDead && diagonalRightIsDead) {
        const randomSide = Math.random() < 0.5 ? -1 : 1
        gridClone[y + 1][x + randomSide].status = CELL_FALLING
        gridClone[y + 1][x + randomSide].colour = gridClone[y][x].colour
    } else if (diagonalLeftIsDead) {
        gridClone[y + 1][x - 1].status = CELL_FALLING
        gridClone[y + 1][x - 1].colour = gridClone[y][x].colour
    } else if (diagonalRightIsDead) {
        gridClone[y + 1][x + 1].status = CELL_FALLING
        gridClone[y + 1][x + 1].colour = gridClone[y][x].colour
    }

    gridClone[y][x].status = CELL_DEAD
    gridClone[y][x].colour = '#000000'
}

function renderCanvas(ctx, grid) {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = grid[y][x]
            ctx.fillStyle = cell.colour
            ctx.fillRect(x, y, 1, 1)
        }
    }
}

function generateInitialGrid() {
    const grid = [];
    for (let i = 0; i < ROWS; i++) {
        const row = [];
        for (let j = 0; j < COLS; j++) {
            row.push({ status: CELL_DEAD, colour: '#000000' });
        }
        grid.push(row);
    }
    return grid;
}