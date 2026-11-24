const transactions = [];
let currentDate = new Date();

const STORAGE_KEY = "minhasDespesas";
const SETTINGS_KEY = "minhasDespesasConfig";

const settings = { lang: "pt", mode: "light", color: "none", cardDay: 0, cardNext: true, customCategories: [], cards: [], soonDays: 3, view: {}, currency: "auto" };

/* Itens da tela que a pessoa pode ligar e desligar (Configurações > Exibição). */
const VIEW_KEYS = ["totalPay", "totalRemaining", "wallet", "cardTotal", "charts", "filters", "vaults", "scan",
  "alertOverdue", "alertSoon", "alertBudget", "alertBackup", "compare", "yearly", "notes", "sort", "swipe", "overdueHighlight", "merge"];
const VIEW_NEW = ["compare", "yearly", "notes", "sort", "swipe", "overdueHighlight", "merge"];
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
          paid: (tx.paidMonths || []).includes(selectedMonth),
          partial: (tx.partialMonths || {})[selectedMonth] || 0
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
        paid: (tx.paidMonths || []).includes(key),
        partial: (tx.partialMonths || {})[key] || 0
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

  mergeDisplayList(items).forEach(entry => {
    if (entry.group) { list.appendChild(mergedRow(entry.group)); return; }
    const tx = entry.tx;
    const div = document.createElement("div");
    div.className = `tx ${tx.type}`;

    const notReceived = tx.type === "income" && isNotReceived(tx);
    const received = tx.type === "income" && !notReceived && tx.date <= dateString(new Date());
    const incomeLate = tx.type === "income" && notReceived && tx.date < dateString(new Date());

    if (tx.type === "income" && received) div.classList.add("received");
    if (incomeLate) div.classList.add("overdue");
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
      ? (received ? t("received") : incomeLate ? t(settings.view.overdueHighlight ? "incomeOverdue" : "toReceive") : t("planned"))
      : (tx.paid ? t("paid") : (isOverdue && settings.view.overdueHighlight ? t("overdueLabel") : t("pending")))
        + (partialOf(tx) > 0 ? " · " + t("partialStatus").replace("{p}", money(partialOf(tx))).replace("{v}", money(leftOf(tx))) : "");

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
    if (settings.view.merge) attachDrag(div, [tx.originalId]);
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

/* Pagamento parcial: quanto já foi pago de uma conta ainda pendente e quanto falta. */
function partialOf(tx) {
  return tx.paid ? 0 : Math.min(Number(tx.partial) || 0, tx.amount);
}
function leftOf(tx) {
  return Math.round((tx.amount - partialOf(tx)) * 100) / 100;
}

function updateSummary(items) {
  const expenses = items.filter(tx => tx.type === "expense");

  const total = expenses.reduce((sum, tx) => sum + tx.amount, 0);
  const remaining = expenses.filter(tx => !tx.paid).reduce((sum, tx) => sum + leftOf(tx), 0);

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
          if (!(tx.notReceivedMonths || []).includes(key)) wallet += amountForMonth(tx, key);
        } else if ((tx.paidMonths || []).includes(key)) {
          wallet -= amountForMonth(tx, key);
        } else {
          wallet -= Math.min((tx.partialMonths || {})[key] || 0, amountForMonth(tx, key));
        }

        index++;
        occurrence = addMonths(start, index);
      }
    } else {
      if (tx.type === "income" && tx.date <= today && !tx.notReceived) wallet += tx.amount;
      if ((tx.type === "expense" || tx.type === "card") && tx.paid) wallet -= tx.amount;
      else if (tx.type === "expense" || tx.type === "card") wallet -= Math.min(Number(tx.partial) || 0, tx.amount);
    }
  });

  wallet -= vaultsTotal();

  const cardTotal = items.filter(tx => tx.type === "card" && !tx.paid).reduce((sum, tx) => sum + leftOf(tx), 0);
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
          overdue.push({ description: tx.description, amount: Math.max(0, amountForMonth(tx, key) - ((tx.partialMonths || {})[key] || 0)), date: day });
        }

        index++;
        occurrence = addMonths(start, index);
      }
    } else if (!tx.paid && tx.date < today) {
      overdue.push({ description: tx.description, amount: Math.max(0, tx.amount - (Number(tx.partial) || 0)), date: tx.date });
    }
  });

  return overdue.sort((a, b) => a.date.localeCompare(b.date));
}

