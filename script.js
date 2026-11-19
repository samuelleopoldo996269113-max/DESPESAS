const transactions = [];
let currentDate = new Date();

const STORAGE_KEY = "minhasDespesas";
const SETTINGS_KEY = "minhasDespesasConfig";

const settings = { lang: "pt", mode: "light", color: "none", cardDay: 0, cardNext: true, customCategories: [], cards: [], soonDays: 3, view: {}, currency: "auto" };

/* Itens da tela que a pessoa pode ligar e desligar (Configurações > Exibição). */
const VIEW_KEYS = ["totalPay", "totalRemaining", "wallet", "cardTotal", "charts", "filters", "vaults", "scan",
  "alertOverdue", "alertSoon", "alertBudget", "alertBackup", "compare", "yearly", "notes", "sort", "swipe", "overdueHighlight"];
const VIEW_NEW = ["compare", "yearly", "notes", "sort", "swipe", "overdueHighlight"];
const MAX_CARDS = 10;

/* Moeda: "auto" segue o idioma (como sempre foi); ou o usuário escolhe uma. */
const CURRENCIES = ["BRL", "USD", "EUR", "MXN"];
function currencyCode() {
  return CURRENCIES.includes(settings.currency) ? settings.currency : I18N[settings.lang].currency;
}

/* Cartões: compra sem cardId (as antigas) pertence ao primeiro cartão. */
function cardOf(tx) {
  return settings.cards.find(c => c.id === tx.cardId) || settings.cards[0];
}

function cardOffsetFor(card) { return card && card.next ? 1 : 0; }

function sanitizeCards(list) {
  const out = [];
  const ids = new Set();
  list.forEach(c => {
    if (!c || typeof c.id !== "string" || !c.id || ids.has(c.id)) return;
    const day = Math.floor(Number(c.day));
    out.push({
      id: c.id,
      name: String(c.name || "").trim().slice(0, 24) || "Cartão",
      day: day >= 1 && day <= 31 ? day : 0,
      next: c.next !== false
    });
    ids.add(c.id);
  });
  return out.slice(0, MAX_CARDS);
}

/* ---------- TRADUÇÕES ---------- */
const I18N = {
  pt: {
    locale: "pt-BR", currency: "BRL",
    title: "1° Passo",
    total: "Total a pagar", remaining: "Saldo a pagar", wallet: "Carteira",
    newTx: "Nova movimentação", type: "Tipo de movimentação",
    expense: "DESPESA", income: "ENTRADA", card: "CARTÃO", cardTotal: "Cartão de crédito",
    typeError: "Escolha despesa, entrada ou cartão.",
    description: "Descrição", descPlaceholder: "Ex.: Luz",
    amount: "Valor", date: "Data", repeat: "Repetição",
    repNone: "Não repetir", repMonthly: "Repetir todo mês", repInstallments: "Parcelar",
    count: "Quantidade de parcelas", save: "Salvar", cancel: "Cancelar",
    settings: "Configurações", language: "Idioma", mode: "Modo",
    light: "Claro", dark: "Escuro", appColor: "Cor do aplicativo",
    blue: "Azul", pink: "Rosa", close: "Fechar",
    empty: "Nenhuma movimentação neste mês.",
    received: "Entrada recebida", planned: "Entrada prevista",
    paid: "Paga", pending: "Pendente",
    markPaid: "Marcar como paga", markPending: "Marcar como pendente",
    edit: "Editar", del: "Excluir",
    delTitle: "Excluir movimentação?", delText: "Tem certeza que deseja excluir esta movimentação?",
    delYes: "Sim, excluir", delNo: "Não, voltar",
    editTitle: "Editar movimentação", editText: "Altere as informações abaixo.",
    saveChanges: "Salvar alterações",
    invalidEdit: "Preencha a descrição e um valor válido.",
    fillAll: "Preencha todos os campos corretamente.",
    minInstallments: "Informe pelo menos 2 parcelas.",
    overdueTitle: "Existem despesas pendentes atrasadas:",
    due: "venc.",
    backup: "Backup", exportBackup: "Exportar backup", importBackup: "Importar backup",
    lastBackup: "Último backup:", neverBackup: "Nenhum backup feito ainda.",
    importDone: "Backup importado. Novas: {n}. Já existiam: {d}.",
    importError: "Arquivo de backup inválido."
  },
  en: {
    locale: "en-US", currency: "USD",
    title: "1° Passo",
    total: "Total to pay", remaining: "Balance to pay", wallet: "Wallet",
    newTx: "New transaction", type: "Transaction type",
    expense: "EXPENSE", income: "INCOME", card: "CARD", cardTotal: "Credit card",
    typeError: "Choose expense, income or card.",
    description: "Description", descPlaceholder: "E.g.: Electricity",
    amount: "Amount", date: "Date", repeat: "Repeat",
    repNone: "Do not repeat", repMonthly: "Repeat every month", repInstallments: "Installments",
    count: "Number of installments", save: "Save", cancel: "Cancel",
    settings: "Settings", language: "Language", mode: "Mode",
    light: "Light", dark: "Dark", appColor: "App color",
    blue: "Blue", pink: "Pink", close: "Close",
    empty: "No transactions this month.",
    received: "Income received", planned: "Expected income",
    paid: "Paid", pending: "Pending",
    markPaid: "Mark as paid", markPending: "Mark as pending",
    edit: "Edit", del: "Delete",
    delTitle: "Delete transaction?", delText: "Are you sure you want to delete this transaction?",
    delYes: "Yes, delete", delNo: "No, go back",
    editTitle: "Edit transaction", editText: "Change the information below.",
    saveChanges: "Save changes",
    invalidEdit: "Enter a description and a valid amount.",
    fillAll: "Fill in all fields correctly.",
    minInstallments: "Enter at least 2 installments.",
    overdueTitle: "You have overdue pending expenses:",
    due: "due",
    backup: "Backup", exportBackup: "Export backup", importBackup: "Import backup",
    lastBackup: "Last backup:", neverBackup: "No backup made yet.",
    importDone: "Backup imported. New: {n}. Already existed: {d}.",
    importError: "Invalid backup file."
  },
  es: {
    locale: "es-ES", currency: "EUR",
    title: "1° Passo",
    total: "Total a pagar", remaining: "Saldo a pagar", wallet: "Cartera",
    newTx: "Nuevo movimiento", type: "Tipo de movimiento",
    expense: "GASTO", income: "INGRESO", card: "TARJETA", cardTotal: "Tarjeta de crédito",
    typeError: "Elige gasto, ingreso o tarjeta.",
    description: "Descripción", descPlaceholder: "Ej.: Luz",
    amount: "Valor", date: "Fecha", repeat: "Repetición",
    repNone: "No repetir", repMonthly: "Repetir cada mes", repInstallments: "Pagar en cuotas",
    count: "Número de cuotas", save: "Guardar", cancel: "Cancelar",
    settings: "Configuración", language: "Idioma", mode: "Modo",
    light: "Claro", dark: "Oscuro", appColor: "Color de la app",
    blue: "Azul", pink: "Rosa", close: "Cerrar",
    empty: "Ningún movimiento este mes.",
    received: "Ingreso recibido", planned: "Ingreso previsto",
    paid: "Pagado", pending: "Pendiente",
    markPaid: "Marcar como pagado", markPending: "Marcar como pendiente",
    edit: "Editar", del: "Eliminar",
    delTitle: "¿Eliminar movimiento?", delText: "¿Seguro que quieres eliminar este movimiento?",
    delYes: "Sí, eliminar", delNo: "No, volver",
    editTitle: "Editar movimiento", editText: "Cambia la información de abajo.",
    saveChanges: "Guardar cambios",
    invalidEdit: "Escribe una descripción y un valor válido.",
    fillAll: "Rellena todos los campos correctamente.",
    minInstallments: "Indica al menos 2 cuotas.",
    overdueTitle: "Tienes gastos pendientes atrasados:",
    due: "venc.",
    backup: "Copia de seguridad", exportBackup: "Exportar copia", importBackup: "Importar copia",
    lastBackup: "Última copia:", neverBackup: "Aún no hay copia.",
    importDone: "Copia importada. Nuevos: {n}. Ya existían: {d}.",
    importError: "Archivo de copia no válido."
  }
};

function t(key) {
  return (I18N[settings.lang] && I18N[settings.lang][key]) || I18N.pt[key] || key;
}

/* ---------- CONFIGURAÇÕES SALVAS ---------- */
function loadSettings() {
  let hadSaved = false;
  let hadView = false;
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (saved && typeof saved === "object") {
      hadSaved = true;
      if (I18N[saved.lang]) settings.lang = saved.lang;
      if (saved.mode === "dark" || saved.mode === "light") settings.mode = saved.mode;
      if (saved.color === "pink" || saved.color === "blue" || saved.color === "none") settings.color = saved.color;
      const day = Number(saved.cardDay);
      if (day >= 1 && day <= 31) settings.cardDay = Math.floor(day);
      if (saved.cardNext === false) settings.cardNext = false;
      if (Array.isArray(saved.customCategories)) {
        settings.customCategories = saved.customCategories.filter(isValidCustomCategory).slice(0, MAX_CUSTOM_CATEGORIES);
      }
      if (CURRENCIES.includes(saved.currency)) settings.currency = saved.currency;
      const soon = Math.floor(Number(saved.soonDays));
      if (soon >= 1 && soon <= 3) settings.soonDays = soon;
      if (Array.isArray(saved.cards)) settings.cards = sanitizeCards(saved.cards);
      if (saved.view && typeof saved.view === "object") {
        hadView = true;
        VIEW_KEYS.forEach(k => { if (typeof saved.view[k] === "boolean") settings.view[k] = saved.view[k]; });
      }
    }
  } catch {}

  /* Quem já usava o app continua vendo tudo (menos os extras novos). Instalação nova começa limpa. */
  let legacy = hadSaved;
  try { if (!legacy) legacy = localStorage.getItem(STORAGE_KEY) !== null || hasEnvelope(); } catch {}
  VIEW_KEYS.forEach(k => {
    if (typeof settings.view[k] !== "boolean") settings.view[k] = legacy ? !VIEW_NEW.includes(k) : false;
  });

  if (!settings.cards.length) {
    settings.cards = [{ id: "card1", name: t("cardDefaultName"), day: settings.cardDay, next: settings.cardNext }];
  }

  if (!hadView) { try { saveSettings(); } catch {} }
}

function saveSettings() {
  /* Mantém os campos antigos iguais ao primeiro cartão (para poder voltar a uma versão anterior sem perder nada). */
  const first = settings.cards[0];
  if (first) { settings.cardDay = first.day; settings.cardNext = first.next; }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applyTheme() {
  document.body.classList.remove("blue", "pink", "dark");
  if (settings.color !== "none") document.body.classList.add(settings.color);
  if (settings.mode === "dark") document.body.classList.add("dark");

  document.querySelectorAll("[data-mode]").forEach(b =>
    b.classList.toggle("active", b.dataset.mode === settings.mode));
  document.querySelectorAll("[data-color]").forEach(b =>
    b.classList.toggle("active", b.dataset.color === settings.color));
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function applyLanguage() {
  document.documentElement.lang = I18N[settings.lang].locale;
  document.title = t("title");

  setText("appTitle", t("title"));
  setText("lblTotal", t("total"));
  setText("lblRemaining", t("remaining"));
  setText("lblWallet", t("wallet"));
  setText("formTitle", t("newTx"));
  setText("lblType", t("type"));
  setText("expenseButton", t("expense"));
  setText("incomeButton", t("income"));
  setText("cardButton", t("card"));
  setText("lblCard", t("cardTotal"));
  setText("typeError", t("typeError"));
  setText("lblDescription", t("description"));
  setText("lblAmount", t("amount"));
  setText("lblDate", t("date"));
  setText("lblRepeat", t("repeat"));
  setText("lblCount", t("count"));
  setText("saveButton", t("save"));
  setText("cancelButton", t("cancel"));
  setText("settingsTitle", t("settings"));
  setText("lblLanguage", t("language"));
  setText("lblMode", t("mode"));
  setText("modeLight", t("light"));
  setText("modeDark", t("dark"));
  setText("lblColor", t("appColor"));
  setText("colorBlue", t("blue"));
  setText("colorPink", t("pink"));
  setText("lblBackup", t("backup"));
  setText("exportButton", t("exportBackup"));
  setText("exportCsvButton", t("exportCsv"));
  setText("importButton", t("importBackup"));
  updateBackupInfo();

  document.getElementById("description").placeholder = t("descPlaceholder");
  document.getElementById("closeSettings").setAttribute("aria-label", t("close"));

  const repeat = document.getElementById("repeat");
  repeat.options[0].textContent = t("repNone");
  repeat.options[1].textContent = t("repMonthly");
  repeat.options[2].textContent = t("repInstallments");

  document.getElementById("languageSelect").value = settings.lang;
  applyCardSettings();
  applyChartLabels();
  applyNewLabels();
}

/* ---------- UTILITÁRIOS ---------- */
function loadData() {
  loadPriv();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (Array.isArray(data)) transactions.push(...data);
    } catch {
      console.error("Erro ao carregar os dados.");
    }
  }
}

