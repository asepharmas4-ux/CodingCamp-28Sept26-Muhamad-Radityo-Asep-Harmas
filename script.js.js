let transactions = JSON.parse(localStorage.getItem('budget_data')) || [];
let myChart = null;

// Mengatur tanggal default ke hari ini pada form input
document.getElementById('date').valueAsDate = new Date();

function formatRp(val) {
  return 'Rp ' + Number(val).toLocaleString('id-ID');
}

function render() {
  // Menyimpan data ke LocalStorage
  localStorage.setItem('budget_data', JSON.stringify(transactions));

  const searchKeyword = document.getElementById('searchInput').value.toLowerCase();
  const filterType = document.getElementById('filterType').value;

  let income = 0;
  let expense = 0;
  const catTotals = {};

  transactions.forEach(t => {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expense += t.amount;
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    }
  });

  document.getElementById('totalBalance').innerText = formatRp(income - expense);
  document.getElementById('totalIncome').innerText = formatRp(income);
  document.getElementById('totalExpense').innerText = formatRp(expense);

  const listEl = document.getElementById('txList');
  listEl.innerHTML = '';

  const filtered = transactions.filter(t => {
    const matchesSearch = t.desc.toLowerCase().includes(searchKeyword);
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = '<li style="justify-content: center; color: var(--text-muted);">Tidak ada data transaksi.</li>';
  } else {
    filtered.forEach(t => {
      const origIdx = transactions.indexOf(t);
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="tx-info">
          <span class="tx-title">${t.desc}</span>
          <span class="tx-meta">${t.category} • ${t.date}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="tx-amount ${t.type}">
            ${t.type === 'income' ? '+' : '-'}${formatRp(t.amount)}
          </span>
          <button class="btn-del" onclick="deleteTx(${origIdx})">✕</button>
        </div>
      `;
      listEl.appendChild(li);
    });
  }

  renderChart(catTotals);
}

function renderChart(catTotals) {
  const ctx = document.getElementById('categoryChart').getContext('2d');
  const labels = Object.keys(catTotals);
  const data = Object.values(catTotals);

  if (myChart) myChart.destroy();

  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels.length ? labels : ['Belum Ada Pengeluaran'],
      datasets: [{
        data: data.length ? data : [1],
        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

document.getElementById('txForm').addEventListener('submit', (e) => {
  e.preventDefault();
  transactions.unshift({
    desc: document.getElementById('desc').value,
    amount: parseFloat(document.getElementById('amount').value),
    type: document.getElementById('type').value,
    category: document.getElementById('category').value,
    date: document.getElementById('date').value
  });
  document.getElementById('desc').value = '';
  document.getElementById('amount').value = '';
  render();
});

function deleteTx(idx) {
  transactions.splice(idx, 1);
  render();
}

function clearData() {
  if (confirm('Hapus seluruh daftar transaksi?')) {
    transactions = [];
    render();
  }
}

// Menjalankan fungsi render saat pertama kali halaman dibuka
render();