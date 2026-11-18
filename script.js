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
  const items = applyFilters(allItems);
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

  updateSummary(allItems);
  updateOverdueAlert();
  updateSoonAlert();
  updateBudgetAlert();
  fillFilterCat();
  updateBackupAlert();
  updateInvoiceBar();
  renderVaults();
  renderCharts();
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
        const key = (tx.type === "card" && settings.cardDay > 0)
          ? monthKey(addMonths(occurrence, cardOffset()))
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

    if (!isSeries) {
      original.description = newText;
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
    appendBudgets(box);
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
  appendBudgets(box);
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

/* ---------- NOVIDADES: DADOS PRIVADOS, FILTROS, ORÇAMENTOS, COFRES E PROTEÇÃO ---------- */
const PRIV_KEY = "minhasDespesasPriv";
const CRYPTO_KEY_NAME = "minhasDespesasCripto";
const SHORTCUT_KEY = "minhasDespesasAtalho";
const PBKDF2_ITER = 200000;
const MAX_VAULTS = 20;
const RELOCK_MS = 60000;

/* Dados novos (saldo inicial, orçamentos e cofres). As despesas continuam em "minhasDespesas". */
const priv = { initialBalance: 0, budgets: {}, vaults: [] };

Object.assign(I18N.pt, {
  searchPh: "Buscar pelo nome...", filters: "Filtros", filterAllCats: "Todas as categorias",
  filterAllStatus: "Todas as situações", filterPaid: "Pagas", filterPending: "Pendentes",
  filterOverdue: "Atrasadas", filterClear: "Limpar filtros", emptyFilter: "Nada encontrado com esses filtros.",
  budgetSet: "Orçamento por categoria", budgetBtn: "Definir orçamentos", budgetTitle: "Orçamento mensal",
  budgetHelp: "Limite de gasto por mês em cada categoria. Deixe vazio para não ter limite.",
  budgetAlertTitle: "Atenção aos orçamentos do mês:",
  budgetNear: "{c}: {p}% do limite ({s} de {l})", budgetOver: "{c}: limite estourado ({s} de {l})",
  budgetsTitle: "Orçamentos do mês",
  initialLabel: "Saldo inicial da carteira", initialHelp: "Quanto você já tinha na carteira antes de usar o app.",
  scopeTitle: "Alterar o valor", scopeText: "Esta conta se repete todo mês. Onde aplicar o novo valor?",
  scopeOne: "Só neste mês", scopeFrom: "Deste mês em diante", scopeAll: "Todos os meses (inclusive anteriores)",
  vaults: "🏦 Cofres", vaultNew: "➕ Novo cofre",
  vaultNone: "Nenhum cofre ainda. Crie um para juntar dinheiro para um plano futuro.",
  vaultName: "Nome do cofre", vaultEmoji: "Emoji (opcional)", vaultTarget: "Valor-alvo",
  vaultDate: "Data-alvo (opcional)", vaultNewTitle: "Novo cofre", vaultEditTitle: "Editar cofre",
  vaultSaved: "{s} de {t} ({p}%)", vaultDone: "🎉 Meta atingida!",
  vaultLeft: "Faltam {v} até {d} (cerca de {m} por mês)", vaultLate: "Prazo vencido: faltam {v}",
  vaultDeposit: "Guardar dinheiro", vaultWithdraw: "Retirar dinheiro", vaultAmountPh: "Valor",
  vaultInvalid: "Informe um nome e um valor-alvo maiores que zero.",
  vaultAmountInvalid: "Informe um valor válido.", vaultNoBalance: "Você só pode retirar até {v}.",
  vaultDelTitle: "Excluir cofre?", vaultDelText: "O dinheiro guardado volta para a Carteira.",
  vaultMax: "Limite de 20 cofres.", vaultEdit: "Editar cofre", vaultDel: "Excluir cofre",
  protectSet: "Proteção", protectOffInfo: "Desligada. Ao ligar, seus dados ficam criptografados e o app pede uma senha ao abrir.",
  protectOnInfo: "Ligada. Seus dados estão criptografados.",
  protectOn: "Ativar proteção com senha", protectOff: "Desativar proteção",
  protectWarnTitle: "Ativar proteção",
  protectWarn: "Se você esquecer a senha, os dados NÃO podem ser recuperados. Faça um backup antes de continuar.",
  protectBackupNow: "Exportar backup agora", protectContinue: "Continuar",
  protectPwTitle: "Criar senha", protectPwText: "Escolha uma senha com pelo menos 6 caracteres.",
  protectPw: "Senha", protectPw2: "Repita a senha",
  protectPwShort: "A senha precisa ter pelo menos 6 caracteres.", protectPwDiff: "As senhas não são iguais.",
  protectActivate: "Ativar", protectDone: "Proteção ativada. Seus dados agora estão criptografados.",
  protectFail: "Não consegui ativar a proteção. Nada foi alterado.",
  protectOffTitle: "Desativar proteção?", protectOffText: "Seus dados voltam a ser salvos sem criptografia.",
  protectOffDone: "Proteção desativada.", protectOffFail: "Não consegui desativar. Seus dados continuam protegidos.",
  lockTitle: "App bloqueado", lockText: "Digite a senha do app para abrir.", lockUnlock: "Desbloquear",
  lockWrong: "Senha incorreta.", lockDevice: "Usar desbloqueio do celular", lockBusy: "Abrindo...",
  shortcutOn: "Ativar desbloqueio do celular", shortcutOff: "Desativar desbloqueio do celular",
  shortcutDone: "Desbloqueio do celular ativado.", shortcutFail: "Não consegui ativar o desbloqueio do celular neste aparelho.",
  shortcutOffDone: "Desbloqueio do celular desativado.",
  backupPwTitle: "Backup protegido", backupPwText: "Digite a senha usada neste backup.", ok: "OK"
});
Object.assign(I18N.en, {
  searchPh: "Search by name...", filters: "Filters", filterAllCats: "All categories",
  filterAllStatus: "All statuses", filterPaid: "Paid", filterPending: "Pending",
  filterOverdue: "Overdue", filterClear: "Clear filters", emptyFilter: "Nothing found with these filters.",
  budgetSet: "Budget by category", budgetBtn: "Set budgets", budgetTitle: "Monthly budget",
  budgetHelp: "Monthly spending limit for each category. Leave empty for no limit.",
  budgetAlertTitle: "Watch your budgets this month:",
  budgetNear: "{c}: {p}% of the limit ({s} of {l})", budgetOver: "{c}: limit exceeded ({s} of {l})",
  budgetsTitle: "Budgets this month",
  initialLabel: "Starting wallet balance", initialHelp: "How much you already had in your wallet before using the app.",
  scopeTitle: "Change the amount", scopeText: "This bill repeats every month. Where should the new amount apply?",
  scopeOne: "Only this month", scopeFrom: "From this month on", scopeAll: "All months (including earlier ones)",
  vaults: "🏦 Vaults", vaultNew: "➕ New vault",
  vaultNone: "No vaults yet. Create one to save money for a future plan.",
  vaultName: "Vault name", vaultEmoji: "Emoji (optional)", vaultTarget: "Target amount",
  vaultDate: "Target date (optional)", vaultNewTitle: "New vault", vaultEditTitle: "Edit vault",
  vaultSaved: "{s} of {t} ({p}%)", vaultDone: "🎉 Goal reached!",
  vaultLeft: "{v} left until {d} (about {m} per month)", vaultLate: "Deadline passed: {v} left",
  vaultDeposit: "Add money", vaultWithdraw: "Take money out", vaultAmountPh: "Amount",
  vaultInvalid: "Enter a name and a target amount greater than zero.",
  vaultAmountInvalid: "Enter a valid amount.", vaultNoBalance: "You can only take out up to {v}.",
  vaultDelTitle: "Delete vault?", vaultDelText: "The saved money goes back to the Wallet.",
  vaultMax: "Limit of 20 vaults.", vaultEdit: "Edit vault", vaultDel: "Delete vault",
  protectSet: "Protection", protectOffInfo: "Off. When on, your data is encrypted and the app asks for a password on opening.",
  protectOnInfo: "On. Your data is encrypted.",
  protectOn: "Turn on password protection", protectOff: "Turn off protection",
  protectWarnTitle: "Turn on protection",
  protectWarn: "If you forget the password, your data CANNOT be recovered. Make a backup before continuing.",
  protectBackupNow: "Export backup now", protectContinue: "Continue",
  protectPwTitle: "Create password", protectPwText: "Choose a password with at least 6 characters.",
  protectPw: "Password", protectPw2: "Repeat the password",
  protectPwShort: "The password needs at least 6 characters.", protectPwDiff: "The passwords do not match.",
  protectActivate: "Turn on", protectDone: "Protection on. Your data is now encrypted.",
  protectFail: "Could not turn on protection. Nothing was changed.",
  protectOffTitle: "Turn off protection?", protectOffText: "Your data goes back to being saved without encryption.",
  protectOffDone: "Protection off.", protectOffFail: "Could not turn off. Your data is still protected.",
  lockTitle: "App locked", lockText: "Enter the app password to open.", lockUnlock: "Unlock",
  lockWrong: "Wrong password.", lockDevice: "Use phone unlock", lockBusy: "Opening...",
  shortcutOn: "Turn on phone unlock", shortcutOff: "Turn off phone unlock",
  shortcutDone: "Phone unlock on.", shortcutFail: "Could not turn on phone unlock on this device.",
  shortcutOffDone: "Phone unlock off.",
  backupPwTitle: "Protected backup", backupPwText: "Enter the password used for this backup.", ok: "OK"
});
Object.assign(I18N.es, {
  searchPh: "Buscar por nombre...", filters: "Filtros", filterAllCats: "Todas las categorías",
  filterAllStatus: "Todos los estados", filterPaid: "Pagados", filterPending: "Pendientes",
  filterOverdue: "Atrasados", filterClear: "Limpiar filtros", emptyFilter: "No se encontró nada con estos filtros.",
  budgetSet: "Presupuesto por categoría", budgetBtn: "Definir presupuestos", budgetTitle: "Presupuesto mensual",
  budgetHelp: "Límite de gasto al mes en cada categoría. Déjalo vacío para no tener límite.",
  budgetAlertTitle: "Atención a los presupuestos del mes:",
  budgetNear: "{c}: {p}% del límite ({s} de {l})", budgetOver: "{c}: límite superado ({s} de {l})",
  budgetsTitle: "Presupuestos del mes",
  initialLabel: "Saldo inicial de la cartera", initialHelp: "Cuánto tenías en la cartera antes de usar la app.",
  scopeTitle: "Cambiar el valor", scopeText: "Esta cuenta se repite cada mes. ¿Dónde aplicar el nuevo valor?",
  scopeOne: "Solo este mes", scopeFrom: "Desde este mes en adelante", scopeAll: "Todos los meses (incluidos los anteriores)",
  vaults: "🏦 Cajas", vaultNew: "➕ Nueva caja",
  vaultNone: "Aún no hay cajas. Crea una para juntar dinero para un plan futuro.",
  vaultName: "Nombre de la caja", vaultEmoji: "Emoji (opcional)", vaultTarget: "Valor objetivo",
  vaultDate: "Fecha objetivo (opcional)", vaultNewTitle: "Nueva caja", vaultEditTitle: "Editar caja",
  vaultSaved: "{s} de {t} ({p}%)", vaultDone: "🎉 ¡Meta alcanzada!",
  vaultLeft: "Faltan {v} hasta {d} (unos {m} al mes)", vaultLate: "Plazo vencido: faltan {v}",
  vaultDeposit: "Guardar dinero", vaultWithdraw: "Retirar dinero", vaultAmountPh: "Valor",
  vaultInvalid: "Escribe un nombre y un valor objetivo mayor que cero.",
  vaultAmountInvalid: "Escribe un valor válido.", vaultNoBalance: "Solo puedes retirar hasta {v}.",
  vaultDelTitle: "¿Eliminar caja?", vaultDelText: "El dinero guardado vuelve a la Cartera.",
  vaultMax: "Límite de 20 cajas.", vaultEdit: "Editar caja", vaultDel: "Eliminar caja",
  protectSet: "Protección", protectOffInfo: "Desactivada. Al activarla, tus datos se cifran y la app pide una contraseña al abrir.",
  protectOnInfo: "Activada. Tus datos están cifrados.",
  protectOn: "Activar protección con contraseña", protectOff: "Desactivar protección",
  protectWarnTitle: "Activar protección",
  protectWarn: "Si olvidas la contraseña, los datos NO se pueden recuperar. Haz una copia antes de continuar.",
  protectBackupNow: "Exportar copia ahora", protectContinue: "Continuar",
  protectPwTitle: "Crear contraseña", protectPwText: "Elige una contraseña de al menos 6 caracteres.",
  protectPw: "Contraseña", protectPw2: "Repite la contraseña",
  protectPwShort: "La contraseña necesita al menos 6 caracteres.", protectPwDiff: "Las contraseñas no coinciden.",
  protectActivate: "Activar", protectDone: "Protección activada. Tus datos ahora están cifrados.",
  protectFail: "No pude activar la protección. No se cambió nada.",
  protectOffTitle: "¿Desactivar protección?", protectOffText: "Tus datos vuelven a guardarse sin cifrado.",
  protectOffDone: "Protección desactivada.", protectOffFail: "No pude desactivar. Tus datos siguen protegidos.",
  lockTitle: "App bloqueada", lockText: "Escribe la contraseña de la app para abrir.", lockUnlock: "Desbloquear",
  lockWrong: "Contraseña incorrecta.", lockDevice: "Usar desbloqueo del móvil", lockBusy: "Abriendo...",
  shortcutOn: "Activar desbloqueo del móvil", shortcutOff: "Desactivar desbloqueo del móvil",
  shortcutDone: "Desbloqueo del móvil activado.", shortcutFail: "No pude activar el desbloqueo del móvil en este aparato.",
  shortcutOffDone: "Desbloqueo del móvil desactivado.",
  backupPwTitle: "Copia protegida", backupPwText: "Escribe la contraseña usada en esta copia.", ok: "OK"
});

/* ----- ajudas ----- */
function parseMoneyText(value) {
  let s = String(value || "").trim().replace(/[^\d.,-]/g, "");
  if (!s) return 0;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return isFinite(n) ? n : 0;
}

function moneyInputText(n) {
  return n ? String(n).replace(".", ",") : "";
}

function normalizeText(text) {
  return String(text || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function sanitizePriv(raw) {
  const out = { initialBalance: 0, budgets: {}, vaults: [] };
  if (!raw || typeof raw !== "object") return out;

  const start = Number(raw.initialBalance);
  if (isFinite(start)) out.initialBalance = start;

  if (raw.budgets && typeof raw.budgets === "object") {
    Object.keys(raw.budgets).forEach(key => {
      const value = Number(raw.budgets[key]);
      if (isFinite(value) && value > 0) out.budgets[key] = value;
    });
  }

  if (Array.isArray(raw.vaults)) {
    raw.vaults.forEach(v => {
      if (!v || typeof v.id !== "string" || typeof v.name !== "string" || !(Number(v.target) > 0)) return;
      out.vaults.push({
        id: v.id,
        name: v.name.slice(0, 30),
        emoji: typeof v.emoji === "string" && v.emoji ? v.emoji : "🎯",
        target: Number(v.target),
        date: typeof v.date === "string" ? v.date : "",
        moves: Array.isArray(v.moves)
          ? v.moves
              .filter(m => m && isFinite(Number(m.amount)) && Number(m.amount) !== 0)
              .map(m => ({ id: String(m.id || crypto.randomUUID()), date: String(m.date || ""), amount: Number(m.amount) }))
          : []
      });
    });
    out.vaults = out.vaults.slice(0, MAX_VAULTS);
  }
  return out;
}

function applyPriv(raw) {
  const p = sanitizePriv(raw);
  priv.initialBalance = p.initialBalance;
  priv.budgets = p.budgets;
  priv.vaults = p.vaults;
}

function loadPriv() {
  try { applyPriv(JSON.parse(localStorage.getItem(PRIV_KEY))); } catch { applyPriv(null); }
}

/* ----- valor de contas mensais que mudaram de preço ----- */
function amountForMonth(tx, key) {
  let amount = Number(tx.amount);
  if (Array.isArray(tx.changes)) {
    tx.changes.forEach(change => {
      if (change && typeof change.from === "string" && change.from <= key) amount = Number(change.amount);
    });
  }
  return amount;
}

function setMonthlyChange(original, key, amount) {
  const changes = (Array.isArray(original.changes) ? original.changes : []).filter(c => c.from !== key);
  changes.push({ from: key, amount });
  changes.sort((a, b) => a.from.localeCompare(b.from));
  original.changes = changes;
}

function askMonthlyScope(original, tx, newAmount) {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  const date = new Date(tx.date + "T12:00:00");
  const key = monthKey(date);
  const nextKey = monthKey(addMonths(date, 1));

  const { overlay, menu } = showModal(t("scopeTitle"), t("scopeText"));

  addModalButton(menu, t("scopeOne"), () => {
    const before = amountForMonth(original, key);
    const hasNext = Array.isArray(original.changes) && original.changes.some(c => c.from === nextKey);
    setMonthlyChange(original, key, newAmount);
    if (!hasNext) setMonthlyChange(original, nextKey, before);
    overlay.remove();
    saveData();
    render();
  });

  addModalButton(menu, t("scopeFrom"), () => {
    original.changes = (Array.isArray(original.changes) ? original.changes : []).filter(c => c.from <= key);
    setMonthlyChange(original, key, newAmount);
    overlay.remove();
    saveData();
    render();
  });

  addModalButton(menu, t("scopeAll"), () => {
    original.amount = newAmount;
    delete original.changes;
    overlay.remove();
    saveData();
    render();
  });

  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

/* ----- busca e filtros ----- */
const filters = { q: "", cat: "all", status: "all" };

function filtersActive() {
  return filters.q.trim() !== "" || filters.cat !== "all" || filters.status !== "all";
}

function applyFilters(items) {
  const today = dateString(new Date());
  const query = normalizeText(filters.q.trim());

  return items.filter(tx => {
    if (query && !normalizeText(tx.description).includes(query)) return false;

    if (filters.cat !== "all") {
      if (tx.type === "income") return false;
      const key = CATEGORY_BY_KEY[tx.category] ? tx.category : "geral";
      if (key !== filters.cat) return false;
    }

    if (filters.status !== "all") {
      if (tx.type === "income") return false;
      if (filters.status === "paid" && !tx.paid) return false;
      if (filters.status === "pending" && tx.paid) return false;
      if (filters.status === "overdue" && !(!tx.paid && tx.date < today)) return false;
    }
    return true;
  });
}

function fillFilterCat(force) {
  const select = document.getElementById("filterCat");
  if (!select) return;
  if (!force && select.options.length === CATEGORIES.length + 1) return;
  select.innerHTML = "";

  const all = document.createElement("option");
  all.value = "all";
  all.textContent = t("filterAllCats");
  select.appendChild(all);

  CATEGORIES.forEach(c => {
    const option = document.createElement("option");
    option.value = c.key;
    option.textContent = c.emoji + " " + categoryName(c);
    select.appendChild(option);
  });

  select.value = (filters.cat === "all" || CATEGORY_BY_KEY[filters.cat]) ? filters.cat : "all";
  filters.cat = select.value;
}

function fillFilterStatus() {
  const select = document.getElementById("filterStatus");
  if (!select) return;
  const options = [["all", "filterAllStatus"], ["paid", "filterPaid"], ["pending", "filterPending"], ["overdue", "filterOverdue"]];
  select.innerHTML = "";
  options.forEach(([value, key]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = t(key);
    select.appendChild(option);
  });
  select.value = filters.status;
}

document.getElementById("searchInput").addEventListener("input", event => {
  filters.q = event.target.value;
  render();
});

document.getElementById("filterToggle").addEventListener("click", () => {
  const panel = document.getElementById("filterPanel");
  panel.hidden = !panel.hidden;
});

document.getElementById("filterCat").addEventListener("change", event => {
  filters.cat = event.target.value;
  render();
});

document.getElementById("filterStatus").addEventListener("change", event => {
  filters.status = event.target.value;
  render();
});

document.getElementById("filterClear").addEventListener("click", () => {
  filters.q = "";
  filters.cat = "all";
  filters.status = "all";
  document.getElementById("searchInput").value = "";
  document.getElementById("filterCat").value = "all";
  document.getElementById("filterStatus").value = "all";
  render();
});

/* ----- orçamento por categoria ----- */
function spentByCategory(date) {
  const totals = {};
  monthSpendingItems(date).forEach(tx => {
    const key = CATEGORY_BY_KEY[tx.category] ? tx.category : "geral";
    totals[key] = (totals[key] || 0) + tx.amount;
  });
  return totals;
}

function budgetRows() {
  const spent = spentByCategory(currentDate);
  return CATEGORIES
    .filter(c => priv.budgets[c.key] > 0)
    .map(c => ({ cat: c, limit: priv.budgets[c.key], spent: spent[c.key] || 0 }));
}

function updateBudgetAlert() {
  const box = document.getElementById("budgetAlert");
  if (!box) return;

  const rows = budgetRows().filter(r => r.spent / r.limit >= 0.8);
  box.innerHTML = "";
  if (!rows.length) { box.hidden = true; return; }

  const over = rows.some(r => r.spent >= r.limit);
  box.className = over ? "alerta" : "alerta aviso";

  const title = document.createElement("strong");
  title.textContent = t("budgetAlertTitle");

  const ul = document.createElement("ul");
  rows.forEach(r => {
    const li = document.createElement("li");
    const text = r.spent >= r.limit ? t("budgetOver") : t("budgetNear");
    li.textContent = text
      .replace("{c}", r.cat.emoji + " " + categoryName(r.cat))
      .replace("{p}", Math.round(r.spent / r.limit * 100))
      .replace("{s}", money(r.spent))
      .replace("{l}", money(r.limit));
    ul.appendChild(li);
  });

  box.append(title, ul);
  box.hidden = false;
}

function appendBudgets(box) {
  const rows = budgetRows();
  if (!rows.length) return;

  const wrap = document.createElement("div");
  wrap.className = "budget-wrap";

  const title = document.createElement("strong");
  title.textContent = t("budgetsTitle");
  wrap.appendChild(title);

  rows.forEach(r => {
    const percent = r.spent / r.limit * 100;
    const line = document.createElement("div");
    line.className = "budget-row";

    const label = document.createElement("div");
    label.className = "budget-label";
    const name = document.createElement("span");
    name.textContent = r.cat.emoji + " " + categoryName(r.cat);
    const value = document.createElement("span");
    value.textContent = `${money(r.spent)} / ${money(r.limit)} (${Math.round(percent)}%)`;
    label.append(name, value);

    const bar = document.createElement("div");
    bar.className = "budget-bar";
    const fill = document.createElement("div");
    fill.className = "budget-fill" + (percent >= 100 ? " over" : percent >= 80 ? " warn" : "");
    fill.style.width = Math.min(100, percent).toFixed(1) + "%";
    bar.appendChild(fill);

    line.append(label, bar);
    wrap.appendChild(line);
  });

  box.appendChild(wrap);
}

function openBudgetModal() {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  const { overlay, menu } = showModal(t("budgetTitle"), t("budgetHelp"));
  const inputs = [];

  CATEGORIES.forEach(c => {
    const label = document.createElement("label");
    label.textContent = c.emoji + " " + categoryName(c);
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.placeholder = "0,00";
    input.value = moneyInputText(priv.budgets[c.key]);
    menu.append(label, input);
    inputs.push([c.key, input]);
  });

  addModalButton(menu, t("save"), () => {
    const budgets = {};
    inputs.forEach(([key, input]) => {
      const value = parseMoneyText(input.value);
      if (value > 0) budgets[key] = value;
    });
    priv.budgets = budgets;
    overlay.remove();
    saveData();
    render();
  });
  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

document.getElementById("budgetButton").addEventListener("click", openBudgetModal);

document.getElementById("initialBalanceInput").addEventListener("change", event => {
  priv.initialBalance = parseMoneyText(event.target.value);
  event.target.value = moneyInputText(priv.initialBalance);
  saveData();
  render();
});

/* ----- cofres ----- */
function vaultSaved(v) {
  return v.moves.reduce((sum, m) => sum + Number(m.amount), 0);
}

function vaultsTotal() {
  return priv.vaults.reduce((sum, v) => sum + vaultSaved(v), 0);
}

function makeField(menu, labelText, type, value, placeholder) {
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = type;
  if (type === "text" && placeholder === "0,00") input.inputMode = "decimal";
  if (placeholder) input.placeholder = placeholder;
  input.value = value || "";
  menu.append(label, input);
  return input;
}

function modalMessage(menu) {
  const p = document.createElement("p");
  p.className = "modal-error";
  p.hidden = true;
  menu.appendChild(p);
  return text => { p.textContent = text || ""; p.hidden = !text; };
}

function vaultLine(v) {
  const saved = vaultSaved(v);
  const left = Math.max(0, v.target - saved);
  if (saved >= v.target) return t("vaultDone");
  if (!v.date) return "";
  const today = new Date();
  const end = new Date(v.date + "T12:00:00");
  if (isNaN(end.getTime())) return "";
  if (dateString(today) > v.date) return t("vaultLate").replace("{v}", money(left));
  const months = Math.max(1, (end.getFullYear() - today.getFullYear()) * 12 + end.getMonth() - today.getMonth());
  return t("vaultLeft").replace("{v}", money(left)).replace("{d}", formatDate(v.date)).replace("{m}", money(left / months));
}

function renderVaults() {
  const list = document.getElementById("vaultList");
  if (!list) return;
  list.innerHTML = "";

  const text = document.getElementById("vaultsToggleText");
  if (text) text.textContent = t("vaults") + (priv.vaults.length ? " (" + priv.vaults.length + ")" : "");

  if (!priv.vaults.length) {
    const empty = document.createElement("p");
    empty.className = "vault-empty";
    empty.textContent = t("vaultNone");
    list.appendChild(empty);
    return;
  }

  priv.vaults.forEach(v => {
    const saved = vaultSaved(v);
    const percent = Math.max(0, Math.min(100, saved / v.target * 100));

    const row = document.createElement("div");
    row.className = "vault-row";
    row.addEventListener("click", () => openVaultOptions(v));

    const top = document.createElement("div");
    top.className = "vault-top";
    const name = document.createElement("strong");
    name.textContent = v.emoji + " " + v.name;
    const value = document.createElement("span");
    value.textContent = t("vaultSaved")
      .replace("{s}", money(saved)).replace("{t}", money(v.target)).replace("{p}", Math.round(percent));
    top.append(name, value);

    const bar = document.createElement("div");
    bar.className = "budget-bar";
    const fill = document.createElement("div");
    fill.className = "budget-fill" + (saved >= v.target ? "" : " vault-fill");
    fill.style.width = percent.toFixed(1) + "%";
    bar.appendChild(fill);

    row.append(top, bar);
    const info = vaultLine(v);
    if (info) {
      const small = document.createElement("small");
      small.textContent = info;
      row.appendChild(small);
    }
    list.appendChild(row);
  });
}

function openVaultForm(vault) {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  if (!vault && priv.vaults.length >= MAX_VAULTS) { alert(t("vaultMax")); return; }

  const { overlay, menu } = showModal(vault ? t("vaultEditTitle") : t("vaultNewTitle"));
  const nameInput = makeField(menu, t("vaultName"), "text", vault ? vault.name : "", "");
  nameInput.maxLength = 30;
  const emojiInput = makeField(menu, t("vaultEmoji"), "text", vault ? vault.emoji : "🎯", "");
  emojiInput.maxLength = 4;
  const targetInput = makeField(menu, t("vaultTarget"), "text", vault ? moneyInputText(vault.target) : "", "0,00");
  const dateInput = makeField(menu, t("vaultDate"), "date", vault ? vault.date : "", "");
  const showError = modalMessage(menu);

  addModalButton(menu, t("save"), () => {
    const name = nameInput.value.trim();
    const target = parseMoneyText(targetInput.value);
    if (!name || !(target > 0)) { showError(t("vaultInvalid")); return; }
    const emoji = emojiInput.value.trim() || "🎯";
    if (vault) {
      vault.name = name; vault.emoji = emoji; vault.target = target; vault.date = dateInput.value || "";
    } else {
      priv.vaults.push({ id: crypto.randomUUID(), name, emoji, target, date: dateInput.value || "", moves: [] });
    }
    overlay.remove();
    saveData();
    render();
  });
  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

function openVaultOptions(vault) {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  const { overlay, menu } = showModal(vault.emoji + " " + vault.name);

  addModalButton(menu, t("vaultDeposit"), () => { overlay.remove(); openVaultMove(vault, 1); });
  addModalButton(menu, t("vaultWithdraw"), () => { overlay.remove(); openVaultMove(vault, -1); });
  addModalButton(menu, t("vaultEdit"), () => { overlay.remove(); openVaultForm(vault); });
  addModalButton(menu, t("vaultDel"), () => { overlay.remove(); confirmDeleteVault(vault); }, "delete-action");
  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

function openVaultMove(vault, sign) {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  const { overlay, menu } = showModal(sign > 0 ? t("vaultDeposit") : t("vaultWithdraw"), vault.emoji + " " + vault.name);
  const input = makeField(menu, t("vaultAmountPh"), "text", "", "0,00");
  const showError = modalMessage(menu);

  addModalButton(menu, t("save"), () => {
    const value = parseMoneyText(input.value);
    if (!(value > 0)) { showError(t("vaultAmountInvalid")); return; }
    const saved = vaultSaved(vault);
    if (sign < 0 && value > saved + 0.001) { showError(t("vaultNoBalance").replace("{v}", money(saved))); return; }
    vault.moves.push({ id: crypto.randomUUID(), date: dateString(new Date()), amount: sign * value });
    overlay.remove();
    saveData();
    render();
  });
  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

function confirmDeleteVault(vault) {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  const { overlay, menu } = showModal(t("vaultDelTitle"), t("vaultDelText"));
  addModalButton(menu, t("vaultDel"), () => {
    priv.vaults = priv.vaults.filter(v => v.id !== vault.id);
    overlay.remove();
    saveData();
    render();
  }, "delete-action");
  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

document.getElementById("addVaultButton").addEventListener("click", () => openVaultForm(null));

document.getElementById("vaultsToggle").addEventListener("click", () => {
  const body = document.getElementById("vaultsBody");
  body.hidden = !body.hidden;
  document.getElementById("vaultsArrow").textContent = body.hidden ? "▾" : "▴";
});

/* ----- criptografia ----- */
let cryptoKey = null;
let cryptoSalt = null;
let cryptoIter = PBKDF2_ITER;
let saveQueue = Promise.resolve();

function bytesToB64(bytes) {
  let s = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i += 8192) s += String.fromCharCode.apply(null, arr.subarray(i, i + 8192));
  return btoa(s);
}

function b64ToBytes(b64) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function deriveKey(password, salt, iter) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: iter },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}

async function encryptText(text, key, salt, iter) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text));
  return {
    v: 1, alg: "AES-GCM", kdf: "PBKDF2-SHA256", iter,
    salt: bytesToB64(salt), iv: bytesToB64(iv), data: bytesToB64(data)
  };
}

async function decryptEnvelope(env, key) {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(env.iv) }, key, b64ToBytes(env.data)
  );
  return new TextDecoder().decode(plain);
}

function hasEnvelope() {
  try { return localStorage.getItem(CRYPTO_KEY_NAME) !== null; } catch { return false; }
}

function persistData() {
  if (cryptoKey) {
    const snapshot = JSON.stringify({ transactions, priv });
    const key = cryptoKey, salt = cryptoSalt, iter = cryptoIter;
    saveQueue = saveQueue
      .then(() => encryptText(snapshot, key, salt, iter))
      .then(env => { localStorage.setItem(CRYPTO_KEY_NAME, JSON.stringify(env)); })
      .catch(err => console.error("Erro ao salvar protegido", err));
    return;
  }
  if (hasEnvelope()) return; /* protegido e bloqueado: nunca grava em texto aberto */
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  localStorage.setItem(PRIV_KEY, JSON.stringify(priv));
}

function loadDecrypted(text) {
  const data = JSON.parse(text);
  transactions.length = 0;
  if (Array.isArray(data.transactions)) transactions.push(...data.transactions);
  applyPriv(data.priv);
}

/* ----- IndexedDB para a chave do desbloqueio do celular ----- */
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("despesaKeys", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("k");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbRun(mode, fn) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("k", mode);
    const req = fn(tx.objectStore("k"));
    tx.oncomplete = () => { db.close(); resolve(req ? req.result : undefined); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
  });
}

