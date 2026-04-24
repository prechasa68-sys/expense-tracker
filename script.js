// ==============================================
// script.js — Expense Tracker
// ==============================================
// โครงสร้างโค้ด:
//   STEP 1: เลือก HTML Elements ที่จะใช้งาน
//   STEP 2: โหลดข้อมูลจาก localStorage
//   STEP 3: ฟังก์ชัน formatCurrency() — แปลงตัวเลขเป็นสกุลเงิน
//   STEP 4: ฟังก์ชัน formatDate() — แปลงวันที่เป็นข้อความ
//   STEP 5: ฟังก์ชัน saveToStorage() — บันทึกลง localStorage
//   STEP 6: ฟังก์ชัน updateSummary() — คำนวณและแสดงยอดสรุป
//   STEP 7: ฟังก์ชัน createTransactionItem() — สร้าง HTML ของแต่ละรายการ
//   STEP 8: ฟังก์ชัน renderList() — วาดรายการทั้งหมดบนหน้าจอ
//   STEP 9: ฟังก์ชัน addTransaction() — เพิ่มรายการใหม่
//   STEP 10: ฟังก์ชัน deleteTransaction() — ลบรายการ
//   STEP 11: Event Listeners — รับ event จาก user
//   STEP 12: เริ่มต้นแอป
// ==============================================


// -----------------------------------------------
// STEP 1: เลือก HTML Elements ที่จะใช้งาน
// document.getElementById() คือการหา element ด้วย id
// เก็บไว้ในตัวแปรเพื่อใช้ซ้ำได้สะดวก
// -----------------------------------------------

// Form และ Input fields
const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');

// Summary display (ช่องแสดงยอดเงิน)
const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');

// List และ Empty State
const transactionList = document.getElementById('transaction-list');
const emptyState = document.getElementById('empty-state');

// ปุ่มล้างทั้งหมด
const clearAllBtn = document.getElementById('clear-all-btn');


// -----------------------------------------------
// STEP 2: โหลดข้อมูลจาก localStorage
//
// localStorage คือพื้นที่เก็บข้อมูลในเบราว์เซอร์
// ข้อมูลจะยังอยู่แม้ refresh หน้าเว็บ
//
// ปัญหา: localStorage เก็บได้แค่ "string" เท่านั้น
// วิธีแก้: ใช้ JSON.stringify() แปลง array → string ก่อนบันทึก
//          ใช้ JSON.parse() แปลง string → array เมื่อโหลด
// -----------------------------------------------
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
//                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                  ถ้าไม่มีข้อมูลใน localStorage จะได้ null
//                  || [] หมายความว่า ถ้า null ให้ใช้ array ว่างแทน


// -----------------------------------------------
// STEP 3: ฟังก์ชัน formatCurrency()
// แปลงตัวเลข เช่น 1500 → "฿1,500.00"
// -----------------------------------------------
function formatCurrency(amount) {
  // Intl.NumberFormat คือ built-in JavaScript สำหรับจัดรูปแบบตัวเลข
  return '฿' + new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,   // ทศนิยมอย่างน้อย 2 ตำแหน่ง
    maximumFractionDigits: 2,   // ทศนิยมมากสุด 2 ตำแหน่ง
  }).format(amount);
}


// -----------------------------------------------
// STEP 4: ฟังก์ชัน formatDate()
// แปลง timestamp เช่น 1700000000000 → "15 พ.ย. 2023 14:30"
// -----------------------------------------------
function formatDate(timestamp) {
  const date = new Date(timestamp);  // แปลง timestamp เป็น Date object
  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}


// -----------------------------------------------
// STEP 5: ฟังก์ชัน saveToStorage()
// บันทึก array transactions ลง localStorage
// เรียกทุกครั้งที่มีการเปลี่ยนแปลงข้อมูล
// -----------------------------------------------
function saveToStorage() {
  // JSON.stringify แปลง array → string เพื่อเก็บใน localStorage
  localStorage.setItem('transactions', JSON.stringify(transactions));
}


