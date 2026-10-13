// =====================================================
// CONFIGURATION
// =====================================================

const API_URL =
    "https://wifi-backend-y5v6.onrender.com";

const TOKEN_KEY = "fleury-history.admin-token";
let accessToken = sessionStorage.getItem(TOKEN_KEY);
const authPanel = document.getElementById("authPanel");
const loginForm = document.getElementById("adminLoginForm");
const authMessage = document.getElementById("authMessage");
const appContainer = document.querySelector(".container");
const logoutBtn = document.getElementById("logoutBtn");

function apiFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(url, { ...options, headers });
}

function showLogin(message = "") {
    accessToken = null;
    sessionStorage.removeItem(TOKEN_KEY);
    appContainer.classList.add("hidden");
    authPanel.classList.remove("hidden");
    authMessage.textContent = message;
    authMessage.classList.toggle("hidden", !message);
}

async function showHistoryApp() {
    const response = await apiFetch(`${API_URL}/users/me`);
    if (!response.ok) throw new Error("Session expirée. Reconnecte-toi.");
    const user = await response.json();
    if (user.role !== "ADMIN") throw new Error("Cette page est réservée à un compte administrateur.");
    authPanel.classList.add("hidden");
    appContainer.classList.remove("hidden");
    await loadRouters();
    await loadHistory();
    await loadFleurySummary();
}


// =====================================================
// ELEMENTS
// =====================================================

const daySelect =
    document.getElementById("day");

const monthSelect =
    document.getElementById("month");

const yearSelect =
    document.getElementById("year");

const phoneInput =
    document.getElementById("phone");


    const routerSelect =
    document.getElementById("router");

const paymentStatusSelect =
    document.getElementById("paymentStatus");

const connectionSelect =
    document.getElementById("connection");

const searchBtn =
    document.getElementById("searchBtn");

