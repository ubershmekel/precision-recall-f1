interact('.resize-drag')
  .draggable({
    onmove: window.dragMoveListener,
    restrict: {
      restriction: 'parent',
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
  })
  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

    // keep the edges inside the parent
    restrictEdges: {
      outer: 'parent',
      endOnly: true,
    },

    // minimum size
    restrictSize: {
      min: { width: 100, height: 50 },
    },

    inertia: true,
  })
  .on('resizemove', function (event) {
    var rect = getRect(event.target);

    // translate when resizing from top or left edges
    rect.x += event.deltaRect.left;
    rect.y += event.deltaRect.top;
    rect.width = event.rect.width;
    rect.height = event.rect.height;

    //target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
    setRect(event.target, rect);
    updateStats();
  });

function getRect(target) {
  return {
    x: (parseFloat(target.getAttribute('data-x')) || 0),
    y: (parseFloat(target.getAttribute('data-y')) || 0),
    width: (parseFloat(target.getAttribute('data-width')) || 0),
    height: (parseFloat(target.getAttribute('data-height')) || 0),
  };
}

function setRect(target, rect) {
  if (rect.width !== undefined) {
    target.style.width = rect.width + 'px';
    target.setAttribute('data-width', rect.width);
  }
  if (rect.height !== undefined) {
    target.style.height = rect.height + 'px';
    target.setAttribute('data-height', rect.height);
  }

  if (rect.x !== undefined) {
    // We don't check for rect.y because we can't apply one without the other.
    // Unless we parse the current translate which I don't want to.
    // Ideas for improvement welcome.
    target.style.webkitTransform = target.style.transform =
      'translate(' + rect.x + 'px,' + rect.y + 'px)';
    target.setAttribute('data-x', rect.x);
    target.setAttribute('data-y', rect.y);
  }
}

function dragMoveListener(event) {
  //console.log(event)
  var target = event.target;
  var rect = getRect(event.target);
  rect.x += event.dx;
  rect.y += event.dy;
  // {
  //   // keep the dragged position in the data-x/data-y attributes
  //   x: (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
  //   y: (parseFloat(target.getAttribute('data-y')) || 0) + event.dy,
  // }

  setRect(target, rect);
  updateStats();
}

function area(rect) {
  return rect.width * rect.height;
}

function intersectionArea(rectA, rectB) {
  var xinter = intervalOverlap(rectA.x, rectA.width, rectB.x, rectB.width);
  var yinter = intervalOverlap(rectA.y, rectA.height, rectB.y, rectB.height);
  return xinter * yinter;
}

function intervalOverlap(a, widthA, b, widthB) {
  if (a > b) {
    // make sure `a` is on the left
    var tmpSwap = a;
    a = b;
    b = tmpSwap;
    tmpSwap = widthA;
    widthA = widthB;
    widthB = tmpSwap;
  }
  var rightOfA = a + widthA;
  return Math.min(widthB, Math.max(0, rightOfA - b));
}

function updateStats() {
  var rectAllSamples = getRect(areas.allSamples);
  var rectPositive = getRect(areas.positive);
  var rectClassifiedPositive = getRect(areas.classifiedPositive);

  document.querySelector("#samples-count").innerHTML = area(rectAllSamples);
  document.querySelector("#positive-samples-count").innerHTML = area(rectPositive);
  document.querySelector("#classified-positive-samples-count").innerHTML = area(rectClassifiedPositive);
  document.querySelector("#true-positive-count").innerHTML = intersectionArea(rectPositive, rectClassifiedPositive);
}

function assertEq(test, expected, description) {
  if (test != expected) {
    console.log("Test failure", test, expected, description);
  }
}

function tests() {
  assertEq(intervalOverlap(0, 5, 1, 2), 2);
  assertEq(intervalOverlap(0, 5, 1, 5), 4);
  assertEq(intervalOverlap(0, 5, -1, 3), 2);
  assertEq(intervalOverlap(0, 5, 6, 3), 0);
  assertEq(intervalOverlap(0, 5, 5, 1), 0);
  assertEq(intervalOverlap(0, 5, -1, 1), 0);
  assertEq(intervalOverlap(0, 5, -2, 1), 0);
  assertEq(intervalOverlap(0, 5, -1, 7), 5);
  console.log("Finished tests");
}

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;
areas = {
  positive: document.querySelector('#positive'),
  allSamples: document.querySelector('#all-samples'),
  classifiedPositive: document.querySelector('#classified-positive'),
}
setRect(areas.positive, {x: 30, y: 30, width: 100, height: 200});
setRect(areas.classifiedPositive, {x: 60, y: 80, width: 200, height: 100});
setRect(areas.allSamples, {x: 10, y: 10, width: 500, height: 500});
updateStats();
tests();


