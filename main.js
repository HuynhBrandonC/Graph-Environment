const canvas = document.getElementById("graphDisplay");
const ctx = canvas.getContext("2d");

let nodes = [],
  edges = [],
  adj = {};

let dragging = false;
let heldNode = null;

let steps = [];
let step = -1;

function stepForward() {
  if (step < steps.length - 1) step++;
  updateStep();
}

function stepBackward() {
  if (step > 0) step--;
  updateStep();
}

function updateStep() {
  let part = [];
  for (let i = 0; i <= step; i++) part.push(steps[i]);
  document.getElementById("output").value =
    "Stepping through:\n" + part.join(" -> ");
}

canvas.addEventListener("mousedown", (e) => {
  let x = e.offsetX,
    y = e.offsetY;
  for (let n of nodes) {
    let dx = n.x - x,
      dy = n.y - y;
    if (Math.sqrt(dx * dx + dy * dy) < 25) {
      dragging = true;
      heldNode = n;
      break;
    }
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (dragging && heldNode) {
    heldNode.x = e.offsetX;
    heldNode.y = e.offsetY;
    redrawJawn();
  }
});

canvas.addEventListener("mouseup", () => {
  dragging = false;
  heldNode = null;
});

function redrawJawn() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < edges.length; i++) {
    let edge = edges[i];
    let a = nodes.find((n) => n.label == edge[0]);
    let b = nodes.find((n) => n.label == edge[1]);
    if (a && b) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
  for (let node of nodes) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#7fc9ff";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.fillText(node.label, node.x - 6, node.y + 5);
  }
}

function resizeCanvas() {
  let newW = prompt("enter new width:");
  let newH = prompt("enter new height:");
  canvas.width = newW;
  canvas.height = newH;
  redrawJawn();
}

function addNode() {
  let label = prompt("enter node id:");
  if (!label || adj[label]) return;
  let px = Math.random() * 550 + 25;
  let py = Math.random() * 350 + 25;
  nodes.push({ label, x: px, y: py });
  adj[label] = [];
  redrawJawn();
}

function addEdge() {
  let from = prompt("start node:");
  let to = prompt("end node:");
  if (!(from in adj) || !(to in adj)) return alert("invalid node");
  adj[from].push(to);
  adj[to].push(from);
  edges.push([from, to]);
  redrawJawn();
}

function showAdjList() {
  let result = "";
  for (let n in adj) result += n + " => " + adj[n].join(" | ") + "\n";
  document.getElementById("output").value = "Adjacency List:\n" + result;
}

function showAdjMatrix() {
  let lbls = nodes.map((x) => x.label);
  let grid = [];
  for (let i = 0; i < lbls.length; i++) {
    grid[i] = [];
    for (let j = 0; j < lbls.length; j++) {
      grid[i][j] = adj[lbls[i]].includes(lbls[j]) ? 1 : 0;
    }
  }
  let txt = "Matrix:\n   " + lbls.join(" ") + "\n";
  for (let i = 0; i < lbls.length; i++) {
    txt += lbls[i] + " " + grid[i].join("  ") + "\n";
  }
  document.getElementById("output").value = txt;
}

function runBFS() {
  let start = prompt("start node:");
  let goal = prompt("target node:");
  if (!adj[start]) return;

  let queue = [start];
  let visited = [];
  let cameFrom = {};
  cameFrom[start] = null;

  steps = [];
  step = -1;

  while (queue.length > 0) {
    let curr = queue[0];
    queue = queue.slice(1);
    if (visited.indexOf(curr) != -1) continue;
    visited.push(curr);
    steps.push(curr);
    if (curr === goal) break;
    for (let i = 0; i < adj[curr].length; i++) {
      let n = adj[curr][i];
      if (!(n in cameFrom)) {
        cameFrom[n] = curr;
        queue.push(n);
      }
    }
  }

  let out = "BFS:\n" + visited.join(" -> ");
  if (goal && goal in cameFrom) {
    let path = [];
    let t = goal;
    while (t !== null) {
      path.unshift(t);
      t = cameFrom[t];
    }
    out += "\nPath: " + path.join(" -> ");
  }
  document.getElementById("output").value = out;
}

function runDFS() {
  let start = prompt("start node:");
  let goal = prompt("target node:");
  if (!adj[start]) return;

  let visited = [],
    path = {};
  let done = false;

  steps = [];
  step = -1;

  path[start] = null;

  function recurse(n) {
    if (done) return;
    visited.push(n);
    steps.push(n);
    if (n == goal) {
      done = true;
      return;
    }
    for (let i = 0; i < adj[n].length; i++) {
      let next = adj[n][i];
      if (!visited.includes(next)) {
        path[next] = n;
        recurse(next);
      }
    }
  }

  recurse(start);

  let str = "DFS:\n" + visited.join(" -> ");
  if (goal && goal in path) {
    let trace = [];
    let p = goal;
    while (p !== null) {
      trace.unshift(p);
      p = path[p];
    }
    str += "\nFound: " + trace.join(" -> ");
  }
  document.getElementById("output").value = str;
}
