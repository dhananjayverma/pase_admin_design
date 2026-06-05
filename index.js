// Immediately apply the saved theme (light or dark) on load to prevent theme flash.
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-theme");
}

// DATA: Cluster Overview cards (#clusterGrid).
const clusters = [
  { name: "Engineering", students: "38,240", departments: 12, courses: 562, color: "#ff5d66", icon: "icon-building" },
  { name: "Management", students: "14,760", departments: 6, courses: 238, color: "#297dff", icon: "icon-users" },
  { name: "Sciences", students: "7,450", departments: 6, courses: 132, color: "#ff781b", icon: "icon-flask" },
  { name: "Liberal Arts", students: "5,680", departments: 5, courses: 118, color: "#954de6", icon: "icon-book" },
];

// DATA: Filter bar options and dependencies (#clusterFilter, #instituteFilter, #programFilter, #courseFilter, #semesterFilter).
const filterRecords = [
  {
    cluster: "Engineering",
    institute: "University Institute of Engineering",
    program: "B.Tech CSE",
    course: "Probability and Statistics",
    semester: "Semester 3",
  },
  {
    cluster: "Engineering",
    institute: "University Institute of Engineering",
    program: "B.Tech Mechanical",
    course: "Engineering Thermodynamics",
    semester: "Semester 4",
  },
  {
    cluster: "Engineering",
    institute: "University Institute of Computing",
    program: "BCA",
    course: "Mobile App Development",
    semester: "Semester 5",
  },
  {
    cluster: "Engineering",
    institute: "University Institute of Computing",
    program: "MCA",
    course: "Cloud Computing",
    semester: "Semester 2",
  },
  {
    cluster: "Management",
    institute: "University School of Business",
    program: "MBA",
    course: "Business Analytics",
    semester: "Semester 1",
  },
  {
    cluster: "Management",
    institute: "University School of Business",
    program: "BBA",
    course: "Marketing Management",
    semester: "Semester 3",
  },
  {
    cluster: "Sciences",
    institute: "Institute of Sciences",
    program: "B.Sc Physics",
    course: "Quantum Mechanics",
    semester: "Semester 5",
  },
  {
    cluster: "Sciences",
    institute: "Institute of Sciences",
    program: "B.Sc Chemistry",
    course: "Organic Chemistry",
    semester: "Semester 4",
  },
  {
    cluster: "Liberal Arts",
    institute: "Institute of Liberal Arts",
    program: "BA",
    course: "Communication Theory",
    semester: "Semester 1",
  },
  {
    cluster: "Liberal Arts",
    institute: "Institute of Liberal Arts",
    program: "MA",
    course: "Cognitive Psychology",
    semester: "Semester 2",
  },
];

// DATA: Student Access Pattern line chart (#lineChart).
const lineSeries = [
  { label: "Course Accesses", color: "#18c8f4", values: [18500, 20500, 19800, 21800, 19200, 11200, 9800] },
  { label: "Content Views", color: "#12c6b2", values: [13500, 15500, 14900, 16200, 14100, 8200, 7000] },
];

// DATA: Top Departments by Enrollment table (#departmentRows).
const departments = [
  ["Computer Science Engineering", "12,245", 156, 89],
  ["MBA", "5,842", 78, 85],
  ["Mechanical Engineering", "4,215", 64, 82],
  ["B.Pharmacy", "3,256", 48, 80],
  ["BBA", "2,985", 42, 78],
];

// DATA: Cluster Comparison table (#clusterComparisonRows) and grouped bar chart (#clusterComparisonChart).
const clusterComparisonRows = [
  { name: "Engineering", students: "38,240", engagement: 84, atRisk: 398, avgScore: 82, coPo: 88 },
  { name: "Management", students: "14,760", engagement: 70, atRisk: 520, avgScore: 68, coPo: 70 },
  { name: "Sciences", students: "7,450", engagement: 80, atRisk: 285, avgScore: 78, coPo: 82 },
  { name: "Liberal Arts", students: "5,680", engagement: 76, atRisk: 275, avgScore: 74, coPo: 74 },
];

// DATA: Metrics shown as bars in the Cluster Comparison Chart.
const clusterComparisonSeries = [
  { key: "engagement", label: "Engagement", color: "#12c6b2" },
  { key: "avgScore", label: "Avg Score", color: "#1f87ff" },
  { key: "coPo", label: "CO-PO", color: "#f59e0b" },
];

