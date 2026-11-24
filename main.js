// ============================================
// GLOBAL CONSTANTS & HELPER FUNCTIONS
// ============================================

const PRECISION = 4;
const DEC_PREC = 0.000001;
const BETWEEN = 0;
const LEFT = 1;
const RIGHT = 2;

// Math shortcuts
const sqrt = Math.sqrt;
const abs = Math.abs;
const round = (x, n) => Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
const sqr = (x) => x * x;
const min = Math.min;
const max = Math.max;

// JSXGraph shared style parameters
const curveParam = {
  strokeColor: '#0000FF',
  strokeWidth: 2,
  highlight: false
};

const shadeParam = {
  strokeColor: 'none',
  fillColor: '#0000FF',
  fillOpacity: 0.3,
  highlight: false
};

const inputParam = {
  fontSize: 16,
  cssStyle: 'width: 80px',
  frozen: true,
  fixed: true
};

const integerInputParam = {
  fontSize: 16,
  cssStyle: 'width: 60px',
  frozen: true,
  fixed: true
};

const buttonParam = {
  frozen: true,
  fixed: true
};

const textParam = {
  fontSize: 14,
  frozen: true,
  fixed: true,
  highlight: false
};

// Evaluate a string expression safely using math.js
function evalstr(s) {
  try {
    if (s === 'Infinity' || s === '+Infinity') return Infinity;
    if (s === '-Infinity') return -Infinity;
    return math.evaluate(String(s));
  } catch(e) {
    return NaN;
  }
}

// Create a JSXGraph checkbox
function JSXCheckbox(board, x, y, label, checked, onChange, params) {
  let cb = board.create('checkbox', 
[x, y, label], params);
  cb.rendNodeCheckbox.checked = checked;
  cb._value = checked;
  cb.rendNodeCheckbox.addEventListener('change', function() {
    cb._value = cb.rendNodeCheckbox.checked;
    onChange();
  });
  return cb;
}

// Set a checkbox value
function setCheckbox(cb, value) {
  cb.rendNodeCheckbox.checked = value;
  cb._value = value;
}

// Check if a checkbox is checked
function isChecked(cb) {
  return cb.rendNodeCheckbox.checked;
}

// Get bounding box of a JSXGraph board
function JSXGetBounds(board) {
  let bb = board.getBoundingBox();
  return {
    xmin: bb
[0],
    ymax: bb
[1],
    xmax: bb
[2],
    ymin: bb
[3]
  };
}

// Set bounding box of a JSXGraph board
function JSXSetBounds(board, bounds) {
  board.setBoundingBox(
[bounds.xmin, bounds.ymax, bounds.xmax, bounds.ymin]);
}

// Z-score helper (used in normaldist.js)
function zScore(x) {
  return (x - normal.mean) / (normal.stdev / sqrt(normal.n));
}

function xValue(z) {
  return normal.mean + z * (normal.stdev / sqrt(normal.n));
}

// ============================================
// STATISTICS FUNCTIONS
// ============================================
const stats = {
  mean: (data) => data.reduce((a, b) => a + b, 0) / data.length,
  sum: (data) => data.reduce((a, b) => a + b, 0),
  sumofsqr: (data) => data.reduce((a, b) => a + b * b, 0),
  min: (data) => Math.min(...data),
  max: (data) => Math.max(...data),

  stdev: function(data) {
    let m = this.mean(data);
    return sqrt(data.reduce((a, b) => a + sqr(b - m), 0) / (data.length - 1));
  },

  stdevp: function(data) {
    let m = this.mean(data);
    return sqrt(data.reduce((a, b) => a + sqr(b - m), 0) / data.length);
  },

  median: function(data) {
    let sorted = 
[...data].sort((a, b) => a - b);
    let mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted
[mid] : (sorted
[mid - 1] + sorted
[mid]) / 2;
  },

  q1: function(data) {
    let sorted = 
[...data].sort((a, b) => a - b);
    let mid = Math.floor(sorted.length / 2);
    return this.median(sorted.slice(0, mid));
  },

  q3: function(data) {
    let sorted = 
[...data].sort((a, b) => a - b);
    let mid = Math.ceil(sorted.length / 2);
    return this.median(sorted.slice(mid));
  },

  correlation: function(x, y) {
    let mx = this.mean(x), my = this.mean(y);
    let num = x.reduce((a, xi, i) => a + (xi - mx) * (y
[i] - my), 0);
    let den = sqrt(x.reduce((a, xi) => a + sqr(xi - mx), 0) * y.reduce((a, yi) => a + sqr(yi - my), 0));
    return num / den;
  },

  linreg: function(x, y) {
    let mx = this.mean(x), my = this.mean(y);
    let m = x.reduce((a, xi, i) => a + (xi - mx) * (y
[i] - my), 0) /
            x.reduce((a, xi) => a + sqr(xi - mx), 0);
    let b = my - m * mx;
    return 
[m, b];
  },

  // Weighted stats
  wn: (x, f) => f.reduce((a, b) => a + b, 0),
  wsum: (x, f) => x.reduce((a, xi, i) => a + xi * f
[i], 0),
  wsumofsqr: (x, f) => x.reduce((a, xi, i) => a + xi * xi * f
[i], 0),
  wmean: function(x, f) { return this.wsum(x, f) / this.wn(x, f); },
  wmin: (x, f) => Math.min(...x),
  wmax: (x, f) => Math.max(...x),

  wstdev: function(x, f) {
    let m = this.wmean(x, f), n = this.wn(x, f);
    return sqrt(x.reduce((a, xi, i) => a + f
[i] * sqr(xi - m), 0) / (n - 1));
  },

  wstdevp: function(x, f) {
    let m = this.wmean(x, f), n = this.wn(x, f);
    return sqrt(x.reduce((a, xi, i) => a + f
[i] * sqr(xi - m), 0) / n);
  },

  wmedian: function(x, f) { return this.median(x); },
  wq1: function(x, f) { return this.q1(x); },
  wq3: function(x, f) { return this.q3(x); },
};

// Combinations and Permutations
function combinations(n, r) {
  if (r > n) return 0;
  let result = 1;
  for (let i = 0; i < r; i++) result *= (n - i) / (i + 1);
  return Math.round(result);
}

function permutations(n, r) {
  let result = 1;
  for (let i = 0; i < r; i++) result *= (n - i);
  return result;
}

// List data storage
var list1_data = 
[];
var list2_data = 
[];
var list3_data = 
[];

// Normal distribution global object (used by normaldist.js)
var normal = {
  mean: 0,
  stdev: 1,
  n: 1,
  x1: -2,
  x2: 2,
  prob: 0,
  probtype: 'BETWEEN',
  functype: 'PROBABILITY'
};
