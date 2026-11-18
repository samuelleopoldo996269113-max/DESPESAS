/* ---------- CARTÃO: DIA DE VENCIMENTO ---------- */
function cardOffset() { return settings.cardNext ? 1 : 0; }

Object.assign(I18N.pt, {
  cardSet: "Cartão de crédito", cardDayPh: "Dia do vencimento (1 a 31)",
  cardNextBtn: "Mês seguinte", cardSameBtn: "Mesmo mês",
  cardSetInfo: "As compras no cartão de um mês caem juntas no dia do vencimento. Vazio = usa a data de cada compra."
});
Object.assign(I18N.en, {
  cardSet: "Credit card", cardDayPh: "Due day (1 to 31)",
  cardNextBtn: "Next month", cardSameBtn: "Same month",
  cardSetInfo: "Card purchases of a month are due together on the due day. Empty = uses each purchase date."
});
Object.assign(I18N.es, {
  cardSet: "Tarjeta de crédito", cardDayPh: "Día de vencimiento (1 a 31)",
  cardNextBtn: "Mes siguiente", cardSameBtn: "Mismo mes",
  cardSetInfo: "Las compras con tarjeta de un mes vencen juntas el día de vencimiento. Vacío = usa la fecha de cada compra."
});

function applyCardSettings() {
  setText("lblCardSet", t("cardSet"));
  setText("cardNextBtn", t("cardNextBtn"));
  setText("cardSameBtn", t("cardSameBtn"));
  setText("cardSetInfo", t("cardSetInfo"));
  const input = document.getElementById("cardDayInput");
  input.placeholder = t("cardDayPh");
  input.value = settings.cardDay > 0 ? settings.cardDay : "";
  document.getElementById("cardNextBtn").classList.toggle("active", settings.cardNext);
  document.getElementById("cardSameBtn").classList.toggle("active", !settings.cardNext);
}

document.getElementById("cardDayInput").addEventListener("change", event => {
  const day = Math.floor(Number(event.target.value));
  settings.cardDay = day >= 1 && day <= 31 ? day : 0;
  saveSettings();
  applyCardSettings();
  render();
});

document.getElementById("cardNextBtn").addEventListener("click", () => {
  settings.cardNext = true; saveSettings(); applyCardSettings(); render();
});
document.getElementById("cardSameBtn").addEventListener("click", () => {
  settings.cardNext = false; saveSettings(); applyCardSettings(); render();
});

/* ---------- GRÁFICOS E CATEGORIAS ---------- */
const BUILTIN_CATEGORIES = [
  { key: "alimentacao", emoji: "🍽️", color: "#e8743b" },
  { key: "moradia", emoji: "🏠", color: "#3b82c4" },
  { key: "transporte", emoji: "🚗", color: "#8a6fd1" },
  { key: "saude", emoji: "💊", color: "#d9534f" },
  { key: "educacao", emoji: "📚", color: "#2a9d8f" },
  { key: "lazer", emoji: "🎮", color: "#e9b72f" },
  { key: "compras", emoji: "🛍️", color: "#d6639a" },
  { key: "servicos", emoji: "📱", color: "#4fb0d9" },
  { key: "cuidados", emoji: "💇", color: "#8bbf4a" },
  { key: "geral", emoji: "📦", color: "#8c93a0" }
];
const CUSTOM_COLORS = ["#b0603a", "#5f7f3b", "#3a7d8c", "#a64d79", "#6a5acd", "#c28f2c", "#2f6f4e", "#9a4d4d", "#4d6a9a", "#7a7a3a"];
const MAX_CUSTOM_CATEGORIES = 20;

let CATEGORIES = [];
const CATEGORY_BY_KEY = {};

function isValidCustomCategory(c) {
  return !!c && typeof c.key === "string" && c.key.startsWith("c_") &&
    typeof c.name === "string" && c.name.trim() !== "" && typeof c.emoji === "string";
}

/* Ordem: as 9 fixas, depois as suas, e "Geral" sempre por último. */
function rebuildCategories() {
  const geral = BUILTIN_CATEGORIES.find(c => c.key === "geral");
  const fixed = BUILTIN_CATEGORIES.filter(c => c.key !== "geral");
  const custom = (settings.customCategories || []).map((c, i) => ({
    key: c.key, emoji: c.emoji || "🏷️", name: c.name, custom: true, color: c.color || CUSTOM_COLORS[i % CUSTOM_COLORS.length]
  }));
  CATEGORIES = [...fixed, ...custom, geral];
  Object.keys(CATEGORY_BY_KEY).forEach(k => delete CATEGORY_BY_KEY[k]);
  CATEGORIES.forEach(c => { CATEGORY_BY_KEY[c.key] = c; });
}