// DATA: Student Engagement Heatmap table (#heatmapTable).
const heatmapRows = [
  ["CS-DEPT", 85, 78, 72, 68, 82, 75],
  ["ME-DEPT", 72, 68, 65, 55, 70, 80],
  ["EE-DEPT", 78, 75, 70, 62, 76, 72],
  ["CE-DEPT", 65, 62, 60, 52, 68, 70],
  ["EC-DEPT", 82, 80, 78, 72, 85, 70],
  ["IT-DEPT", 88, 85, 82, 78, 88, 80],
  ["AIML-DEPT", 90, 88, 85, 82, 90, 85],
  ["DS-DEPT", 86, 82, 80, 75, 85, 82],
];

const heatmapColumns = ["", "VIDEOS", "ASSIGNMENTS", "QUIZZES", "FORUMS", "LECTURE NOTES", "PROJECTS"];

// DATA: Activity Completion by Department chart. Derived from the Student Engagement Heatmap data above.
const stackedActivityColors = ["#1889aa", "#f5a23a", "#704ee6", "#55c8c2", "#9bd81c", "#de8200"];
const stackedActivitySeries = heatmapColumns.slice(1).map((label, index) => ({
  label: label
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()),
  color: stackedActivityColors[index],
}));

const stackedActivityRows = heatmapRows.map(([label, ...values]) => ({ label, values }));

// Utility helpers: DOM lookup and SVG node creation used by all render functions.
const $ = (selector) => document.querySelector(selector);
const svgEl = (name, attrs = {}) => {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
};

// Custom dropdown behavior for the filter bar.
function closeCustomSelects(exceptField) {
  document.querySelectorAll(".filter-field.is-open").forEach((field) => {
    if (field !== exceptField) {
      field.classList.remove("is-open");
      field.querySelector(".custom-select-trigger")?.setAttribute("aria-expanded", "false");
    }
  });
}

function syncCustomSelect(select) {
  const field = select.closest(".filter-field");
  const customSelect = field?.querySelector(".custom-select");
  if (!customSelect) return;

  const trigger = customSelect.querySelector(".custom-select-trigger");
  const menu = customSelect.querySelector(".custom-select-menu");
  const selectedOption = select.options[select.selectedIndex] || select.options[0];
  trigger.textContent = selectedOption?.textContent || "";
  trigger.setAttribute("aria-disabled", String(select.disabled));
  trigger.tabIndex = select.disabled ? -1 : 0;
  menu.innerHTML = "";

  Array.from(select.options).forEach((option, index) => {
    const item = document.createElement("li");
    item.className = `custom-select-option${option.value === select.value ? " is-selected" : ""}`;
    item.textContent = option.textContent;
    item.dataset.value = option.value;
    item.role = "option";
    item.tabIndex = -1;
    item.setAttribute("aria-selected", String(option.value === select.value));
    item.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (select.disabled) return;
      closeCustomSelects();
      select.selectedIndex = index;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    menu.appendChild(item);
  });
}

function moveCustomSelection(select, direction) {
  if (select.disabled) return;
  const nextIndex = Math.min(Math.max(select.selectedIndex + direction, 0), select.options.length - 1);
  if (nextIndex === select.selectedIndex) return;
  select.selectedIndex = nextIndex;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

function enhanceFilterDropdowns() {
  document.querySelectorAll(".filter-bar select").forEach((select) => {
    const field = select.closest(".filter-field");
    const customSelect = document.createElement("span");
    customSelect.className = "custom-select";
    customSelect.innerHTML = `
      <span class="custom-select-trigger" role="combobox" aria-expanded="false" aria-haspopup="listbox" tabindex="0"></span>
      <span class="custom-select-chevron" aria-hidden="true"></span>
      <ul class="custom-select-menu" role="listbox"></ul>
    `;
    select.after(customSelect);

    const trigger = customSelect.querySelector(".custom-select-trigger");
    const toggleSelect = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (select.disabled) return;
      const shouldOpen = !field.classList.contains("is-open");
      closeCustomSelects(field);
      field.classList.toggle("is-open", shouldOpen);
      trigger.setAttribute("aria-expanded", String(shouldOpen));
    };

    trigger.addEventListener("click", toggleSelect);
    field.addEventListener("click", (event) => {
      if (event.target.closest(".custom-select-menu")) return;
      toggleSelect(event);
    });
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleSelect(event);
      }

      if (event.key === "Escape") {
        closeCustomSelects();
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        moveCustomSelection(select, event.key === "ArrowDown" ? 1 : -1);
      }
    });

    select.addEventListener("change", () => closeCustomSelects());
    syncCustomSelect(select);
  });

  document.addEventListener("click", () => closeCustomSelects());
}

