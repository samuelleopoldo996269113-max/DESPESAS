const transactions = [];
let currentDate = new Date();

const STORAGE_KEY = "minhasDespesas";
const SETTINGS_KEY = "minhasDespesasConfig";

const settings = { lang: "pt", mode: "light", color: "none" };

/* ---------- TRADUÇÕES ---------- */
const I18N = {
  pt: {
    locale: "pt-BR", currency: "BRL",
    title: "Minhas despesas",
    total: "Total a pagar", remaining: "Saldo a pagar", wallet: "Carteira",
    newTx: "Nova movimentação", type: "Tipo de movimentação",
    expense: "DESPESA", income: "ENTRADA",
    typeError: "Escolha despesa ou entrada.",
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
    title: "My expenses",
    total: "Total to pay", remaining: "Balance to pay", wallet: "Wallet",
    newTx: "New transaction", type: "Transaction type",
    expense: "EXPENSE", income: "INCOME",
    typeError: "Choose expense or income.",
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
    title: "Mis gastos",
    total: "Total a pagar", remaining: "Saldo a pagar", wallet: "Cartera",
    newTx: "Nuevo movimiento", type: "Tipo de movimiento",
    expense: "GASTO", income: "INGRESO",
    typeError: "Elige gasto o ingreso.",
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

function getMonthTransactions() {
  const selectedMonth = monthKey(currentDate);
  const result = [];

  transactions.forEach(tx => {
    if (tx.repeat === "monthly") {
      if (selectedMonth < tx.date.substring(0, 7)) return;

      const start = new Date(tx.date + "T12:00:00");
      const difference =
        (currentDate.getFullYear() - start.getFullYear()) * 12 +
        currentDate.getMonth() - start.getMonth();

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
    if (tx.type === "expense" && tx.paid) div.classList.add("done");

    const name = document.createElement("div");
    name.className = "tx-name";
    name.textContent = tx.description;

    const date = document.createElement("div");
    date.className = "tx-date";
    date.textContent = formatDate(tx.date);

    const status = document.createElement("div");
    status.className = "status";
    status.textContent = tx.type === "income"
      ? (received ? t("received") : t("planned"))
      : (tx.paid ? t("paid") : t("pending"));

    const left = document.createElement("div");
    left.append(name, date, status);

    const value = document.createElement("div");
    value.className = "tx-value";
    value.textContent = (tx.type === "expense" ? "- " : "+ ") + money(tx.amount);

    div.append(left, value);
    div.addEventListener("click", () => transactionOptions(tx));
    list.appendChild(div);
  });

  updateSummary(items);
  updateOverdueAlert();
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
        const key = monthKey(occurrence);

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
      if (tx.type === "expense" && tx.paid) wallet -= tx.amount;
    }
  });

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

  if (tx.type === "expense") {
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

  const amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.min = "0.01";
  amountInput.step = "0.01";
  amountInput.value = original.amount;

  menu.append(descriptionLabel, descriptionInput, amountLabel, amountInput);

  addModalButton(menu, t("saveChanges"), () => {
    const newDescription = descriptionInput.value.trim();
    const newAmount = Number(amountInput.value);

    if (!newDescription || newAmount <= 0) {
      alert(t("invalidEdit"));
      return;
    }

    original.description = newDescription;
    original.amount = newAmount;

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
  document.getElementById("typeError").hidden = true;
}

document.getElementById("expenseButton").addEventListener("click", () => setType("expense"));
document.getElementById("incomeButton").addEventListener("click", () => setType("income"));

document.getElementById("addButton").addEventListener("click", () => {
  form.reset();
  setType("");
  document.getElementById("dueDate").value = dateString(new Date());
  document.getElementById("countField").hidden = true;
  txOverlay.hidden = false;
});

document.getElementById("cancelButton").addEventListener("click", () => {
  txOverlay.hidden = true;
});

document.getElementById("repeat").addEventListener("change", event => {
  document.getElementById("countField").hidden = event.target.value !== "installments";
});

form.addEventListener("submit", event => {
  event.preventDefault();

  if (!selectedType) {
    document.getElementById("typeError").hidden = false;
    return;
  }

  const type = selectedType;
  const description = document.getElementById("description").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const date = document.getElementById("dueDate").value;
  const repeat = document.getElementById("repeat").value;
  const count = Number(document.getElementById("count").value);

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
        paid: false
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
      paidMonths: []
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
    if (raw.type !== "expense" && raw.type !== "income") return;
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

/* ---------- INICIAR ---------- */
loadSettings();
applyTheme();
applyLanguage();
loadData();
render();