function categoryName(c) {
  return c.custom ? c.name : t("cat_" + c.key);
}

rebuildCategories();

Object.assign(I18N.pt, {
  chartsTitle: "Gráficos", chartMonth: "Mês", chart6: "6 meses",
  chartEmpty: "Sem gastos neste mês.", avgLabel: "Média", category: "Categoria (opcional)",
  prevMonthLabel: "Mês anterior", nextMonthLabel: "Próximo mês",
  cat_alimentacao: "Alimentação", cat_moradia: "Moradia", cat_transporte: "Transporte",
  cat_saude: "Saúde", cat_educacao: "Educação", cat_lazer: "Lazer", cat_compras: "Compras",
  cat_servicos: "Serviços e assinaturas", cat_cuidados: "Cuidados pessoais", cat_geral: "Geral"
});
Object.assign(I18N.en, {
  chartsTitle: "Charts", chartMonth: "Month", chart6: "6 months",
  chartEmpty: "No spending this month.", avgLabel: "Average", category: "Category (optional)",
  prevMonthLabel: "Previous month", nextMonthLabel: "Next month",
  cat_alimentacao: "Food", cat_moradia: "Housing", cat_transporte: "Transport",
  cat_saude: "Health", cat_educacao: "Education", cat_lazer: "Leisure", cat_compras: "Shopping",
  cat_servicos: "Services and subscriptions", cat_cuidados: "Personal care", cat_geral: "General"
});
Object.assign(I18N.es, {
  chartsTitle: "Gráficos", chartMonth: "Mes", chart6: "6 meses",
  chartEmpty: "Sin gastos este mes.", avgLabel: "Promedio", category: "Categoría (opcional)",
  prevMonthLabel: "Mes anterior", nextMonthLabel: "Mes siguiente",
  cat_alimentacao: "Alimentación", cat_moradia: "Vivienda", cat_transporte: "Transporte",
  cat_saude: "Salud", cat_educacao: "Educación", cat_lazer: "Ocio", cat_compras: "Compras",
  cat_servicos: "Servicios y suscripciones", cat_cuidados: "Cuidado personal", cat_geral: "General"
});

/* Estado só na memória: o app SEMPRE abre com os gráficos fechados. */
let chartsOpen = false;
let chartsTab = "month";
let chartEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12);

function fillCategorySelect(select, value) {
  select.innerHTML = "";
  CATEGORIES.forEach(c => {
    const option = document.createElement("option");
    option.value = c.key;
    option.textContent = c.emoji + " " + categoryName(c);
    select.appendChild(option);
  });

  const add = document.createElement("option");
  add.value = "__new__";
  add.textContent = t("newCatOption");
  select.appendChild(add);

  select.value = CATEGORY_BY_KEY[value] ? value : "geral";
  select.dataset.prev = select.value;

  if (!select.dataset.catBound) {
    select.dataset.catBound = "1";
    select.addEventListener("change", () => {
      if (select.value !== "__new__") { select.dataset.prev = select.value; return; }
      const prev = select.dataset.prev || "geral";
      select.value = prev;
      openNewCategoryModal(cat => fillCategorySelect(select, cat.key));
    });
  }
}

function applyChartLabels() {
  setText("chartsToggleText", "📊 " + t("chartsTitle"));
  setText("tabMonth", t("chartMonth"));
  setText("tab6", t("chart6"));
  setText("lblCategory", t("category"));
  setText("lblCustomCats", t("customCats"));
  setText("addCatButton", t("newCat"));
  renderCustomCatList();
  document.getElementById("rangePrev").setAttribute("aria-label", t("prevMonthLabel"));
  document.getElementById("rangeNext").setAttribute("aria-label", t("nextMonthLabel"));
  const select = document.getElementById("category");
  fillCategorySelect(select, select.value || "geral");
}

/* Total gasto (despesas + cartão) de um mês qualquer, na mesma lógica da lista. */
function monthSpendingItems(date) {
  return getMonthTransactions(date).filter(tx => tx.type === "expense" || tx.type === "card");
}

function moneyShort(value) {
  return Number(value).toLocaleString(I18N[settings.lang].locale, {
    style: "currency",
    currency: I18N[settings.lang].currency,
    maximumFractionDigits: 0
  });
}

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs) {
  const el = document.createElementNS(SVG_NS, name);
  Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
  return el;
}