// -----------------------------------------------
// STEP 6: ฟังก์ชัน updateSummary()
// คำนวณยอดรายรับ รายจ่าย และยอดคงเหลือ
// แล้วอัปเดตตัวเลขบนหน้าเว็บ
// -----------------------------------------------
function updateSummary() {

  // reduce() คือ loop ที่สะสมค่าไปเรื่อยๆ
  // เริ่มต้นที่ 0 แล้วบวกทีละรายการ
  const totalIncome = transactions
    .filter(t => t.type === 'income')        // กรองเฉพาะรายรับ
    .reduce((sum, t) => sum + t.amount, 0);  // บวกรวมทั้งหมด

  const totalExpense = transactions
    .filter(t => t.type === 'expense')       // กรองเฉพาะรายจ่าย
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;  // ยอดคงเหลือ = รายรับ - รายจ่าย

  // อัปเดตข้อความใน HTML
  totalIncomeEl.textContent = formatCurrency(totalIncome);
  totalExpenseEl.textContent = formatCurrency(totalExpense);
  balanceEl.textContent = formatCurrency(balance);

  // ถ้ายอดคงเหลือติดลบ เปลี่ยนสีเป็นแดง (ไม่งั้น reset สี)
  balanceEl.style.color = balance < 0 ? '#ff6b6b' : '';
}


// -----------------------------------------------
// STEP 7: ฟังก์ชัน createTransactionItem()
// รับข้อมูล transaction 1 รายการ
// แล้วสร้าง HTML element <li> สำหรับแสดงในลิสต์
// -----------------------------------------------
function createTransactionItem(transaction) {

  // สร้าง element <li> ใหม่
  const li = document.createElement('li');

  // ใส่ class สำหรับ styling (income หรือ expense)
  li.className = `transaction-item ${transaction.type}`;

  // ใส่ data attribute เก็บ id ไว้ใช้ตอนลบ
  li.dataset.id = transaction.id;

  // กำหนดสัญลักษณ์และเครื่องหมาย
  const sign = transaction.type === 'income' ? '+' : '-';
  const icon = transaction.type === 'income' ? '💚' : '🔴';

  // ใส่ HTML ข้างใน <li> ด้วย template literals (backtick ``)
  // template literals ช่วยให้ใส่ตัวแปรใน string ได้สะดวก: ${ตัวแปร}
  li.innerHTML = `
    <div class="transaction-info">
      <span class="transaction-description">${icon} ${transaction.description}</span>
      <span class="transaction-date">${formatDate(transaction.date)}</span>
    </div>
    <div class="transaction-right">
      <span class="transaction-amount">
        ${sign}${formatCurrency(transaction.amount)}
      </span>
      <button class="delete-btn" onclick="deleteTransaction('${transaction.id}')" title="ลบรายการ">
        ✕
      </button>
    </div>
  `;

  return li;  // ส่งคืน element ที่สร้าง
}


// -----------------------------------------------
// STEP 8: ฟังก์ชัน renderList()
// วาดรายการทั้งหมดบนหน้าเว็บใหม่ทั้งหมด
// เรียกทุกครั้งที่ข้อมูลเปลี่ยน
// -----------------------------------------------
function renderList() {

  // ล้าง list ก่อน (ไม่งั้นจะซ้ำกัน)
  transactionList.innerHTML = '';

  if (transactions.length === 0) {
    // ถ้าไม่มีรายการ: แสดง empty state, ซ่อน list และปุ่มล้างทั้งหมด
    emptyState.style.display = 'block';
    clearAllBtn.style.display = 'none';
  } else {
    // ถ้ามีรายการ: ซ่อน empty state, แสดงปุ่มล้างทั้งหมด
    emptyState.style.display = 'none';
    clearAllBtn.style.display = 'block';

    // วนลูปสร้าง <li> แล้วเพิ่มเข้าไปใน <ul>
    // เรียงจากใหม่ → เก่า ด้วย .slice().reverse()
    // ใช้ .slice() เพื่อ copy array ก่อน (ไม่แก้ต้นฉบับ)
    transactions.slice().reverse().forEach(transaction => {
      const item = createTransactionItem(transaction);
      transactionList.appendChild(item);  // เพิ่ม element เข้า DOM
    });
  }

  // อัปเดตยอดสรุปทุกครั้ง
  updateSummary();
}


