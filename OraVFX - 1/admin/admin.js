const $ = (id) => document.getElementById(id);
let inquiries = [];
let packages = [];
let orders = [];
function date(v) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}
function render() {
  const q = $("search").value.toLowerCase().trim(),
    f = $("filter").value;
  const items = inquiries.filter((x) => {
    const z = x.fields || {},
      s = Array.isArray(x.services) ? x.services : [],
      hay = [
        z.fullName,
        z.email,
        z.phone,
        z.company,
        z.details,
        z.reference,
        x.budget,
        x.timeline,
        ...s,
      ]
        .join(" ")
        .toLowerCase();
    return (!q || hay.includes(q)) && (!f || s.includes(f));
  });
  $("list").innerHTML = "";
  $("empty").classList.toggle("hidden", items.length > 0);
  for (const x of items) {
    const z = x.fields || {},
      s = Array.isArray(x.services) ? x.services : [],
      files = Array.isArray(x.files) ? x.files : [];
    const c = document.createElement("article");
    c.className = "card";
    c.innerHTML = `<div class="head"><div><div class="date">${date(x.receivedAt)}</div><div class="name"></div><div class="company"></div></div><button class="delete">Delete</button></div><div class="grid"><div><span>Email</span><a class="email"></a></div><div><span>Phone</span><a class="phone"></a></div><div><span>Services</span><p class="svc"></p></div><div><span>Budget</span><p class="budget"></p></div><div><span>Timeline</span><p class="time"></p></div><div><span>Files</span><p class="files"></p></div></div><div class="details"><span>Project details</span><p class="detail"></p></div>`;
    c.querySelector(".name").textContent = z.fullName || "Unnamed client";
    c.querySelector(".company").textContent = z.company || "No company";
    const e = c.querySelector(".email");
    e.textContent = z.email || "—";
    if (z.email) e.href = "mailto:" + z.email;
    const ph = c.querySelector(".phone");
    ph.textContent = z.phone || "—";
    if (z.phone) ph.href = "tel:" + z.phone.replace(/[^\d+]/g, "");
    c.querySelector(".svc").textContent = s.join(", ") || "—";
    c.querySelector(".budget").textContent = x.budget || "—";
    c.querySelector(".time").textContent = x.timeline || "—";
    const filesElement = c.querySelector(".files");
    filesElement.innerHTML = "";
    if (!files.length) {
      filesElement.textContent = "No files";
    } else {
      files.forEach((file, index) => {
        const link = document.createElement("a");
        const fileName = typeof file === "string" ? file : file.name;
        link.textContent = fileName || `File ${index + 1}`;
        link.href = typeof file === "object" && file.url ? file.url : "#";
        link.target = "_blank";
        link.rel = "noopener";
        if (!file || typeof file !== "object" || !file.url) {
          link.className = "file-name-only";
          link.removeAttribute("target");
          link.removeAttribute("rel");
        }
        filesElement.appendChild(link);
        if (index < files.length - 1) filesElement.append(" ");
      });
    }
    c.querySelector(".detail").textContent = z.details || "—";
    c.querySelector(".delete").onclick = async () => {
      if (!confirm(`Delete inquiry from ${z.fullName || "this client"}?`))
        return;
      const r = await fetch("/api/inquiries/" + encodeURIComponent(x.id), {
        method: "DELETE",
      });
      if (r.ok) {
        inquiries = inquiries.filter((i) => i.id !== x.id);
        loadStats();
        render();
      }
    };
    $("list").appendChild(c);
  }
}
function renderPackageList() {
  const list = $("packageList");
  if (!packages.length) {
    list.innerHTML = '<div class="mini-item"><strong>No packages</strong><small>Add a package from the public catalog page.</small></div>';
    return;
  }
  list.innerHTML = packages
    .map(
      (item) => `
        <div class="mini-item">
          <strong>${item.name}</strong>
          <small>${item.category} • ${item.priceDisplay || (item.price ? `₹${Number(item.price).toLocaleString("en-IN")}` : "Price on request")}</small>
        </div>
      `,
    )
    .join("");
}

