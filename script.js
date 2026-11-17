const transactions = [];
let currentDate = new Date();

const STORAGE_KEY = "minhasDespesas";
const SETTINGS_KEY = "minhasDespesasConfig";

const settings = { lang: "pt", mode: "light", color: "none", cardDay: 0, cardNext: true };

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
      date.textContent += " · " + CATEGORY_BY_KEY[tx.category].emoji + " " + t("cat_" + tx.category);
    }

    const status = document.createElement("div");
    status.className = "status";
    status.textContent = tx.type === "income"
      ? (received ? t("received") : t("planned"))
      : (tx.paid ? t("paid") : t("pending"));

    const left = document.createElement("div");
    left.append(name, date, status);

    const value = document.createElement("div");
    value.className = "tx-value";
    value.textContent = (tx.type === "income" ? "+ " : "- ") + money(tx.amount);

    div.append(left, value);
    div.addEventListener("click", () => transactionOptions(tx));
    list.appendChild(div);
  });

  updateSummary(items);
  updateOverdueAlert();
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

function transactionOptions(tx) {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  if (!document.getElementById("settingsOverlay").hidden) return;

  const { overlay, menu } = showModal(tx.description, money(tx.amount));

  if (tx.type === "expense" || tx.type === "card") {
    addModalButton(menu, tx.paid ? t("markPending") : t("markPaid"), () => {
      const original = transactions.find(item => item.id === tx.originalId);
      if (!original) return;

      if (tx.repeat === "monthly") {
        const key = monthKey(new Date(tx.date + "T12:00:00"));
        original.paidMonths = original.paidMonths || [];

        if (original.paidMonths.includes(key)) {
          original.paidMonths = original.paidMonths.filter(month => month !== key);
        } else {
          original.paidMonths.push(key);
        }
      } else {
        original.paid = !original.paid;
      }

      overlay.remove();
      saveData();
      render();
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

function confirmDelete(tx) {
  const { overlay, menu } = showModal(t("delTitle"), t("delText"));

  addModalButton(menu, t("delYes"), () => {
    const index = transactions.findIndex(item => item.id === tx.originalId);
    if (index !== -1) transactions.splice(index, 1);

    overlay.remove();
    saveData();
    render();
  }, "delete-action");

  addModalButton(menu, t("delNo"), () => overlay.remove(), "cancel-action");
}

function editTransaction(tx) {
  const original = transactions.find(item => item.id === tx.originalId);
  if (!original) return;

  const { overlay, menu } = showModal(t("editTitle"), t("editText"));

  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = t("description");

  const descriptionInput = document.createElement("input");
  descriptionInput.value = original.description;

  const amountLabel = document.createElement("label");
  amountLabel.textContent = t("amount");

  const editAmountInput = document.createElement("input");
  editAmountInput.type = "number";
  editAmountInput.min = "0.01";
  editAmountInput.step = "0.01";
  editAmountInput.value = original.amount;

  menu.append(descriptionLabel, descriptionInput, amountLabel, editAmountInput);

  let editCategory = null;
  if (original.type !== "income") {
    const categoryLabel = document.createElement("label");
    categoryLabel.textContent = t("category");
    editCategory = document.createElement("select");
    editCategory.id = "editCategory";
    fillCategorySelect(editCategory, CATEGORY_BY_KEY[original.category] ? original.category : "geral");
    menu.append(categoryLabel, editCategory);
  }

  addModalButton(menu, t("saveChanges"), () => {
    const newDescription = descriptionInput.value.trim();
    const newAmount = Number(editAmountInput.value);

    if (!newDescription || newAmount <= 0) {
      alert(t("invalidEdit"));
      return;
    }

    original.description = newDescription;
    original.amount = newAmount;
    if (editCategory) original.category = editCategory.value;

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

  if (!description || amount <= 0 || !date) {
    alert(t("fillAll"));
    return;
  }

  if (repeat === "installments" && count < 2) {
    alert(t("minInstallments"));
    return;
  }

  if (repeat === "installments") {
    for (let i = 0; i < count; i++) {
      transactions.push({
        id: crypto.randomUUID(),
        type,
        description: `${description} (${i + 1}/${count})`,
        amount,
        date: dateString(addMonths(new Date(date + "T12:00:00"), i)),
        repeat: "installments",
        paid: false,
        category
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
      category
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
  const data = {
    app: "minhasDespesas",
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    transactions
  };

  const text = JSON.stringify(data, null, 2);
  const fileName = `minhas-despesas-backup-${dateString(new Date())}.json`;
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

function importBackup(file) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      // Ignora marcas de formatação (```json ... ```) caso o arquivo tenha sido copiado e colado.
      const cleaned = String(reader.result)
        .replace(/^\uFEFF/, "")
        .trim()
        .replace(/^```[a-zA-Z]*\s*/, "")
        .replace(/\s*```$/, "")
        .trim();

      const data = JSON.parse(cleaned);
      if (!data || data.app !== "minhasDespesas" || !Array.isArray(data.transactions)) {
        throw new Error("formato");
      }

      const result = mergeTransactions(data.transactions);
      saveData();
      render();

      alert(t("importDone").replace("{n}", result.added).replace("{d}", result.duplicates));
    } catch {
      alert(t("importError"));
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
const CATEGORIES = [
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
const CATEGORY_BY_KEY = {};
CATEGORIES.forEach(c => { CATEGORY_BY_KEY[c.key] = c; });

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
    option.textContent = c.emoji + " " + t("cat_" + c.key);
    select.appendChild(option);
  });
  select.value = value || "geral";
}

function applyChartLabels() {
  setText("chartsToggleText", "📊 " + t("chartsTitle"));
  setText("tabMonth", t("chartMonth"));
  setText("tab6", t("chart6"));
  setText("lblCategory", t("category"));
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
    name.textContent = row.cat.emoji + " " + t("cat_" + row.cat.key);

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

/* ---------- INICIAR ---------- */
loadSettings();
applyTheme();
applyLanguage();
loadData();
render();