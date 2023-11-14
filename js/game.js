// Constants for the Plinko game
const BALL_SIZE = 16;
const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 794;
const PEG_X = 70;
const PEG_Y = 70;
const BUCKET_COLOR = '#fef3d9';
const COLORS = [
  '#fef3d9',
  '#feefcc',
  '#feebbf',
  '#fde7b2',
  '#fde3a5',
  '#fddf99',
  '#fcdb8c',
  '#fcd77f',
  '#e3c272',
  '#caac66',
];

// Matter.js modules
const { Engine, Render, World, Bodies, Events, Body, Runner } = Matter;

// Create the Matter.js engine
const engine = Engine.create({
  timing: { timeScale: 2 },
});

// Create the rendering environment
const render = Render.create({
  element: document.querySelector('.target'),
  engine,
  options: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    wireframes: false,
    background: '#c5f8c8',
  },
});

// Create the ground and walls
const ground = Bodies.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT, CANVAS_WIDTH * 3, 50, {
  id: 999,
  isStatic: true,
  collisionFilter: { group: 'ground' },
  render: {
    fillStyle: '#3d473e',
  },
});

const ground2 = Bodies.rectangle(0, CANVAS_HEIGHT, CANVAS_WIDTH * 3, 50, {
  id: 9999,
  isStatic: true,
  collisionFilter: { group: 'ground' },
});

// Create the indicator for dropping balls
const indicator = Bodies.circle(BALL_SIZE, BALL_SIZE, BALL_SIZE, {
  isStatic: true,
  collisionFilter: { group: 'ball' },
  render: {
    fillStyle: '#3d473e',
  },
});

// Create the Plinko pegs
const pegs = [];
for (let i = 1; i < CANVAS_HEIGHT / PEG_Y - 1; i++) {
  for (let j = 1; j < CANVAS_WIDTH / PEG_X + 1; j++) {
    let x = j * PEG_X - BALL_SIZE * 1.5;
    const y = i * PEG_Y;

    if (i % 2 === 0) {
      x -= PEG_X / 2;
    }

    const peg = Bodies.polygon(x, y, 7, BALL_SIZE / 4, {
      isStatic: true,
      render: {
        fillStyle: '#3d473e',
      },
    });
    pegs.push(peg);
  }
}

// Create the walls on the sides
const leftWall = Bodies.rectangle(-1, CANVAS_HEIGHT / 2 + BALL_SIZE * 2, 1, CANVAS_HEIGHT, {
  isStatic: true,
});

const rightWall = Bodies.rectangle(
  CANVAS_WIDTH + 1,
  CANVAS_HEIGHT / 2 + BALL_SIZE * 2,
  1,
  CANVAS_HEIGHT,
  {
    isStatic: true,
  },
);

// Create the buckets and dividers
const buckets = [];
const bucketIdRange = [];
const bucketWidth = CANVAS_WIDTH / 10;
const bucketHeight = BALL_SIZE * 3;
for (let i = 0; i < 10; i++) {
  const bucket = Bodies.rectangle(
    bucketWidth * i + bucketWidth * 0.5,
    CANVAS_HEIGHT - bucketHeight,
    bucketWidth,
    bucketHeight,
    {
      id: i,
      isStatic: true,
      isSensor: true,
      render: {
        fillStyle: BUCKET_COLOR,
      },
      collisionFilter: {
        group: 'bucket',
      },
    },
  );

  const divider = Bodies.rectangle(bucketWidth * i, CANVAS_HEIGHT - bucketHeight, 2, bucketHeight, {
    isStatic: true,
    collisionFilter: { group: 'bucket' },
    render: {
      fillStyle: '#273228',
    },
  });
  bucketIdRange.push(i);
  buckets.push(bucket);
  buckets.push(divider);
}

// Add bodies to the world
World.add(engine.world, [ground2, ...pegs, ...buckets, ground, indicator, leftWall, rightWall]);

// Run the engine and rendering
Runner.run(engine);
Render.run(render);
let ballCount = 0;