function renderOrderList() {
  const list = $("orderList");
  if (!orders.length) {
    list.innerHTML = '<div class="mini-item"><strong>No orders</strong><small>Orders created from the website will appear here.</small></div>';
    return;
  }
  list.innerHTML = orders
    .slice(0, 6)
    .map(
      (order) => `
        <div class="mini-item">
          <strong>${order.packageName || "Package"}</strong>
          <small>${order.customer?.fullName || "Client"} • ${order.status || "pending"} • ₹${Number(order.amount || 0).toLocaleString("en-IN")}</small>
          <select class="order-status" data-order-id="${order.id}">
            ${["pending_payment", "payment_processing", "payment_pending", "paid", "payment_failed", "cancelled"].map((status) => `<option value="${status}" ${order.status === status ? "selected" : ""}>${status.replaceAll("_", " ")}</option>`).join("")}
          </select>
        </div>
      `,
    )
    .join("");
  list.querySelectorAll(".order-status").forEach((select) => {
    select.onchange = async () => {
      select.disabled = true;
      const response = await fetch(`/api/orders/${encodeURIComponent(select.dataset.orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: select.value }),
      });
      if (response.ok) {
        const order = orders.find((item) => item.id === select.dataset.orderId);
        if (order) order.status = select.value;
      } else {
        select.value = orders.find((item) => item.id === select.dataset.orderId)?.status || "pending_payment";
        $("msg").textContent = "Could not update order status.";
      }
      select.disabled = false;
    };
  });
}

function loadStats() {
  $("total").textContent = inquiries.length;
  const now = new Date();
  $("today").textContent = inquiries.filter((x) => {
    const d = new Date(x.receivedAt);
    return d.toDateString() === now.toDateString();
  }).length;
  const set = new Set(
    inquiries.flatMap((x) => (Array.isArray(x.services) ? x.services : [])),
  );
  $("services").textContent = set.size;
  const old = $("filter").value;
  $("filter").innerHTML = '<option value="">All services</option>';
  [...set].sort().forEach((s) => {
    const o = document.createElement("option");
    o.value = s;
    o.textContent = s;
    $("filter").appendChild(o);
  });
  $("filter").value = set.has(old) ? old : "";
}
async function load() {
  try {
    const [inquiriesRes, packagesRes, ordersRes] = await Promise.all([
      fetch("/api/inquiries", { credentials: "same-origin" }),
      fetch("/api/packages", { credentials: "same-origin" }),
      fetch("/api/orders", { credentials: "same-origin" }),
    ]);

    if (inquiriesRes.status === 401 || packagesRes.status === 401 || ordersRes.status === 401) return showLogin();

    const inquiriesData = await inquiriesRes.json();
    const packagesData = await packagesRes.json();
    const ordersData = await ordersRes.json();

    if (!inquiriesRes.ok) {
      $("msg").textContent = inquiriesData.message || "Could not load inquiries.";
      return;
    }

    inquiries = inquiriesData.inquiries || [];
    packages = packagesData.packages || [];
    orders = ordersData.orders || [];

    renderPackageList();
    renderOrderList();
    loadStats();
    render();
    $("msg").textContent = "";
  } catch (error) {
    $("msg").textContent = "Could not connect to the admin server.";
  }
}
function showLogin() {
  $("login").classList.remove("hidden");
  $("dash").classList.add("hidden");
  $("password").focus();
}
function showDash() {
  $("login").classList.add("hidden");
  $("dash").classList.remove("hidden");
}
$("showPassword").onchange = () => {
  $("password").type = $("showPassword").checked ? "text" : "password";
};
$("loginForm").onsubmit = async (e) => {
  e.preventDefault();
  $("loginMsg").textContent = "Signing in...";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      signal: controller.signal,
      body: JSON.stringify({ password: $("password").value }),
    });
    clearTimeout(timeout);
    const d = await r.json();
    if (!r.ok) {
      $("loginMsg").textContent = d.message || "Login failed.";
      return;
    }
    $("password").value = "";
    showDash();
    load();
  } catch (error) {
    $("loginMsg").textContent =
      error.name === "AbortError"
        ? "Server took too long to respond."
        : "Could not connect to the admin server.";
  }
};
$("refresh").onclick = load;
$("search").oninput = render;
$("filter").onchange = render;
$("logout").onclick = async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  showLogin();
};
fetch("/api/admin/me")
  .then((r) => r.json())
  .then((d) => (d.authenticated ? (showDash(), load()) : showLogin()))
  .catch(showLogin);
