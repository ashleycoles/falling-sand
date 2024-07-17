const ROWS = 200
const COLS = 200
const FRAME_COUNTER = false

const canvas = document.querySelector('canvas')
const canvasRect = canvas.getBoundingClientRect()
const ctx = canvas.getContext('2d')

let grid = generateStartingGrid()


let clickInterval
let mousex
let mousey

canvas.addEventListener("mousemove", e => {
    mousex = e.clientX - canvasRect.left
    mousey = e.clientY - canvasRect.top
})

canvas.addEventListener('mousedown', e => {
    const x = e.clientX - canvasRect.left
    const y = e.clientY - canvasRect.top
    grid[y][x] = 1

    clickInterval = setInterval(() => {
       grid[mousey][mousex] = 1
    }, 10)

})

canvas.addEventListener('mouseup', e => {
    clearInterval(clickInterval)
})

renderCanvas(ctx, grid)

requestAnimationFrame(nextGeneration)

let frame = 1

function nextGeneration() {
    const gridClone = grid.map(row => row.slice())

    if (FRAME_COUNTER) {
        console.log(`Frame: ${frame}`)
        frame++
    }

    for (let y = 1; y < ROWS; y++) {
        for (let x = 1; x < COLS; x++) {
            const cell = grid[y][x]

            if (cell === 1) {
                const isAtBottom = y >= COLS - 1;

                if (isAtBottom) {
                    continue
                }

                const cellUnderIsDead = grid[y + 1][x] === 0;

                if (cellUnderIsDead) {
                    gridClone[y + 1][x] = 1
                    gridClone[y][x] = 0
                }
            }
        }
    }

    grid = gridClone

    renderCanvas(ctx, grid)
    requestAnimationFrame(nextGeneration)
}

function renderCanvas(ctx, grid) {
    for (let y = 1; y < ROWS; y++) {
        for (let x = 1; x < COLS; x++) {
            const cell = grid[y][x]

            if (cell === 1) {
                ctx.fillStyle = '#00ff00'
                ctx.fillRect(x, y, 1, 1)
            } else {
                ctx.fillStyle = '#000'
                ctx.fillRect(x, y, 1, 1)
            }
        }
    }
}

function generateStartingGrid() {
    const grid = [];
    for (let i = 0; i < ROWS; i++) {
        grid[i] = new Array(COLS).fill(0)
    }
    return grid
}