const idbPut = (key, value) => idbRun("readwrite", s => s.put(value, key));
const idbGet = key => idbRun("readonly", s => s.get(key));
const idbDelete = key => idbRun("readwrite", s => s.delete(key));

function shortcutId() {
  try { return localStorage.getItem(SHORTCUT_KEY); } catch { return null; }
}

function shortcutSupported() {
  return !!(window.PublicKeyCredential && navigator.credentials && window.indexedDB);
}

async function enableShortcut() {
  if (!cryptoKey) return;
  try {
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "Despesa" },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: "despesa", displayName: "Despesa" },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
        timeout: 60000
      }
    });
    if (!cred) throw new Error("sem credencial");
    await idbPut("key", cryptoKey);
    localStorage.setItem(SHORTCUT_KEY, bytesToB64(cred.rawId));
    alert(t("shortcutDone"));
  } catch (err) {
    console.error(err);
    alert(t("shortcutFail"));
  }
  updateProtectUI();
}

async function removeShortcut(silent) {
  try { localStorage.removeItem(SHORTCUT_KEY); } catch {}
  try { await idbDelete("key"); } catch {}
  if (!silent) alert(t("shortcutOffDone"));
  updateProtectUI();
}

/* ----- tela de bloqueio ----- */
let lockEl = null;
let hiddenAt = 0;

