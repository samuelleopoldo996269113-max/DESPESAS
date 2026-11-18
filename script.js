const transactions = [];
let currentDate = new Date();

const STORAGE_KEY = "minhasDespesas";
const SETTINGS_KEY = "minhasDespesasConfig";

const settings = { lang: "pt", mode: "light", color: "none", cardDay: 0, cardNext: true, customCategories: [] };

/* ---------- TRADUÇÕES ---------- */
const I18N = {
  pt: {
    locale: "pt-BR", currency: "BRL",
    title: "Despesa",
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
    title: "Despesa",
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
    title: "Despesa",
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
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (saved && typeof saved === "object") {
      if (I18N[saved.lang]) settings.lang = saved.lang;
      if (saved.mode === "dark" || saved.mode === "light") settings.mode = saved.mode;
      if (saved.color === "pink" || saved.color === "blue" || saved.color === "none") settings.color = saved.color;
      const day = Number(saved.cardDay);
      if (day >= 1 && day <= 31) settings.cardDay = Math.floor(day);
      if (saved.cardNext === false) settings.cardNext = false;
      if (Array.isArray(saved.customCategories)) {
        settings.customCategories = saved.customCategories.filter(isValidCustomCategory).slice(0, MAX_CUSTOM_CATEGORIES);
      }
    }
  } catch {}
}

function saveSettings() {
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
}

/* ---------- UTILITÁRIOS ---------- */
function loadData() {
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function money(value) {
  return Number(value).toLocaleString(I18N[settings.lang].locale, {
    style: "currency",
    currency: I18N[settings.lang].currency
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
    if (tx.type === "card" && settings.cardDay > 0) {
      const base = new Date(forDate.getFullYear(), forDate.getMonth(), 1, 12);
      const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
      const due = dateString(new Date(base.getFullYear(), base.getMonth(), Math.min(settings.cardDay, lastDay), 12));
      const src = addMonths(base, -cardOffset());
      const srcKey = monthKey(src);

      if (tx.repeat === "monthly") {
        if (srcKey < tx.date.substring(0, 7)) return;
        result.push({
          ...tx,
          date: due,
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

  const items = getMonthTransactions();
  list.innerHTML = "";

  if (items.length === 0) {
    list.innerHTML = '<div class="empty"></div>';
    list.firstChild.textContent = t("empty");
  }

  items.forEach(tx => {
    const div = document.createElement("div");
    div.className = `tx ${tx.type}`;

    const received = tx.type === "income" && tx.date <= dateString(new Date());

    if (tx.type === "income" && received) div.classList.add("received");
    if ((tx.type === "expense" || tx.type === "card") && tx.paid) div.classList.add("done");

    const name = document.createElement("div");
    name.className = "tx-name";
    name.textContent = tx.description;

    const date = document.createElement("div");
    date.className = "tx-date";
    date.textContent = formatDate(tx.date);
    if ((tx.type === "expense" || tx.type === "card") && tx.category && tx.category !== "geral" && CATEGORY_BY_KEY[tx.category]) {
      date.textContent += " · " + CATEGORY_BY_KEY[tx.category].emoji + " " + categoryName(CATEGORY_BY_KEY[tx.category]);
    }

    const status = document.createElement("div");
    status.className = "status";
    status.textContent = tx.type === "income"
      ? (received ? t("received") : t("planned"))
      : (tx.paid ? t("paid") : t("pending"));

    const left = document.createElement("div");
    left.append(name, date, status);

    const summary = installmentSummary(tx);
    if (summary) {
      const extra = document.createElement("div");
      extra.className = "status";
      extra.textContent = summary;
      left.appendChild(extra);
    }

    const value = document.createElement("div");
    value.className = "tx-value";
    value.textContent = (tx.type === "income" ? "+ " : "- ") + money(tx.amount);

    div.append(left, value);
    div.addEventListener("click", () => transactionOptions(tx));
    list.appendChild(div);
  });

  updateSummary(items);
  updateOverdueAlert();
  updateSoonAlert();
  updateBackupAlert();
  updateInvoiceBar();
  renderCharts();
}

function updateSummary(items) {
  const expenses = items.filter(tx => tx.type === "expense");

  const total = expenses.reduce((sum, tx) => sum + tx.amount, 0);
  const remaining = expenses.filter(tx => !tx.paid).reduce((sum, tx) => sum + tx.amount, 0);

  let wallet = 0;
  const today = dateString(new Date());

  transactions.forEach(tx => {
    if (tx.repeat === "monthly") {
      const start = new Date(tx.date + "T12:00:00");
      const end = new Date(today + "T12:00:00");
      if (start > end) return;

      let occurrence = new Date(start);
      let index = 0;

      while (occurrence <= end) {
        const key = (tx.type === "card" && settings.cardDay > 0)
          ? monthKey(addMonths(occurrence, cardOffset()))
          : monthKey(occurrence);

        if (tx.type === "income") {
          wallet += tx.amount;
        } else if ((tx.paidMonths || []).includes(key)) {
          wallet -= tx.amount;
        }

        index++;
        occurrence = addMonths(start, index);
      }
    } else {
      if (tx.type === "income" && tx.date <= today) wallet += tx.amount;
      if ((tx.type === "expense" || tx.type === "card") && tx.paid) wallet -= tx.amount;
    }
  });

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
          overdue.push({ description: tx.description, amount: tx.amount, date: day });
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