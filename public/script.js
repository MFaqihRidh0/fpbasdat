// --- AUTH & GLOBAL ---
const token = localStorage.getItem("admin-token");
if (!token) {
  window.location.href = "/index.html";
}
const authHeader = {
  "x-admin-token": token,
  "Content-Type": "application/json",
};

// --- Elemen Modal ---
const modal = document.getElementById("edit-modal");
const modalTitle = document.getElementById("modal-title");
const modalFields = document.getElementById("edit-fields");
const editIdInput = document.getElementById("edit-id");
const editTypeInput = document.getElementById("edit-type");

// --- FUNGSI MODAL ---
function closeEditModal() {
  modal.style.display = "none";
}

async function openEditModal(type, id, data) {
  editIdInput.value = id;
  editTypeInput.value = type;
  modalFields.innerHTML = "";

  if (type === "kategori") {
    modalTitle.innerText = "Edit Kategori";
    modalFields.innerHTML = `<label>Nama Kategori:</label><input id="edit-nama" value="${data.nama}" required>`;
  } else if (type === "supplier") {
    modalTitle.innerText = "Edit Supplier";
    modalFields.innerHTML = `
          <label>Nama:</label><input id="edit-nama" value="${data.nama}" required>
          <label>Alamat:</label><input id="edit-alamat" value="${data.alamat}" required>
          <label>Kontak:</label><input id="edit-kontak" value="${data.kontak}" required>
        `;
  } else if (type === "produk") {
    modalTitle.innerText = "Edit Produk";
    modalFields.innerHTML = `
          <label>Nama:</label><input id="edit-nama" value="${data.nama}" required>
          <label>Stok:</label><input id="edit-stok" type="number" value="${data.stok}" required>
          <label>Harga:</label><input id="edit-harga" type="number" value="${data.harga}" required>
          <label>Kategori:</label><select id="edit-p-kat"></select>
        `;
    await loadKategoriToSelect("edit-p-kat", data.kategori._id);
  }
  modal.style.display = "block";
}

