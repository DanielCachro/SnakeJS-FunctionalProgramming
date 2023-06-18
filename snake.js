const canvas = document.querySelector('#snake')
const ctx = canvas.getContext('2d')

const point = (x, y) => ({x, y})
const DIRECTIONS = {
	ArrowLeft: point(-1, 0),
	ArrowUp: point(0, -1),
	ArrowRight: point(1, 0),
	ArrowDown: point(0, 1),
}

const initialState = {
	grid: {width: 25, height: 25},
	snake: [point(5, 5)],
	snakeColor: '#074513',
	snakeRounding: 90,
	snakeLength: 6,
	fruit: point(10, 5),
	fruitRounding: 8,
	fruitColor: '#9e0817',
	move: DIRECTIONS.ArrowRight,
	gameSpeed: 75,
	maxSpeed: 35,
	speedDecrease: 3,
}

// Using R.clone to be sure of not modifying original object. Standard js assignment is by reference
let state = R.clone(initialState)

const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`

const setColor = (ctx, color) => {
	ctx.lineWidth = 6
	ctx.strokeStyle = '#111111'
	ctx.fillStyle = color
}

const setHeadRounding = ({x, y}, snakeRounding) => {
	switch (true) {
		case x == -1 && y == 0:
			return [snakeRounding, 0, 0, snakeRounding]
		case x == 0 && y == -1:
			return [snakeRounding, snakeRounding, 0, 0]
		case x == 1 && y == 0:
			return [0, snakeRounding, snakeRounding, 0]
		case x == 0 && y == 1:
			return [0, 0, snakeRounding, snakeRounding]
	}
}

const setSnakeRounding = (index, snake, move, snakeRounding) =>
	index + 1 === snake.length ? setHeadRounding(move, snakeRounding) : [0, 0, 0, 0]

const drawPoint = (ctx, {x, y}, {width, height}, rounding) => {
	ctx.beginPath()
	ctx.roundRect(x * width, y * width, width, height, rounding)
	ctx.stroke()
	ctx.fill()
}

const setDirection = direction => state => ({
	...state,
	move: DIRECTIONS[direction],
})
const collectedFruits = ({snakeLength}) => snakeLength - initialState.snakeLength
const calculateScore = ({gameSpeed}) => collectedFruits(state) * Math.floor((1 / gameSpeed) * 1000)
const setSpeed = ({gameSpeed, maxSpeed, speedDecrease}) => Math.max(gameSpeed - speedDecrease, maxSpeed)
const edge = (value, range) => (value < 0 ? range : value % range)
const random = range => Math.floor(Math.random() * range)
const setTail = ({snake, snakeLength}) =>
	R.drop(Math.abs(snake.length > snakeLength ? snake.length - snakeLength : 0), snake)

const draw = (ctx, canvas, {fruitColor, snakeColor, fruitRounding, snakeRounding, fruit, snake, grid, move}) => {
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	setColor(ctx, fruitColor)
	drawPoint(ctx, fruit, grid, fruitRounding)

	setColor(ctx, snakeColor)
	snake.forEach((point, index) => {
		drawPoint(ctx, point, grid, setSnakeRounding(index, snake, move, snakeRounding))
	})
}

const nextStep = ({snake, move, grid}) =>
	point(edge(R.last(snake).x + move.x, grid.width), edge(R.last(snake).y + move.y, grid.height))

const nextSnake = state => {
	if (R.find(R.equals(nextStep(state)))(state.snake)) {
		alert(`You lost :(\n\nYour score is: ${calculateScore(state)}\nYou collected ${collectedFruits(state)} fruits`)
		return {
			...state,
			snake: [point(5, 5)],
			snakeLength: initialState.snakeLength,
			gameSpeed: initialState.gameSpeed,
		}
	} else {
		return {
			...state,
			snake: [...setTail(state), nextStep(state)],
		}
	}
}

const nextApple = state =>
	R.equals(nextStep(state), state.fruit)
		? {
				...state,
				fruit: point(random(state.grid.width), random(state.grid.height)),
				fruitColor: getRandomColor(),
				snakeLength: state.snakeLength + 1,
				gameSpeed: setSpeed(state),
		  }
		: state

const nextState = state => {
	return R.pipe(nextApple, nextSnake)(state)
}

const refreshState = () => {
	draw(ctx, canvas, state)
	state = nextState(state)
	setTimeout(refreshState, state.gameSpeed)
}
setTimeout(refreshState, state.gameSpeed)

document.addEventListener('keydown', ({key: direction}) => {
	state = setDirection(direction)(state)
})