// Cluster overview renderer: creates the cards inside #clusterGrid.
function renderClusters(activeClusterNames = clusters.map((cluster) => cluster.name)) {
  const grid = $("#clusterGrid");
  if (!grid) return;
  grid.innerHTML = "";

  clusters.forEach((cluster) => {
    const isActive = activeClusterNames.includes(cluster.name);
    const card = document.createElement("article");
    card.className = `cluster-card${isActive ? "" : " is-disabled"}`;
    card.style.setProperty("--accent", cluster.color);
    card.innerHTML = `
      <div class="cluster-title">
        <span class="cluster-icon" style="background:${cluster.color}">
          <svg><use href="#${cluster.icon}"></use></svg>
        </span>
        <span>${cluster.name}</span>
      </div>
      <div class="cluster-metric"><span>Students</span><strong>${cluster.students}</strong></div>
      <div class="cluster-metric"><span>Departments</span><strong>${cluster.departments}</strong></div>
      <div class="cluster-metric"><span>Courses</span><strong>${cluster.courses}</strong></div>
    `;
    grid.appendChild(card);
  });
}

// Filter helpers: populate dropdown options and enable/disable dependent filters.
function setSelectOptions(select, placeholder, values) {
  const currentValue = select.value;
  const uniqueValues = [...new Set(values)];
  select.innerHTML = `<option value="">${placeholder}</option>`;
  uniqueValues.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  if (uniqueValues.includes(currentValue)) {
    select.value = currentValue;
  }

  syncCustomSelect(select);
}

function setFilterState(select, isEnabled) {
  if (!isEnabled) {
    select.value = "";
  }

  select.disabled = !isEnabled;
  select.closest(".filter-field").classList.toggle("is-disabled", !isEnabled);
  syncCustomSelect(select);
}

const filterControls = {
  cluster: { selector: "#clusterFilter", placeholder: "All Clusters" },
  institute: { selector: "#instituteFilter", placeholder: "All Institutes" },
  program: { selector: "#programFilter", placeholder: "All Programs" },
  course: { selector: "#courseFilter", placeholder: "All Courses" },
  semester: { selector: "#semesterFilter", placeholder: "All Semesters" },
};

const filterLabels = {
  cluster: "Cluster",
  institute: "Institute",
  program: "Program",
  course: "Course",
  semester: "Semester",
};

function getFilterSelections() {
  return Object.fromEntries(
    Object.entries(filterControls).map(([key, config]) => {
      const select = $(config.selector);
      return [key, select && select.disabled ? "" : select?.value || ""];
    })
  );
}

function recordMatchesSelections(record, selections, ignoredKey = "") {
  return Object.entries(selections).every(([key, value]) => !value || key === ignoredKey || record[key] === value);
}

function getFilterValues(key, selections) {
  return filterRecords
    .filter((record) => recordMatchesSelections(record, selections, key))
    .map((record) => record[key]);
}

function clusterMatchesFilters(clusterName) {
  const selections = getFilterSelections();
  return filterRecords.some(
    (record) => record.cluster === clusterName && recordMatchesSelections(record, selections)
  );
}

function applyFilters() {
  const refreshOptions = () => {
    const selections = getFilterSelections();
    const hasCluster = Boolean(selections.cluster);

    Object.entries(filterControls).forEach(([key, config]) => {
      const select = $(config.selector);
      if (!select) return;
      setSelectOptions(select, config.placeholder, getFilterValues(key, selections));
      setFilterState(select, key === "cluster" || hasCluster);
    });
  };

  refreshOptions();
  refreshOptions();

  const activeClusterNames = clusters.filter((cluster) => clusterMatchesFilters(cluster.name)).map((cluster) => cluster.name);
  renderClusters(activeClusterNames);
}

function initFilters() {
  Object.values(filterControls).forEach((config) => {
    $(config.selector)?.addEventListener("change", applyFilters);
  });

  applyFilters();
}

// Renderer: Active filter chips shown below the filter bar.
function initActiveFilterChips() {
  const filterSelects = document.querySelectorAll('[data-filter-name]');
  const activeFilterChips = document.getElementById('activeFilterChips');
  const activeFilterRow = document.querySelector('.active-filter-row');
  const resetButton = document.getElementById('resetFilters');

  if (!filterSelects.length || !activeFilterChips || !activeFilterRow || !resetButton) return;

  function updateActiveFilters() {
    activeFilterChips.innerHTML = '';
    const filters = [];

    filterSelects.forEach(select => {
      const value = select.value;
      const name = select.getAttribute('data-filter-name');
      if (value) {
        filters.push({ name, value, id: select.id });
      }
    });

    if (filters.length === 0) {
      activeFilterRow.style.display = 'none';
      return;
    }

    activeFilterRow.style.display = 'flex';

    filters.forEach(filter => {
      const chip = document.createElement('span');
      chip.className = 'active-filter-chip';
      chip.innerHTML = `
        <span>${filter.name}: ${filter.value}</span>
        <button type="button" class="chip-remove-btn" data-filter-id="${filter.id}" aria-label="Remove ${filter.name} filter">×</button>
      `;
      activeFilterChips.appendChild(chip);
    });

    activeFilterChips.querySelectorAll('.chip-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filterId = e.currentTarget.getAttribute('data-filter-id');
        const select = document.getElementById(filterId);
        if (select) {
          select.value = '';
          applyFilters();
          updateActiveFilters();
        }
      });
    });
  }

  filterSelects.forEach(select => {
    select.addEventListener('change', updateActiveFilters);
  });

  resetButton.addEventListener('click', () => {
    filterSelects.forEach(select => {
      select.value = '';
    });
    applyFilters();
    updateActiveFilters();
  });

  updateActiveFilters();
}