document.getElementById("edit-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = editIdInput.value;
  const type = editTypeInput.value;
  let body;

  if (type === "kategori") {
    body = { nama: document.getElementById("edit-nama").value };
  } else if (type === "supplier") {
    body = {
      nama: document.getElementById("edit-nama").value,
      alamat: document.getElementById("edit-alamat").value,
      kontak: document.getElementById("edit-kontak").value,
    };
  } else if (type === "produk") {
    body = {
      nama: document.getElementById("edit-nama").value,
      stok: document.getElementById("edit-stok").value,
      harga: document.getElementById("edit-harga").value,
      kategori: document.getElementById("edit-p-kat").value,
    };
  }

  try {
    const res = await fetch(`/api/${type}/${id}`, {
      method: "PUT",
      headers: authHeader,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Gagal menyimpan data");

    closeEditModal();
    loadAllData();
    alert("Data berhasil diperbarui!");
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

// --- FUNGSI CRUD & RENDER ---
async function deleteItem(type, id) {
  if (!confirm(`Apakah Anda yakin ingin menghapus item ini?`)) return;
  try {
    await fetch(`/api/${type}/${id}`, {
      method: "DELETE",
      headers: authHeader,
    });
    loadAllData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function loadKategoriToSelect(selectId, selectedValue = null) {
  const select = document.getElementById(selectId);
  select.innerHTML = "";
  const res = await fetch("/api/kategori", { headers: authHeader });
  const kats = await res.json();
  kats.forEach((k) => {
    const opt = document.createElement("option");
    opt.value = k._id;
    opt.innerText = k.nama;
    if (k._id === selectedValue) opt.selected = true;
    select.appendChild(opt);
  });
}

function renderKategori(data) {
  const list = document.getElementById("list-kat");
  list.innerHTML = "";
  data.forEach((kat) => {
    const li = document.createElement("li");
    li.innerHTML = `
                <span>${kat.nama}</span>
                <div class="li-actions">
                    <button class="edit-btn" onclick="openEditModal('kategori', '${
                      kat._id
                    }', ${JSON.stringify(kat)})">Edit</button>
                    <button class="delete-btn" onclick="deleteItem('kategori', '${
                      kat._id
                    }')">X</button>
                </div>
            `;
    list.appendChild(li);
  });
}

function renderSupplier(data) {
  const list = document.getElementById("list-supplier");
  list.innerHTML = "";
  data.forEach((sup) => {
    const li = document.createElement("li");
    li.innerHTML = `
                <span>${sup.nama} — ${sup.alamat} — ${sup.kontak}</span>
                <div class="li-actions">
                    <button class="edit-btn" onclick="openEditModal('supplier', '${
                      sup._id
                    }', ${JSON.stringify(sup)})">Edit</button>
                    <button class="delete-btn" onclick="deleteItem('supplier', '${
                      sup._id
                    }')">X</button>
                </div>
            `;
    list.appendChild(li);
  });
}

function renderProduk(data) {
  const list = document.getElementById("list-produk");
  list.innerHTML = "";
  data.forEach((p) => {
    const li = document.createElement("li");
    const kategoriNama = p.kategori ? p.kategori.nama : "Tidak ada kategori";
    li.innerHTML = `
                <span>${p.nama} (Stok: ${p.stok}) - Rp ${
      p.harga
    } - [${kategoriNama}]</span>
                <div class="li-actions">
                    <button class="edit-btn" onclick='openEditModal("produk", "${
                      p._id
                    }", ${JSON.stringify(p)})'>Edit</button>
                    <button class="delete-btn" onclick="deleteItem('produk', '${
                      p._id
                    }')">X</button>
                </div>
            `;
    list.appendChild(li);
  });
}

// --- FORM SUBMISSION ---
document.getElementById("form-kat").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nama = document.getElementById("new-kat").value;
  await fetch("/api/kategori", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({ nama }),
  });
  document.getElementById("new-kat").value = "";
  loadAllData();
});

document
  .getElementById("form-supplier")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
      nama: document.getElementById("new-supplier-nama").value,
      alamat: document.getElementById("new-supplier-alamat").value,
      kontak: document.getElementById("new-supplier-kontak").value,
    };
    await fetch("/api/supplier", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify(body),
    });
    e.target.reset();
    loadAllData();
  });

document.getElementById("form-produk").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    nama: document.getElementById("p-nama").value,
    stok: document.getElementById("p-stok").value,
    harga: document.getElementById("p-harga").value,
    kategori: document.getElementById("p-kat").value,
  };
  await fetch("/api/produk", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify(body),
  });
  e.target.reset();
  loadAllData();
});

// --- [BARU] LOGIKA UNTUK TRANSAKSI ---
let itemsPenjualan = [];
let itemsPembelian = [];

function addItemPenjualan() {
  const produkSelect = document.getElementById("tx-produk");
  const produkId = produkSelect.value;
  const produkNama = produkSelect.options[produkSelect.selectedIndex].text;
  const jumlah = parseInt(document.getElementById("tx-jumlah").value);

  if (!produkId || !jumlah || jumlah <= 0) {
    alert("Pilih produk dan masukkan jumlah yang valid.");
    return;
  }
  itemsPenjualan.push({ produk: produkId, nama: produkNama, jumlah });
  renderItemsPenjualan();
}

function renderItemsPenjualan() {
  const list = document.getElementById("list-items-penjualan");
  list.innerHTML = "";
  itemsPenjualan.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerText = `${item.nama} - Jumlah: ${item.jumlah}`;
    list.appendChild(li);
  });
}

async function submitTransaksi() {
  const pembeli = document.getElementById("pembeli").value;
  const jenisPembayaran = document.getElementById("jenispembayaran").value;
  if (!pembeli || itemsPenjualan.length === 0) {
    alert("Isi nama pembeli dan tambahkan item terlebih dahulu.");
    return;
  }
  const body = { pembeli, jenisPembayaran, items: itemsPenjualan };
  await fetch("/api/penjualan", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify(body),
  });
  itemsPenjualan = [];
  document.getElementById("pembeli").value = "";
  renderItemsPenjualan();
  loadAllData();
}