function showLockScreen() {
  if (lockEl) return;
  document.querySelectorAll(".action-overlay:not(#settingsOverlay)").forEach(o => o.remove());
  document.getElementById("settingsOverlay").hidden = true;

  lockEl = document.createElement("div");
  lockEl.className = "lock-screen";

  const box = document.createElement("div");
  box.className = "lock-box";

  const title = document.createElement("h2");
  title.textContent = "🔒 " + t("lockTitle");
  const text = document.createElement("p");
  text.textContent = t("lockText");

  const input = document.createElement("input");
  input.type = "password";
  input.autocomplete = "current-password";
  input.placeholder = t("protectPw");

  const error = document.createElement("p");
  error.className = "modal-error";
  error.hidden = true;

  const unlockBtn = document.createElement("button");
  unlockBtn.type = "button";
  unlockBtn.textContent = t("lockUnlock");

  box.append(title, text, input, error, unlockBtn);

  let deviceBtn = null;
  if (shortcutId() && shortcutSupported()) {
    deviceBtn = document.createElement("button");
    deviceBtn.type = "button";
    deviceBtn.className = "cancel-action";
    deviceBtn.textContent = "📱 " + t("lockDevice");
    box.appendChild(deviceBtn);
  }

  lockEl.appendChild(box);
  document.body.appendChild(lockEl);

  let busy = false;
  const fail = message => { error.textContent = message; error.hidden = false; };

  async function finish(key, salt, iter, text) {
    cryptoKey = key; cryptoSalt = salt; cryptoIter = iter;
    loadDecrypted(text);
    lockEl.remove();
    lockEl = null;
    applyNewLabels();
    render();
    updateProtectUI();
  }

  async function tryPassword() {
    if (busy) return;
    const password = input.value;
    if (!password) return;
    busy = true;
    unlockBtn.textContent = t("lockBusy");
    try {
      const env = JSON.parse(localStorage.getItem(CRYPTO_KEY_NAME));
      const salt = b64ToBytes(env.salt);
      const iter = env.iter || PBKDF2_ITER;
      const key = await deriveKey(password, salt, iter);
      let text;
      try { text = await decryptEnvelope(env, key); } catch { fail(t("lockWrong")); return; }
      await finish(key, salt, iter, text);
    } catch (err) {
      console.error(err);
      fail(t("lockWrong"));
    } finally {
      busy = false;
      if (unlockBtn.isConnected) unlockBtn.textContent = t("lockUnlock");
    }
  }

  async function tryDevice() {
    if (busy) return;
    busy = true;
    try {
      await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{ type: "public-key", id: b64ToBytes(shortcutId()) }],
          userVerification: "required",
          timeout: 60000
        }
      });
      const key = await idbGet("key");
      if (!key) throw new Error("sem chave");
      const env = JSON.parse(localStorage.getItem(CRYPTO_KEY_NAME));
      let text;
      try { text = await decryptEnvelope(env, key); }
      catch { await removeShortcut(true); throw new Error("chave antiga"); }
      await finish(key, b64ToBytes(env.salt), env.iter || PBKDF2_ITER, text);
    } catch (err) {
      console.error(err);
      fail(t("lockWrong"));
    } finally {
      busy = false;
    }
  }

  unlockBtn.addEventListener("click", tryPassword);
  input.addEventListener("keydown", e => { if (e.key === "Enter") tryPassword(); });
  if (deviceBtn) deviceBtn.addEventListener("click", tryDevice);
  setTimeout(() => input.focus(), 50);
}