function renderPie() {
  const box = document.getElementById("chartMonth");
  box.innerHTML = "";

  const totals = {};
  monthSpendingItems(currentDate).forEach(tx => {
    const key = CATEGORY_BY_KEY[tx.category] ? tx.category : "geral";
    totals[key] = (totals[key] || 0) + tx.amount;
  });

  const rows = CATEGORIES.filter(c => totals[c.key] > 0)
    .map(c => ({ cat: c, value: totals[c.key] }))
    .sort((a, b) => b.value - a.value);
  const sum = rows.reduce((acc, r) => acc + r.value, 0);

  if (!rows.length) {
    const empty = document.createElement("div");
    empty.className = "chart-empty";
    empty.textContent = t("chartEmpty");
    box.appendChild(empty);
    return;
  }

  const svg = svgEl("svg", { viewBox: "0 0 200 200", class: "chart-svg", role: "img" });
  const cx = 100, cy = 100, r = 90;

  if (rows.length === 1) {
    svg.appendChild(svgEl("circle", { cx, cy, r, fill: rows[0].cat.color }));
  } else {
    let angle = -Math.PI / 2;
    rows.forEach(row => {
      const share = row.value / sum;
      const next = angle + share * Math.PI * 2;
      const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
      const x2 = cx + r * Math.cos(next), y2 = cy + r * Math.sin(next);
      const large = share > 0.5 ? 1 : 0;
      svg.appendChild(svgEl("path", {
        d: `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`,
        fill: row.cat.color,
        stroke: "var(--panel)",
        "stroke-width": "1.5"
      }));
      angle = next;
    });
  }

  const legend = document.createElement("div");
  legend.className = "legend";
  rows.forEach(row => {
    const line = document.createElement("div");
    line.className = "legend-row";

    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.background = row.cat.color;

    const name = document.createElement("span");
    name.className = "legend-name";
    name.textContent = row.cat.emoji + " " + categoryName(row.cat);

    const val = document.createElement("span");
    val.className = "legend-val";
    val.textContent = money(row.value);

    const pct = document.createElement("span");
    pct.className = "legend-pct";
    pct.textContent = Math.round(row.value / sum * 100) + "%";

    line.append(dot, name, val, pct);
    legend.appendChild(line);
  });

  const wrap = document.createElement("div");
  wrap.className = "pie-wrap";
  wrap.append(svg, legend);
  box.appendChild(wrap);
}

function renderBars() {
  const box = document.getElementById("chart6Svg");
  box.innerHTML = "";

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(chartEnd.getFullYear(), chartEnd.getMonth() - i, 1, 12);
    const total = monthSpendingItems(d).reduce((acc, tx) => acc + tx.amount, 0);
    months.push({ date: d, total });
  }

  const endName = chartEnd.toLocaleDateString(I18N[settings.lang].locale, { month: "long", year: "numeric" });
  document.getElementById("rangeLabel").textContent = endName.charAt(0).toUpperCase() + endName.slice(1);

  const avg = months.reduce((acc, m) => acc + m.total, 0) / 6;
  const maxValue = Math.max(1, avg, ...months.map(m => m.total));

  const W = 360, H = 240, padX = 10, top = 34, bottom = 28;
  const plotH = H - top - bottom;
  const slot = (W - padX * 2) / 6;
  const barW = slot * 0.62;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart-svg", role: "img" });

  svg.appendChild(svgEl("line", {
    x1: padX, y1: H - bottom, x2: W - padX, y2: H - bottom,
    stroke: "var(--border)", "stroke-width": "1"
  }));

  months.forEach((m, i) => {
    const h = m.total > 0 ? Math.max(2, m.total / maxValue * plotH) : 0;
    const x = padX + slot * i + (slot - barW) / 2;
    const y = H - bottom - h;

    if (h > 0) {
      svg.appendChild(svgEl("rect", { x: x.toFixed(1), y: y.toFixed(1), width: barW.toFixed(1), height: h.toFixed(1), rx: 4, fill: "var(--accent)" }));
    }

    const value = svgEl("text", { x: (x + barW / 2).toFixed(1), y: (y - 5).toFixed(1), "text-anchor": "middle", "font-size": "9.5", "font-weight": "bold", stroke: "var(--panel)", "stroke-width": "3", "paint-order": "stroke" });
    value.textContent = moneyShort(m.total);
    svg.appendChild(value);

    const raw = m.date.toLocaleDateString(I18N[settings.lang].locale, { month: "short" }).replace(".", "");
    const label = svgEl("text", { x: (x + barW / 2).toFixed(1), y: H - 10, "text-anchor": "middle", "font-size": "10.5" });
    label.textContent = raw.charAt(0).toUpperCase() + raw.slice(1);
    svg.appendChild(label);
  });

  const avgY = H - bottom - avg / maxValue * plotH;
  svg.appendChild(svgEl("line", {
    x1: padX, y1: avgY.toFixed(1), x2: W - padX, y2: avgY.toFixed(1),
    stroke: "#e0a030", "stroke-width": "2", "stroke-dasharray": "6 4"
  }));
  /* Legenda da média numa linha própria no topo, para não ficar em cima das barras. */
  svg.appendChild(svgEl("line", {
    x1: padX, y1: 12, x2: padX + 26, y2: 12,
    stroke: "#e0a030", "stroke-width": "2", "stroke-dasharray": "6 4"
  }));
  const avgText = svgEl("text", { x: padX + 33, y: 16, "font-size": "11", "font-weight": "bold" });
  avgText.textContent = t("avgLabel") + ": " + money(avg);
  svg.appendChild(avgText);

  box.appendChild(svg);
}