/* Entradas marcadas como "não recebidas" cuja data já passou. */
function getOverdueIncomes() {
  const today = dateString(new Date());
  const late = [];

  transactions.forEach(tx => {
    if (tx.type !== "income") return;

    if (tx.repeat === "monthly") {
      const start = new Date(tx.date + "T12:00:00");
      const end = new Date(today + "T12:00:00");
      if (start > end) return;

      let index = 0;
      let occurrence = new Date(start);
      while (occurrence <= end) {
        const key = monthKey(occurrence);
        const day = dateString(occurrence);
        if (day < today && (tx.notReceivedMonths || []).includes(key)) {
          late.push({ description: tx.description, amount: amountForMonth(tx, key), date: day });
        }
        index++;
        occurrence = addMonths(start, index);
      }
    } else if (tx.notReceived && tx.date < today) {
      late.push({ description: tx.description, amount: tx.amount, date: tx.date });
    }
  });

  return late.sort((a, b) => a.date.localeCompare(b.date));
}

function updateOverdueAlert() {
  const alertBox = document.getElementById("overdueAlert");
  const overdue = getOverdueExpenses();
  const lateIncomes = getOverdueIncomes();

  if (overdue.length === 0 && lateIncomes.length === 0) {
    alertBox.hidden = true;
    alertBox.innerHTML = "";
    return;
  }

  alertBox.innerHTML = "";

  if (overdue.length) {
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
  }

  if (lateIncomes.length) {
    const title = document.createElement("strong");
    title.textContent = t("overdueIncomeTitle");

    const ul = document.createElement("ul");
    lateIncomes.forEach(item => {
      const li = document.createElement("li");
      li.textContent =
        `${item.description} - ${money(item.amount)} (${t("expectedOn")} ${formatDate(item.date)})`;
      ul.appendChild(li);
    });
    alertBox.append(title, ul);
  }

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

/* Entrada que ainda não foi recebida (ex.: salário atrasado). Entradas antigas não têm essa marca e continuam valendo como recebidas. */
function isNotReceived(tx) {
  if (tx.repeat === "monthly") return (tx.notReceivedMonths || []).includes(monthKey(new Date(tx.date + "T12:00:00")));
  return !!tx.notReceived;
}

/* Registra um pagamento parcial (soma ao que já foi pago). Só vale se ainda falta algo. */
function addPartial(tx, value) {
  const original = transactions.find(item => item.id === tx.originalId);
  if (!original || tx.paid) return false;
  if (!(value > 0) || value >= leftOf(tx) - 0.001) return false;

  if (tx.repeat === "monthly") {
    const key = monthKey(new Date(tx.date + "T12:00:00"));
    original.partialMonths = { ...(original.partialMonths || {}), [key]: Math.round(((original.partialMonths || {})[key] || 0) * 100 + value * 100) / 100 };
  } else {
    original.partial = Math.round(((Number(original.partial) || 0) * 100) + value * 100) / 100;
  }
  saveData();
  render();
  return true;
}

function clearPartial(tx) {
  const original = transactions.find(item => item.id === tx.originalId);
  if (!original) return;
  if (tx.repeat === "monthly") {
    const key = monthKey(new Date(tx.date + "T12:00:00"));
    const map = { ...(original.partialMonths || {}) };
    delete map[key];
    original.partialMonths = map;
  } else {
    delete original.partial;
  }
  saveData();
  render();
}

function openPartial(tx) {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  const { overlay, menu } = showModal(t("partialTitle"), tx.description + " · " + t("partialLeft").replace("{v}", money(leftOf(tx))));
  const input = makeField(menu, t("partialAmountPh"), "text", "", "0,00");
  input.inputMode = "decimal";
  const showError = modalMessage(menu);

  addModalButton(menu, t("save"), () => {
    const value = parseMoneyText(input.value);
    if (!(value > 0)) { showError(t("partialInvalid")); return; }
    if (value >= leftOf(tx) - 0.001) { showError(t("partialTooMuch").replace("{v}", money(leftOf(tx)))); return; }
    overlay.remove();
    addPartial(tx, value);
  });
  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

function setReceived(tx, wantReceived) {
  const original = transactions.find(item => item.id === tx.originalId);
  if (!original) return false;

  if (tx.repeat === "monthly") {
    const key = monthKey(new Date(tx.date + "T12:00:00"));
    const list = original.notReceivedMonths || [];
    const has = list.includes(key);
    if (wantReceived === !has) return false;
    original.notReceivedMonths = wantReceived ? list.filter(month => month !== key) : [...list, key];
  } else {
    if (wantReceived === !original.notReceived) return false;
    if (wantReceived) delete original.notReceived; else original.notReceived = true;
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

    if (!tx.paid) {
      addModalButton(menu, t("partialPay"), () => { overlay.remove(); openPartial(tx); });
      if (partialOf(tx) > 0) {
        addModalButton(menu, t("partialClear"), () => { overlay.remove(); clearPartial(tx); });
      }
    }
  }

  if (tx.type === "income") {
    const notReceived = isNotReceived(tx);
    if (notReceived || tx.date <= dateString(new Date())) {
      addModalButton(menu, notReceived ? t("markReceived") : t("markNotReceived"), () => {
        overlay.remove();
        setReceived(tx, notReceived);
      });
    }
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
    p.merges.forEach(m => {
      const busy = priv.merges.some(x => x.id === m.id ||
        (x.month === m.month && x.ids.some(id => m.ids.includes(id))));
      if (!busy) priv.merges.push(m);
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

/* Boleto bancário: a linha digitável tem 47 números; os 14 últimos trazem o fator de vencimento (4) e o valor em centavos (10). */
function scanBoleto(text) {
  const candidates = String(text || "").match(/\d[\d .\-]{40,70}\d/g) || [];
  for (const raw of candidates) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 47) continue;
    const factor = Number(digits.slice(33, 37));
    const cents = Number(digits.slice(37, 47));
    if (!(cents > 0)) continue;
    let date = "";
    if (factor >= 1000) {
      const day = 86400000;
      const newBase = Date.UTC(2025, 1, 22) - 1000 * day;   // 22/02/2025 voltou ao fator 1000
      const oldBase = Date.UTC(1997, 9, 7);
      let when = newBase + factor * day;
      if (when < Date.UTC(2025, 1, 22)) when = oldBase + factor * day;
      const d = new Date(when);
      date = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    }
    return { value: cents / 100, date };
  }
  return null;
}

function parseReceipt(text, todayText) {
  const fixed = String(text || "").replace(/(\d)\s*([,.])\s*(\d{2})(?!\d)/g, "$1$2$3");
  const lines = fixed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const boleto = scanBoleto(String(text || ""));
  return {
    value: boleto ? boleto.value : scanFindTotal(lines),
    name: scanFindName(lines),
    date: boleto && boleto.date ? boleto.date : scanFindDate(lines, todayText)
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
  scanChoose();
});

/* Escolher entre tirar a foto agora ou usar uma imagem da galeria (nota, boleto, print do banco). */
function scanChoose() {
  const { overlay, menu } = showModal(t("scanChooseTitle"), t("scanChooseText"));
  addModalButton(menu, t("scanCamera"), () => { overlay.remove(); document.getElementById("scanFile").click(); });
  addModalButton(menu, t("scanGallery"), () => { overlay.remove(); document.getElementById("scanGallery").click(); });
  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

(function createGalleryInput() {
  const input = document.createElement("input");
  input.type = "file";
  input.id = "scanGallery";
  input.accept = "image/*";
  input.hidden = true;
  document.body.appendChild(input);
  input.addEventListener("change", event => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (file) scanReceipt(file);
  });
})();

document.getElementById("scanFile").addEventListener("change", event => {
  const file = event.target.files && event.target.files[0];
  event.target.value = "";
  if (file) scanReceipt(file);
});