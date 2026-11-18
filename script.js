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