function renderCharts() {
  const body = document.getElementById("chartsBody");
  body.hidden = !chartsOpen;
  document.getElementById("chartsToggle").setAttribute("aria-expanded", chartsOpen ? "true" : "false");
  document.getElementById("chartsArrow").textContent = chartsOpen ? "▴" : "▾";
  if (!chartsOpen) return;

  document.getElementById("tabMonth").classList.toggle("active", chartsTab === "month");
  document.getElementById("tab6").classList.toggle("active", chartsTab === "six");
  document.getElementById("chartMonth").hidden = chartsTab !== "month";
  document.getElementById("chart6").hidden = chartsTab !== "six";

  if (chartsTab === "month") renderPie(); else renderBars();
}

document.getElementById("chartsToggle").addEventListener("click", () => {
  chartsOpen = !chartsOpen;
  renderCharts();
});
document.getElementById("tabMonth").addEventListener("click", () => { chartsTab = "month"; renderCharts(); });
document.getElementById("tab6").addEventListener("click", () => { chartsTab = "six"; renderCharts(); });
document.getElementById("rangePrev").addEventListener("click", () => {
  chartEnd = new Date(chartEnd.getFullYear(), chartEnd.getMonth() - 1, 1, 12);
  renderCharts();
});
document.getElementById("rangeNext").addEventListener("click", () => {
  chartEnd = new Date(chartEnd.getFullYear(), chartEnd.getMonth() + 1, 1, 12);
  renderCharts();
});

/* ---------- AVISOS: VENCENDO EM BREVE E LEMBRETE DE BACKUP ---------- */
const SOON_DAYS = 3;
const BACKUP_REMIND_DAYS = 7;
let backupDismissed = false;   // só vale até fechar o app; depois o lembrete volta

Object.assign(I18N.pt, {
  soonTitle: "Vencem nos próximos 3 dias:", soonToday: "hoje", soonTomorrow: "amanhã", soonIn: "em {n} dias",
  backupOld: "Faz {n} dias que você não faz backup dos seus dados.",
  backupNever: "Você ainda não fez backup dos seus dados.",
  backupNow: "Fazer backup agora", backupLater: "Depois"
});
Object.assign(I18N.en, {
  soonTitle: "Due in the next 3 days:", soonToday: "today", soonTomorrow: "tomorrow", soonIn: "in {n} days",
  backupOld: "It has been {n} days since your last backup.",
  backupNever: "You have not backed up your data yet.",
  backupNow: "Back up now", backupLater: "Later"
});
Object.assign(I18N.es, {
  soonTitle: "Vencen en los próximos 3 días:", soonToday: "hoy", soonTomorrow: "mañana", soonIn: "en {n} días",
  backupOld: "Hace {n} días que no haces una copia de tus datos.",
  backupNever: "Aún no has hecho una copia de tus datos.",
  backupNow: "Hacer copia ahora", backupLater: "Después"
});