// Renderer: Student Access Pattern line chart (#lineChart), using lineSeries data.
function renderLineChart() {
  const svg = $("#lineChart");
  if (!svg) return;

  svg.replaceChildren();
  const frame = svg.closest(".chart-frame");
  const width = Math.max(420, Math.round(frame?.clientWidth || 680));
  const height = Math.max(260, Math.round(frame?.clientHeight || 430));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const padding = { top: 18, right: 18, bottom: 34, left: 46 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = 22000;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const defs = svgEl("defs");
  lineSeries.forEach((series, index) => {
    const gradient = svgEl("linearGradient", { id: `lineFill${index}`, x1: "0", x2: "0", y1: "0", y2: "1" });
    gradient.appendChild(svgEl("stop", { offset: "0%", "stop-color": series.color, "stop-opacity": "0.18" }));
    gradient.appendChild(svgEl("stop", { offset: "100%", "stop-color": series.color, "stop-opacity": "0" }));
    defs.appendChild(gradient);
  });
  svg.appendChild(defs);

  [0, 6000, 11000, 17000, 22000].forEach((tick) => {
    const y = padding.top + chartHeight - (tick / maxValue) * chartHeight;
    svg.appendChild(svgEl("line", { x1: padding.left, x2: width - padding.right, y1: y, y2: y, class: "grid-line" }));
    const text = svgEl("text", { x: 10, y: y + 4, class: "chart-label" });
    text.textContent = tick === 0 ? "0" : `${Math.round(tick / 1000)}k`;
    svg.appendChild(text);
  });

  days.forEach((day, index) => {
    const x = padding.left + (index / (days.length - 1)) * chartWidth;
    const text = svgEl("text", { x, y: height - 12, "text-anchor": "middle", class: "chart-label" });
    text.textContent = day;
    svg.appendChild(text);
  });

  lineSeries.forEach((series, index) => {
    const points = series.values.map((value, pointIndex) => ({
      x: padding.left + (pointIndex / (series.values.length - 1)) * chartWidth,
      y: padding.top + chartHeight - (value / maxValue) * chartHeight,
    }));

    const pathData = points.reduce((path, point, pointIndex) => {
      if (pointIndex === 0) return `M ${point.x} ${point.y}`;
      const previous = points[pointIndex - 1];
      const controlX = (previous.x + point.x) / 2;
      return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
    }, "");

    const areaPath = `${pathData} L ${points.at(-1).x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
    svg.appendChild(svgEl("path", { d: areaPath, fill: `url(#lineFill${index})` }));
    svg.appendChild(svgEl("path", { d: pathData, fill: "none", stroke: series.color, "stroke-width": 3.2, "stroke-linecap": "round" }));
  });
}

let lineChartResizeFrame = null;
window.addEventListener("resize", () => {
  cancelAnimationFrame(lineChartResizeFrame);
  lineChartResizeFrame = requestAnimationFrame(() => {
    renderLineChart();
    renderClusterComparisonChart();
  });
});

// Renderer: Top Departments table (#departmentRows), using departments data.
function renderDepartmentTable() {
  const body = $("#departmentRows");
  if (!body) return;

  departments.forEach(([name, students, courses, completion]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${name}</td>
      <td>${students}</td>
      <td>${courses}</td>
      <td><span class="progress"><span>${completion}%</span><span class="bar-track"><i class="bar-fill" style="width:${completion}%"></i></span></span></td>
    `;
    body.appendChild(row);
  });
}

// Renderer: Cluster Comparison table (#clusterComparisonRows), then refreshes the matching bar chart.
function renderClusterComparison() {
  const body = $("#clusterComparisonRows");
  const count = $("#clusterComparisonCount");
  if (!body) return;

  body.replaceChildren();
  if (count) count.textContent = `${clusterComparisonRows.length} clusters`;

  clusterComparisonRows.forEach((cluster) => {
    const progressClass = cluster.coPo < 80 ? " warn" : "";
    const engagementClass = cluster.engagement < 75 ? "metric-warning" : "metric-good";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${cluster.name}</td>
      <td>${cluster.students}</td>
      <td class="${engagementClass}">${cluster.engagement}%</td>
      <td class="metric-risk">${cluster.atRisk}</td>
      <td>${cluster.avgScore}%</td>
      <td><span class="comparison-progress${progressClass}"><i style="width: ${cluster.coPo}%"></i></span>${cluster.coPo}%</td>
    `;
    body.appendChild(row);
  });

  renderClusterComparisonChart();
}

// Renderer: Cluster Comparison grouped bar chart (#clusterComparisonChart), using clusterComparisonRows and clusterComparisonSeries.
function renderClusterComparisonChart() {
  const svg = $("#clusterComparisonChart");
  if (!svg) return;

  svg.replaceChildren();
  const chartRows = clusterComparisonRows;
  const chartSeries = clusterComparisonSeries;
  if (!chartRows.length || !chartSeries.length) return;
  const frame = svg.closest(".comparison-chart-frame");
  const tooltip = $("#clusterComparisonTooltip");
  const width = Math.max(620, Math.round(frame?.clientWidth || 720));
  const height = Math.max(360, Math.round(frame?.clientHeight || 430));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const padding = { top: 48, right: 22, bottom: 52, left: 52 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const yTicks = Array.from({ length: 11 }, (_, index) => index * 10);
  const groupWidth = chartWidth / chartRows.length;
  const barGap = 8;
  const barWidth = Math.min(34, Math.max(14, (groupWidth * 0.58 - barGap * (chartSeries.length - 1)) / chartSeries.length));
  const groupBarsWidth = chartSeries.length * barWidth + (chartSeries.length - 1) * barGap;
  const yFor = (value) => padding.top + chartHeight - (value / 100) * chartHeight;
  let activeValue = null;

  const legend = svgEl("g", { class: "cluster-chart-legend" });
  let legendX = padding.left;
  chartSeries.forEach((series) => {
    legend.appendChild(svgEl("rect", { x: legendX, y: 13, width: 11, height: 11, rx: 2, fill: series.color }));
    const label = svgEl("text", { x: legendX + 18, y: 23, class: "cluster-chart-legend-label" });
    label.textContent = series.label;
    legend.appendChild(label);
    legendX += 102;
  });
  svg.appendChild(legend);

  yTicks.forEach((tick) => {
    const y = yFor(tick);
    svg.appendChild(svgEl("line", { x1: padding.left, x2: width - padding.right, y1: y, y2: y, class: "cluster-chart-grid" }));
    const text = svgEl("text", { x: 10, y: y + 4, class: "cluster-chart-label" });
    text.textContent = tick;
    svg.appendChild(text);
  });
  svg.appendChild(svgEl("line", { x1: padding.left, x2: padding.left, y1: padding.top, y2: padding.top + chartHeight, class: "cluster-chart-axis" }));
  svg.appendChild(svgEl("line", { x1: padding.left, x2: width - padding.right, y1: padding.top + chartHeight, y2: padding.top + chartHeight, class: "cluster-chart-axis" }));

  chartRows.forEach((row, index) => {
    const groupX = padding.left + index * groupWidth;
    const centerX = groupX + groupWidth / 2;
    svg.appendChild(svgEl("line", { x1: centerX, x2: centerX, y1: padding.top, y2: height - padding.bottom, class: "cluster-chart-grid vertical" }));
    const label = svgEl("text", {
      x: centerX,
      y: padding.top + chartHeight + 31,
      "text-anchor": "middle",
      class: "cluster-chart-label cluster-chart-x-label",
    });
    label.textContent = row.name;
    svg.appendChild(label);

    chartSeries.forEach((series, seriesIndex) => {
      const value = row[series.key];
      const barX = groupX + (groupWidth - groupBarsWidth) / 2 + seriesIndex * (barWidth + barGap);
      const barY = yFor(value);
      const rect = svgEl("rect", {
        x: barX,
        y: barY,
        width: barWidth,
        height: Math.max(1, padding.top + chartHeight - barY),
        rx: 3,
        fill: series.color,
        class: "cluster-bar",
      });
      rect.appendChild(svgEl("title"));
      rect.querySelector("title").textContent = `${row.name} ${series.label}: ${value}%`;
      svg.appendChild(rect);
    });
  });

  const overlay = svgEl("g", { class: "cluster-chart-overlay" });
  svg.appendChild(overlay);

  const clearHover = () => {
    activeValue = null;
    overlay.replaceChildren();
    if (tooltip) tooltip.classList.remove("is-visible");
  };

  const drawHover = (index, pointerX, pointerY) => {
    const row = chartRows[index];
    if (!row) return;
    const values = chartSeries.map((series) => row[series.key]);
    activeValue = values.reduce((closest, value) => (
      Math.abs(value - activeValue) < Math.abs(closest - activeValue) ? value : closest
    ), values[1]);

    overlay.replaceChildren();
    const groupX = padding.left + index * groupWidth;
    const centerX = groupX + groupWidth / 2;
    const y = yFor(activeValue);

    overlay.appendChild(svgEl("rect", {
      x: groupX + 8,
      y: padding.top,
      width: groupWidth - 16,
      height: chartHeight,
      class: "cluster-chart-band",
    }));
    overlay.appendChild(svgEl("line", { x1: centerX, x2: centerX, y1: padding.top, y2: padding.top + chartHeight, class: "cluster-chart-crosshair" }));
    overlay.appendChild(svgEl("line", { x1: padding.left, x2: width - padding.right, y1: y, y2: y, class: "cluster-chart-crosshair" }));
    overlay.appendChild(svgEl("rect", { x: 0, y: y - 12, width: 34, height: 24, rx: 5, class: "cluster-chart-value-box" }));
    const valueLabel = svgEl("text", { x: 17, y: y + 5, "text-anchor": "middle", class: "cluster-chart-value-label" });
    valueLabel.textContent = activeValue;
    overlay.appendChild(valueLabel);
    const bottomLabel = svgEl("text", { x: centerX, y: padding.top + chartHeight + 31, "text-anchor": "middle", class: "cluster-chart-hover-label" });
    bottomLabel.textContent = row.name;
    overlay.appendChild(bottomLabel);

    if (tooltip) {
      tooltip.innerHTML = `
        <strong>${row.name}</strong>
        ${chartSeries.map((series) => `
          <span><i style="border-color:${series.color}; background:${series.color}"></i><b>${series.label}:</b> ${row[series.key]}%</span>
        `).join("")}
      `;
      const frameRect = frame.getBoundingClientRect();
      const tooltipX = Math.min(Math.max(pointerX + 14, 12), frameRect.width - 176);
      const tooltipY = Math.min(Math.max(pointerY - 92, 12), frameRect.height - 128);
      tooltip.style.left = `${tooltipX}px`;
      tooltip.style.top = `${tooltipY}px`;
      tooltip.classList.add("is-visible");
    }
  };

  svg.onmousemove = (event) => {
    const bounds = svg.getBoundingClientRect();
    const pointerX = ((event.clientX - bounds.left) / bounds.width) * width;
    const pointerY = ((event.clientY - bounds.top) / bounds.height) * height;
    activeValue = Math.round(Math.max(0, Math.min(100, ((padding.top + chartHeight - pointerY) / chartHeight) * 100)));
    const index = Math.max(0, Math.min(chartRows.length - 1, Math.floor((pointerX - padding.left) / groupWidth)));
    if (pointerX < padding.left || pointerX > width - padding.right || pointerY < padding.top || pointerY > padding.top + chartHeight) {
      clearHover();
      return;
    }
    drawHover(index, event.clientX - frame.getBoundingClientRect().left, event.clientY - frame.getBoundingClientRect().top);
  };
  svg.onmouseleave = clearHover;
}

// Heatmap cell color helper: maps percentage values to RYG classes.
function cellClass(value, partialThreshold = 70) {
  if (value === null) return "cell-empty";
  if (value >= 70) return "cell-high";
  if (value >= partialThreshold) return "cell-partial";
  return "cell-low";
}

// Renderer: Generic matrix table builder. Used for the Student Engagement Heatmap (#heatmapTable).
function renderSimpleMatrix(tableSelector, columns, rows) {
  const table = $(tableSelector);
  if (!table) return;
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  thead.innerHTML = `<tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr>`;
  rows.forEach((rowData) => {
    const row = document.createElement("tr");
    rowData.forEach((value, index) => {
      const cell = document.createElement(index === 0 ? "th" : "td");
      if (index === 0) {
        cell.textContent = value;
      } else {
        const className = cellClass(value, 40);
        cell.innerHTML = `<span class="heat-cell ${className}">${value === null ? "-" : `${value}%`}</span>`;
      }
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
}

// Renderer: Activity Completion by Department stacked bar chart (#stackedBarChart).
function renderStackedBarChart() {
  const svg = $("#stackedBarChart");
  const tooltip = $("#stackedTooltip");
  if (!svg) return;
  svg.innerHTML = "";

  const width = 720;
  const height = 430;
  const padding = { top: 16, right: 20, bottom: 34, left: 128 };
  const chartWidth = width - padding.left - padding.right;
  const rowPitch = (height - padding.top - padding.bottom) / stackedActivityRows.length;
  const barHeight = 20;
  const maxValue = Math.ceil(
    Math.max(...stackedActivityRows.map((row) => row.values.reduce((sum, value) => sum + value, 0))) / 50
  ) * 50;

  const showStackedTooltip = (event, row) => {
    if (!tooltip) return;
    const total = row.values.reduce((sum, value) => sum + value, 0);
    tooltip.innerHTML = `
      <strong>${row.label}</strong>
      ${stackedActivitySeries
        .map(
          (series, index) => `
            <span><i style="background:${series.color}"></i><b>${series.label}:</b><em>${row.values[index]}%</em></span>
          `
        )
        .join("")}
      <span class="tooltip-total"><i></i><b>Total:</b><em>${total}</em></span>
    `;
    tooltip.classList.add("is-visible");

    const frameRect = tooltip.parentElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const pointerX = Number.isFinite(event.clientX) ? event.clientX - frameRect.left : frameRect.width / 2;
    const pointerY = Number.isFinite(event.clientY) ? event.clientY - frameRect.top : frameRect.height / 2;
    const left = Math.min(Math.max(pointerX + 16, 8), frameRect.width - tooltipRect.width - 8);
    const top = Math.min(Math.max(pointerY - tooltipRect.height / 2, 8), frameRect.height - tooltipRect.height - 8);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };

  const hideStackedTooltip = () => {
    tooltip?.classList.remove("is-visible");
  };

  Array.from({ length: Math.floor(maxValue / 100) + 1 }, (_, index) => index * 100).forEach((tick) => {
    const x = padding.left + (tick / maxValue) * chartWidth;
    svg.appendChild(svgEl("line", { x1: x, x2: x, y1: padding.top - 6, y2: height - padding.bottom, class: "grid-line" }));
    const text = svgEl("text", { x, y: height - 10, "text-anchor": "middle", class: "chart-label" });
    text.textContent = tick;
    svg.appendChild(text);
  });

  svg.appendChild(svgEl("line", { x1: padding.left, x2: padding.left, y1: padding.top - 6, y2: height - padding.bottom, class: "stacked-axis" }));
  svg.appendChild(svgEl("line", { x1: padding.left, x2: width - padding.right, y1: height - padding.bottom, y2: height - padding.bottom, class: "stacked-axis" }));

  stackedActivityRows.forEach((row, rowIndex) => {
    const rowGroup = svgEl("g", { class: "stacked-row", tabindex: "0" });
    const y = padding.top + rowIndex * rowPitch + (rowPitch - barHeight) / 2;
    const rowBand = svgEl("rect", {
      x: 0,
      y: padding.top + rowIndex * rowPitch,
      width,
      height: rowPitch,
      class: "stacked-row-band",
    });
    rowGroup.appendChild(rowBand);

    const label = svgEl("text", { x: 14, y: y + barHeight / 2 + 5, class: "stacked-label" });
    label.textContent = row.label;
    rowGroup.appendChild(label);

    let cursorX = padding.left;
    row.values.forEach((value, valueIndex) => {
      const segmentWidth = (value / maxValue) * chartWidth;
      const rect = svgEl("rect", {
        x: cursorX,
        y,
        width: Math.max(segmentWidth, 1.5),
        height: barHeight,
        fill: stackedActivitySeries[valueIndex].color,
        class: "stacked-segment",
      });
      rect.appendChild(svgEl("title"));
      rect.querySelector("title").textContent = `${row.label} - ${stackedActivitySeries[valueIndex].label}: ${value}`;
      rowGroup.appendChild(rect);
      cursorX += segmentWidth;
    });

    rowGroup.addEventListener("pointerenter", (event) => {
      rowGroup.classList.add("is-active");
      showStackedTooltip(event, row);
    });
    rowGroup.addEventListener("pointermove", (event) => showStackedTooltip(event, row));
    rowGroup.addEventListener("pointerleave", () => {
      rowGroup.classList.remove("is-active");
      hideStackedTooltip();
    });
    rowGroup.addEventListener("focus", (event) => {
      rowGroup.classList.add("is-active");
      showStackedTooltip(event, row);
    });
    rowGroup.addEventListener("blur", () => {
      rowGroup.classList.remove("is-active");
      hideStackedTooltip();
    });

    svg.appendChild(rowGroup);
  });
}

// Mobile navigation drawer: opens/closes the primary nav on smaller screens.
function initNavigationDrawer() {
  const toggle = $(".drawer-toggle");
  const nav = $("#primaryNav");
  const backdrop = $(".drawer-backdrop");
  if (!toggle || !nav || !backdrop) return;

  const setDrawerOpen = (isOpen) => {
    toggle.classList.toggle("is-open", isOpen);
    nav.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("drawer-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  };

  toggle.addEventListener("click", () => setDrawerOpen(!nav.classList.contains("is-open")));
  backdrop.addEventListener("click", () => setDrawerOpen(false));
  nav.querySelectorAll(".nav-item").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      nav.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
      setDrawerOpen(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setDrawerOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1180) setDrawerOpen(false);
  });
}

async function loadNavbar() {
  const mount = $("#navbarMount");
  if (!mount) return;

  const fallbackNavbar = `
    <header class="topbar">
      <a class="brand" href="#" aria-label="Chandigarh University dashboard">
        <img class="brand-logo" src="log1.png" alt="Chandigarh University" />
      </a>

      <button class="drawer-toggle" type="button" aria-label="Open navigation menu" aria-controls="primaryNav" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav class="main-nav" id="primaryNav" aria-label="Primary navigation">
        <div class="drawer-user">
          <button class="profile compact-profile" aria-label="Open admin menu">
            <span class="profile-initials">RS</span>
            <span>
              <strong>RS</strong>
              <small>Site admin</small>
            </span>
            <span class="chevron">⌄</span>
          </button>
        </div>

        <a class="nav-item" href="#">Home</a>
        <a class="nav-item" href="#">Dashboard</a>
        <a class="nav-item" href="#">My courses</a>
        <a class="nav-item active" href="#">Site administration</a>
        <a class="nav-item" href="#">MOOCs Courses</a>
      </nav>

      <div class="navbar-actions" aria-label="Toolbar">
        <div class="theme-tools" aria-label="Theme controls">
          <button class="plain-icon-button" type="button" aria-label="Light mode">
            <svg viewBox="0 0 24 24"><use href="#icon-sun"></use></svg>
          </button>
          <button class="switch-control" type="button" aria-label="Toggle theme">
            <span></span>
          </button>
          <button class="plain-icon-button" type="button" aria-label="Dark mode">
            <svg viewBox="0 0 24 24"><use href="#icon-moon"></use></svg>
          </button>
        </div>

        <span class="navbar-divider"></span>

        <button class="plain-icon-button" type="button" aria-label="Courses">
          <svg viewBox="0 0 24 24"><use href="#icon-cap"></use></svg>
        </button>
        <button class="plain-icon-button notification-button" type="button" aria-label="Notifications">
          <svg viewBox="0 0 24 24"><use href="#icon-bell"></use></svg>
          <span class="badge">8</span>
        </button>
        <button class="plain-icon-button" type="button" aria-label="Messages">
          <svg viewBox="0 0 24 24"><use href="#icon-message"></use></svg>
        </button>

        <span class="navbar-divider"></span>

        <button class="profile" type="button" aria-label="Open admin menu">
          <span class="profile-initials">RS</span>
          <span class="chevron">⌄</span>
        </button>

        <span class="navbar-divider"></span>

        <label class="edit-mode-toggle">
          <span>Edit mode</span>
          <input type="checkbox" checked />
          <i aria-hidden="true"></i>
        </label>
      </div>
    </header>
    <div class="drawer-backdrop" data-close-drawer></div>
  `;

  try {
    const response = await fetch("Navbar.html");
    if (!response.ok) throw new Error(`Navbar request failed: ${response.status}`);
    mount.innerHTML = await response.text();
  } catch (error) {
    mount.innerHTML = fallbackNavbar;
    console.warn("Using inline navbar fallback. Open through a local server to load Navbar.html.", error);
  }
}

function initTheme() {
  const body = document.body;
  const sunBtn = $(".theme-tools button[aria-label='Light mode']");
  const moonBtn = $(".theme-tools button[aria-label='Dark mode']");
  const toggleBtn = $(".theme-tools .switch-control");

  const setDark = (isDark) => {
    if (isDark) {
      body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  };

  sunBtn?.addEventListener("click", () => setDark(false));
  moonBtn?.addEventListener("click", () => setDark(true));
  toggleBtn?.addEventListener("click", () => setDark(!body.classList.contains("dark-theme")));
}

// Page startup: load the shared navbar, enhance controls, apply filters, then render visuals.
async function initDashboard() {
  await loadNavbar();
  initTheme();
  initNavigationDrawer();
  enhanceFilterDropdowns();
  initFilters();
  initActiveFilterChips();
  renderLineChart();
  renderDepartmentTable();
  renderClusterComparison();
  renderSimpleMatrix("#heatmapTable", heatmapColumns, heatmapRows);
  renderStackedBarChart();
}

initDashboard();
