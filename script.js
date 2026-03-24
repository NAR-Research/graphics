const dashboardData = {
  stats: [
    { kicker: "Housing", label: "Homeownership rate", value: 29.8 },
    { kicker: "Mobility", label: "Moved within state", value: 56.5 },
    { kicker: "Local", label: "Moved within county", value: 7.1 },
    { kicker: "Interstate", label: "Moved from a different state", value: 36.4 }
  ],
  originAreas: [
    { area: "Charlotte-Concord-Gastonia, NC-SC", value: 7.5, highlight: true },
    { area: "Orangeburg, SC", value: 7.4, highlight: false },
    { area: "Columbia, SC", value: 7.4, highlight: false },
    { area: "Williamsport, PA", value: 5.5, highlight: false },
    { area: "Lock Haven, PA", value: 5.5, highlight: false }
  ],
  destinationAreas: [
    { area: "Greenville-Anderson, SC", value: 19.5, highlight: true },
    { area: "Orangeburg, SC", value: 13.6, highlight: false },
    { area: "Deltona-Daytona Beach-Ormond Beach, FL", value: 13.3, highlight: false },
    { area: "Virginia Beach-Norfolk-Newport News, VA-NC", value: 7.3, highlight: false },
    { area: "Columbia, SC", value: 6.9, highlight: false }
  ],
  age: [
    { group: "Less than 25", value: 20.6, highlight: false },
    { group: "25–34", value: 34.2, highlight: true },
    { group: "35–44", value: 16.2, highlight: false },
    { group: "45–54", value: 11.7, highlight: false },
    { group: "55–64", value: 8.0, highlight: false },
    { group: "65+", value: 9.3, highlight: false }
  ],
  income: [
    { group: "Less than $50K", value: 31.2, highlight: false },
    { group: "$50K–$100K", value: 31.7, highlight: true },
    { group: "$100K–$150K", value: 17.9, highlight: false },
    { group: "$150K–$200K", value: 9.8, highlight: false },
    { group: "$200K–$500K", value: 7.1, highlight: false },
    { group: "$500K+", value: 2.3, highlight: false }
  ]
};

const tooltip = d3.select("#tooltip");

function showTooltip(event, title, value, extra = "") {
  tooltip
    .html(`
      <div class="tooltip-title">${title}</div>
      <div><span class="tooltip-value">${value}</span>${extra ? `<br>${extra}` : ""}</div>
    `)
    .style("left", `${event.pageX + 10}px`)
    .style("top", `${event.pageY - 18}px`)
    .classed("show", true);
}

function moveTooltip(event) {
  tooltip
    .style("left", `${event.pageX + 10}px`)
    .style("top", `${event.pageY - 18}px`);
}

function hideTooltip() {
  tooltip.classed("show", false);
}

function wrapText(text, width) {
  text.each(function () {
    const textSel = d3.select(this);
    const words = textSel.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.08;
    const y = textSel.attr("y");
    const dy = parseFloat(textSel.attr("dy") || 0);
    let tspan = textSel.text(null)
      .append("tspan")
      .attr("x", textSel.attr("x"))
      .attr("y", y)
      .attr("dy", `${dy}em`);

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = textSel.append("tspan")
          .attr("x", textSel.attr("x"))
          .attr("y", y)
          .attr("dy", `${++lineNumber * lineHeight + dy}em`)
          .text(word);
      }
    }
  });
}

function renderStats() {
  const grid = d3.select("#statsGrid");
  grid.selectAll("*").remove();

  const cards = grid.selectAll(".stat-card")
    .data(dashboardData.stats)
    .enter()
    .append("div")
    .attr("class", "stat-card");

  cards.append("div")
    .attr("class", "stat-kicker")
    .text(d => d.kicker);

  cards.append("div")
    .attr("class", "stat-value")
    .text(d => `${d.value}%`);

  cards.append("div")
    .attr("class", "stat-label")
    .text(d => d.label);
}

function addDefs(svg, prefix, horizontal = true) {
  const defs = svg.append("defs");

  const blueGradient = defs.append("linearGradient")
    .attr("id", `${prefix}-blueGradient`)
    .attr("x1", "0%")
    .attr("x2", horizontal ? "100%" : "0%")
    .attr("y1", "0%")
    .attr("y2", horizontal ? "0%" : "100%");

  blueGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#4788d2");

  blueGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#1f5fa5");

  const grayGradient = defs.append("linearGradient")
    .attr("id", `${prefix}-grayGradient`)
    .attr("x1", "0%")
    .attr("x2", horizontal ? "100%" : "0%")
    .attr("y1", "0%")
    .attr("y2", horizontal ? "0%" : "100%");

  grayGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#cbc2bc");

  grayGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#b5aca5");

  const glow = defs.append("filter")
    .attr("id", `${prefix}-glow`)
    .attr("x", "-30%")
    .attr("y", "-30%")
    .attr("width", "160%")
    .attr("height", "180%");

  glow.append("feDropShadow")
    .attr("dx", 0)
    .attr("dy", 2)
    .attr("stdDeviation", 2.5)
    .attr("flood-color", "rgba(31,95,165,0.24)");
}