/* Pendentes que vencem de hoje até daqui a 3 dias (usa a mesma lógica da lista: repetição, parcelas e cartão). */
function getDueSoon() {
  const now = new Date();
  const today = dateString(now);
  const limit = dateString(new Date(now.getFullYear(), now.getMonth(), now.getDate() + SOON_DAYS, 12));
  const first = new Date(now.getFullYear(), now.getMonth(), 1, 12);
  const second = new Date(now.getFullYear(), now.getMonth() + 1, 1, 12);

  const seen = new Set();
  const found = [];
  [first, second].forEach(month => {
    getMonthTransactions(month).forEach(tx => {
      if (tx.type !== "expense" && tx.type !== "card") return;
      if (tx.paid || tx.date < today || tx.date > limit) return;
      const key = tx.originalId + "|" + tx.date;
      if (seen.has(key)) return;
      seen.add(key);
      found.push(tx);
    });
  });
  return found.sort((a, b) => a.date.localeCompare(b.date));
}

function updateSoonAlert() {
  const box = document.getElementById("soonAlert");
  const items = getDueSoon();

  box.innerHTML = "";
  if (!items.length) { box.hidden = true; return; }

  const todayDate = new Date(dateString(new Date()) + "T12:00:00");

  const title = document.createElement("strong");
  title.textContent = t("soonTitle");

  const ul = document.createElement("ul");
  items.forEach(tx => {
    const days = Math.round((new Date(tx.date + "T12:00:00") - todayDate) / 86400000);
    const when = days <= 0 ? t("soonToday") : days === 1 ? t("soonTomorrow") : t("soonIn").replace("{n}", days);
    const li = document.createElement("li");
    li.textContent = `${tx.description} - ${money(tx.amount)} (${when}, ${formatDate(tx.date)})`;
    ul.appendChild(li);
  });

  box.append(title, ul);
  box.hidden = false;
}

function updateBackupAlert() {
  const box = document.getElementById("backupAlert");
  if (!box) return;

  box.innerHTML = "";

  let days = null;
  const last = localStorage.getItem(BACKUP_KEY);
  if (last) {
    const diff = (Date.now() - new Date(last).getTime()) / 86400000;
    if (isFinite(diff)) days = Math.floor(diff);
  }

  const needs = transactions.length > 0 && (days === null || days >= BACKUP_REMIND_DAYS);
  if (!needs || backupDismissed) { box.hidden = true; return; }

  const text = document.createElement("div");
  text.textContent = days === null ? t("backupNever") : t("backupOld").replace("{n}", days);

  const buttons = document.createElement("div");
  buttons.className = "alerta-botoes";

  const now = document.createElement("button");
  now.type = "button";
  now.textContent = t("backupNow");
  now.addEventListener("click", () => exportBackup());

  const later = document.createElement("button");
  later.type = "button";
  later.className = "secundario";
  later.textContent = t("backupLater");
  later.addEventListener("click", () => { backupDismissed = true; updateBackupAlert(); });

  buttons.append(now, later);
  box.append(text, buttons);
  box.hidden = false;
}

/* ---------- CATEGORIAS PERSONALIZADAS ---------- */
Object.assign(I18N.pt, {
  customCats: "Categorias personalizadas", newCat: "➕ Nova categoria", newCatOption: "➕ Nova categoria…",
  newCatTitle: "Nova categoria", newCatText: "Escolha um nome e, se quiser, um emoji.",
  newCatName: "Nome", newCatEmoji: "Emoji (opcional)",
  catNameEmpty: "Digite um nome para a categoria.", catExists: "Já existe uma categoria com esse nome.",
  catMax: "Limite de 20 categorias personalizadas.",
  catDelTitle: "Excluir categoria?", catDelText: "As despesas dessa categoria passam a aparecer em Geral.",
  catNone: "Nenhuma categoria personalizada ainda."
});
Object.assign(I18N.en, {
  customCats: "Custom categories", newCat: "➕ New category", newCatOption: "➕ New category…",
  newCatTitle: "New category", newCatText: "Choose a name and, if you like, an emoji.",
  newCatName: "Name", newCatEmoji: "Emoji (optional)",
  catNameEmpty: "Enter a name for the category.", catExists: "A category with this name already exists.",
  catMax: "Limit of 20 custom categories.",
  catDelTitle: "Delete category?", catDelText: "Expenses in this category will show up as General.",
  catNone: "No custom categories yet."
});
Object.assign(I18N.es, {
  customCats: "Categorías personalizadas", newCat: "➕ Nueva categoría", newCatOption: "➕ Nueva categoría…",
  newCatTitle: "Nueva categoría", newCatText: "Elige un nombre y, si quieres, un emoji.",
  newCatName: "Nombre", newCatEmoji: "Emoji (opcional)",
  catNameEmpty: "Escribe un nombre para la categoría.", catExists: "Ya existe una categoría con ese nombre.",
  catMax: "Límite de 20 categorías personalizadas.",
  catDelTitle: "¿Eliminar categoría?", catDelText: "Los gastos de esta categoría pasarán a aparecer en General.",
  catNone: "Aún no hay categorías personalizadas."
});