function addItemPembelian() {
  const produkSelect = document.getElementById("txp-produk");
  const produkId = produkSelect.value;
  const produkNama = produkSelect.options[produkSelect.selectedIndex].text;
  const jumlah = parseInt(document.getElementById("txp-jumlah").value);
  const hargaBeli = parseInt(document.getElementById("txp-harga").value);
  if (!produkId || !jumlah || !hargaBeli || jumlah <= 0 || hargaBeli <= 0) {
    alert("Lengkapi semua field pembelian dengan benar.");
    return;
  }
  itemsPembelian.push({
    produk: produkId,
    nama: produkNama,
    jumlah,
    hargaBeliSatuan: hargaBeli,
  });
  renderItemsPembelian();
}

function renderItemsPembelian() {
  const list = document.getElementById("list-items-pembelian");
  list.innerHTML = "";
  itemsPembelian.forEach((item) => {
    const li = document.createElement("li");
    li.innerText = `${item.nama} - Jumlah: ${item.jumlah} @ Rp ${item.hargaBeliSatuan}`;
    list.appendChild(li);
  });
}

async function submitPembelian() {
  const supplierId = document.getElementById("tx-supplier").value;
  if (!supplierId || itemsPembelian.length === 0) {
    alert("Pilih supplier dan tambahkan item terlebih dahulu.");
    return;
  }
  const body = { supplierId, items: itemsPembelian };
  await fetch("/api/pembelian", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify(body),
  });
  itemsPembelian = [];
  renderItemsPembelian();
  loadAllData();
}

function renderRiwayat(idList, data) {
  const list = document.getElementById(idList);
  list.innerHTML = "";
  data.forEach((item) => {
    const li = document.createElement("li");
    const tanggal = new Date(item.tanggal).toLocaleString("id-ID");
    li.innerText = `${tanggal} - Total: Rp ${item.totalHarga}`;
    list.appendChild(li);
  });
}

// --- INITIAL LOAD ---
async function loadAllData() {
  try {
    const [resKat, resSup, resProd, resPenjualan, resPembelian] =
      await Promise.all([
        fetch("/api/kategori", { headers: authHeader }),
        fetch("/api/supplier", { headers: authHeader }),
        fetch("/api/produk", { headers: authHeader }),
        fetch("/api/penjualan", { headers: authHeader }),
        fetch("/api/pembelian", { headers: authHeader }),
      ]);
    if (
      !resKat.ok ||
      !resSup.ok ||
      !resProd.ok ||
      !resPenjualan.ok ||
      !resPembelian.ok
    ) {
      throw new Error("Sesi berakhir atau terjadi kesalahan server.");
    }
    const kat = await resKat.json();
    const sup = await resSup.json();
    const prod = await resProd.json();
    const penjualan = await resPenjualan.json();
    const pembelian = await resPembelian.json();

    // Render CRUD
    renderKategori(kat);
    renderSupplier(sup);
    renderProduk(prod);

    // Render Transaksi & Riwayat
    renderRiwayat("list-penjualan", penjualan);
    renderRiwayat("list-pembelian", pembelian);

    // Load options for selects
    loadKategoriToSelect("p-kat");

    // Load options for transaksi
    const txProdukSelect = document.getElementById("tx-produk");
    txProdukSelect.innerHTML = "";
    prod.forEach((p) =>
      txProdukSelect.add(new Option(`${p.nama} (Stok: ${p.stok})`, p._id))
    );

    const txpProdukSelect = document.getElementById("txp-produk");
    txpProdukSelect.innerHTML = "";
    prod.forEach((p) => txpProdukSelect.add(new Option(p.nama, p._id)));

    const txSupplierSelect = document.getElementById("tx-supplier");
    txSupplierSelect.innerHTML = "";
    sup.forEach((s) => txSupplierSelect.add(new Option(s.nama, s._id)));
  } catch (err) {
    console.error("Gagal memuat data awal:", err);
    alert("Sesi Anda mungkin telah berakhir. Silakan login kembali.");
    window.location.href = "/index.html";
  }
}

window.onload = loadAllData;
