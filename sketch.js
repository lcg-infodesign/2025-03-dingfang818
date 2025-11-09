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
  background("#04091D");

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
  textSize(40);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  text("🌋 Interactive Volcano Visualization", width/2, 20);

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
  let c;

  if (!type) c = color("#ADD5C4");
  else if (type.toLowerCase().includes("strato")) c = color("#A6CDED");
  else if (type.toLowerCase().includes("shield")) c = color("#CD5A5C");
  else if (type.toLowerCase().includes("complex")) c = color("#F3C2B6");
  else if (type.toLowerCase().includes("submarine")) c = color("#893F9A");
  else if (type.toLowerCase().includes("lava")) c = color("#FCFDF9");
  else c = color("#ADD5C4"); // 👈 默认颜色（别写 return）

  c.setAlpha(150); // 🔹设置透明度
  return c;        // ✅ 返回最终颜色
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
    ["Stratovolcano", color("#A6CDED")],
    ["Shield", color("#CD5A5C")],
    ["Complex", color("#F3C2B6")],
    ["Submarine", color("#893F9A")],
    ["Lava Dome", color("#FCFDF9")],
    ["Other", color("#ADD5C4")]
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

// 绘制经纬度网格（虚线）
function drawGrid() {
  stroke(80);
  strokeWeight(1);
  textSize(12);
  fill(200);

  // 设置虚线样式
  drawingContext.setLineDash([4, 4]);

  // 经度每30°
  for (let lon = Math.ceil(minLon / 30) * 30; lon <= maxLon; lon += 30) {
    let x = map(lon, minLon, maxLon, outerMargin, width - outerMargin);
    line(x, outerMargin, x, height - outerMargin);

    // 经纬度文字
    drawingContext.setLineDash([]); // 先恢复为实线，避免文字绘制受影响
    noStroke();
    textAlign(CENTER, TOP);
    text(`${lon}°`, x, height - outerMargin + 5);
    stroke(80);
    drawingContext.setLineDash([4, 4]); // 再恢复虚线
  }

  // 纬度每30°
  for (let lat = Math.ceil(minLat / 30) * 30; lat <= maxLat; lat += 30) {
    let y = map(lat, minLat, maxLat, height - outerMargin, outerMargin);
    line(outerMargin, y, width - outerMargin, y);

    // 经纬度文字
    drawingContext.setLineDash([]);
    noStroke();
    textAlign(RIGHT, CENTER);
    text(`${lat}°`, outerMargin - 5, y);
    stroke(80);
    drawingContext.setLineDash([4, 4]);
  }

  // 画完后恢复为实线
  drawingContext.setLineDash([]);
}




// 窗口大小变化时重新计算火山坐标
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  loadVolcanoesData();
}