function firstEmoji(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const first = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value)[Symbol.iterator]().next();
    return first && first.value ? first.value.segment : "";
  }
  return Array.from(value)[0] || "";
}

function categoryNameTaken(name) {
  const wanted = name.trim().toLowerCase();
  return CATEGORIES.some(c => categoryName(c).trim().toLowerCase() === wanted);
}

function createCustomCategory(name, emoji) {
  const cat = {
    key: "c_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: name.trim().slice(0, 24),
    emoji: firstEmoji(emoji) || "🏷️",
    color: CUSTOM_COLORS[settings.customCategories.length % CUSTOM_COLORS.length]
  };
  settings.customCategories.push(cat);
  saveSettings();
  rebuildCategories();
  applyChartLabels();     // refaz a lista do formulário e a lista das configurações
  renderCharts();
  return CATEGORY_BY_KEY[cat.key];
}

function openNewCategoryModal(onCreated) {
  if (settings.customCategories.length >= MAX_CUSTOM_CATEGORIES) {
    alert(t("catMax"));
    return;
  }

  const { overlay, menu } = showModal(t("newCatTitle"), t("newCatText"));

  const nameLabel = document.createElement("label");
  nameLabel.textContent = t("newCatName");
  const nameInput = document.createElement("input");
  nameInput.maxLength = 24;

  const emojiLabel = document.createElement("label");
  emojiLabel.textContent = t("newCatEmoji");
  const emojiInput = document.createElement("input");
  emojiInput.maxLength = 8;
  emojiInput.placeholder = "🏷️";

  menu.append(nameLabel, nameInput, emojiLabel, emojiInput);

  addModalButton(menu, t("save"), () => {
    const name = nameInput.value.trim();
    if (!name) { alert(t("catNameEmpty")); return; }
    if (categoryNameTaken(name)) { alert(t("catExists")); return; }

    const created = createCustomCategory(name, emojiInput.value);
    overlay.remove();
    if (onCreated) onCreated(created);
  });

  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
  setTimeout(() => nameInput.focus(), 50);
}

function deleteCustomCategory(key) {
  const cat = CATEGORY_BY_KEY[key];
  if (!cat) return;

  const { overlay, menu } = showModal(t("catDelTitle") + " " + cat.emoji + " " + cat.name, t("catDelText"));

  addModalButton(menu, t("delYes"), () => {
    settings.customCategories = settings.customCategories.filter(c => c.key !== key);
    saveSettings();
    rebuildCategories();
    applyChartLabels();
    overlay.remove();
    render();
  }, "delete-action");

  addModalButton(menu, t("delNo"), () => overlay.remove(), "cancel-action");
}

function renderCustomCatList() {
  const box = document.getElementById("customCatList");
  if (!box) return;
  box.innerHTML = "";

  if (!settings.customCategories.length) {
    const empty = document.createElement("p");
    empty.className = "backup-info cat-empty";
    empty.textContent = t("catNone");
    box.appendChild(empty);
    return;
  }

  settings.customCategories.forEach(c => {
    const row = document.createElement("div");
    row.className = "cat-row";

    const label = document.createElement("span");
    label.textContent = (c.emoji || "🏷️") + " " + c.name;

    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "✕";
    del.setAttribute("aria-label", t("del") + " " + c.name);
    del.addEventListener("click", () => deleteCustomCategory(c.key));

    row.append(label, del);
    box.appendChild(row);
  });
}

document.getElementById("addCatButton").addEventListener("click", () => openNewCategoryModal());

