/**
 * Gráficas del panel privado (analítica de negocio). Todo se dibuja con
 * SVG a mano -- sin librerías externas -- leyendo los mismos pedidos que
 * guarda admin-orders.js en localStorage. Se vuelve a llamar cada vez que
 * cambian los pedidos (ver el final de renderOrders() en admin-orders.js).
 */

const CHART_MONTHS = 6;
const CHART_STATUS_COLORS = {
  Pendiente: "#e0b34d",
  Confirmado: "#6fb0e0",
  Enviado: "#b08cf0",
  Entregado: "#4fd18b",
  Cancelado: "#e5876c",
};
const CHART_COLOR_VENTA = "#c9a24a";
const CHART_COLOR_GANANCIA = "#4fd18b";

function svgEl(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function chartEmptyState(container, message) {
  container.innerHTML = `<p class="chart-empty">${escapeHtml(message)}</p>`;
}

/* ============ GRÁFICA DE BARRAS AGRUPADAS (venta/ganancia por mes) ============ */
function renderMonthlyChart(container, monthlyData) {
  container.innerHTML = "";
  if (monthlyData.every((m) => m.venta === 0 && m.ganancia === 0)) {
    chartEmptyState(container, "Aún no hay ventas registradas en los últimos meses.");
    return;
  }

  const W = 600;
  const H = 260;
  const padLeft = 56;
  const padBottom = 34;
  const padTop = 16;
  const padRight = 16;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;

  const maxVal = Math.max(1, ...monthlyData.map((m) => Math.max(m.venta, m.ganancia)));
  const niceMax = Math.ceil(maxVal / 4) * 4 || 4;
  const scaleY = (v) => plotH - (v / niceMax) * plotH;

  const svg = svgEl("svg", {
    viewBox: `0 0 ${W} ${H}`,
    class: "chart-svg",
    role: "img",
    "aria-label": "Ventas y ganancia por mes",
  });

  // gridlines + y labels
  for (let i = 0; i <= 4; i++) {
    const v = (niceMax / 4) * i;
    const y = padTop + scaleY(v);
    svg.appendChild(
      svgEl("line", { x1: padLeft, x2: W - padRight, y1: y, y2: y, class: "chart-grid" })
    );
    const label = svgEl("text", { x: padLeft - 8, y: y + 4, class: "chart-axis-label", "text-anchor": "end" });
    label.textContent = formatCOPShort(v);
    svg.appendChild(label);
  }

  const groupW = plotW / monthlyData.length;
  const barW = Math.min(22, groupW * 0.3);

  monthlyData.forEach((m, i) => {
    const groupX = padLeft + i * groupW + groupW / 2;

    const ventaH = plotH - scaleY(m.venta);
    const ventaBar = svgEl("rect", {
      x: groupX - barW - 3,
      y: padTop + scaleY(m.venta),
      width: barW,
      height: Math.max(ventaH, 0),
      fill: CHART_COLOR_VENTA,
      rx: 3,
    });
    ventaBar.appendChild(svgEl("title")).textContent = `${m.label}: Venta ${formatCOP(m.venta)}`;
    svg.appendChild(ventaBar);

    const gananciaH = plotH - scaleY(m.ganancia);
    const gananciaBar = svgEl("rect", {
      x: groupX + 3,
      y: padTop + scaleY(m.ganancia),
      width: barW,
      height: Math.max(gananciaH, 0),
      fill: CHART_COLOR_GANANCIA,
      rx: 3,
    });
    gananciaBar.appendChild(svgEl("title")).textContent = `${m.label}: Ganancia ${formatCOP(m.ganancia)}`;
    svg.appendChild(gananciaBar);

    const xLabel = svgEl("text", { x: groupX, y: H - padBottom + 20, class: "chart-axis-label", "text-anchor": "middle" });
    xLabel.textContent = m.label;
    svg.appendChild(xLabel);
  });

  container.appendChild(svg);

  const legend = document.createElement("div");
  legend.className = "chart-legend";
  legend.innerHTML = `
    <span class="chart-legend__item"><i style="background:${CHART_COLOR_VENTA}"></i>Venta</span>
    <span class="chart-legend__item"><i style="background:${CHART_COLOR_GANANCIA}"></i>Ganancia</span>
  `;
  container.appendChild(legend);
}

function formatCOPShort(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)}M`;
  if (v >= 1000) return `$${Math.round(v / 1000)}k`;
  return `$${v}`;
}

/* ============ DONUT (pedidos por estado) ============ */
function renderStatusDonut(container, counts) {
  container.innerHTML = "";
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) {
    chartEmptyState(container, "Aún no has registrado pedidos.");
    return;
  }

  const size = 200;
  const r = 72;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const wrap = document.createElement("div");
  wrap.className = "chart-donut-wrap";

  const svg = svgEl("svg", { viewBox: `0 0 ${size} ${size}`, class: "chart-svg chart-donut", role: "img", "aria-label": "Pedidos por estado" });
  svg.appendChild(svgEl("circle", { cx, cy, r, fill: "none", stroke: "var(--border)", "stroke-width": 22 }));

  let offset = 0;
  Object.entries(counts).forEach(([status, count]) => {
    if (count === 0) return;
    const frac = count / total;
    const dash = frac * circumference;
    const circle = svgEl("circle", {
      cx,
      cy,
      r,
      fill: "none",
      stroke: CHART_STATUS_COLORS[status] || "var(--text-muted)",
      "stroke-width": 22,
      "stroke-dasharray": `${dash} ${circumference - dash}`,
      "stroke-dashoffset": -offset,
      transform: `rotate(-90 ${cx} ${cy})`,
    });
    circle.appendChild(svgEl("title")).textContent = `${status}: ${count}`;
    svg.appendChild(circle);
    offset += dash;
  });

  const centerLabel = svgEl("text", { x: cx, y: cy - 4, "text-anchor": "middle", class: "chart-donut-total" });
  centerLabel.textContent = total;
  svg.appendChild(centerLabel);
  const centerSub = svgEl("text", { x: cx, y: cy + 16, "text-anchor": "middle", class: "chart-donut-sub" });
  centerSub.textContent = total === 1 ? "pedido" : "pedidos";
  svg.appendChild(centerSub);

  wrap.appendChild(svg);

  const legend = document.createElement("div");
  legend.className = "chart-legend chart-legend--vertical";
  legend.innerHTML = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(
      ([status, count]) =>
        `<span class="chart-legend__item"><i style="background:${CHART_STATUS_COLORS[status] || "var(--text-muted)"}"></i>${escapeHtml(status)} (${count})</span>`
    )
    .join("");
  wrap.appendChild(legend);

  container.appendChild(wrap);
}

/* ============ BARRAS HORIZONTALES (top relojes / encargados) ============ */
function renderHorizontalBars(container, items, opts) {
  container.innerHTML = "";
  if (items.length === 0) {
    chartEmptyState(container, opts.emptyMessage);
    return;
  }

  const maxVal = Math.max(1, ...items.map((i) => i.value));
  const list = document.createElement("div");
  list.className = "chart-hbars";

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "chart-hbar-row";
    const pct = Math.max((item.value / maxVal) * 100, 3);
    row.innerHTML = `
      <span class="chart-hbar-label" title="${escapeHtml(item.full || item.label)}">${escapeHtml(item.label)}</span>
      <span class="chart-hbar-track"><span class="chart-hbar-fill" style="width:${pct}%; background:${opts.color}"></span></span>
      <span class="chart-hbar-value">${opts.formatValue(item.value)}</span>
    `;
    list.appendChild(row);
  });

  container.appendChild(list);
}

/* ============ AGREGACIÓN DE DATOS ============ */
function monthLabel(year, month) {
  const names = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${names[month]} ${String(year).slice(2)}`;
}

