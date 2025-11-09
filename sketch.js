let outerMargin = 100;
let data;
let volcanoes = [];
let minLon, maxLon, minLat, maxLat, minElev, maxElev;

function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 计算全局最小最大值
  let allLon = data.getColumn("Longitude");
  minLon = min(allLon);
  maxLon = max(allLon);

  let allLat = data.getColumn("Latitude");
  minLat = min(allLat);
  maxLat = max(allLat);

  let allElev = data.getColumn("Elevation (m)");
  minElev = min(allElev);
  maxElev = max(allElev);

  // 加载火山数据
  loadVolcanoesData();
}

function draw() {
  background(10);

  // 绘制经纬度网格
  drawGrid();

  let hovered = null;

  // 绘制火山
  for (let v of volcanoes) {
    let d = dist(mouseX, mouseY, v.x, v.y);
    if (d < v.radius / 2) {
      hovered = v;
      drawVolcano(v.x, v.y, v.radius + 4, v.color, true);
    } else {
      drawVolcano(v.x, v.y, v.radius, v.color, false);
    }
  }

  // 鼠标悬停 tooltip & 底部经纬度
  if (hovered) {
    cursor("pointer");
    drawTooltip(
      hovered.x + 10,
      hovered.y - 30,
      `${hovered.name} (${hovered.type})\n${hovered.country}, ${hovered.elev} m`
    );

    textAlign(RIGHT, BOTTOM);
    fill(255);
    textSize(14);
    text(`Longitude: ${hovered.lon}°, Latitude: ${hovered.lat}°`, width - 20, height - 10);
  } else {
    cursor("default");
  }

  // 标题
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text("🌋 Interactive Volcano Visualization", 20, 20);

  // 图例
  drawLegend();
}

// 加载火山数据
function loadVolcanoesData() {
  volcanoes = [];
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let row = data.getRow(rowNumber);
    let lat = parseFloat(row.get("Latitude"));
    let lon = parseFloat(row.get("Longitude"));
    let elev = parseFloat(row.get("Elevation (m)"));
    let type = row.get("TypeCategory");
    let name = row.get("Volcano Name");
    let country = row.get("Country");
    let lastEruption = row.get("Last Known Eruption");

    if (isNaN(lat) || isNaN(lon) || isNaN(elev)) continue;

    let x = map(lon, minLon, maxLon, outerMargin, width - outerMargin);
    let y = map(lat, minLat, maxLat, height - outerMargin, outerMargin);
    let radius = map(elev, minElev, maxElev, 3, 15);
    let c = colorByType(type);

    volcanoes.push({ x, y, radius, color: c, name, type, country, elev, lastEruption, lon, lat });
  }
}

// 绘制单个火山
function drawVolcano(x, y, radius, c, highlight) {
  noStroke();
  fill(c);
  ellipse(x, y, radius);
  if (highlight) {
    stroke(255);
    noFill();
    ellipse(x, y, radius + 4);
    noStroke();
  }
}

// 火山颜色分类
function colorByType(type) {
  if (!type) return color(200);
  type = type.toLowerCase();
  if (type.includes("strato")) return color(255, 80, 0, 200);
  if (type.includes("shield")) return color(0, 150, 255, 200);
  if (type.includes("complex")) return color(255, 200, 0, 200);
  if (type.includes("submarine")) return color(0, 255, 150, 200);
  if (type.includes("lava")) return color(255, 100, 200, 200);
  return color(180, 180, 180, 150);
}

// 绘制 tooltip
function drawTooltip(px, py, textString) {
  textSize(14);
  textAlign(LEFT, TOP);
  fill(255);
  stroke(0);
  text(textString, px, py);
}

// 绘制图例（底部水平）
function drawLegend() {
  let legendY = height - 30;
  let startX = 50;
  let spacing = 120;

  let types = [
    ["Stratovolcano", color(255, 80, 0)],
    ["Shield", color(0, 150, 255)],
    ["Complex", color(255, 200, 0)],
    ["Submarine", color(0, 255, 150)],
    ["Lava Dome", color(255, 100, 200)],
    ["Other", color(180)]
  ];

  textSize(12);
  textAlign(LEFT, CENTER);

  for (let i = 0; i < types.length; i++) {
    let x = startX + i * spacing;

    // 绘制颜色点
    fill(types[i][1]);
    noStroke();
    ellipse(x, legendY, 12, 12);

    // 绘制文字
    fill(255);
    text(types[i][0], x + 15, legendY);
  }
}

// 绘制经纬度网格
function drawGrid() {
  stroke(80);
  strokeWeight(1);
  textSize(12);
  fill(200);

  // 经度每30°
  for (let lon = Math.ceil(minLon/30)*30; lon <= maxLon; lon += 30) {
    let x = map(lon, minLon, maxLon, outerMargin, width - outerMargin);
    line(x, outerMargin, x, height - outerMargin);
    noStroke();
    textAlign(CENTER, TOP);
    text(`${lon}°`, x, height - outerMargin + 5);
    stroke(80);
  }

  // 纬度每30°
  for (let lat = Math.ceil(minLat/30)*30; lat <= maxLat; lat += 30) {
    let y = map(lat, minLat, maxLat, height - outerMargin, outerMargin);
    line(outerMargin, y, width - outerMargin, y);
    noStroke();
    textAlign(RIGHT, CENTER);
    text(`${lat}°`, outerMargin - 5, y);
    stroke(80);
  }
}

// 窗口大小变化时重新计算火山坐标
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  loadVolcanoesData();
}