/* ---------- DESFAZER, PARCELAS RESTANTES, FATURA DO CARTÃO E PLANILHA ---------- */
Object.assign(I18N.pt, {
  undoBtn: "Desfazer", undoOne: "Despesa excluída.", undoMany: "{n} parcelas excluídas.",
  instLeft: "Faltam {n} de {t} parcelas · {v}", instDone: "Parcelamento quitado",
  invoiceLabel: "💳 Fatura do cartão", invoicePaidLabel: "💳 Fatura paga", invoiceCount: "{n} compra(s)",
  invoicePay: "Pagar fatura", invoiceConfirmTitle: "Pagar a fatura?", invoiceYes: "Sim, pagar",
  invoiceDone: "{n} compra(s) do cartão marcadas como pagas.",
  exportCsv: "Exportar planilha (CSV)",
  csvDate: "Data", csvDesc: "Descrição", csvType: "Tipo", csvCategory: "Categoria", csvAmount: "Valor",
  csvStatus: "Situação", csvRepeat: "Repetição", csvMonthly: "Mensal"
});
Object.assign(I18N.en, {
  undoBtn: "Undo", undoOne: "Expense deleted.", undoMany: "{n} installments deleted.",
  instLeft: "{n} of {t} installments left · {v}", instDone: "Installments fully paid",
  invoiceLabel: "💳 Card bill", invoicePaidLabel: "💳 Card bill paid", invoiceCount: "{n} purchase(s)",
  invoicePay: "Pay bill", invoiceConfirmTitle: "Pay the bill?", invoiceYes: "Yes, pay",
  invoiceDone: "{n} card purchase(s) marked as paid.",
  exportCsv: "Export spreadsheet (CSV)",
  csvDate: "Date", csvDesc: "Description", csvType: "Type", csvCategory: "Category", csvAmount: "Amount",
  csvStatus: "Status", csvRepeat: "Repeat", csvMonthly: "Monthly"
});
Object.assign(I18N.es, {
  undoBtn: "Deshacer", undoOne: "Gasto eliminado.", undoMany: "{n} cuotas eliminadas.",
  instLeft: "Faltan {n} de {t} cuotas · {v}", instDone: "Cuotas pagadas por completo",
  invoiceLabel: "💳 Factura de la tarjeta", invoicePaidLabel: "💳 Factura pagada", invoiceCount: "{n} compra(s)",
  invoicePay: "Pagar factura", invoiceConfirmTitle: "¿Pagar la factura?", invoiceYes: "Sí, pagar",
  invoiceDone: "{n} compra(s) de la tarjeta marcadas como pagadas.",
  exportCsv: "Exportar hoja de cálculo (CSV)",
  csvDate: "Fecha", csvDesc: "Descripción", csvType: "Tipo", csvCategory: "Categoría", csvAmount: "Valor",
  csvStatus: "Estado", csvRepeat: "Repetición", csvMonthly: "Mensual"
});

/* Aviso com botão "Desfazer" (fica 8 segundos). */
let toastTimer = null;

function showUndoToast(message, undoAction) {
  const old = document.getElementById("undoToast");
  if (old) old.remove();
  if (toastTimer) clearTimeout(toastTimer);

  const toast = document.createElement("div");
  toast.id = "undoToast";
  toast.className = "toast";

  const text = document.createElement("span");
  text.textContent = message;

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = t("undoBtn");
  button.addEventListener("click", () => {
    toast.remove();
    if (toastTimer) clearTimeout(toastTimer);
    undoAction();
  });

  toast.append(text, button);
  document.body.appendChild(toast);
  toastTimer = setTimeout(() => toast.remove(), 8000);
}

/* Exclui e deixa desfazer: devolve cada item na mesma posição. */
function deleteItems(ids) {
  const wanted = new Set(ids);
  const removed = [];
  transactions.forEach((item, index) => {
    if (wanted.has(item.id)) removed.push({ item, index });
  });
  if (!removed.length) return;

  for (let i = transactions.length - 1; i >= 0; i--) {
    if (wanted.has(transactions[i].id)) transactions.splice(i, 1);
  }
  saveData();
  render();

  const message = removed.length === 1 ? t("undoOne") : t("undoMany").replace("{n}", removed.length);
  showUndoToast(message, () => {
    removed.forEach(r => transactions.splice(Math.min(r.index, transactions.length), 0, r.item));
    saveData();
    render();
  });
}

/* Quantas parcelas faltam e quanto ainda resta pagar da mesma compra. */
function installmentSummary(tx) {
  if (tx.repeat !== "installments") return "";
  const original = transactions.find(item => item.id === tx.originalId);
  if (!original) return "";

  const group = seriesOf(original);
  if (group.length < 2) return "";

  const open = group.filter(item => !item.paid);
  if (!open.length) return t("instDone");

  const left = open.reduce((sum, item) => sum + item.amount, 0);
  return t("instLeft").replace("{n}", open.length).replace("{t}", group.length).replace("{v}", money(left));
}

