interact('.resize-drag')
  .draggable({
    onmove: dragMoveListener,
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
      //endOnly: true,
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
    validateSetRect(event.target, rect);
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

function mustContain(outsideRect, inRect) {
  // outsideRect must be set to contain inRect within it
  if (inRect.x < outsideRect.x) {
    outsideRect.x = inRect.x;
  }
  if (inRect.x + inRect.width > outsideRect.x + outsideRect.width) {
    outsideRect.width = inRect.x + inRect.width - outsideRect.x;
  }
  if (inRect.y < outsideRect.y) {
    outsideRect.y = inRect.y;
  }
  if (inRect.y + inRect.height > outsideRect.y + outsideRect.height) {
    outsideRect.height = inRect.y + inRect.height - outsideRect.y;
  }
}

function mustStayIn(inRect, outsideRect) {
  // inRect must be set to stay inside outsideRect
  if (inRect.x < outsideRect.x) {
    inRect.x = outsideRect.x;
  }
  if (inRect.x + inRect.width > outsideRect.x + outsideRect.width) {
    inRect.width = outsideRect.x + outsideRect.width - inRect.x;
  }
  if (inRect.y < outsideRect.y) {
    inRect.y = outsideRect.y;
  }
  if (inRect.y + inRect.height > outsideRect.y + outsideRect.height) {
    inRect.height = outsideRect.y + outsideRect.height - inRect.y;
  }
}

function validateSetRect(target, rect) {
  if (target === areas.allSamples) {
    // limit to always contain positive and classified positive
    mustContain(rect, getRect(areas.positive));
    mustContain(rect, getRect(areas.classifiedPositive));
  } else {
    mustStayIn(rect, getRect(areas.allSamples));
  }
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
  var rect = getRect(event.target);
  rect.x += event.dx;
  rect.y += event.dy;

  validateSetRect(event.target, rect);
  setRect(event.target, rect);
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

  var sampleCount = area(rectAllSamples);
  var positive = area(rectPositive);
  var classifiedPositive = area(rectClassifiedPositive)
  var tp = intersectionArea(rectPositive, rectClassifiedPositive);
  var precision = tp / classifiedPositive;
  var recall = tp / positive;
  var negative = sampleCount - positive;
  var tn = sampleCount - positive - classifiedPositive + tp;
  var specificity = tn / negative;
  var f1 = 2 / ((1 / recall) + (1 / precision));

  document.querySelector("#samples-count").innerHTML = sampleCount;
  document.querySelector("#positive-samples-count").innerHTML = positive;
  document.querySelector("#classified-positive-samples-count").innerHTML = classifiedPositive;
  document.querySelector("#true-positive-count").innerHTML = tp;
  document.querySelector("#true-negative-count").innerHTML = tn;
  document.querySelector("#precision").innerHTML = precision;
  document.querySelector("#recall").innerHTML = recall;
  document.querySelector("#specificity").innerHTML = specificity;
  document.querySelector("#f1").innerHTML = f1;
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
setRect(areas.positive, {x: 75, y: 65, width: 200, height: 200});
setRect(areas.classifiedPositive, {x: 130, y: 180, width: 300, height: 100});
setRect(areas.allSamples, {x: 10, y: 10, width: 500, height: 500});
updateStats();
tests();


