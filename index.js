import * as tome from 'chromotome';
import Chance from 'chance';

let chance;

let sketch = function(p) {
  let THE_SEED;
  let grid = [];
  let gx = 16;
  let gy = 16;

  let cdim = 50; // Cell dimension
  let bwidth = 40; // Band width

  let colorPairs;
  let number_of_pairs = 4;
  let tomeInstance = tome.getRandom();
  let palette = tomeInstance.colors;
  let background = tomeInstance.background;

  p.setup = function() {
    p.createCanvas(800, 800);
    THE_SEED = p.floor(p.random(9999999));
    chance = new Chance(THE_SEED);
    p.randomSeed(THE_SEED);

    p.noLoop();
    p.fill(255, 100, 0);
    p.noStroke();
    p.strokeWeight(2);
    p.strokeJoin(p.BEVEL);

    colorPairs = colPairs(number_of_pairs, palette);

    for (let i = 0; i < gy; i++) {
      let row = [];
      for (let j = 0; j < gx; j++) {
        row.push(rule2(i, j, row));
      }
      grid.push(row);
    }
  };

  function rule1(i, j, row) {
    if (i === 0 && j === 0) return { n: null, e: null, s: null, w: null, r: false };

    const rib = newRibbon(colorPairs);
    if (i === 0) return { n: rib, e: null, s: rib, w: null, r: false };
    if (j === 0) return { n: null, e: turnRibbon(rib), s: null, w: turnRibbon(rib), r: false };
    return nextCell(grid[i - 1][j].s, row[j - 1].e);
  }

  function rule2(i, j, row) {
    if (i === 0 || j === 0) return { n: false, e: false, s: false, w: false, r: false };
    if (i === 1 && j === 1) {
      const rib = newRibbon(colorPairs);
      return { n: null, e: rib, s: turnRibbon(rib), w: null, r: flip() };
    }
    return nextCell(grid[i - 1][j].s, row[j - 1].e);
  }

  p.draw = function() {
    p.background(background ? background : '#fefefe');
    for (let i = 0; i < gy; i++) {
      for (let j = 0; j < gx; j++) {
        p.push();
        p.translate(j * cdim, i * cdim);
        drawCell(grid[i][j]);
        p.pop();
      }
    }
  };

  p.keyPressed = function() {
    if (p.keyCode === 80) p.saveCanvas('sketch_' + THE_SEED, 'jpeg');
  };

  function nextCell(n, w) {
    const reflected = flip();
    if (n && w) {
      let stop = compareRibbons(n, turnRibbon(w)) && flip();
      return { n, e: stop ? null : w, s: stop ? null : n, w, r: reflected };
    }
    if (n) {
      let turn = flipL(50);
      return { n, e: turn ? turnRibbon(n) : null, s: turn ? null : n, w, r: reflected };
    }
    if (w) {
      let turn = flipL(50);
      return { n, e: turn ? null : w, s: turn ? turnRibbon(w) : null, w, r: reflected };
    }
    let start = flipL(30);
    let rib = newRibbon(colorPairs);
    return { n, e: start ? rib : null, s: start ? turnRibbon(rib) : null, w, r: reflected };
  }

  function drawCell({ n, w, s, e, r }) {
    if (n && w && s && e) draw_cross(n, w, r);
    else if (n && s) draw_straight(0, n.front);
    else if (w && e) draw_straight(p.PI / 2, w.front);
    else {
      if (n && e) drawEll(r, 0, n, e);
      if (s && e) drawEll(r, 1, e, s);
      if (s && w) drawEll(r, 2, s, w);
      if (n && w) drawEll(r, 3, w, n);
    }
  }

  function drawEll(reflected, rotation, r1, r2) {
    p.push();
    p.rotate((rotation * p.PI) / 2);
    const br = bwidth / 2;

    p.fill(r1.front);
    p.beginShape();
    p.vertex(br, -cdim / 2);
    p.vertex(br, reflected ? br : -br);
    p.vertex(-br, -br);
    p.vertex(-br, -cdim / 2);
    p.endShape();

    p.fill(r2.front);
    p.beginShape();
    p.vertex(cdim / 2, br);
    p.vertex(br, br);
    p.vertex(reflected ? br : -br, -br);
    p.vertex(cdim / 2, -br);
    p.endShape();

    if (
      (!reflected && (rotation === 1 || rotation === 2)) ||
      (reflected && (rotation === 0 || rotation == 1))
    ) {
      p.noStroke();
      p.fill(0, 60);
      p.beginShape();
      p.vertex(br, -br);
      if (reflected) p.vertex(br, br);
      else p.vertex(-br, -br);
      if (reflected) p.vertex(br + bwidth / 8, -br);
      else p.vertex(br, -(br + bwidth / 8));
      p.endShape();
    }
    p.pop();
  }

  function draw_straight(rotation, col) {
    p.push();
    p.fill(col);
    p.rotate(rotation);
    p.noStroke();
    p.rect(-bwidth / 2, -cdim / 2, bwidth, cdim);
    //p.stroke(0);
    p.line(-bwidth / 2, -cdim / 2, -bwidth / 2, cdim / 2);
    p.line(bwidth / 2, -cdim / 2, bwidth / 2, cdim / 2);
    p.pop();
  }

  function draw_cross(r1, r2, reflected) {
    if (reflected) {
      draw_straight(0, r1.front);
      draw_straight(p.PI / 2, r2.front);
    } else {
      draw_straight(p.PI / 2, r2.front);
      draw_straight(0, r1.front);
    }

    p.fill(0, 60);
    if (reflected) p.rect(-bwidth / 2, bwidth / 2, bwidth, bwidth / 8);
    else p.rect(bwidth / 2, -bwidth / 2, bwidth / 8, bwidth);
  }
};
new p5(sketch);

function flip() {
  return chance.bool();
}

function flipL(l) {
  return chance.bool({ likelihood: l });
}

function newRibbon(palette) {
  let pair = chance.pickone(palette);
  return { front: pair[0], back: pair[1] };
}

function turnRibbon(r) {
  return { front: r.back, back: r.front };
}

function compareRibbons(r1, r2) {
  return r1.front === r2.front && r1.back === r2.back;
}

function colPairs(n, palette) {
  const pairs = [];
  for (let i = 0; i < n; i++) {
    pairs.push(chance.pickset(palette, 2));
  }
  return pairs;
}
