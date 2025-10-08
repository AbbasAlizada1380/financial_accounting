import React, { useRef } from "react";

const PoolBill = ({ customer }) => {
  const printRef = useRef();

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
          <h2> حوض ابی بند امیر</h2>
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

        <div className="total-box">
          {/* Base total */}
          <p>هزینه حوض : {customer?.total_pay}</p>
          <p>محاسبه شده؟ : {customer?.is_calculated ? "✅" : "❌"}</p>

          {/* Rent Section */}
          {customer?.rent &&
            Object.keys(customer.rent).length > 0 &&
            (() => {
              // Calculate rent sum
              const rentTotal = Object.values(customer.rent).reduce(
                (sum, val) => {
                  const num = parseFloat(val);
                  return sum + (isNaN(num) ? 0 : num);
                },
                0
              );

              const grandTotal =
                (parseFloat(customer?.total_pay) || 0) + rentTotal;

              return (
                <div className="mt-2">
                  <h4 className="font-bold">تجهیزات</h4>
                  <ul className="list-disc pr-5">
                    {Object.entries(customer.rent).map(([key, value], idx) => (
                      <li key={idx}>
                        {key} : {value}
                      </li>
                    ))}
                  </ul>

                  <p className="font-bold mt-2">جمع کرایه: {rentTotal}</p>
                  <p className="font-bold text-blue-600">
                    مجموع کل پرداختی: {grandTotal}
                  </p>
                </div>
              );
            })()}
        </div>

        <p className="font-bold">ابزار:</p>
        <ul className="list-disc pr-5">
          {customer?.tools?.map((tool, i) => (
            <li key={i}>{tool}</li>
          ))}
        </ul>

        <div className="footer">
          <p>با تشکر از حضور شما 💦</p>
          <p>مدیریت حوض</p>
        </div>
      </div>
    </div>
  );
};

export default PoolBill;
