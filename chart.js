// Data (replace as needed)
const data = [
  { group: "Married couple",   value: 125000 },
  { group: "Single female",    value:  76400 },
  { group: "Single male",      value:  79300 },
  { group: "Unmarried couple", value: 116000 },
  { group: "Other",            value:  83900 }
];

const svg = d3.select("#chart");

const tooltip = d3.select("#tooltip");
const ttLabel = d3.select("#ttLabel");
const ttValue = d3.select("#ttValue");

const fmt = d3.format(",");

const margin = { top: 10, right: 30, bottom: 70, left: 210 };

function render(){
  svg.selectAll("*").remove();

  const wrap = svg.node().parentElement.getBoundingClientRect();
  const width = Math.max(820, Math.floor(wrap.width));
  const barH = 44;
  const rowGap = 18;
  const height = margin.top + margin.bottom + data.length * (barH + rowGap);

  svg.attr("viewBox", `0 0 ${width} ${height}`);

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const maxV = d3.max(data, d => d.value);
  const x = d3.scaleLinear()
    .domain([0, Math.ceil(maxV / 10000) * 10000])
    .range([0, innerW]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.group))
    .range([0, innerH])
    .paddingInner(0.35);

  // Gridlines (vertical)
  g.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(13).tickSize(-innerH).tickFormat(""));

  // X axis
  const gx = g.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(13).tickFormat(d => fmt(d)));

  gx.selectAll("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-45)")
    .attr("dx", "-0.45em")
    .attr("dy", "0.85em");

  // Y labels
  g.append("g")
    .attr("class", "axis y-axis")
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll("text")
    .attr("dx", "-0.4em");

  // Bars
  const bars = g.append("g")
    .selectAll("rect")
    .data(data, d => d.group)
    .join("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", d => y(d.group))
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.value));

  // Value boxes
  const tags = g.append("g")
    .selectAll(".value-tag")
    .data(data, d => d.group)
    .join("g")
    .attr("class", "value-tag")
    .attr("transform", d => `translate(${x(d.value)},${y(d.group) + y.bandwidth()/2})`);

  tags.each(function(d){
    const gg = d3.select(this);
    const t = gg.append("text")
      .attr("x", -10)
      .attr("y", 6)
      .attr("text-anchor", "end")
      .text(fmt(d.value));

    const bb = t.node().getBBox();
    const padX = 12, padY = 8;

    gg.insert("rect", "text")
      .attr("x", bb.x - padX)
      .attr("y", bb.y - padY)
      .attr("width", bb.width + padX*2)
      .attr("height", bb.height + padY*2);

    // keep inside right edge
    const endX = x(d.value);
    const overflow = (endX + 6) - innerW;
    const shiftLeft = Math.max(0, overflow);
    gg.attr("transform", `translate(${endX - shiftLeft},${y(d.group) + y.bandwidth()/2})`);
  });

  // --- Anchored tooltip positioning helper ---
  function showAnchoredTooltip(d, anchorSvgX, anchorSvgY) {
    // Convert the anchor point from SVG space to viewport coordinates
    const svgRect = svg.node().getBoundingClientRect();
    const viewBox = svg.attr("viewBox").split(" ").map(Number); // [0,0,w,h]
    const vbW = viewBox[2], vbH = viewBox[3];

    // Scale from viewBox units to pixels
    const pxX = svgRect.left + (anchorSvgX / vbW) * svgRect.width;
    const pxY = svgRect.top  + (anchorSvgY / vbH) * svgRect.height;

    ttLabel.text(`${d.group}:`);
    ttValue.text(fmt(d.value));

    tooltip
      .style("left", pxX + "px")
      .style("top",  pxY + "px")
      .style("opacity", 1)
      .attr("aria-hidden", "false");
  }

  function hideTooltip(){
    tooltip.style("opacity", 0).attr("aria-hidden", "true");
  }

  // Hit areas for hover, and anchor tooltip near bar end
  g.append("g")
    .selectAll(".hit")
    .data(data, d => d.group)
    .join("rect")
    .attr("class", "hit")
    .attr("x", 0)
    .attr("y", d => y(d.group))
    .attr("width", innerW)
    .attr("height", y.bandwidth())
    .attr("fill", "transparent")
    .on("mouseenter", (event, d) => {
      const endX = x(d.value);
      const midY = y(d.group) + y.bandwidth()/2;

      // anchor slightly *before* the end so the tooltip sits centered like screenshot
      const anchorX = margin.left + Math.min(endX, innerW) - 30;
      const anchorY = margin.top + midY;

      // pass anchor in full-SVG coordinates
      showAnchoredTooltip(d, anchorX, anchorY);
    })
    .on("mouseleave", hideTooltip);
}

let t=null;
window.addEventListener("resize", () => {
  clearTimeout(t);
  t=setTimeout(render, 120);
});

render();