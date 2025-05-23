const canvas = document.getElementById("graphDisplay");
const ctx = canvas.getContext("2d");

let nodes = [],
  edges = [],
  adj = {},
  dragging = false,
  heldNode = null,
  steps = [],
  step = -1;

function stepForward() {
  if (step <= steps.length - 1) step++;
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
  for (let n of nodes) {
    if (Math.abs(n.x - e.offsetX) < 25 && Math.abs(n.y - e.offsetY) < 25) {
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

function draggingJawn() {
  for (let node of adj[heldNode.label]) {
    if (node) {
      return;
    }
  }
}

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

function drawNode(node) {
  ctx.beginPath();
  ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
  ctx.fillStyle = "#7fc9ff";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "black";
  ctx.fillText(node.label, node.x - 6, node.y + 5);
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
  console.log();
  adj[label] = [];
  drawNode(nodes.find((n) => n.label == label));
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
  for (let n in adj) result += n + " -> " + adj[n].join(", ") + "\n";
  document.getElementById("output").value = "Adjacency List:\n" + result;
}

function showAdjMatrix() {
  let labels = nodes.map((x) => x.label);
  let grid = [];
  for (let i = 0; i < labels.length; i++) {
    grid[i] = [];
    for (let j = 0; j < labels.length; j++) {
      grid[i][j] = adj[labels[i]].includes(labels[j]) ? 1 : 0;
    }
  }
  let txt = "Adjacency Matrix:\n   " + labels.join(" ") + "\n";
  for (let i = 0; i < labels.length; i++) {
    txt += labels[i] + " " + grid[i].join("  ") + "\n";
  }
  document.getElementById("output").value = txt;
}

function BFS() {
  let start = prompt("start node:");
  let goal = prompt("target node (Leave blank for distance map):");
  if (!adj[start]) return;

  let queue = [start],
    visited = [],
    path = {},
    distance = {};

  path[start] = null;
  distance[start] = 0;

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
      if (!(n in path)) {
        path[n] = curr;
        console.log(distance[curr]);
        distance[n] = distance[curr] + 1;
        queue.push(n);
      }
    }
  }

  let out = "BFS:\n" + visited.join(" -> ");
  if (goal && goal in path) {
    let path = [];
    let t = goal;
    while (t !== null) {
      path.unshift(t);
      t = path[t];
    }
    out += "\nPath: " + path.join(" -> ");
  } else if (!goal) {
    out += "\nSteps from " + start + ":\n";
    for (let node in distance) {
      out += node + " -> " + distance[node] + "\n";
      console.log(distance);
    }
  }
  document.getElementById("output").value = out;
}

function DFS() {
  let start = prompt("start node:");
  let goal = prompt("target node (Leave blank for distance map):");
  if (!adj[start]) return;

  let visited = [],
    path = {},
    distance = {},
    done = false;

  steps = [];
  step = -1;

  path[start] = null;
  distance[start] = 0;

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
        distance[next] = distance[n] + 1;
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
  } else if (!goal) {
    str += "\nSteps from " + start + ":\n";
    for (let node in distance) {
      str += node + " -> " + distance[node] + "\n";
    }
  }
  document.getElementById("output").value = str;
}