// -----------------------------------------------
// STEP 9: ฟังก์ชัน addTransaction()
// รับค่าจาก form แล้วเพิ่มรายการใหม่ลงใน array
// -----------------------------------------------
function addTransaction(event) {

  // preventDefault() หยุดไม่ให้ form reload หน้าเว็บ (พฤติกรรม default)
  event.preventDefault();

  // อ่านค่าจาก input และ trim() ลบ space ด้านหน้าด้านหลัง
  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);  // แปลง string → number
  const type = typeSelect.value;

  // Validation: ตรวจสอบว่าข้อมูลถูกต้องก่อน
  if (!description) {
    alert('กรุณากรอกชื่อรายการ');
    descriptionInput.focus();  // เลื่อน cursor ไปที่ input
    return;  // หยุดทำงาน ไม่ต้องทำต่อ
  }

  if (isNaN(amount) || amount <= 0) {
    alert('กรุณากรอกจำนวนเงินที่ถูกต้อง (มากกว่า 0)');
    amountInput.focus();
    return;
  }

  // สร้าง transaction object ใหม่
  const newTransaction = {
    id: Date.now().toString(),  // ใช้ timestamp เป็น id (unique ทุกครั้ง)
    description: description,
    amount: amount,
    type: type,
    date: Date.now(),           // เก็บเวลาปัจจุบัน (milliseconds)
  };

  // เพิ่มเข้าไปใน array
  transactions.push(newTransaction);

  // บันทึกลง localStorage
  saveToStorage();

  // วาดหน้าเว็บใหม่
  renderList();

  // Clear form หลังเพิ่มสำเร็จ
  descriptionInput.value = '';
  amountInput.value = '';
  typeSelect.value = 'income';  // reset กลับเป็น รายรับ
  descriptionInput.focus();     // เลื่อน cursor มาที่ description เพื่อกรอกต่อ
}


// -----------------------------------------------
// STEP 10: ฟังก์ชัน deleteTransaction()
// ลบรายการโดยใช้ id
// ฟังก์ชันนี้ถูกเรียกจากปุ่ม ✕ ใน HTML (onclick)
// -----------------------------------------------
function deleteTransaction(id) {

  // ถามยืนยันก่อนลบ
  const confirmed = confirm('ต้องการลบรายการนี้ใช่ไหม?');
  if (!confirmed) return;  // ถ้ากด Cancel ให้หยุด

  // filter() สร้าง array ใหม่ที่ไม่มีรายการที่ตรงกับ id
  // คือลบ element ที่ id ตรงกัน ออกไปจาก array
  transactions = transactions.filter(t => t.id !== id);

  // บันทึกและวาดใหม่
  saveToStorage();
  renderList();
}


// -----------------------------------------------
// STEP 11: EVENT LISTENERS
// ฟัง event ต่างๆ จาก user
// -----------------------------------------------

// เมื่อ submit form (กดปุ่มเพิ่มรายการ)
form.addEventListener('submit', addTransaction);

// เมื่อกดปุ่มล้างทั้งหมด
clearAllBtn.addEventListener('click', function () {
  const confirmed = confirm('ต้องการลบรายการทั้งหมดใช่ไหม? การกระทำนี้ไม่สามารถย้อนกลับได้');
  if (!confirmed) return;

  transactions = [];   // ล้าง array
  saveToStorage();     // บันทึก array ว่าง
  renderList();        // วาดหน้าใหม่
});


// -----------------------------------------------
// STEP 12: เริ่มต้นแอป
// เรียก renderList() ครั้งแรกเมื่อหน้าเว็บโหลดเสร็จ
// จะดึงข้อมูลจาก localStorage แล้วแสดงผล
// -----------------------------------------------
renderList();


// ==============================================
// 📚 สรุปแนวคิดที่ได้เรียนจากโปรเจกต์นี้:
//
// DOM Manipulation:
//   - document.getElementById() — หา element
//   - element.innerHTML — เปลี่ยน HTML ข้างใน
//   - element.textContent — เปลี่ยนข้อความ
//   - document.createElement() — สร้าง element ใหม่
//   - parent.appendChild(child) — เพิ่ม element เข้า DOM
//
// Event Handling:
//   - addEventListener('submit', fn) — ฟัง event submit
//   - addEventListener('click', fn) — ฟัง event click
//   - event.preventDefault() — หยุด default behavior
//
// JavaScript Logic:
//   - Array.filter() — กรองข้อมูล
//   - Array.reduce() — สะสมค่า (เช่น รวมยอดเงิน)
//   - Array.forEach() — วนลูป
//   - JSON.stringify() / JSON.parse() — แปลง object ↔ string
//   - localStorage — เก็บข้อมูลในเบราว์เซอร์
// ==============================================