async function lockNow() {
  if (!cryptoKey || lockEl) return;
  try { await saveQueue; } catch {}
  cryptoKey = null;
  transactions.length = 0;
  applyPriv(null);
  render();
  showLockScreen();
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    hiddenAt = Date.now();
  } else if (cryptoKey && hiddenAt && Date.now() - hiddenAt > RELOCK_MS) {
    lockNow();
  }
});

/* ----- janelas de senha ----- */
function askPasswordModal(title, text) {
  return new Promise((resolve, reject) => {
    const { overlay, menu } = showModal(title, text);
    const input = document.createElement("input");
    input.type = "password";
    input.placeholder = t("protectPw");
    menu.appendChild(input);

    const submit = () => { if (!input.value) return; overlay.remove(); resolve(input.value); };
    input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
    addModalButton(menu, t("ok"), submit);
    addModalButton(menu, t("cancel"), () => { overlay.remove(); reject(new Error("cancelado")); }, "cancel-action");
    setTimeout(() => input.focus(), 50);
  });
}

function askNewPassword() {
  const { overlay, menu } = showModal(t("protectPwTitle"), t("protectPwText"));
  const one = document.createElement("input");
  one.type = "password"; one.autocomplete = "new-password"; one.placeholder = t("protectPw");
  const two = document.createElement("input");
  two.type = "password"; two.autocomplete = "new-password"; two.placeholder = t("protectPw2");
  menu.append(one, two);
  const showError = modalMessage(menu);

  addModalButton(menu, t("protectActivate"), async () => {
    if (one.value.length < 6) { showError(t("protectPwShort")); return; }
    if (one.value !== two.value) { showError(t("protectPwDiff")); return; }
    const password = one.value;
    overlay.remove();
    await enableProtection(password);
  });
  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

function startEnableProtection() {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  const { overlay, menu } = showModal(t("protectWarnTitle"), t("protectWarn"));
  addModalButton(menu, t("protectBackupNow"), () => { exportBackup(); });
  addModalButton(menu, t("protectContinue"), () => { overlay.remove(); askNewPassword(); });
  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

async function enableProtection(password) {
  let wrote = false;
  try {
    await saveQueue;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(password, salt, PBKDF2_ITER);
    const payload = JSON.stringify({ transactions, priv });
    const env = await encryptText(payload, key, salt, PBKDF2_ITER);
    if ((await decryptEnvelope(env, key)) !== payload) throw new Error("verificacao");

    localStorage.setItem(CRYPTO_KEY_NAME, JSON.stringify(env));
    wrote = true;
    const back = JSON.parse(localStorage.getItem(CRYPTO_KEY_NAME));
    if ((await decryptEnvelope(back, key)) !== payload) throw new Error("verificacao");

    cryptoKey = key; cryptoSalt = salt; cryptoIter = PBKDF2_ITER;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PRIV_KEY);
    updateProtectUI();
    alert(t("protectDone"));
  } catch (err) {
    console.error(err);
    if (wrote && !cryptoKey) { try { localStorage.removeItem(CRYPTO_KEY_NAME); } catch {} }
    alert(t("protectFail"));
  }
}

function confirmDisableProtection() {
  if (document.querySelector(".action-overlay:not(#settingsOverlay)")) return;
  const { overlay, menu } = showModal(t("protectOffTitle"), t("protectOffText"));
  addModalButton(menu, t("protectOff"), async () => {
    overlay.remove();
    await disableProtection();
  }, "delete-action");
  addModalButton(menu, t("cancel"), () => overlay.remove(), "cancel-action");
}

async function disableProtection() {
  try {
    await saveQueue;
    const txText = JSON.stringify(transactions);
    const privText = JSON.stringify(priv);
    localStorage.setItem(STORAGE_KEY, txText);
    localStorage.setItem(PRIV_KEY, privText);
    if (localStorage.getItem(STORAGE_KEY) !== txText || localStorage.getItem(PRIV_KEY) !== privText) {
      throw new Error("verificacao");
    }
    localStorage.removeItem(CRYPTO_KEY_NAME);
    cryptoKey = null; cryptoSalt = null;
    await removeShortcut(true);
    updateProtectUI();
    alert(t("protectOffDone"));
  } catch (err) {
    console.error(err);
    alert(t("protectOffFail"));
  }
}

function updateProtectUI() {
  const on = !!cryptoKey;
  const info = document.getElementById("protectInfo");
  const button = document.getElementById("protectButton");
  const sc = document.getElementById("shortcutButton");
  if (info) info.textContent = on ? t("protectOnInfo") : t("protectOffInfo");
  if (button) button.textContent = on ? t("protectOff") : t("protectOn");
  if (sc) {
    sc.hidden = !(on && shortcutSupported());
    sc.textContent = shortcutId() ? t("shortcutOff") : t("shortcutOn");
  }
}

document.getElementById("protectButton").addEventListener("click", () => {
  if (cryptoKey) confirmDisableProtection(); else startEnableProtection();
});

document.getElementById("shortcutButton").addEventListener("click", () => {
  if (shortcutId()) removeShortcut(false); else enableShortcut();
});

/* ----- textos novos ----- */
function applyNewLabels() {
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  const search = document.getElementById("searchInput");
  if (search) search.placeholder = t("searchPh");
  set("filterToggle", "⚙️ " + t("filters"));
  set("filterClear", t("filterClear"));
  fillFilterCat(true);
  fillFilterStatus();
  set("addVaultButton", t("vaultNew"));
  set("lblBudget", t("budgetSet"));
  set("budgetButton", t("budgetBtn"));
  set("lblInitial", t("initialLabel"));
  set("initialHelp", t("initialHelp"));
  set("lblProtect", t("protectSet"));
  const initial = document.getElementById("initialBalanceInput");
  if (initial) initial.value = moneyInputText(priv.initialBalance);
  updateProtectUI();
  renderVaults();
}

/* ---------- INICIAR ---------- */
loadSettings();
rebuildCategories();
applyTheme();
applyLanguage();
if (hasEnvelope()) {
  showLockScreen();
} else {
  loadData();
  applyNewLabels();
  render();
}