const resetBtn =
    document.getElementById("resetBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const table =
    document.getElementById("paymentsTable");

const message =
    document.getElementById("message");

const detailsModal =
    document.getElementById("detailsModal");

const detailsContent =
    document.getElementById("detailsContent");

const closeModal =
    document.getElementById("closeModal");


// =====================================================
// INITIALISATION DES JOURS
// =====================================================

function initializeDays() {

    for (let i = 1; i <= 31; i++) {

        const option =
            document.createElement("option");

        option.value = i;

        option.textContent =
            String(i).padStart(2, "0");

        daySelect.appendChild(option);
    }
}


// =====================================================
// INITIALISATION DES ANNEES
// =====================================================

function initializeYears() {

    const currentYear =
        new Date().getFullYear();

    for (
        let year = currentYear;
        year >= currentYear - 5;
        year--
    ) {

        const option =
            document.createElement("option");

        option.value = year;

        option.textContent = year;

        yearSelect.appendChild(option);
    }
}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(text) {

    message.textContent = text;

    message.classList.remove("hidden");
}

function hideMessage() {

    message.textContent = "";

    message.classList.add("hidden");
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString(
        "fr-FR",
        {
            dateStyle: "short",
            timeStyle: "short",
        }
    );
}


// =====================================================
// FORMAT MONTANT
// =====================================================

function formatAmount(amount) {

    return new Intl.NumberFormat(
        "fr-FR"
    ).format(amount) + " FCFA";
}


// =====================================================
// BADGE PAIEMENT
// =====================================================

function paymentBadge(status) {

    if (status === "SUCCESS") {

        return `
            <span class="badge badge-success">
                ✓ SUCCESS
            </span>
        `;
    }

    if (status === "FAILED") {

        return `
            <span class="badge badge-danger">
                ✕ FAILED
            </span>
        `;
    }

    return `
        <span class="badge badge-warning">
            ⏳ PENDING
        </span>
    `;
}


// =====================================================
// BADGE CONNEXION
// =====================================================

function connectionBadge(connected) {

    if (connected) {

        return `
            <span class="badge badge-success">
                ✓ Connecté
            </span>
        `;
    }

    return `
        <span class="badge badge-danger">
            ✕ Jamais connecté
        </span>
    `;
}


// =====================================================
// BADGE MIKROTIK
// =====================================================

function mikrotikBadge(item) {

    if (!item.mikrotik.ticketCreated) {

        return `
            <span class="badge badge-warning">
                ⏳ Non créé
            </span>
        `;
    }

    if (
        item.mikrotik.createStatus ===
        "SUCCESS"
    ) {

        return `
            <span class="badge badge-success">
                ✓ Créé
            </span>
        `;
    }

    if (
        item.mikrotik.createStatus ===
        "FAILED"
    ) {

        return `
            <span class="badge badge-danger">
                ✕ Échec
            </span>
        `;
    }

    return `
        <span class="badge badge-warning">
            ⏳ ${item.mikrotik.createStatus}
        </span>
    `;
}







// =====================================================
// CHARGER LES ROUTEURS
// =====================================================

async function loadRouters() {

    try {

        const response =
            await apiFetch(`${API_URL}/routers`);

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const routers =
            await response.json();

        routers.forEach(router => {

            const option =
                document.createElement("option");

            option.value = router.code;

            option.textContent = router.name;

            routerSelect.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Erreur chargement routeurs :",
            error
        );

    }
}
// =====================================================
// CHARGER HISTORIQUE
// =====================================================

async function loadHistory() {

    hideMessage();

    table.innerHTML = `
        <tr>
            <td colspan="10" class="loading">
                Chargement...
            </td>
        </tr>
    `;

    const params =
        new URLSearchParams();

    if (daySelect.value) {

        params.set(
            "day",
            daySelect.value
        );
    }

    if (monthSelect.value) {

        params.set(
            "month",
            monthSelect.value
        );
    }

    if (yearSelect.value) {

        params.set(
            "year",
            yearSelect.value
        );
    }

    if (phoneInput.value.trim()) {

        params.set(
            "phone",
            phoneInput.value.trim()
        );
    }


    if (routerSelect.value) {

    params.set(
        "routerCode",
        routerSelect.value
    );
}




    if (paymentStatusSelect.value) {

        params.set(
            "paymentStatus",
            paymentStatusSelect.value
        );
    }

    if (connectionSelect.value) {

        params.set(
            "connection",
            connectionSelect.value
        );
    }


    try {

        const response =
            await apiFetch(
                `${API_URL}/payments/fleury/history?${params.toString()}`
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const result =
            await response.json();

        renderStatistics(
            result.statistics
        );

        renderTable(
            result.data
        );

    } catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="10" class="loading">
                    Impossible de charger les données.
                </td>
            </tr>
        `;

        showMessage(
            "Erreur lors de la récupération de l'historique."
        );
    }
}


// =====================================================
// RESUME FINANCIER FLEURY
// =====================================================

async function loadFleurySummary() {
    try {
        const response = await apiFetch(
            `${API_URL}/payments/fleury/summary`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        console.log("===== REPONSE FLEURY =====");
        console.log(result);

        // Supporte directement la réponse du backend
        // et une éventuelle réponse encapsulée dans data
        const summary = result.data ?? result;

        document.getElementById("fleurySales").textContent =
            formatAmount(
                Number(summary.totalFleurySales ?? 0)
            );

        document.getElementById("fleuryPaid").textContent =
            formatAmount(
                Number(summary.totalPaid ?? 0)
            );

    } catch (error) {

        console.error(
            "Erreur chargement résumé FLEURY :",
            error
        );

        document.getElementById("fleurySales").textContent = "—";
        document.getElementById("fleuryPaid").textContent = "—";
    }
}


// =====================================================
// STATISTIQUES
// =====================================================

function renderStatistics(stats) {

    document.getElementById(
        "statTotal"
    ).textContent =
        stats.total ?? 0;

    document.getElementById(
        "statSuccess"
    ).textContent =
        stats.paymentSuccess ?? 0;

    document.getElementById(
        "statFailed"
    ).textContent =
        stats.paymentFailed ?? 0;

    document.getElementById(
        "statTickets"
    ).textContent =
        stats.ticketCreated ?? 0;

    document.getElementById(
        "statConnected"
    ).textContent =
        stats.connected ?? 0;

    document.getElementById(
        "statNeverConnected"
    ).textContent =
        stats.neverConnected ?? 0;
}


// =====================================================
// TABLE
// =====================================================

function renderTable(data) {

    if (!data || data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="11" class="loading">
                    Aucun résultat.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        data.map(
            (item, index) => {

                const ticket =
                    item.ticket;

                return `

                    <tr>

                        <td>
                            ${formatDate(
                                item.payment.createdAt
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.payment.phone
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.payment.operator
                            )}
                        </td>

                        <td>
                            ${formatAmount(
                                item.payment.amount
                            )}
                        </td>

                        <td>
                            ${paymentBadge(
                                item.payment.status
                            )}
                        </td>

                        <td>

                            ${
                                ticket
                                ?
                                `
                                <div class="ticket-info">

                                    <span class="ticket-username">
                                        ${escapeHtml(
                                            ticket.username
                                        )}
                                    </span>

                                    <span class="ticket-password">
                                        ${escapeHtml(
                                            ticket.password
                                        )}
                                    </span>

                                </div>
                                `
                                :
                                `
                                <span class="badge badge-neutral">
                                    Aucun ticket
                                </span>
                                `
                            }

                        </td>

                        
                        <td>
    ${escapeHtml(
        item.router?.name ?? "—"
    )}
</td>

                        <td>
                            ${connectionBadge(
                                item.connection.connected
                            )}
                        </td>

                        <td>
                            ${mikrotikBadge(item)}
                        </td>

                        <td>
                            ${
                                ticket
                                ?
                                formatDate(
                                    ticket.expiresAt
                                )
                                :
                                "—"
                            }
                        </td>

                        <td>

                            <button
                                class="btn primary"
                                onclick="showDetails(${index})"
                            >
                                Détails
                            </button>

                        </td>

                    </tr>
                `;
            }
        ).join("");


    // Stockage pour les détails

    window.historyData =
        data;
}


// =====================================================
// DETAILS
// =====================================================

function showDetails(index) {

    const item =
        window.historyData[index];

    if (!item) {
        return;
    }

    const payment =
        item.payment;

    const ticket =
        item.ticket;

    const offer =
        item.offer;

    const router =
        item.router;


    detailsContent.innerHTML = `

        <div class="credentials">

            <h3>
                🎫 Identifiants du ticket
            </h3>

            <div class="credential-row">

                <span>
                    Username
                </span>

                <span>

                    <span class="credential-value">
                        ${
                            ticket
                            ?
                            escapeHtml(
                                ticket.username
                            )
                            :
                            "—"
                        }
                    </span>

                    ${
                        ticket
                        ?
                        `
                        <button
                            class="copy-btn"
                            onclick="copyText('${escapeAttribute(ticket.username)}')"
                        >
                            Copier
                        </button>
                        `
                        :
                        ""
                    }

                </span>

            </div>


            <div class="credential-row">

                <span>
                    Password
                </span>

                <span>

                    <span class="credential-value">
                        ${
                            ticket
                            ?
                            escapeHtml(
                                ticket.password
                            )
                            :
                            "—"
                        }
                    </span>

                    ${
                        ticket
                        ?
                        `
                        <button
                            class="copy-btn"
                            onclick="copyText('${escapeAttribute(ticket.password)}')"
                        >
                            Copier
                        </button>
                        `
                        :
                        ""
                    }

                </span>

            </div>

        </div>


        <div class="details-grid">

            <div class="detail-card">

                <div class="detail-label">
                    Téléphone
                </div>

                <div class="detail-value">
                    ${escapeHtml(
                        payment.phone
                    )}
                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    Opérateur
                </div>

                <div class="detail-value">
                    ${escapeHtml(
                        payment.operator
                    )}
                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    Montant
                </div>

                <div class="detail-value">
                    ${formatAmount(
                        payment.amount
                    )}
                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    Statut paiement
                </div>

                <div class="detail-value">
                    ${paymentBadge(
                        payment.status
                    )}
                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    Référence
                </div>

                <div class="detail-value">
                    ${escapeHtml(
                        payment.reference
                    )}
                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    Transaction
                </div>

                <div class="detail-value">
                    ${
                        payment.transactionId
                        ?
                        escapeHtml(
                            payment.transactionId
                        )
                        :
                        "—"
                    }
                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    Offre
                </div>

                <div class="detail-value">
                    ${escapeHtml(
                        offer.name
                    )}
                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    Profil MikroTik
                </div>

                <div class="detail-value">
                    ${escapeHtml(
                        offer.profileName
                    )}
                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    Ticket créé
                </div>

                <div class="detail-value">

                    ${
                        item.mikrotik.ticketCreated
                        ?
                        "✅ Oui"
                        :
                        "❌ Non"
                    }

                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    Première connexion
                </div>

                <div class="detail-value">

                    ${
                        item.connection.connected
                        ?
                        "✅ Oui"
                        :
                        "❌ Non"
                    }

                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    Première connexion
                </div>

                <div class="detail-value">
                    ${formatDate(
                        item.connection.firstLoginAt
                    )}
                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    Dernière présence
                </div>

                <div class="detail-value">
                    ${formatDate(
                        item.connection.lastSeenAt
                    )}
                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    Activation du forfait
                </div>

                <div class="detail-value">
                    ${
                        ticket
                        ?
                        formatDate(
                            ticket.activatedAt
                        )
                        :
                        "—"
                    }
                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    Expiration
                </div>

                <div class="detail-value">
                    ${
                        ticket
                        ?
                        formatDate(
                            ticket.expiresAt
                        )
                        :
                        "—"
                    }
                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    CREATE MikroTik
                </div>

                <div class="detail-value">

                    ${
                        item.mikrotik.createStatus
                        ?
                        item.mikrotik.createStatus
                        :
                        "—"
                    }

                </div>

            </div>


            <div class="detail-card">

                <div class="detail-label">
                    REMOVE MikroTik
                </div>

                <div class="detail-value">

                    ${
                        item.mikrotik.removeStatus
                        ?
                        item.mikrotik.removeStatus
                        :
                        "—"
                    }

                </div>

            </div>


            <div class="detail-card full">

                <div class="detail-label">
                    Routeur
                </div>

                <div class="detail-value">
                    ${escapeHtml(
                        router.name
                    )}
                    —
                    ${escapeHtml(
                        router.code
                    )}
                </div>

            </div>

        </div>

    `;


    detailsModal.classList.remove(
        "hidden"
    );
}


// =====================================================
// COPIER
// =====================================================

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(
            text
        );

        alert(
            "Copié dans le presse-papiers"
        );

    } catch (error) {

        console.error(error);

        alert(
            "Impossible de copier"
        );
    }
}


// =====================================================
// SECURITE HTML
// =====================================================

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");
}


// =====================================================
// EVENEMENTS
// =====================================================

searchBtn.addEventListener(
    "click",
    loadHistory
);

refreshBtn.addEventListener(
    "click",
    () => {

        loadHistory();
        loadFleurySummary();

    }
);


resetBtn.addEventListener(
    "click",
    () => {

        daySelect.value = "";

        monthSelect.value = "";

        yearSelect.value = "";

        phoneInput.value = "";

        routerSelect.value = "";

        paymentStatusSelect.value = "";

        connectionSelect.value = "";

        loadHistory();
    }
);


phoneInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            loadHistory();
        }
    }
);


closeModal.addEventListener(
    "click",
    () => {

        detailsModal.classList.add(
            "hidden"
        );
    }
);


detailsModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            detailsModal
        ) {

            detailsModal.classList.add(
                "hidden"
            );
        }
    }
);


// =====================================================
// DEMARRAGE
// =====================================================

initializeDays();
initializeYears();
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = loginForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    authMessage.classList.add("hidden");
    try {
        const credentials = Object.fromEntries(new FormData(loginForm));
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Connexion refusée.");
        accessToken = result.access_token;
        if (!accessToken) throw new Error("Le backend n’a pas retourné de jeton de session.");
        sessionStorage.setItem(TOKEN_KEY, accessToken);
        await showHistoryApp();
    } catch (error) {
        showLogin(error.message || "Connexion impossible.");
    } finally {
        submit.disabled = false;
    }
});

logoutBtn.addEventListener("click", () => showLogin());

if (accessToken) {
    showHistoryApp().catch((error) => showLogin(error.message));
} else {
    showLogin();
}