function saveData() {
  persistData();
}

function money(value) {
  return Number(value).toLocaleString(I18N[settings.lang].locale, {
    style: "currency",
    currency: currencyCode()
  });
}

function dateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function addMonths(date, amount) {
  const result = new Date(date);
  const originalDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + amount);

  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();

  result.setDate(Math.min(originalDay, lastDay));
  return result;
}

function getMonthTransactions(forDate = currentDate) {
  const selectedMonth = monthKey(forDate);
  const result = [];

  transactions.forEach(tx => {
    const card = tx.type === "card" ? cardOf(tx) : null;

    if (card && card.day > 0) {
      const base = new Date(forDate.getFullYear(), forDate.getMonth(), 1, 12);
      const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
      const due = dateString(new Date(base.getFullYear(), base.getMonth(), Math.min(card.day, lastDay), 12));
      const src = addMonths(base, -cardOffsetFor(card));
      const srcKey = monthKey(src);

      if (tx.repeat === "monthly") {
        if (srcKey < tx.date.substring(0, 7)) return;
        result.push({
          ...tx,
          date: due,
          amount: amountForMonth(tx, selectedMonth),
          originalId: tx.id,
          paid: (tx.paidMonths || []).includes(selectedMonth)
        });
      } else if (tx.date.substring(0, 7) === srcKey) {
        result.push({ ...tx, date: due, originalId: tx.id });
      }
      return;
    }

    if (tx.repeat === "monthly") {
      if (selectedMonth < tx.date.substring(0, 7)) return;

      const start = new Date(tx.date + "T12:00:00");
      const difference =
        (forDate.getFullYear() - start.getFullYear()) * 12 +
        forDate.getMonth() - start.getMonth();

      const occurrence = addMonths(start, difference);
      const key = monthKey(occurrence);

      result.push({
        ...tx,
        date: dateString(occurrence),
        amount: amountForMonth(tx, key),
        originalId: tx.id,
        paid: (tx.paidMonths || []).includes(key)
      });
    } else if (tx.date.substring(0, 7) === selectedMonth) {
      result.push({ ...tx, originalId: tx.id });
    }
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

function render() {
  const list = document.getElementById("transactions");
  const monthLabel = document.getElementById("monthLabel");

  const monthName = currentDate.toLocaleDateString(I18N[settings.lang].locale, {
    month: "long",
    year: "numeric"
  });
  monthLabel.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const allItems = getMonthTransactions();
  const items = sortItems(applyFilters(allItems));
  list.innerHTML = "";

  if (items.length === 0) {
    list.innerHTML = '<div class="empty"></div>';
    list.firstChild.textContent = t(filtersActive() && allItems.length ? "emptyFilter" : "empty");
  }

  items.forEach(tx => {
    const div = document.createElement("div");
    div.className = `tx ${tx.type}`;

    const received = tx.type === "income" && tx.date <= dateString(new Date());

    if (tx.type === "income" && received) div.classList.add("received");
    if ((tx.type === "expense" || tx.type === "card") && tx.paid) div.classList.add("done");
    const isOverdue = (tx.type === "expense" || tx.type === "card") && !tx.paid && tx.date < dateString(new Date());
    if (isOverdue) div.classList.add("overdue");

    const name = document.createElement("div");
    name.className = "tx-name";
    name.textContent = tx.description;

    const date = document.createElement("div");
    date.className = "tx-date";
    date.textContent = formatDate(tx.date);
    if ((tx.type === "expense" || tx.type === "card") && tx.category && tx.category !== "geral" && CATEGORY_BY_KEY[tx.category]) {
      date.textContent += " · " + CATEGORY_BY_KEY[tx.category].emoji + " " + categoryName(CATEGORY_BY_KEY[tx.category]);
    }
    if (tx.type === "card" && settings.cards.length > 1) {
      date.textContent += " · 💳 " + cardOf(tx).name;
    }

    const status = document.createElement("div");
    status.className = "status";
    status.textContent = tx.type === "income"
      ? (received ? t("received") : t("planned"))
      : (tx.paid ? t("paid") : (isOverdue && settings.view.overdueHighlight ? t("overdueLabel") : t("pending")));

    const left = document.createElement("div");
    left.append(name, date, status);

    const summary = installmentSummary(tx);
    if (summary) {
      const extra = document.createElement("div");
      extra.className = "status";
      extra.textContent = summary;
      left.appendChild(extra);
    }

    if (settings.view.notes && tx.note) {
      const note = document.createElement("div");
      note.className = "status tx-note";
      note.textContent = "📝 " + tx.note;
      left.appendChild(note);
    }

    const value = document.createElement("div");
    value.className = "tx-value";
    value.textContent = (tx.type === "income" ? "+ " : "- ") + money(tx.amount);

    div.append(left, value);
    div.addEventListener("click", () => { if (swipeBlock) return; transactionOptions(tx); });
    if (settings.view.swipe && tx.type !== "income") attachSwipe(div, tx);
    list.appendChild(div);
  });

  updateSummary(allItems);
  updateOverdueAlert();
  updateSoonAlert();
  updateBudgetAlert();
  fillFilterCat();
  updateBackupAlert();
  updateInvoiceBar();
  renderVaults();
  renderCharts();
  renderExtras();
}

function updateSummary(items) {
  const expenses = items.filter(tx => tx.type === "expense");

  const total = expenses.reduce((sum, tx) => sum + tx.amount, 0);
  const remaining = expenses.filter(tx => !tx.paid).reduce((sum, tx) => sum + tx.amount, 0);

  let wallet = Number(priv.initialBalance) || 0;
  const today = dateString(new Date());

  transactions.forEach(tx => {
    if (tx.repeat === "monthly") {
      const start = new Date(tx.date + "T12:00:00");
      const end = new Date(today + "T12:00:00");
      if (start > end) return;

      let occurrence = new Date(start);
      let index = 0;

      while (occurrence <= end) {
        const key = (tx.type === "card" && cardOf(tx).day > 0)
          ? monthKey(addMonths(occurrence, cardOffsetFor(cardOf(tx))))
          : monthKey(occurrence);

        if (tx.type === "income") {
          wallet += amountForMonth(tx, key);
        } else if ((tx.paidMonths || []).includes(key)) {
          wallet -= amountForMonth(tx, key);
        }

        index++;
        occurrence = addMonths(start, index);
      }
    } else {
      if (tx.type === "income" && tx.date <= today) wallet += tx.amount;
      if ((tx.type === "expense" || tx.type === "card") && tx.paid) wallet -= tx.amount;
    }
  });

  wallet -= vaultsTotal();

  const cardTotal = items.filter(tx => tx.type === "card" && !tx.paid).reduce((sum, tx) => sum + tx.amount, 0);
  document.getElementById("cardTotal").textContent = money(cardTotal);

  document.getElementById("totalExpenses").textContent = money(total);
  document.getElementById("remaining").textContent = money(remaining);

  const walletElement = document.getElementById("wallet");
  walletElement.textContent = money(wallet);
  walletElement.className = wallet > 0 ? "" : wallet < 0 ? "negative" : "zero";
}

/* Lista TODAS as despesas vencidas e não pagas, de qualquer mês ou ano. */
function getOverdueExpenses() {
  const today = dateString(new Date());
  const overdue = [];

  transactions.forEach(tx => {
    if (tx.type !== "expense") return;

    if (tx.repeat === "monthly") {
      const start = new Date(tx.date + "T12:00:00");
      const end = new Date(today + "T12:00:00");
      if (start > end) return;

      let index = 0;
      let occurrence = new Date(start);

      while (occurrence <= end) {
        const key = monthKey(occurrence);
        const day = dateString(occurrence);

        if (day < today && !(tx.paidMonths || []).includes(key)) {
          overdue.push({ description: tx.description, amount: amountForMonth(tx, key), date: day });
        }

        index++;
        occurrence = addMonths(start, index);
      }
    } else if (!tx.paid && tx.date < today) {
      overdue.push({ description: tx.description, amount: tx.amount, date: tx.date });
    }
  });

  return overdue.sort((a, b) => a.date.localeCompare(b.date));
}

function updateOverdueAlert() {
  const alertBox = document.getElementById("overdueAlert");
  const overdue = getOverdueExpenses();

  if (overdue.length === 0) {
    alertBox.hidden = true;
    alertBox.innerHTML = "";
    return;
  }

  alertBox.innerHTML = "";

  const title = document.createElement("strong");
  title.textContent = t("overdueTitle");

  const ul = document.createElement("ul");
  overdue.forEach(item => {
    const li = document.createElement("li");
    li.textContent =
      `${item.description} - ${money(item.amount)} (${t("due")} ${formatDate(item.date)})`;
    ul.appendChild(li);
  });

  alertBox.append(title, ul);
  alertBox.hidden = false;
}

/* ---------- JANELAS ---------- */
function showModal(title, subtitle = "") {
  const overlay = document.createElement("div");
  overlay.className = "action-overlay";

  const menu = document.createElement("div");
  menu.className = "action-menu";

  const heading = document.createElement("h2");
  heading.textContent = title;
  menu.appendChild(heading);

  if (subtitle) {
    const description = document.createElement("p");
    description.textContent = subtitle;
    menu.appendChild(description);
  }

  overlay.appendChild(menu);
  document.body.appendChild(overlay);

  return { overlay, menu };
}

function addModalButton(menu, label, action, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  if (className) button.className = className;
  button.addEventListener("click", action);
  menu.appendChild(button);
  return button;
}

/* Marca como paga (true) ou pendente (false). Não faz nada se já estiver assim. */
function setPaid(tx, wantPaid) {
  const original = transactions.find(item => item.id === tx.originalId);
  if (!original) return false;

  if (tx.repeat === "monthly") {
    const key = monthKey(new Date(tx.date + "T12:00:00"));
    const list = original.paidMonths || [];
    if (wantPaid === list.includes(key)) return false;
    original.paidMonths = wantPaid ? [...list, key] : list.filter(month => month !== key);
  } else {
    if (!!original.paid === wantPaid) return false;
    original.paid = wantPaid;
  }

  saveData();
  render();
  return true;
}

function transactionOptions(tx) {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  if (!document.getElementById("settingsOverlay").hidden) return;

  const { overlay, menu } = showModal(tx.description, money(tx.amount));

  if (tx.type === "expense" || tx.type === "card") {
    addModalButton(menu, tx.paid ? t("markPending") : t("markPaid"), () => {
      overlay.remove();
      setPaid(tx, !tx.paid);
    });
  }

  addModalButton(menu, t("edit"), () => {
    overlay.remove();
    editTransaction(tx);
  });

  addModalButton(menu, t("del"), () => {
    overlay.remove();
    confirmDelete(tx);
  }, "delete-action");

  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

/* Parcelas da mesma compra: "Terreno (1/106)", "Terreno (2/106)"... formam uma série. */
function installmentParts(tx) {
  const m = /^(.*) \((\d+)\/(\d+)\)$/.exec(String(tx.description || "").trim());
  return m ? { base: m[1].trim(), index: m[2], total: m[3] } : null;
}

function sameInstallmentSeries(a, b) {
  if (a.repeat !== "installments" || b.repeat !== "installments") return false;
  if (a.type !== b.type) return false;
  if (a.series && b.series) return a.series === b.series;
  const x = installmentParts(a), y = installmentParts(b);
  return !!(x && y && x.base.toLowerCase() === y.base.toLowerCase() && x.total === y.total);
}

/* Todas as parcelas da mesma compra (inclui a própria). */
function seriesOf(original) {
  const list = transactions.filter(item => item === original || sameInstallmentSeries(original, item));
  return list.length ? list : [original];
}

Object.assign(I18N.pt, {
  delSeriesText: "Esta despesa é parcelada. O que você quer excluir?",
  delOne: "Excluir só esta parcela", delAll: "Excluir todas as parcelas ({n})",
  seriesNote: "Parcelada: nome, valor e categoria mudam em todas as parcelas. Parcelas já pagas mantêm o valor."
});
Object.assign(I18N.en, {
  delSeriesText: "This expense is in installments. What do you want to delete?",
  delOne: "Delete only this installment", delAll: "Delete all installments ({n})",
  seriesNote: "Installments: name, amount and category change in all installments. Paid installments keep their amount."
});
Object.assign(I18N.es, {
  delSeriesText: "Este gasto está en cuotas. ¿Qué quieres eliminar?",
  delOne: "Eliminar solo esta cuota", delAll: "Eliminar todas las cuotas ({n})",
  seriesNote: "En cuotas: nombre, valor y categoría cambian en todas las cuotas. Las cuotas pagadas mantienen su valor."
});

function confirmDelete(tx) {
  const original = transactions.find(item => item.id === tx.originalId);
  const group = original && original.repeat === "installments" ? seriesOf(original) : [];

  if (group.length > 1) {
    const { overlay, menu } = showModal(t("delTitle"), t("delSeriesText"));

    addModalButton(menu, t("delOne"), () => {
      overlay.remove();
      deleteItems([tx.originalId]);
    }, "delete-action");

    addModalButton(menu, t("delAll").replace("{n}", group.length), () => {
      overlay.remove();
      deleteItems(group.map(item => item.id));
    }, "delete-action");

    addModalButton(menu, t("delNo"), () => overlay.remove(), "cancel-action");
    return;
  }

  const { overlay, menu } = showModal(t("delTitle"), t("delText"));

  addModalButton(menu, t("delYes"), () => {
    overlay.remove();
    deleteItems([tx.originalId]);
  }, "delete-action");

  addModalButton(menu, t("delNo"), () => overlay.remove(), "cancel-action");
}

function editTransaction(tx) {
  const original = transactions.find(item => item.id === tx.originalId);
  if (!original) return;

  const group = original.repeat === "installments" ? seriesOf(original) : [original];
  const isSeries = group.length > 1;
  const oldParts = installmentParts(original);
  const oldBase = isSeries && oldParts ? oldParts.base : original.description;
  const isMonthly = original.repeat === "monthly";
  const oldAmount = isMonthly ? tx.amount : original.amount;
  const oldCategory = CATEGORY_BY_KEY[original.category] ? original.category : "geral";

  const { overlay, menu } = showModal(t("editTitle"), isSeries ? t("seriesNote") : t("editText"));

  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = t("description");

  const descriptionInput = document.createElement("input");
  descriptionInput.value = oldBase;

  const amountLabel = document.createElement("label");
  amountLabel.textContent = t("amount");

  const editAmountInput = document.createElement("input");
  editAmountInput.type = "number";
  editAmountInput.min = "0.01";
  editAmountInput.step = "0.01";
  editAmountInput.value = oldAmount;

  menu.append(descriptionLabel, descriptionInput, amountLabel, editAmountInput);

  let editCategory = null;
  if (original.type !== "income") {
    const categoryLabel = document.createElement("label");
    categoryLabel.textContent = t("category");
    editCategory = document.createElement("select");
    editCategory.id = "editCategory";
    fillCategorySelect(editCategory, oldCategory);
    menu.append(categoryLabel, editCategory);
  }

  let noteInput = null;
  if (settings.view.notes) {
    const noteLabel = document.createElement("label");
    noteLabel.textContent = t("noteLabel");
    noteInput = document.createElement("input");
    noteInput.maxLength = 200;
    noteInput.value = original.note || "";
    menu.append(noteLabel, noteInput);
  }

  let cardSelect = null;
  if (original.type === "card" && settings.cards.length > 1) {
    const cardLabel = document.createElement("label");
    cardLabel.textContent = t("cardField");
    cardSelect = document.createElement("select");
    fillCardSelect(cardSelect, cardOf(original).id);
    menu.append(cardLabel, cardSelect);
  }

  addModalButton(menu, t("saveChanges"), () => {
    const newText = descriptionInput.value.trim();
    const newAmount = Number(editAmountInput.value);

    if (!newText || newAmount <= 0) {
      alert(t("invalidEdit"));
      return;
    }

    const nameChanged = newText !== oldBase;
    const amountChanged = newAmount !== oldAmount;
    const newCategory = editCategory ? editCategory.value : null;
    const categoryChanged = newCategory !== null && newCategory !== oldCategory;
    const newNote = noteInput ? noteInput.value.trim().slice(0, 200) : null;
    const newCard = cardSelect ? cardSelect.value : null;
    const applyExtras = item => {
      if (newNote !== null) { if (newNote) item.note = newNote; else delete item.note; }
      if (newCard !== null && newCard !== cardOf(item).id) item.cardId = newCard;
    };

    if (!isSeries) {
      original.description = newText;
      applyExtras(original);
      if (!isMonthly) original.amount = newAmount;
      if (newCategory !== null) original.category = newCategory;
      if (isMonthly && amountChanged) {
        overlay.remove();
        saveData();
        render();
        askMonthlyScope(original, tx, newAmount);
        return;
      }
    } else {
      group.forEach(item => {
        const isThis = item === original;
        applyExtras(item);

        if (nameChanged) {
          const parts = installmentParts(item);
          item.description = parts ? `${newText} (${parts.index}/${parts.total})` : newText;
        }
        /* O valor muda em todas as parcelas que ainda não foram pagas (e sempre na que você editou). */
        if (amountChanged && (isThis || !item.paid)) item.amount = newAmount;
        if (categoryChanged) item.category = newCategory;
      });
    }

    overlay.remove();
    saveData();
    render();
  });

  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

/* ---------- FORMULÁRIO ---------- */
const txOverlay = document.getElementById("txOverlay");
const form = document.getElementById("txForm");
let selectedType = "";

function setType(type) {
  selectedType = type;
  document.getElementById("expenseButton").classList.toggle("selected", type === "expense");
  document.getElementById("incomeButton").classList.toggle("selected", type === "income");
  document.getElementById("cardButton").classList.toggle("selected", type === "card");
  document.getElementById("typeError").hidden = true;
  document.getElementById("categoryField").hidden = (type === "income");
  document.getElementById("cardField").hidden = !(type === "card" && settings.cards.length > 1);
}

document.getElementById("expenseButton").addEventListener("click", () => setType("expense"));
document.getElementById("incomeButton").addEventListener("click", () => setType("income"));
document.getElementById("cardButton").addEventListener("click", () => setType("card"));

/* ---------- CAMPO DE VALOR (estilo banco: os números entram pela direita) ---------- */
const amountInput = document.getElementById("amount");
let amountCents = 0;

function formatCents(cents) {
  const text = String(cents).padStart(3, "0");
  const reais = text.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${reais},${text.slice(-2)}`;
}

function showAmount() {
  amountInput.value = formatCents(amountCents);
  const end = amountInput.value.length;
  try { amountInput.setSelectionRange(end, end); } catch {}
}

/* Substitui o comportamento normal do campo: cada número entra à direita. */
/* (o código antigo do beforeinput foi removido; o evento input abaixo faz tudo) */

/* Reserva para teclados de celular que não enviam o beforeinput: lê o que foi digitado e refaz. */
amountInput.addEventListener("input", () => {
  const digits = amountInput.value.replace(/\D/g, "").replace(/^0+/, "");
  amountCents = digits ? Number(digits.slice(0, 11)) : 0;
  showAmount();
});

amountInput.addEventListener("focus", showAmount);
amountInput.addEventListener("click", showAmount);

document.getElementById("addButton").addEventListener("click", () => {
  form.reset();
  amountCents = 0;
  showAmount();
  setType("");
  document.getElementById("category").value = "geral";
  document.getElementById("dueDate").value = dateString(new Date());
  document.getElementById("countField").hidden = true;
  fillCardSelect();
  txOverlay.hidden = false;
});

document.getElementById("cancelButton").addEventListener("click", () => {
  txOverlay.hidden = true;
});

document.getElementById("repeat").addEventListener("change", event => {
  const isInstallments = event.target.value === "installments";
  document.getElementById("countField").hidden = !isInstallments;
  if (isInstallments) document.getElementById("count").value = "";
});

form.addEventListener("submit", event => {
  event.preventDefault();

  if (!selectedType) {
    document.getElementById("typeError").hidden = false;
    return;
  }

  const type = selectedType;
  const description = document.getElementById("description").value.trim();
  const amount = amountCents / 100;
  const date = document.getElementById("dueDate").value;
  const repeat = document.getElementById("repeat").value;
  const count = Number(document.getElementById("count").value);
  const category = type === "income" ? undefined : (document.getElementById("category").value || "geral");
  const cardId = (type === "card" && settings.cards.length > 1) ? document.getElementById("cardSelect").value : undefined;
  const note = settings.view.notes ? document.getElementById("note").value.trim().slice(0, 200) : "";
  const extras = { ...(cardId ? { cardId } : {}), ...(note ? { note } : {}) };

  if (!description || amount <= 0 || !date) {
    alert(t("fillAll"));
    return;
  }

  if (repeat === "installments" && count < 2) {
    alert(t("minInstallments"));
    return;
  }

  if (repeat === "installments") {
    const series = crypto.randomUUID();
    for (let i = 0; i < count; i++) {
      transactions.push({
        id: crypto.randomUUID(),
        series,
        type,
        description: `${description} (${i + 1}/${count})`,
        amount,
        date: dateString(addMonths(new Date(date + "T12:00:00"), i)),
        repeat: "installments",
        paid: false,
        category,
        ...extras
      });
    }
  } else {
    transactions.push({
      id: crypto.randomUUID(),
      type,
      description,
      amount,
      date,
      repeat,
      paid: false,
      paidMonths: [],
      category,
      ...extras
    });
  }

  saveData();
  txOverlay.hidden = true;
  currentDate = new Date(date + "T12:00:00");
  render();
});

document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate = addMonths(currentDate, -1);
  render();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate = addMonths(currentDate, 1);
  render();
});

/* ---------- MENU DE TRÊS PONTINHOS ---------- */
const settingsOverlay = document.getElementById("settingsOverlay");

document.getElementById("menuButton").addEventListener("click", () => {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  if (!txOverlay.hidden) return;
  settingsOverlay.hidden = false;
});

/* Fecha SOMENTE no X. Clicar fora não fecha. */
document.getElementById("closeSettings").addEventListener("click", () => {
  settingsOverlay.hidden = true;
});

document.getElementById("languageSelect").addEventListener("change", event => {
  settings.lang = event.target.value;
  saveSettings();
  applyLanguage();
  render();
});

document.querySelectorAll("[data-mode]").forEach(button => {
  button.addEventListener("click", () => {
    settings.mode = button.dataset.mode;
    saveSettings();
    applyTheme();
  });
});

/* Tocar na cor ativa volta ao neutro. */
document.querySelectorAll("[data-color]").forEach(button => {
  button.addEventListener("click", () => {
    settings.color = settings.color === button.dataset.color ? "none" : button.dataset.color;
    saveSettings();
    applyTheme();
  });
});

/* ---------- BACKUP ---------- */
const BACKUP_KEY = "minhasDespesasUltimoBackup";

function updateBackupInfo() {
  updateBackupAlert();
  const info = document.getElementById("backupInfo");
  if (!info) return;

  const last = localStorage.getItem(BACKUP_KEY);
  info.textContent = last
    ? `${t("lastBackup")} ${new Date(last).toLocaleString(I18N[settings.lang].locale)}`
    : t("neverBackup");
}

function txSignature(tx) {
  return [tx.type, tx.description.trim().toLowerCase(), Number(tx.amount).toFixed(2), tx.date].join("|");
}

async function exportBackup() {
  const payload = {
    app: "minhasDespesas",
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    transactions,
    priv
  };

  let text = JSON.stringify(payload, null, 2);
  let fileName = `minhas-despesas-backup-${dateString(new Date())}.json`;

  /* Com a proteção ligada, o backup também sai criptografado com a mesma senha. */
  if (cryptoKey) {
    const env = await encryptText(JSON.stringify(payload), cryptoKey, cryptoSalt, cryptoIter);
    text = JSON.stringify({ app: "minhasDespesas", encrypted: true, version: 1, exportedAt: payload.exportedAt, ...env }, null, 2);
    fileName = `minhas-despesas-backup-protegido-${dateString(new Date())}.json`;
  }

  const file = new File([text], fileName, { type: "application/json" });

  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: fileName });
      localStorage.setItem(BACKUP_KEY, new Date().toISOString());
      updateBackupInfo();
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

  localStorage.setItem(BACKUP_KEY, new Date().toISOString());
  updateBackupInfo();
}

/* Junta os dados: o que é novo entra; igual (tipo, nome, valor e data) não duplica. */
function mergeTransactions(incoming) {
  const bySignature = new Map();
  transactions.forEach(tx => bySignature.set(txSignature(tx), tx));
  const ids = new Set(transactions.map(tx => tx.id));

  let added = 0;
  let duplicates = 0;

  incoming.forEach(raw => {
    if (!raw || typeof raw !== "object") return;
    if (typeof raw.description !== "string" || typeof raw.date !== "string") return;
    if (raw.type !== "expense" && raw.type !== "income" && raw.type !== "card") return;
    if (!(Number(raw.amount) > 0)) return;

    const tx = { ...raw, amount: Number(raw.amount) };
    const existing = ids.has(tx.id) ? transactions.find(item => item.id === tx.id) : bySignature.get(txSignature(tx));

    if (existing) {
      // Mantém a marcação de paga e os meses pagos de qualquer lado.
      if (tx.paid) existing.paid = true;
      const months = new Set([...(existing.paidMonths || []), ...(tx.paidMonths || [])]);
      if (months.size > 0 || existing.repeat === "monthly") existing.paidMonths = [...months];
      duplicates++;
      return;
    }

    if (!tx.id || ids.has(tx.id)) tx.id = crypto.randomUUID();
    transactions.push(tx);
    ids.add(tx.id);
    bySignature.set(txSignature(tx), tx);
    added++;
  });

  return { added, duplicates };
}

function applyImportedData(data) {
  const result = mergeTransactions(data.transactions);

  if (data.settings && Array.isArray(data.settings.customCategories)) {
    data.settings.customCategories.filter(isValidCustomCategory).forEach(c => {
      if (!settings.customCategories.some(x => x.key === c.key) && settings.customCategories.length < MAX_CUSTOM_CATEGORIES) {
        settings.customCategories.push({ key: c.key, name: c.name.slice(0, 24), emoji: c.emoji, color: c.color });
      }
    });
    saveSettings();
    rebuildCategories();
    applyChartLabels();
  }

  if (data.settings && Array.isArray(data.settings.cards)) {
    sanitizeCards(data.settings.cards).forEach(c => {
      if (!settings.cards.some(x => x.id === c.id) && settings.cards.length < MAX_CARDS) settings.cards.push(c);
    });
    saveSettings();
    applyCardSettings();
  }

  if (data.priv) {
    const p = sanitizePriv(data.priv);
    if (!priv.initialBalance && p.initialBalance) priv.initialBalance = p.initialBalance;
    Object.keys(p.budgets).forEach(k => { if (!(k in priv.budgets)) priv.budgets[k] = p.budgets[k]; });
    p.vaults.forEach(v => {
      if (!priv.vaults.some(x => x.id === v.id) && priv.vaults.length < MAX_VAULTS) priv.vaults.push(v);
    });
  }

  saveData();
  render();
  applyNewLabels();

  alert(t("importDone").replace("{n}", result.added).replace("{d}", result.duplicates));
}

function importBackup(file) {
  const reader = new FileReader();

  reader.onload = async () => {
    try {
      // Ignora marcas de formatação (3 crases) caso o arquivo tenha sido copiado e colado.
      const cleaned = String(reader.result)
        .replace(/^﻿/, "")
        .trim()
        .replace(/^[\x60]{3}[a-zA-Z]*\s*/, "")
        .replace(/\s*[\x60]{3}$/, "")
        .trim();

      let data = JSON.parse(cleaned);

      if (data && data.encrypted) {
        const password = await askPasswordModal(t("backupPwTitle"), t("backupPwText"));
        try {
          const key = await deriveKey(password, b64ToBytes(data.salt), data.iter || PBKDF2_ITER);
          data = JSON.parse(await decryptEnvelope(data, key));
        } catch {
          throw new Error("senha");
        }
      }

      if (!data || data.app !== "minhasDespesas" || !Array.isArray(data.transactions)) {
        throw new Error("formato");
      }

      applyImportedData(data);
    } catch (error) {
      if (error && error.message === "cancelado") return;
      alert(error && error.message === "senha" ? t("lockWrong") : t("importError"));
    }
  };

  reader.onerror = () => alert(t("importError"));
  reader.readAsText(file);
}

document.getElementById("exportButton").addEventListener("click", exportBackup);

document.getElementById("importButton").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", event => {
  const file = event.target.files && event.target.files[0];
  if (file) importBackup(file);
  event.target.value = "";
});

/* ---------- LEITOR DE NOTAS (câmera) ---------- */
/* Tudo deste bloco é novo. Ele só usa funções que já existem (setType, showAmount, dateString, t). */
Object.assign(I18N.pt, {
  scanTitle: "Lendo a nota",
  scanReading: "Lendo a nota... pode levar alguns segundos.",
  scanDownloading: "Baixando o leitor de texto (só na primeira vez, precisa de internet)...",
  scanProgress: "Lendo a nota... {p}%",
  scanError: "Não consegui ler a nota. Confira a internet e tente de novo, com a foto bem iluminada e sem tremer.",
  scanNoValue: "Não achei o valor na foto. Preencha o valor e confira os outros campos.",
  scanSeen: "Texto lido:"
});
Object.assign(I18N.en, {
  scanTitle: "Reading the receipt",
  scanReading: "Reading the receipt... this may take a few seconds.",
  scanDownloading: "Downloading the text reader (first time only, needs internet)...",
  scanProgress: "Reading the receipt... {p}%",
  scanError: "Could not read the receipt. Check your internet and try again with a well-lit, steady photo.",
  scanNoValue: "Could not find the amount in the photo. Fill in the amount and check the other fields.",
  scanSeen: "Text read:"
});
Object.assign(I18N.es, {
  scanTitle: "Leyendo el recibo",
  scanReading: "Leyendo el recibo... puede tardar unos segundos.",
  scanDownloading: "Descargando el lector de texto (solo la primera vez, necesita internet)...",
  scanProgress: "Leyendo el recibo... {p}%",
  scanError: "No pude leer el recibo. Revisa el internet e inténtalo de nuevo con una foto bien iluminada y sin movimiento.",
  scanNoValue: "No encontré el valor en la foto. Completa el valor y revisa los otros campos.",
  scanSeen: "Texto leído:"
});

/* PURE:START (funções de interpretação do texto lido, sem acesso à tela) */
const SCAN_MONEY_RE = /(?<![\d.,\/-])(?:\d{1,3}(?:\.\d{3})+|\d+)[.,]\d{2}(?!\d)(?![.,]\d)/g;

function scanParseMoney(text) {
  let s = text.trim();
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  const n = Number(s);
  return isFinite(n) ? n : NaN;
}

function scanAmountsIn(line) {
  return (line.match(SCAN_MONEY_RE) || []).map(scanParseMoney).filter(n => n > 0 && n < 10000000);
}

function scanFindTotal(lines) {
  const bad = /(sub\s*-?\s*total|troco|valor\s+pago|pago\b|pagto|recebid|dinheiro|desconto|acr[eé]scimo|\bqtd|icms|\bpis\b|cofins|tribut|imposto|juros|multa|aproximad)/i;
  const tiers = [
    /(valor\s+(total\s+)?a\s+pagar|total\s+a\s+pagar|valor\s+do\s+documento|valor\s+cobrado|total\s+da\s+fatura|total\s+geral|valor\s+total|vlr\.?\s*total)/i,
    /(\btotal\b|l[ií]quido|a\s+pagar)/i,
    /(\bvalor\b|\bpre[cç]o\b|tarifa|ped[aá]gio|estacionamento|permanência)/i
  ];
  for (const tier of tiers) {
    const found = [];
    lines.forEach((line, i) => {
      if (!tier.test(line) || bad.test(line)) return;
      let amounts = scanAmountsIn(line);
      if (!amounts.length && lines[i + 1] && !bad.test(lines[i + 1])) amounts = scanAmountsIn(lines[i + 1]);
      found.push(...amounts);
    });
    if (found.length) return Math.max(...found);
  }
  const all = [];
  lines.forEach(line => { if (!bad.test(line)) all.push(...scanAmountsIn(line)); });
  return all.length ? Math.max(...all) : 0;
}

function scanTitleCase(text) {
  const small = ["de", "da", "do", "das", "dos", "e"];
  return text.toLowerCase().split(" ").map((w, i) =>
    (i > 0 && small.includes(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)
  ).join(" ");
}

function scanFindName(lines) {
  const skip = /(cnpj|cpf|\bie\s*:|inscri|cupom|nota\s+fiscal|nfc-?e|danfe|documento|consumidor|www\.|http|@|\btel\b|fone|\brua\b|\bav\.|avenida|endere|\bdata\b|\bhora\b|extrato|via\s+do|comprovante|recibo)/i;
  const good = line => {
    const letters = (line.match(/[A-Za-zÀ-ÿ]/g) || []).length;
    const size = line.replace(/\s/g, "").length;
    return letters >= 4 && size > 0 && letters / size >= 0.65;
  };
  const top = lines.slice(0, 12);
  let pick = top.find(line => good(line) && !skip.test(line)) || top.find(good) || "";
  pick = pick.replace(/[^A-Za-zÀ-ÿ0-9&.\- ]/g, " ").replace(/\s+/g, " ").trim();
  if (pick.length > 40) pick = pick.slice(0, 40).trim();
  const letters = pick.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letters && letters === letters.toUpperCase()) pick = scanTitleCase(pick);
  return pick;
}

function scanValidDate(d, m, y) {
  if (y < 100) y += 2000;
  if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getMonth() !== m - 1) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function scanDatesIn(line) {
  const out = [];
  const re = /(?<!\d)(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4}|\d{2})(?!\d)/g;
  let m;
  while ((m = re.exec(line))) {
    const v = scanValidDate(Number(m[1]), Number(m[2]), Number(m[3]));
    if (v) out.push(v);
  }
  return out;
}

function scanFindDate(lines, todayText) {
  const due = /(vencimento|\bvenc\b|\bvence\b|pagar\s+at[eé])/i;
  for (let i = 0; i < lines.length; i++) {
    if (!due.test(lines[i])) continue;
    const here = scanDatesIn(lines[i]);
    if (here.length) return here[0];
    const next = lines[i + 1] ? scanDatesIn(lines[i + 1]) : [];
    if (next.length) return next[0];
  }
  const today = new Date(todayText + "T12:00:00");
  for (const line of lines) {
    for (const d of scanDatesIn(line)) {
      const diff = (new Date(d + "T12:00:00") - today) / 86400000;
      if (diff <= 1 && diff >= -400) return d;
    }
  }
  return todayText;
}

function parseReceipt(text, todayText) {
  const fixed = String(text || "").replace(/(\d)\s*([,.])\s*(\d{2})(?!\d)/g, "$1$2$3");
  const lines = fixed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return {
    value: scanFindTotal(lines),
    name: scanFindName(lines),
    date: scanFindDate(lines, todayText)
  };
}
/* PURE:END */

function scanShow(message) {
  document.getElementById("scanTitle").textContent = t("scanTitle");
  document.getElementById("scanStatus").textContent = message;
  document.getElementById("scanOverlay").hidden = false;
}

function scanHide() {
  document.getElementById("scanOverlay").hidden = true;
}

let scanTesseractPromise = null;

function scanLoadLibrary() {
  if (window.Tesseract) return Promise.resolve();
  if (!scanTesseractPromise) {
    scanTesseractPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
      script.onload = () => resolve();
      script.onerror = () => { scanTesseractPromise = null; reject(new Error("load")); };
      document.head.appendChild(script);
    });
  }
  return scanTesseractPromise;
}

/* Reduz a foto e aumenta o contraste, o que ajuda muito a leitura de papel térmico. */
function scanPrepareImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const limit = 2600;
        const scale = Math.min(1, limit / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        const image = ctx.getImageData(0, 0, w, h);
        const px = image.data;
        const hist = new Array(256).fill(0);
        for (let i = 0; i < px.length; i += 4) {
          const g = Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]);
          px[i] = g;
          hist[g]++;
        }
        const total = w * h;
        let low = 0, high = 255, acc = 0;
        for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * 0.02) { low = v; break; } }
        acc = 0;
        for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc >= total * 0.02) { high = v; break; } }
        const range = Math.max(30, high - low);
        for (let i = 0; i < px.length; i += 4) {
          const v = Math.max(0, Math.min(255, Math.round((px[i] - low) * 255 / range)));
          px[i] = px[i + 1] = px[i + 2] = v;
        }
        ctx.putImageData(image, 0, 0);

        canvas.toBlob(blob => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob); else reject(new Error("blob"));
        }, "image/png");
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("img")); };
    img.src = url;
  });
}

function scanFillForm(result, rawText) {
  document.getElementById("addButton").click();   // abre a tela normal de nova movimentação
  setType("expense");
  if (result.name) document.getElementById("description").value = result.name;
  if (result.value > 0) {
    amountCents = Math.round(result.value * 100);
    showAmount();
  }
  document.getElementById("dueDate").value = result.date;
  if (!(result.value > 0)) {
    const seen = String(rawText || "").replace(/\s+/g, " ").trim().slice(0, 400);
    alert(t("scanNoValue") + "\n\n" + (t("scanSeen")) + " " + (seen || "(-)"));
  }
}

async function scanReceipt(file) {
  scanShow(t("scanReading"));
  let worker = null;

  try {
    await scanLoadLibrary();
    const image = await scanPrepareImage(file);

    worker = await Tesseract.createWorker("por", 1, {
      logger: info => {
        if (!info) return;
        if (/loading|initializ/i.test(info.status || "")) {
          document.getElementById("scanStatus").textContent = t("scanDownloading");
        } else if (info.status === "recognizing text" && typeof info.progress === "number") {
          document.getElementById("scanStatus").textContent =
            t("scanProgress").replace("{p}", Math.round(info.progress * 100));
        }
      }
    });

    const todayText = dateString(new Date());
    let text = "";
    let result = null;

    for (const mode of ["4", "6"]) {
      try { await worker.setParameters({ tessedit_pageseg_mode: mode }); } catch {}
      const { data } = await worker.recognize(image);
      const read = (data && data.text) || "";
      const attempt = parseReceipt(read, todayText);
      if (!result || attempt.value > 0) { result = attempt; text = read; }
      if (attempt.value > 0) break;
    }

    scanHide();
    scanFillForm(result, text);
  } catch (error) {
    scanHide();
    alert(t("scanError"));
  } finally {
    if (worker) { try { await worker.terminate(); } catch {} }
  }
}

document.getElementById("scanButton").addEventListener("click", () => {
  if (!document.getElementById("txOverlay").hidden) return;
  if (!document.getElementById("settingsOverlay").hidden) return;
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  document.getElementById("scanFile").click();
});

document.getElementById("scanFile").addEventListener("change", event => {
  const file = event.target.files && event.target.files[0];
  event.target.value = "";
  if (file) scanReceipt(file);
});
/* ---------- NOVIDADES 2: EXIBIÇÃO, CARTÕES, COMPARAÇÃO, RESUMO ANUAL, OBSERVAÇÕES, ORDEM E DESLIZAR ---------- */
Object.assign(I18N.pt, {
  viewTitle: "Exibição", viewHelp: "Escolha o que aparece na tela. Desligar só esconde: seus dados continuam guardados.",
  viewMain: "Tela principal", viewAlerts: "Avisos", viewExtras: "Extras",
  v_totalPay: "Total a pagar", v_totalRemaining: "Saldo a pagar", v_wallet: "Carteira", v_cardTotal: "Cartão de crédito e faturas",
  v_charts: "Gráficos", v_filters: "Busca e filtros", v_vaults: "Cofres", v_scan: "Câmera (ler nota)",
  v_alertOverdue: "Contas atrasadas", v_alertSoon: "Contas vencendo em breve", v_alertBudget: "Orçamento do mês", v_alertBackup: "Lembrete de backup",
  v_compare: "Comparação com o mês anterior", v_yearly: "Resumo anual", v_notes: "Observações", v_sort: "Ordenar a lista", v_swipe: "Deslizar para pagar",
  soonLabel: "Avisar vencimentos com antecedência", soonDay1: "1 dia", soonDay2: "2 dias", soonDay3: "3 dias",
  soonTitle1: "Vencem hoje ou amanhã:",
  cardSet: "Cartões de crédito", cardNamePh: "Nome do cartão", cardDayPh: "Dia do vencimento (1 a 31)",
  cardNextBtn: "Mês seguinte", cardSameBtn: "Mesmo mês",
  cardSetInfo: "As compras no cartão de um mês caem juntas no dia do vencimento. Vazio = usa a data de cada compra.",
  cardAdd: "➕ Novo cartão", cardDel: "Excluir cartão", cardDelTitle: "Excluir cartão?",
  cardDelText: "As compras deste cartão passam para o cartão {n}.", cardMax: "Limite de 10 cartões.",
  cardDefaultName: "Cartão", cardField: "Cartão",
  noteLabel: "Observação (opcional)", noteShort: "Observação",
  sortLabel: "Ordenar", sortDate: "Data", sortHigh: "Maior valor", sortLow: "Menor valor", sortName: "Nome (A-Z)",
  compareTitle: "📈 Comparação com o mês anterior", compareNone: "Sem gastos nesses dois meses.",
  compareThis: "Este mês", comparePrev: "Mês anterior", compareTotal: "Total", compareSame: "igual",
  yearTitle: "📅 Resumo anual", yearIn: "Entradas", yearOut: "Despesas", yearLeft: "Sobra", yearTotal: "Ano todo"
});
Object.assign(I18N.en, {
  viewTitle: "Display", viewHelp: "Choose what shows on the screen. Turning off only hides: your data stays saved.",
  viewMain: "Main screen", viewAlerts: "Alerts", viewExtras: "Extras",
  v_totalPay: "Total to pay", v_totalRemaining: "Balance to pay", v_wallet: "Wallet", v_cardTotal: "Credit card and bills",
  v_charts: "Charts", v_filters: "Search and filters", v_vaults: "Vaults", v_scan: "Camera (read receipt)",
  v_alertOverdue: "Overdue bills", v_alertSoon: "Bills due soon", v_alertBudget: "Monthly budget", v_alertBackup: "Backup reminder",
  v_compare: "Compare with last month", v_yearly: "Yearly summary", v_notes: "Notes", v_sort: "Sort the list", v_swipe: "Swipe to pay",
  soonLabel: "Warn about due dates in advance", soonDay1: "1 day", soonDay2: "2 days", soonDay3: "3 days",
  soonTitle1: "Due today or tomorrow:",
  cardSet: "Credit cards", cardNamePh: "Card name", cardDayPh: "Due day (1 to 31)",
  cardNextBtn: "Next month", cardSameBtn: "Same month",
  cardSetInfo: "Card purchases of a month are due together on the due day. Empty = uses each purchase date.",
  cardAdd: "➕ New card", cardDel: "Delete card", cardDelTitle: "Delete card?",
  cardDelText: "Purchases on this card move to the card {n}.", cardMax: "Limit of 10 cards.",
  cardDefaultName: "Card", cardField: "Card",
  noteLabel: "Note (optional)", noteShort: "Note",
  sortLabel: "Sort", sortDate: "Date", sortHigh: "Highest amount", sortLow: "Lowest amount", sortName: "Name (A-Z)",
  compareTitle: "📈 Compare with last month", compareNone: "No spending in these two months.",
  compareThis: "This month", comparePrev: "Last month", compareTotal: "Total", compareSame: "same",
  yearTitle: "📅 Yearly summary", yearIn: "Income", yearOut: "Expenses", yearLeft: "Left over", yearTotal: "Whole year"
});
Object.assign(I18N.es, {
  viewTitle: "Pantalla", viewHelp: "Elige qué se muestra en la pantalla. Desactivar solo oculta: tus datos siguen guardados.",
  viewMain: "Pantalla principal", viewAlerts: "Avisos", viewExtras: "Extras",
  v_totalPay: "Total a pagar", v_totalRemaining: "Saldo a pagar", v_wallet: "Cartera", v_cardTotal: "Tarjeta de crédito y facturas",
  v_charts: "Gráficos", v_filters: "Búsqueda y filtros", v_vaults: "Cajas", v_scan: "Cámara (leer recibo)",
  v_alertOverdue: "Cuentas atrasadas", v_alertSoon: "Cuentas por vencer", v_alertBudget: "Presupuesto del mes", v_alertBackup: "Recordatorio de copia",
  v_compare: "Comparación con el mes anterior", v_yearly: "Resumen anual", v_notes: "Observaciones", v_sort: "Ordenar la lista", v_swipe: "Deslizar para pagar",
  soonLabel: "Avisar vencimientos con antelación", soonDay1: "1 día", soonDay2: "2 días", soonDay3: "3 días",
  soonTitle1: "Vencen hoy o mañana:",
  cardSet: "Tarjetas de crédito", cardNamePh: "Nombre de la tarjeta", cardDayPh: "Día de vencimiento (1 a 31)",
  cardNextBtn: "Mes siguiente", cardSameBtn: "Mismo mes",
  cardSetInfo: "Las compras con tarjeta de un mes vencen juntas el día de vencimiento. Vacío = usa la fecha de cada compra.",
  cardAdd: "➕ Nueva tarjeta", cardDel: "Eliminar tarjeta", cardDelTitle: "¿Eliminar tarjeta?",
  cardDelText: "Las compras de esta tarjeta pasan a la tarjeta {n}.", cardMax: "Límite de 10 tarjetas.",
  cardDefaultName: "Tarjeta", cardField: "Tarjeta",
  noteLabel: "Observación (opcional)", noteShort: "Observación",
  sortLabel: "Ordenar", sortDate: "Fecha", sortHigh: "Mayor valor", sortLow: "Menor valor", sortName: "Nombre (A-Z)",
  compareTitle: "📈 Comparación con el mes anterior", compareNone: "Sin gastos en estos dos meses.",
  compareThis: "Este mes", comparePrev: "Mes anterior", compareTotal: "Total", compareSame: "igual",
  yearTitle: "📅 Resumen anual", yearIn: "Ingresos", yearOut: "Gastos", yearLeft: "Sobra", yearTotal: "Todo el año"
});

/* ----- o que aparece na tela ----- */
const VIEW_GROUPS = [
  ["viewMain", ["totalPay", "totalRemaining", "wallet", "cardTotal", "charts", "filters", "vaults", "scan"]],
  ["viewAlerts", ["alertOverdue", "alertSoon", "alertBudget", "alertBackup"]],
  ["viewExtras", ["compare", "yearly", "notes", "sort", "swipe", "overdueHighlight"]]
];

function applyView() {
  VIEW_KEYS.forEach(k => document.body.classList.toggle("hide-" + k, !settings.view[k]));
  const footerOff = ["totalPay", "totalRemaining", "wallet", "cardTotal"].every(k => !settings.view[k]);
  document.body.classList.toggle("hide-footer", footerOff);
}

function resetFilters() {
  filters.q = "";
  filters.cat = "all";
  filters.status = "all";
  const search = document.getElementById("searchInput");
  if (search) search.value = "";
  const cat = document.getElementById("filterCat");
  if (cat) cat.value = "all";
  const status = document.getElementById("filterStatus");
  if (status) status.value = "all";
}

function renderViewPanel() {
  setText("lblView", t("viewTitle"));
  setText("viewHelp", t("viewHelp"));

  const box = document.getElementById("viewList");
  if (!box) return;
  box.innerHTML = "";

  VIEW_GROUPS.forEach(([groupKey, keys]) => {
    const head = document.createElement("div");
    head.className = "view-group";
    head.textContent = t(groupKey);
    box.appendChild(head);

    keys.forEach(key => {
      const row = document.createElement("label");
      row.className = "view-row";

      const text = document.createElement("span");
      text.textContent = t("v_" + key);

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = !!settings.view[key];
      input.addEventListener("change", () => {
        settings.view[key] = input.checked;
        if (key === "filters" && !input.checked) resetFilters();
        if (key === "sort" && !input.checked) sortMode = "date";
        saveSettings();
        applyView();
        render();
      });

      row.append(text, input);
      box.appendChild(row);
    });
  });
}

/* ----- aviso de vencimento: 1, 2 ou 3 dias ----- */
function renderSoonDays() {
  setText("lblSoon", t("soonLabel"));
  const row = document.getElementById("soonDaysRow");
  if (!row) return;
  row.innerHTML = "";

  [1, 2, 3].forEach(n => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice" + (settings.soonDays === n ? " active" : "");
    button.textContent = t("soonDay" + n);
    button.addEventListener("click", () => {
      settings.soonDays = n;
      saveSettings();
      renderSoonDays();
      render();
    });
    row.appendChild(button);
  });
}

/* ----- cartões (até 10) ----- */
function newCardId() {
  return "card" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function fillCardSelect(select, value) {
  select = select || document.getElementById("cardSelect");
  if (!select) return;
  select.innerHTML = "";
  settings.cards.forEach(card => {
    const option = document.createElement("option");
    option.value = card.id;
    option.textContent = "💳 " + card.name;
    select.appendChild(option);
  });
  select.value = value && settings.cards.some(c => c.id === value) ? value : settings.cards[0].id;
}

function confirmDeleteCard(card) {
  if (settings.cards.length < 2) return;
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;

  const rest = settings.cards.filter(c => c.id !== card.id);
  const { overlay, menu } = showModal(t("cardDelTitle") + " " + card.name, t("cardDelText").replace("{n}", rest[0].name));

  addModalButton(menu, t("cardDel"), () => {
    transactions.forEach(tx => {
      if (tx.type === "card" && tx.cardId === card.id) tx.cardId = rest[0].id;
    });
    settings.cards = rest;
    saveSettings();
    saveData();
    overlay.remove();
    applyCardSettings();
    render();
  }, "delete-action");

  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

function applyCardSettings() {
  setText("lblCardSet", t("cardSet"));
  setText("cardSetInfo", t("cardSetInfo"));
  setText("lblCardField", t("cardField"));
  setText("lblNote", t("noteLabel"));

  const add = document.getElementById("addCardButton");
  if (add) {
    add.textContent = t("cardAdd");
    add.disabled = settings.cards.length >= MAX_CARDS;
  }

  const box = document.getElementById("cardList");
  if (box) {
    box.innerHTML = "";

    settings.cards.forEach(card => {
      const item = document.createElement("div");
      item.className = "card-item";

      const name = document.createElement("input");
      name.type = "text";
      name.maxLength = 24;
      name.placeholder = t("cardNamePh");
      name.value = card.name;
      name.addEventListener("change", () => {
        card.name = name.value.trim().slice(0, 24) || card.name;
        name.value = card.name;
        saveSettings();
        fillCardSelect();
        render();
      });

      const day = document.createElement("input");
      day.type = "number";
      day.inputMode = "numeric";
      day.min = "1";
      day.max = "31";
      day.placeholder = t("cardDayPh");
      day.value = card.day > 0 ? card.day : "";
      day.addEventListener("change", () => {
        const value = Math.floor(Number(day.value));
        card.day = value >= 1 && value <= 31 ? value : 0;
        day.value = card.day > 0 ? card.day : "";
        saveSettings();
        render();
      });

      const row = document.createElement("div");
      row.className = "choice-row";
      const next = document.createElement("button");
      next.type = "button";
      next.className = "choice" + (card.next ? " active" : "");
      next.textContent = t("cardNextBtn");
      const same = document.createElement("button");
      same.type = "button";
      same.className = "choice" + (card.next ? "" : " active");
      same.textContent = t("cardSameBtn");
      const choose = value => {
        card.next = value;
        next.classList.toggle("active", value);
        same.classList.toggle("active", !value);
        saveSettings();
        render();
      };
      next.addEventListener("click", () => choose(true));
      same.addEventListener("click", () => choose(false));
      row.append(next, same);

      item.append(name, day, row);

      if (settings.cards.length > 1) {
        const del = document.createElement("button");
        del.type = "button";
        del.className = "delete-action";
        del.textContent = t("cardDel");
        del.addEventListener("click", () => confirmDeleteCard(card));
        item.appendChild(del);
      }

      box.appendChild(item);
    });
  }

  fillCardSelect();
}

document.getElementById("addCardButton").addEventListener("click", () => {
  if (settings.cards.length >= MAX_CARDS) { alert(t("cardMax")); return; }
  settings.cards.push({ id: newCardId(), name: t("cardDefaultName") + " " + (settings.cards.length + 1), day: 0, next: true });
  saveSettings();
  applyCardSettings();
  render();
});

/* ----- ordenar a lista ----- */
let sortMode = "date";   /* sempre abre por data */

function sortItems(items) {
  if (!settings.view.sort || sortMode === "date") return items;
  const list = [...items];
  const locale = I18N[settings.lang].locale;

  if (sortMode === "high") list.sort((a, b) => b.amount - a.amount);
  else if (sortMode === "low") list.sort((a, b) => a.amount - b.amount);
  else if (sortMode === "name") list.sort((a, b) => a.description.localeCompare(b.description, locale, { sensitivity: "base" }));
  return list;
}

function fillSortSelect() {
  setText("lblSort", t("sortLabel"));
  const select = document.getElementById("sortSelect");
  if (!select) return;
  select.innerHTML = "";
  [["date", "sortDate"], ["high", "sortHigh"], ["low", "sortLow"], ["name", "sortName"]].forEach(([value, key]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = t(key);
    select.appendChild(option);
  });
  select.value = sortMode;
}

document.getElementById("sortSelect").addEventListener("change", event => {
  sortMode = event.target.value;
  render();
});

/* ----- deslizar para pagar (direita = paga, esquerda = pendente) ----- */
let swipeBlock = false;

function attachSwipe(el, tx) {
  el.style.touchAction = "pan-y";

  let startX = 0, startY = 0, dx = 0, active = false, moved = false, pointer = null;

  el.addEventListener("pointerdown", event => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    active = true;
    moved = false;
    dx = 0;
    startX = event.clientX;
    startY = event.clientY;
    pointer = event.pointerId;
  });

  el.addEventListener("pointermove", event => {
    if (!active || event.pointerId !== pointer) return;
    const mx = event.clientX - startX;
    const my = event.clientY - startY;

    if (!moved) {
      if (Math.abs(mx) > 10 && Math.abs(mx) > Math.abs(my) * 1.5) {
        moved = true;
        try { el.setPointerCapture(pointer); } catch {}
      } else {
        return;
      }
    }

    dx = Math.max(-120, Math.min(120, mx));
    el.style.transform = "translateX(" + dx + "px)";
    el.classList.toggle("swipe-right", dx > 0);
    el.classList.toggle("swipe-left", dx < 0);
  });

  const finish = event => {
    if (!active || event.pointerId !== pointer) return;
    active = false;
    if (!moved) return;

    swipeBlock = true;
    setTimeout(() => { swipeBlock = false; }, 400);

    const finalDx = dx;
    el.style.transform = "";
    el.classList.remove("swipe-right", "swipe-left");

    if (event.type === "pointercancel") return;
    if (Math.abs(finalDx) >= 70) setPaid(tx, finalDx > 0);
  };

  el.addEventListener("pointerup", finish);
  el.addEventListener("pointercancel", finish);
}

/* ----- comparação com o mês anterior e resumo anual ----- */
let compareOpen = false;
let yearOpen = false;
let yearView = new Date().getFullYear();

function monthLong(date) {
  const text = date.toLocaleDateString(I18N[settings.lang].locale, { month: "long" });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function diffText(current, previous) {
  const delta = current - previous;
  if (Math.abs(delta) < 0.005) return { text: t("compareSame"), cls: "" };
  let text = (delta > 0 ? "▲ " : "▼ ") + money(Math.abs(delta));
  if (previous > 0) text += " (" + Math.round(Math.abs(delta) / previous * 100) + "%)";
  return { text, cls: delta > 0 ? "up" : "down" };
}

function compareRow(name, current, previous, strong) {
  const row = document.createElement("div");
  row.className = "cmp-row" + (strong ? " cmp-total" : "");

  const top = document.createElement("div");
  top.className = "cmp-top";
  const label = document.createElement("span");
  label.textContent = name;
  const diff = diffText(current, previous);
  const change = document.createElement("span");
  change.className = "cmp-diff " + diff.cls;
  change.textContent = diff.text;
  top.append(label, change);

  const sub = document.createElement("div");
  sub.className = "cmp-sub";
  sub.textContent = t("compareThis") + ": " + money(current) + " · " + t("comparePrev") + ": " + money(previous);

  row.append(top, sub);
  return row;
}

function renderCompare() {
  setText("compareToggleText", t("compareTitle"));
  const arrow = document.getElementById("compareArrow");
  if (arrow) arrow.textContent = compareOpen ? "▴" : "▾";

  const body = document.getElementById("compareBody");
  if (!body) return;
  body.hidden = !compareOpen;
  if (!compareOpen) return;
  body.innerHTML = "";

  const previousDate = addMonths(currentDate, -1);
  const current = spentByCategory(currentDate);
  const previous = spentByCategory(previousDate);

  const head = document.createElement("div");
  head.className = "cmp-head";
  head.textContent = monthLong(currentDate) + " × " + monthLong(previousDate);
  body.appendChild(head);

  const rows = CATEGORIES.filter(c => (current[c.key] || 0) > 0 || (previous[c.key] || 0) > 0);
  if (!rows.length) {
    const empty = document.createElement("div");
    empty.className = "chart-empty";
    empty.textContent = t("compareNone");
    body.appendChild(empty);
    return;
  }

  const totalNow = rows.reduce((sum, c) => sum + (current[c.key] || 0), 0);
  const totalBefore = rows.reduce((sum, c) => sum + (previous[c.key] || 0), 0);
  body.appendChild(compareRow(t("compareTotal"), totalNow, totalBefore, true));
  rows.forEach(c => body.appendChild(compareRow(c.emoji + " " + categoryName(c), current[c.key] || 0, previous[c.key] || 0, false)));
}

function renderYear() {
  setText("yearToggleText", t("yearTitle"));
  const arrow = document.getElementById("yearArrow");
  if (arrow) arrow.textContent = yearOpen ? "▴" : "▾";

  const body = document.getElementById("yearBody");
  if (!body) return;
  body.hidden = !yearOpen;
  if (!yearOpen) return;
  body.innerHTML = "";

  const nav = document.createElement("div");
  nav.className = "chart-range";
  const prev = document.createElement("button");
  prev.type = "button";
  prev.textContent = "‹";
  prev.setAttribute("aria-label", t("prevMonthLabel"));
  prev.addEventListener("click", () => { yearView--; renderYear(); });
  const label = document.createElement("span");
  label.textContent = String(yearView);
  const next = document.createElement("button");
  next.type = "button";
  next.textContent = "›";
  next.setAttribute("aria-label", t("nextMonthLabel"));
  next.addEventListener("click", () => { yearView++; renderYear(); });
  nav.append(prev, label, next);
  body.appendChild(nav);

  const months = [];
  let totalIn = 0, totalOut = 0;
  for (let m = 0; m < 12; m++) {
    const date = new Date(yearView, m, 1, 12);
    const items = getMonthTransactions(date);
    const income = items.filter(tx => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
    const spent = items.filter(tx => tx.type === "expense" || tx.type === "card").reduce((sum, tx) => sum + tx.amount, 0);
    months.push({ date, income, spent });
    totalIn += income;
    totalOut += spent;
  }

  const yearRow = (name, income, spent, strong) => {
    const row = document.createElement("div");
    row.className = "cmp-row" + (strong ? " cmp-total" : "");

    const top = document.createElement("div");
    top.className = "cmp-top";
    const title = document.createElement("span");
    title.textContent = name;
    const left = income - spent;
    const result = document.createElement("span");
    result.className = "cmp-diff " + (left < 0 ? "up" : left > 0 ? "down" : "");
    result.textContent = t("yearLeft") + ": " + money(left);
    top.append(title, result);

    const sub = document.createElement("div");
    sub.className = "cmp-sub";
    sub.textContent = t("yearIn") + ": " + money(income) + " · " + t("yearOut") + ": " + money(spent);

    row.append(top, sub);
    return row;
  };

  body.appendChild(yearRow(t("yearTotal"), totalIn, totalOut, true));
  months.forEach(m => {
    if (m.income === 0 && m.spent === 0) return;
    body.appendChild(yearRow(monthLong(m.date), m.income, m.spent, false));
  });
}

function renderExtras() {
  if (settings.view.compare) renderCompare();
  if (settings.view.yearly) renderYear();
  maybeAutoSnapshot();
}

document.getElementById("compareToggle").addEventListener("click", () => { compareOpen = !compareOpen; renderCompare(); });
document.getElementById("yearToggle").addEventListener("click", () => { yearOpen = !yearOpen; renderYear(); });

/* ----- textos novos ----- */
function applyExtraLabels() {
  applyView();
  renderViewPanel();
  renderSoonDays();
  fillSortSelect();
  setText("lblNote", t("noteLabel"));
  setText("lblCardField", t("cardField"));
  fillCurrencySelect();
  setText("lblSnap", t("snapTitle"));
  setText("snapHelp", t("snapHelp"));
  setText("snapNowButton", t("snapNow"));
  renderSnapList();
  setText("lblWipe", t("wipeTitle"));
  setText("wipeHelp", t("wipeHelp"));
  setText("wipeButton", t("wipeBtn"));
  setText("lblAbout", t("aboutTitle"));
  setText("aboutVersion", t("aboutVersion").replace("{v}", APP_VERSION));
  setText("termsButton", t("termsBtn"));
  setText("privacyButton", t("privacyBtn"));
  setText("contactButton", t("contactBtn"));
}

/* ---------- 1° PASSO: VERSÃO, TERMOS, MOEDA, CÓPIAS INTERNAS E APAGAR DADOS ---------- */
const APP_VERSION = "1.0.0";
const CONTACT_EMAIL = "desenvolvimentopadraooficial@gmail.com";

/* Recursos que poderão ser pagos numa atualização futura. Hoje todos continuam liberados. */
const EXTRA_FEATURES = ["charts", "compare", "yearly", "vaults", "filters", "notes", "sort", "swipe", "overdueHighlight"];

Object.assign(I18N.pt, {
  overdueLabel: "Atrasada", v_overdueHighlight: "Destacar contas atrasadas",
  currencyLabel: "Moeda", currencyAuto: "Automática (pelo idioma)",
  cur_BRL: "R$ — Real brasileiro", cur_USD: "$ — Dólar americano", cur_EUR: "€ — Euro", cur_MXN: "$ — Peso mexicano",
  aboutTitle: "Sobre o app", aboutVersion: "1° Passo · Versão {v}",
  termsBtn: "Termos de uso", privacyBtn: "Política de privacidade", contactBtn: "Fale conosco",
  legalNote: "Texto disponível apenas em português.",
  snapTitle: "Cópias internas",
  snapHelp: "O app guarda cópias automáticas dos seus dados neste aparelho (as 10 mais recentes). Elas ajudam se você apagar algo sem querer, mas não protegem se você desinstalar o app ou limpar os dados. Para isso, exporte um backup.",
  snapNow: "Criar cópia agora", snapNone: "Nenhuma cópia ainda.", snapRow: "{d} · {n} lançamento(s)", snapRestore: "Restaurar",
  snapRestoreTitle: "Restaurar esta cópia?", snapRestoreText: "Seus dados atuais serão trocados por esta cópia. Antes disso, o app guarda uma cópia dos dados atuais.",
  snapRestoreYes: "Sim, restaurar", snapDone: "Cópia restaurada.", snapFail: "Não consegui restaurar esta cópia.",
  snapFailKey: "Não consegui abrir esta cópia (ela foi criada com outra senha).",
  snapMade: "Cópia criada.", snapEmptyData: "Não há dados para copiar.",
  wipeTitle: "Apagar dados", wipeHelp: "Remove despesas, configurações, cópias internas e a proteção por senha deste aparelho. Não dá para desfazer.",
  wipeBtn: "Apagar todos os meus dados", wipeModalTitle: "Apagar tudo?",
  wipeModalText: "Isso apaga TUDO neste aparelho e não pode ser desfeito. Exporte um backup antes. Para confirmar, digite {w}.",
  wipeWord: "APAGAR", wipeConfirm: "Apagar tudo"
});
Object.assign(I18N.en, {
  overdueLabel: "Overdue", v_overdueHighlight: "Highlight overdue bills",
  currencyLabel: "Currency", currencyAuto: "Automatic (by language)",
  cur_BRL: "R$ — Brazilian real", cur_USD: "$ — US dollar", cur_EUR: "€ — Euro", cur_MXN: "$ — Mexican peso",
  aboutTitle: "About the app", aboutVersion: "1° Passo · Version {v}",
  termsBtn: "Terms of use", privacyBtn: "Privacy policy", contactBtn: "Contact us",
  legalNote: "Text available in Portuguese only.",
  snapTitle: "Internal copies",
  snapHelp: "The app keeps automatic copies of your data on this device (the 10 most recent). They help if you delete something by mistake, but they do not protect you if you uninstall the app or clear its data. For that, export a backup.",
  snapNow: "Create copy now", snapNone: "No copies yet.", snapRow: "{d} · {n} entry(ies)", snapRestore: "Restore",
  snapRestoreTitle: "Restore this copy?", snapRestoreText: "Your current data will be replaced by this copy. Before that, the app saves a copy of your current data.",
  snapRestoreYes: "Yes, restore", snapDone: "Copy restored.", snapFail: "Could not restore this copy.",
  snapFailKey: "Could not open this copy (it was created with another password).",
  snapMade: "Copy created.", snapEmptyData: "There is no data to copy.",
  wipeTitle: "Delete data", wipeHelp: "Removes expenses, settings, internal copies and password protection from this device. This cannot be undone.",
  wipeBtn: "Delete all my data", wipeModalTitle: "Delete everything?",
  wipeModalText: "This deletes EVERYTHING on this device and cannot be undone. Export a backup first. To confirm, type {w}.",
  wipeWord: "DELETE", wipeConfirm: "Delete everything"
});
Object.assign(I18N.es, {
  overdueLabel: "Atrasado", v_overdueHighlight: "Destacar cuentas atrasadas",
  currencyLabel: "Moneda", currencyAuto: "Automática (según el idioma)",
  cur_BRL: "R$ — Real brasileño", cur_USD: "$ — Dólar estadounidense", cur_EUR: "€ — Euro", cur_MXN: "$ — Peso mexicano",
  aboutTitle: "Acerca de la app", aboutVersion: "1° Passo · Versión {v}",
  termsBtn: "Términos de uso", privacyBtn: "Política de privacidad", contactBtn: "Contáctanos",
  legalNote: "Texto disponible solo en portugués.",
  snapTitle: "Copias internas",
  snapHelp: "La app guarda copias automáticas de tus datos en este aparato (las 10 más recientes). Ayudan si borras algo sin querer, pero no te protegen si desinstalas la app o borras sus datos. Para eso, exporta una copia de seguridad.",
  snapNow: "Crear copia ahora", snapNone: "Aún no hay copias.", snapRow: "{d} · {n} registro(s)", snapRestore: "Restaurar",
  snapRestoreTitle: "¿Restaurar esta copia?", snapRestoreText: "Tus datos actuales serán reemplazados por esta copia. Antes, la app guarda una copia de tus datos actuales.",
  snapRestoreYes: "Sí, restaurar", snapDone: "Copia restaurada.", snapFail: "No pude restaurar esta copia.",
  snapFailKey: "No pude abrir esta copia (fue creada con otra contraseña).",
  snapMade: "Copia creada.", snapEmptyData: "No hay datos para copiar.",
  wipeTitle: "Borrar datos", wipeHelp: "Elimina gastos, configuración, copias internas y la protección con contraseña de este aparato. No se puede deshacer.",
  wipeBtn: "Borrar todos mis datos", wipeModalTitle: "¿Borrar todo?",
  wipeModalText: "Esto borra TODO en este aparato y no se puede deshacer. Exporta una copia antes. Para confirmar, escribe {w}.",
  wipeWord: "BORRAR", wipeConfirm: "Borrar todo"
});

/* Substitui a versão de script2.js: o gráfico de barras também respeita a moeda escolhida. */
function moneyShort(value) {
  return Number(value).toLocaleString(I18N[settings.lang].locale, {
    style: "currency",
    currency: currencyCode(),
    maximumFractionDigits: 0
  });
}

/* ----- moeda ----- */
function fillCurrencySelect() {
  setText("lblCurrency", t("currencyLabel"));
  const select = document.getElementById("currencySelect");
  if (!select) return;
  select.innerHTML = "";
  [["auto", t("currencyAuto")], ...CURRENCIES.map(code => [code, t("cur_" + code)])].forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  });
  select.value = CURRENCIES.includes(settings.currency) ? settings.currency : "auto";
}

document.getElementById("currencySelect").addEventListener("change", event => {
  settings.currency = event.target.value;
  saveSettings();
  render();
});

/* ----- termos de uso e política de privacidade (texto em português) ----- */
const TERMS_PT = [
  ["1. Quem somos", "O 1° Passo (\"app\") é um aplicativo de controle de despesas pessoais, desenvolvido e mantido por Samuel Carlos Leopoldo (\"desenvolvedor\"), de Criciúma/SC. Contato: " + CONTACT_EMAIL + "."],
  ["2. Aceite", "Ao instalar ou usar o app, você concorda com estes termos. Se não concordar, não use o app."],
  ["3. O que o app faz", "O app ajuda você a anotar despesas, entradas e compras no cartão e a acompanhar vencimentos. Ele não é consultoria financeira, contábil, jurídica nem de investimentos."],
  ["4. Responsabilidade pelas informações", "Os valores, datas e descrições são digitados por você. O app faz cálculos com o que você informa, e você é responsável por conferir se estão corretos e por suas decisões financeiras."],
  ["5. Seus dados ficam no seu aparelho", "O app guarda os dados apenas no armazenamento do seu aparelho. O desenvolvedor não recebe, não vê e não consegue recuperar seus dados."],
  ["6. Backup", "Você é responsável por exportar seus backups. Os dados podem ser perdidos se você desinstalar o app, limpar os dados do navegador ou do app, trocar ou perder o aparelho, ou se o sistema apagar o armazenamento. O app também guarda cópias internas automáticas no próprio aparelho, mas elas não protegem nesses casos."],
  ["7. Proteção por senha", "Se você ativar a proteção, seus dados são criptografados com a sua senha. Se você esquecer a senha, ninguém, nem o desenvolvedor, consegue recuperá-los. Faça backup antes de ativar."],
  ["8. Leitor de notas (câmera)", "A foto é processada no seu próprio aparelho e não é enviada ao desenvolvedor. Para funcionar, o app baixa na internet um componente de leitura de texto, na primeira vez que você usa o recurso."],
  ["9. Disponibilidade e garantia", "O app é oferecido \"como está\", sem garantia de funcionamento contínuo, sem erros ou de compatibilidade com todos os aparelhos. Dentro do que a lei permite, o desenvolvedor não responde por perdas de dados, lucros cessantes ou prejuízos indiretos decorrentes do uso do app."],
  ["10. Uso adequado", "Você se compromete a não usar o app de forma ilegal, a não tentar copiar, descompilar ou revender o app sem autorização e a não tentar prejudicar seu funcionamento."],
  ["11. Propriedade", "O nome, o ícone, o código e o conteúdo do app pertencem ao desenvolvedor. Você recebe apenas o direito de usar o app, pessoal e não exclusivo."],
  ["12. Cobrança", "Alguns recursos poderão ser pagos no futuro. Se houver planos pagos, os preços, a renovação, o cancelamento e o reembolso seguem as regras da loja em que você adquiriu o app (Google Play), que é quem processa o pagamento."],
  ["13. Menores de idade", "Menores de 18 anos devem usar o app com o conhecimento de um responsável."],
  ["14. Mudanças", "O app e estes termos podem ser atualizados. A versão em vigor aparece em Ajustes > Sobre o app. Continuar usando o app depois de uma atualização significa que você aceita a nova versão."],
  ["15. Lei e foro", "Estes termos seguem a legislação brasileira. Fica eleito o foro da comarca de Criciúma/SC, ressalvado o direito do consumidor de ajuizar a ação em seu domicílio."],
  ["Vigência", "19/11/2026 · Versão " + APP_VERSION]
];

const PRIVACY_PT = [
  ["1. Responsável", "Samuel Carlos Leopoldo, Criciúma/SC. Contato: " + CONTACT_EMAIL + "."],
  ["2. Dados que ficam no aparelho", "Descrições, valores, datas, categorias, observações, cartões, cofres, orçamentos, configurações e cópias internas automáticas. Ficam só no seu aparelho. O desenvolvedor não coleta nem recebe esses dados."],
  ["3. Não vendemos nem compartilhamos dados", "Não há contas, cadastro, anúncios ou rastreadores no app na versão atual."],
  ["4. Proteção", "Você pode ativar a proteção por senha, que criptografa seus dados no aparelho."],
  ["5. Leitor de notas", "A imagem é lida no aparelho e não é enviada. O app baixa de um serviço externo (CDN) o componente de leitura. Ao baixar, esse serviço pode registrar dados técnicos da conexão, como o endereço IP, conforme a política dele."],
  ["6. Backups", "Os arquivos de backup e de planilha que você exporta ficam sob seu controle. Se você os compartilhar, o destino passa a ser responsável por eles."],
  ["7. Seus direitos (LGPD)", "Como o desenvolvedor não guarda seus dados, você os controla diretamente no app: pode editar, exportar ou apagar tudo quando quiser, em Ajustes > Apagar dados. Para dúvidas, use o contato acima."],
  ["8. Mudanças", "Se o app passar a usar anúncios, pagamentos, contas ou nuvem, esta política será atualizada antes disso."],
  ["Vigência", "19/11/2026 · Versão " + APP_VERSION]
];

function showLegal(title, sections) {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  const { overlay, menu } = showModal(title);
  menu.style.width = "min(520px, 94%)";

  const box = document.createElement("div");
  box.className = "legal-text";
  if (settings.lang !== "pt") {
    const note = document.createElement("p");
    note.textContent = t("legalNote");
    box.appendChild(note);
  }
  sections.forEach(([heading, text]) => {
    const h = document.createElement("h3");
    h.textContent = heading;
    const p = document.createElement("p");
    p.textContent = text;
    box.append(h, p);
  });
  menu.appendChild(box);
  addModalButton(menu, t("close"), () => overlay.remove(), "cancel-action");
}

document.getElementById("termsButton").addEventListener("click", () => showLegal(t("termsBtn"), TERMS_PT));
document.getElementById("privacyButton").addEventListener("click", () => showLegal(t("privacyBtn"), PRIVACY_PT));
document.getElementById("contactButton").addEventListener("click", () => {
  window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent("1° Passo " + APP_VERSION);
});

/* ----- cópias internas (ficam no próprio aparelho, em IndexedDB) ----- */
const SNAP_DB = "despesaBackups";
const SNAP_MAX = 10;
const SNAP_EVERY_MS = 20 * 3600 * 1000;
let lastSnapCheck = 0;

function snapOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(SNAP_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("s", { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function snapRun(mode, fn) {
  const db = await snapOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("s", mode);
    const req = fn(tx.objectStore("s"));
    tx.oncomplete = () => { db.close(); resolve(req ? req.result : undefined); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
  });
}

const snapAll = () => snapRun("readonly", s => s.getAll()).then(list => (list || []).sort((a, b) => b.id - a.id));
const snapPut = rec => snapRun("readwrite", s => s.put(rec));
const snapDel = id => snapRun("readwrite", s => s.delete(id));
const snapClear = () => snapRun("readwrite", s => s.clear());

async function makeSnapshot() {
  if (!window.indexedDB) return false;
  if (lockEl || (hasEnvelope() && !cryptoKey)) return false;
  if (!transactions.length) return false;

  const payload = JSON.stringify({ transactions, priv });
  const rec = { id: Date.now(), at: new Date().toISOString(), n: transactions.length };
  if (cryptoKey) {
    rec.enc = true;
    rec.env = await encryptText(payload, cryptoKey, cryptoSalt, cryptoIter);
  } else {
    rec.data = payload;
  }
  await snapPut(rec);

  const all = await snapAll();
  for (const old of all.slice(SNAP_MAX)) await snapDel(old.id);
  return true;
}

async function maybeAutoSnapshot() {
  const now = Date.now();
  if (now - lastSnapCheck < 3600000) return;
  if (!transactions.length || lockEl || (hasEnvelope() && !cryptoKey)) return;
  lastSnapCheck = now;
  try {
    const all = await snapAll();
    if (all.length && now - all[0].id < SNAP_EVERY_MS) return;
    if (await makeSnapshot()) renderSnapList();
  } catch (error) {
    console.error(error);
  }
}

async function renderSnapList() {
  const box = document.getElementById("snapList");
  if (!box) return;

  let all = [];
  try { all = await snapAll(); } catch {}
  box.innerHTML = "";

  if (!all.length) {
    const empty = document.createElement("p");
    empty.className = "backup-info";
    empty.textContent = t("snapNone");
    box.appendChild(empty);
    return;
  }

  all.forEach(rec => {
    const row = document.createElement("div");
    row.className = "snap-row";

    const text = document.createElement("span");
    text.textContent = t("snapRow")
      .replace("{d}", new Date(rec.at).toLocaleString(I18N[settings.lang].locale))
      .replace("{n}", rec.n);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = t("snapRestore");
    button.addEventListener("click", () => confirmRestore(rec));

    row.append(text, button);
    box.appendChild(row);
  });
}

function confirmRestore(rec) {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  const { overlay, menu } = showModal(t("snapRestoreTitle"), t("snapRestoreText"));
  addModalButton(menu, t("snapRestoreYes"), () => { overlay.remove(); restoreSnapshot(rec); });
  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

async function restoreSnapshot(rec) {
  try {
    let text;
    if (rec.enc) {
      if (!cryptoKey) throw new Error("sem chave");
      text = await decryptEnvelope(rec.env, cryptoKey);
    } else {
      text = rec.data;
    }
    const data = JSON.parse(text);
    if (!data || !Array.isArray(data.transactions)) throw new Error("formato");

    await makeSnapshot();   /* guarda os dados de agora antes de trocar */
    transactions.length = 0;
    transactions.push(...data.transactions);
    applyPriv(data.priv);
    saveData();
    render();
    applyNewLabels();
    alert(t("snapDone"));
  } catch (error) {
    console.error(error);
    alert(rec.enc ? t("snapFailKey") : t("snapFail"));
  }
}

document.getElementById("snapNowButton").addEventListener("click", async () => {
  if (!transactions.length) { alert(t("snapEmptyData")); return; }
  try {
    if (await makeSnapshot()) { await renderSnapList(); alert(t("snapMade")); }
  } catch (error) {
    console.error(error);
    alert(t("snapFail"));
  }
});

/* Ligar ou desligar a proteção troca a chave: as cópias antigas deixam de servir, então são apagadas. */
const originalEnableProtection = enableProtection;
enableProtection = async function (password) {
  await originalEnableProtection(password);
  if (cryptoKey) { try { await snapClear(); } catch {} lastSnapCheck = 0; renderSnapList(); }
};

const originalDisableProtection = disableProtection;
disableProtection = async function () {
  await originalDisableProtection();
  if (!cryptoKey) { try { await snapClear(); } catch {} lastSnapCheck = 0; renderSnapList(); }
};

/* ----- apagar todos os dados ----- */
async function wipeAll() {
  try { await saveQueue; } catch {}
  try { await snapClear(); } catch {}
  try { await idbDelete("key"); } catch {}
  [STORAGE_KEY, PRIV_KEY, SETTINGS_KEY, CRYPTO_KEY_NAME, SHORTCUT_KEY, BACKUP_KEY].forEach(key => {
    try { localStorage.removeItem(key); } catch {}
  });
  location.reload();
}

function openWipeModal() {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  const word = t("wipeWord");
  const { overlay, menu } = showModal(t("wipeModalTitle"), t("wipeModalText").replace("{w}", word));

  const input = document.createElement("input");
  input.autocomplete = "off";
  input.placeholder = word;
  menu.appendChild(input);

  const matches = () => input.value.trim().toUpperCase() === word;
  const go = addModalButton(menu, t("wipeConfirm"), async () => {
    if (!matches()) return;
    overlay.remove();
    await wipeAll();
  }, "delete-action");
  go.disabled = true;
  input.addEventListener("input", () => { go.disabled = !matches(); });

  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

document.getElementById("wipeButton").addEventListener("click", openWipeModal);

/* ---------- INICIAR ---------- */
loadSettings();
rebuildCategories();
applyTheme();
applyView();
applyLanguage();
if (hasEnvelope()) {
  showLockScreen();
} else {
  loadData();
  applyNewLabels();
  render();
}