function computeMonthlyData(orders) {
  const now = new Date();
  const months = [];
  for (let i = CHART_MONTHS - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: monthLabel(d.getFullYear(), d.getMonth()), venta: 0, ganancia: 0 });
  }
  const soldOrders = orders.filter((o) => o.estado !== "Cancelado" && o.fecha);
  soldOrders.forEach((o) => {
    const d = new Date(o.fecha + "T00:00:00");
    if (isNaN(d)) return;
    const bucket = months.find((m) => m.year === d.getFullYear() && m.month === d.getMonth());
    if (!bucket) return;
    bucket.venta += Number(o.precio) || 0;
    const g = calcGanancia(o);
    if (g != null) bucket.ganancia += g;
  });
  return months;
}

function computeStatusCounts(orders) {
  const counts = { Pendiente: 0, Confirmado: 0, Enviado: 0, Entregado: 0, Cancelado: 0 };
  orders.forEach((o) => {
    if (counts[o.estado] != null) counts[o.estado]++;
  });
  return counts;
}

function shortWatchLabel(reloj) {
  const match = reloj.match(/^(REF-\d+)\s*—\s*(\S+)/);
  return match ? `${match[1]} ${match[2]}` : reloj;
}

function computeTopWatches(orders, limit) {
  const soldOrders = orders.filter((o) => o.estado !== "Cancelado" && o.reloj);
  const map = new Map();
  soldOrders.forEach((o) => {
    map.set(o.reloj, (map.get(o.reloj) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([reloj, value]) => ({ label: shortWatchLabel(reloj), full: reloj, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function computeSalesByVendedor(orders) {
  const soldOrders = orders.filter((o) => o.estado !== "Cancelado" && o.vendedor);
  const map = new Map();
  soldOrders.forEach((o) => {
    map.set(o.vendedor, (map.get(o.vendedor) || 0) + (Number(o.precio) || 0));
  });
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function renderMonthlySummary(container, monthlyData) {
  const thisMonth = monthlyData[monthlyData.length - 1];
  const lastMonth = monthlyData[monthlyData.length - 2];
  if (!thisMonth || !lastMonth || (lastMonth.venta === 0 && thisMonth.venta === 0)) {
    container.textContent = "";
    return;
  }
  const parts = [`Este mes: ${formatCOP(thisMonth.venta)} en ventas`];
  if (lastMonth.venta > 0) {
    const change = ((thisMonth.venta - lastMonth.venta) / lastMonth.venta) * 100;
    const sign = change >= 0 ? "+" : "";
    const cls = change >= 0 ? "chart-summary__delta--up" : "chart-summary__delta--down";
    parts.push(`<span class="${cls}">${sign}${change.toFixed(0)}% vs. mes anterior</span>`);
  } else if (thisMonth.venta > 0) {
    parts.push(`<span class="chart-summary__delta--up">primeras ventas del mes</span>`);
  }
  container.innerHTML = parts.join(" · ");
}

/* ============ ENTRADA PRINCIPAL ============ */
function renderCharts() {
  const orders = loadOrders();
  const section = document.getElementById("admin-charts");
  if (!section) return;

  const monthlyData = computeMonthlyData(orders);
  renderMonthlySummary(document.getElementById("chart-monthly-summary"), monthlyData);
  renderMonthlyChart(document.getElementById("chart-monthly"), monthlyData);
  renderStatusDonut(document.getElementById("chart-status"), computeStatusCounts(orders));
  renderHorizontalBars(document.getElementById("chart-top-watches"), computeTopWatches(orders, 5), {
    color: CHART_COLOR_VENTA,
    emptyMessage: "Aún no hay relojes vendidos para mostrar.",
    formatValue: (v) => `${v} ${v === 1 ? "venta" : "ventas"}`,
  });
  renderHorizontalBars(document.getElementById("chart-vendedores"), computeSalesByVendedor(orders), {
    color: CHART_COLOR_GANANCIA,
    emptyMessage: "Aún no hay ventas asignadas a un encargado.",
    formatValue: (v) => formatCOP(v),
  });
}