// Function to drop balls from a specific position
function dropBalls(position, quantity) {
  const balls = [];

  const startRes = Math.min(Math.abs(parseFloat(document.querySelector('#coef-start').value)), 1);

  const endRes = Math.min(Math.abs(parseFloat(document.querySelector('#coef-end').value)), 1);

  const startSize = parseFloat(document.querySelector('#size-start').value);
  const endSize = parseFloat(document.querySelector('#size-end').value);

  for (let i = 0; i < quantity; i++) {
    ballCount++;
    if (ballCount > 785) {
      ballCount--;
      break;
    }

    const restitution = Math.random() * (endRes - startRes) + startRes;
    const size = Math.random() * (endSize - startSize) + startSize;
    const dropX = position;

    const ball = Bodies.circle(dropX, size, size, {
      restitution,
      collisionFilter: { group: 'ball' },
      friction: 0.9,
      render: {
        fillStyle: '#8aae8c',
      },
    });

    ball.size = size;
    ball.restitution = restitution;
    ball.dropX = position;
    balls.push(ball);
  }

  World.add(engine.world, balls);
}

let x = 0;
const canvas = document.querySelector('canvas');
const events = {
  mousemove(event) {
    x = event.offsetX;

    Body.setPosition(indicator, { x, y: BALL_SIZE });
    document.querySelector('.x-position').innerHTML = `Drop Position: ${x}`;
  },
  click() {
    const quantity = parseInt(document.querySelector('#drop-quantity').value);

    dropBalls(x, quantity);
  },
};

for (const event in events) {
  canvas.addEventListener(event, events[event]);
}

// Event listener for collision detection
let _score = {};
Events.on(engine, 'collisionActive', ({ pairs }) => {
  pairs.forEach((pair) => {
    if (
      (bucketIdRange.includes(pair.bodyA.id) || bucketIdRange.includes(pair.bodyB.id)) &&
      Math.abs(pair.bodyB.velocity.y) < 0.1 &&
      pair.bodyB.position.y > CANVAS_HEIGHT - 200
    ) {
      World.remove(engine.world, pair.bodyB);
      ballCount--;
      const bucketId = pair.bodyA.id;

      _score[bucketId] = (_score[bucketId] || 0) + 1;

      const count = parseInt(document.querySelector(`#bucket-${bucketId}`).innerHTML);
      document.querySelector(`#bucket-${bucketId}`).innerHTML = count + 1;

      onScoreUpdate(
        Math.round(pair.bodyB.dropX),
        pair.bodyB.restitution,
        pair.bodyB.size,
        bucketId + 1,
      );
      updateBucketColors(_score);
    }
  });
});

// Event listeners for various buttons
document.querySelector('button#scan').addEventListener('click', () => {
  const quantity = parseInt(document.querySelector('#scan-quantity').value);
  const spacing = parseInt(document.querySelector('#scan-spacing').value);

  for (let i = 1; i < CANVAS_WIDTH / spacing; i++) {
    dropBalls(i * spacing, quantity);
  }
});

document.querySelector('button#spot').addEventListener('click', () => {
  const quantity = parseInt(document.querySelector('#spot-quantity').value);
  const spot = parseInt(document.querySelector('#spot-location').value);

  dropBalls(spot, quantity);
});

document.querySelector('button#analyze').addEventListener('click', runAnalysis);

document
  .querySelectorAll('form')
  .forEach((f) => f.addEventListener('submit', (e) => e.preventDefault()));

// Function to update bucket colors based on scores
function updateBucketColors(_score) {
  const counts = _.range(0, 10).map((i) => _score[i] || 0);
  const ranks = counts.map((count, i) => ({ i, c: count }));

  let counter = 0;
  _.chain(ranks)
    .sortBy('c')
    .forEach(({ i, c }, j, collection) => {
      if (_.get(collection, `[${j - 1}].c`) !== c) {
        counter++;
      }
      buckets[i * 2].render.fillStyle = COLORS[counter - 1];
    })
    .value();
}

// Event listener to reset the game
document.querySelector('#reset').addEventListener('click', function () {
  try {
    outputs.length = 0;
  } catch (e) {}

  _.range(0, 10).forEach((i) => {
    buckets[i * 2].render.fillStyle = BUCKET_COLOR;
    document.querySelector(`#bucket-${i}`).innerHTML = 0;
  });

  _score = {};
});
