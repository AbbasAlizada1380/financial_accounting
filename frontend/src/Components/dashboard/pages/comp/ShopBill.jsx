import React, { useRef } from "react";

const Bill = ({ sale, customer }) => {
  const printRef = useRef();
console.log("sale",sale,"customer",customer);

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=600,height=800");
    printWindow.document.write(`
      <html>
        <head>
          <title>فاکتور فروش استخر</title>
          <style>
            @page { size: A6; margin: 8mm; }
            body {
              font-family: Vazirmatn, sans-serif;
              direction: rtl;
              text-align: right;
              padding: 10px;
              background: #f9f9f9;
            }
            .header {
              text-align: center;
              margin-bottom: 12px;
              border-bottom: 2px dashed #000;
              padding-bottom: 6px;
            }
            .header h2 {
              margin: 0;
              font-size: 16px;
            }
            .header small {
              display: block;
              font-size: 11px;
              color: #555;
            }
            .info {
              font-size: 12px;
              margin-bottom: 10px;
            }
            .info p {
              margin: 2px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #000;
              padding: 4px;
              text-align: center;
            }
            th {
              background: #e0f7fa;
              font-size: 13px;
            }
            .total-box {
              margin-top: 10px;
              border-top: 2px dashed #000;
              padding-top: 6px;
              font-size: 13px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 11px;
              margin-top: 12px;
              border-top: 1px dashed #000;
              padding-top: 6px;
              color: #444;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Format date
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${hours}:${minutes}:${seconds} - ${year}/${month}/${day}`;
  };

  return (
    <div>
      {/* Button only visible in UI */}
      <button
        onClick={handlePrint}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
      >
        چاپ فاکتور
      </button>

      {/* Printable Content */}
      <div ref={printRef} style={{ display: "none" }}>
        <div className="header">
          <h2>فاکتور فروش حوض ابی بند امیر</h2>
          <small>تجهیزات و خدمات حوض</small>
        </div>

        <div className="info">
          <p>
            <strong>مشتری:</strong> {customer?.name}
          </p>
          <p>
            <strong>نمبر صندق:</strong> {customer?.cabinet_number}
          </p>
          <p>
            <strong>تعداد نفرات:</strong> {customer?.num_people}
          </p>
          <p>
            <strong>تاریخ:</strong> {formatDateTime(customer?.created_at)}
          </p>
        </div>

        <table>
          <thead>
            <tr>
              <th>نام کالا</th>
              <th>قیمت</th>
            </tr>
          </thead>
          <tbody>
            {sale?.list &&
              Object.entries(sale.list).map(([name, price], i) => (
                <tr key={i}>
                  <td>{name}</td>
                  <td>{price}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <div className="total-box">
          <p>جمع خرید: {sale?.total}</p>
          <p>محاسبه شده؟ : {sale?.is_calculated ? "✅" : "❌"}</p>
        </div>

        <div className="footer">
          <p>با تشکر از خرید شما 💦</p>
          <p>مدیریت حوض</p>
        </div>
      </div>
    </div>
  );
};

export default Bill;