function attachBarHover(selection, prefix, formatter) {
  selection
    .on("mouseenter", function (event, d) {
      const allBars = d3.select(this.parentNode).selectAll(".bar");
      allBars.classed("dimmed", true);
      d3.select(this).classed("dimmed", false).attr("filter", `url(#${prefix}-glow)`);
      showTooltip(event, formatter.title(d), formatter.value(d), formatter.extra(d));
    })
    .on("mousemove", moveTooltip)
    .on("mouseleave", function () {
      const allBars = d3.select(this.parentNode).selectAll(".bar");
      allBars.classed("dimmed", false);
      d3.select(this).attr("filter", null);
      hideTooltip();
    });
}

function renderHorizontalBarChart({ selector, data, align }) {
  d3.select(selector).selectAll("*").remove();

  const container = d3.select(selector);
  const width = container.node().getBoundingClientRect().width || 420;
  const height = 215;
  const margin = align === "left"
    ? { top: 3, right: 8, bottom: 3, left: 42 }
    : { top: 3, right: 40, bottom: 3, left: 8 };

  const labelZone = 128;
  const chartWidth = width - margin.left - margin.right - labelZone;
  const rowGap = 40;
  const barHeight = 26;

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const prefix = selector.replace("#", "");
  addDefs(svg, prefix, true);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const maxVal = d3.max(data, d => d.value);
  const x = d3.scaleLinear()
    .domain([0, maxVal * 1.18])
    .range([0, chartWidth]);

  data.forEach((d, i) => {
    const y = i * rowGap;

    if (align === "left") {
      g.append("text")
        .attr("x", -5)
        .attr("y", y + barHeight / 2 + 4)
        .attr("text-anchor", "end")
        .attr("class", "percent-label")
        .text(`${d.value}%`);

      g.append("rect")
        .attr("class", "bar-bg")
        .attr("x", 0)
        .attr("y", y + 3)
        .attr("width", chartWidth)
        .attr("height", barHeight)
        .attr("rx", 6);

      const bar = g.append("rect")
        .datum(d)
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", y + 3)
        .attr("width", 0)
        .attr("height", barHeight)
        .attr("rx", 6)
        .attr("fill", d.highlight ? `url(#${prefix}-blueGradient)` : `url(#${prefix}-grayGradient)`);

      bar.transition()
        .duration(650)
        .delay(i * 45)
        .ease(d3.easeCubicOut)
        .attr("width", x(d.value));

      const label = g.append("text")
        .attr("class", "category-label")
        .attr("x", chartWidth + 8)
        .attr("y", y + 15)
        .attr("text-anchor", "start")
        .text(d.area);

      wrapText(label, labelZone - 12);

      attachBarHover(bar, prefix, {
        title: d => d.area,
        value: d => `${d.value}%`,
        extra: () => "Share of origin moves"
      });

    } else {
      const label = g.append("text")
        .attr("class", "category-label")
        .attr("x", labelZone - 8)
        .attr("y", y + 15)
        .attr("text-anchor", "end")
        .text(d.area);

      wrapText(label, labelZone - 12);

      g.append("rect")
        .attr("class", "bar-bg")
        .attr("x", labelZone)
        .attr("y", y + 3)
        .attr("width", chartWidth)
        .attr("height", barHeight)
        .attr("rx", 6);

      const bar = g.append("rect")
        .datum(d)
        .attr("class", "bar")
        .attr("x", labelZone)
        .attr("y", y + 3)
        .attr("width", 0)
        .attr("height", barHeight)
        .attr("rx", 6)
        .attr("fill", d.highlight ? `url(#${prefix}-blueGradient)` : `url(#${prefix}-grayGradient)`);

      bar.transition()
        .duration(650)
        .delay(i * 45)
        .ease(d3.easeCubicOut)
        .attr("width", x(d.value));

      g.append("text")
        .attr("class", "percent-label")
        .attr("x", labelZone + x(d.value) + 5)
        .attr("y", y + barHeight / 2 + 4)
        .attr("text-anchor", "start")
        .text(`${d.value}%`);

      attachBarHover(bar, prefix, {
        title: d => d.area,
        value: d => `${d.value}%`,
        extra: () => "Share of destination moves"
      });
    }
  });
}