/* Fatura do cartão do mês que está na tela. */
function updateInvoiceBar() {
  const bar = document.getElementById("invoiceBar");
  if (!bar) return;

  const cards = getMonthTransactions().filter(tx => tx.type === "card");
  bar.innerHTML = "";
  bar.classList.remove("paga");

  if (!cards.length) { bar.hidden = true; return; }

  const pending = cards.filter(tx => !tx.paid);
  const shown = pending.length ? pending : cards;
  const total = shown.reduce((sum, tx) => sum + tx.amount, 0);

  const info = document.createElement("div");
  const label = document.createElement("span");
  label.textContent = (pending.length ? t("invoiceLabel") : t("invoicePaidLabel")) + " · " + t("invoiceCount").replace("{n}", shown.length);
  const value = document.createElement("strong");
  value.textContent = money(total);
  info.append(label, value);
  bar.appendChild(info);

  if (pending.length) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = t("invoicePay");
    button.addEventListener("click", () => confirmPayInvoice());
    bar.appendChild(button);
  } else {
    bar.classList.add("paga");
  }

  bar.hidden = false;
}

function confirmPayInvoice() {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;

  const pending = getMonthTransactions().filter(tx => tx.type === "card" && !tx.paid);
  if (!pending.length) return;

  const total = pending.reduce((sum, tx) => sum + tx.amount, 0);
  const { overlay, menu } = showModal(t("invoiceConfirmTitle"), `${t("invoiceCount").replace("{n}", pending.length)} · ${money(total)}`);

  addModalButton(menu, t("invoiceYes"), () => {
    overlay.remove();
    payInvoice();
  });
  addModalButton(menu, t("delNo"), () => overlay.remove(), "cancel-action");
}

function payInvoice() {
  const pending = getMonthTransactions().filter(tx => tx.type === "card" && !tx.paid);
  const snapshots = [];

  pending.forEach(tx => {
    const original = transactions.find(item => item.id === tx.originalId);
    if (!original) return;

    snapshots.push({
      original,
      paid: original.paid,
      hadMonths: Object.prototype.hasOwnProperty.call(original, "paidMonths"),
      months: original.paidMonths ? [...original.paidMonths] : undefined
    });

    if (tx.repeat === "monthly") {
      const key = monthKey(new Date(tx.date + "T12:00:00"));
      original.paidMonths = original.paidMonths || [];
      if (!original.paidMonths.includes(key)) original.paidMonths.push(key);
    } else {
      original.paid = true;
    }
  });

  if (!snapshots.length) return;
  saveData();
  render();

  showUndoToast(t("invoiceDone").replace("{n}", snapshots.length), () => {
    snapshots.forEach(snap => {
      snap.original.paid = snap.paid;
      if (snap.hadMonths) snap.original.paidMonths = snap.months;
      else delete snap.original.paidMonths;
    });
    saveData();
    render();
  });
}

/* Planilha (CSV): abre no Excel e no Google Planilhas. Separador ";" e acentos corretos. */
function csvCell(value) {
  const text = String(value === undefined || value === null ? "" : value);
  return /[;"\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

function csvDateText(value) {
  const [year, month, day] = String(value).split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
}

function buildCsv() {
  const today = dateString(new Date());
  const capital = text => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  const header = [t("csvDate"), t("csvDesc"), t("csvType"), t("csvCategory"), t("csvAmount"), t("csvStatus"), t("csvRepeat")];

  const rows = [...transactions]
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map(tx => {
      const cat = CATEGORY_BY_KEY[tx.category] || CATEGORY_BY_KEY.geral;
      const category = tx.type === "income" ? "" : categoryName(cat);
      let status;
      if (tx.type === "income") status = tx.date <= today ? t("received") : t("planned");
      else if (tx.repeat === "monthly") status = t("csvMonthly");
      else status = tx.paid ? t("paid") : t("pending");

      const repeat = tx.repeat === "monthly" ? t("repMonthly") : tx.repeat === "installments" ? t("repInstallments") : t("repNone");

      return [
        csvDateText(tx.date),
        tx.description,
        capital(t(tx.type)),
        category,
        Number(tx.amount).toFixed(2).replace(".", ","),
        status,
        repeat
      ];
    });

  return "﻿" + [header, ...rows].map(row => row.map(csvCell).join(";")).join("\r\n") + "\r\n";
}

async function exportCsv() {
  const fileName = `minhas-despesas-planilha-${dateString(new Date())}.csv`;
  const file = new File([buildCsv()], fileName, { type: "text/csv" });

  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: fileName });
      return;
    }
  } catch (error) {
    if (error && error.name === "AbortError") return;
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.getElementById("exportCsvButton").addEventListener("click", exportCsv);

/* ---------- INICIAR ---------- */
loadSettings();
rebuildCategories();
applyTheme();
applyLanguage();
loadData();
render();