function renderVerticalBarChart({ selector, data, yMax, tooltipExtra }) {
  d3.select(selector).selectAll("*").remove();

  const container = d3.select(selector);
  const width = container.node().getBoundingClientRect().width || 420;
  const isMobile = window.innerWidth <= 560;
  const isIncomeChart = selector === "#incomeChart";
  const shouldRotateMobileLabels = isMobile && isIncomeChart;

  let height = 165;
  let bottomMargin = 36;

  if (isMobile) {
    if (isIncomeChart) {
      height = 220;
      bottomMargin = 84;
    } else {
      height = 180;
      bottomMargin = 46;
    }
  }

  const margin = { top: 11, right: 5, bottom: bottomMargin, left: 5 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const prefix = selector.replace("#", "");
  addDefs(svg, prefix, false);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.group))
    .range([0, innerWidth])
    .padding(isMobile ? 0.32 : 0.28);

  const y = d3.scaleLinear()
    .domain([0, yMax])
    .range([innerHeight, 0]);

  const grid = d3.axisLeft(y)
    .tickValues([0, 10, 20, 30])
    .tickSize(-innerWidth)
    .tickFormat("");

  g.append("g")
    .attr("class", "grid")
    .call(grid);

  const bars = g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.group))
    .attr("y", innerHeight)
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("rx", 7)
    .attr("fill", d => d.highlight ? `url(#${prefix}-blueGradient)` : `url(#${prefix}-grayGradient)`);

  bars.transition()
    .duration(700)
    .delay((d, i) => i * 45)
    .ease(d3.easeCubicOut)
    .attr("y", d => y(d.value))
    .attr("height", d => innerHeight - y(d.value));

  g.selectAll(".value-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "percent-label")
    .attr("x", d => x(d.group) + x.bandwidth() / 2)
    .attr("y", d => y(d.value) - 5)
    .attr("text-anchor", "middle")
    .style("opacity", 0)
    .text(d => `${d.value}%`)
    .transition()
    .duration(260)
    .delay((d, i) => 300 + i * 45)
    .style("opacity", 1);

  const labels = g.selectAll(".x-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", shouldRotateMobileLabels ? "category-label rotated-mobile" : "category-label")
    .attr("x", d => x(d.group) + x.bandwidth() / 2)
    .attr("y", shouldRotateMobileLabels ? innerHeight + 16 : innerHeight + 12)
    .attr("text-anchor", shouldRotateMobileLabels ? "end" : "middle")
    .text(d => d.group);

  if (shouldRotateMobileLabels) {
    labels
      .attr("transform", d => {
        const xPos = x(d.group) + x.bandwidth() / 2;
        const yPos = innerHeight + 16;
        return `rotate(-45, ${xPos}, ${yPos})`;
      });
  } else {
    wrapText(labels, x.bandwidth() + 6);
  }

  attachBarHover(bars, prefix, {
    title: d => d.group,
    value: d => `${d.value}%`,
    extra: () => tooltipExtra
  });
}

function renderAllCharts() {
  renderStats();

  renderHorizontalBarChart({
    selector: "#originChart",
    data: dashboardData.originAreas,
    align: "left"
  });

  renderHorizontalBarChart({
    selector: "#destinationChart",
    data: dashboardData.destinationAreas,
    align: "right"
  });

  renderVerticalBarChart({
    selector: "#ageChart",
    data: dashboardData.age,
    yMax: 36,
    tooltipExtra: "Share of movers by age"
  });

  renderVerticalBarChart({
    selector: "#incomeChart",
    data: dashboardData.income,
    yMax: 34,
    tooltipExtra: "Share of movers by income"
  });
}

function initToggle() {
  const buttons = document.querySelectorAll(".toggle-btn");
  const originPanel = document.getElementById("originPanel");
  const destinationPanel = document.getElementById("destinationPanel");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const mode = btn.dataset.mode;

      if (mode === "both") {
        originPanel.classList.remove("hidden-panel");
        destinationPanel.classList.remove("hidden-panel");
      } else if (mode === "origin") {
        originPanel.classList.remove("hidden-panel");
        destinationPanel.classList.add("hidden-panel");
      } else if (mode === "destination") {
        originPanel.classList.add("hidden-panel");
        destinationPanel.classList.remove("hidden-panel");
      }

      setTimeout(() => {
        renderAllCharts();
      }, 30);
    });
  });
}

renderAllCharts();
initToggle();

window.addEventListener("resize", () => {
  renderAllCharts();
});