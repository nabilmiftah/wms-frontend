// composables/usePrintLabel.ts
// Generate label print sesuai layout desain:
// - Kertas A4 portrait
// - Margin: 2cm kiri/kanan, 2.7cm atas, 3cm bawah
// - 2 kolom, gap antar label 1cm
// - Setiap label: Asset Number, Asset Name, QR Code (label code), Price, Brand, Supplier

export interface LabelData {
  labelCode: string;      // e.g. AST_01_000001 — jadi konten QR
  assetNumber: string;    // e.g. AST_01
  assetName: string;      // e.g. Nike Journey Run Road Running Shoes - Black
  price: string;          // e.g. Rp. 100.000
  brand?: string;         // e.g. WMS Solution
  supplierName?: string;  // e.g. PT. STECHOQ ROBOTIKA INDONESIA
}

export function usePrintLabel() {
  const generateQRSvg = (text: string, size: number = 80): string => {
    // Simple QR placeholder — di production ganti dengan library qrcode.js
    // Pakai inline SVG pattern sebagai placeholder visual
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="white" stroke="#000" stroke-width="1"/>
        <!-- QR pattern placeholder -->
        <rect x="4" y="4" width="22" height="22" fill="none" stroke="#000" stroke-width="2"/>
        <rect x="7" y="7" width="16" height="16" fill="#000"/>
        <rect x="10" y="10" width="10" height="10" fill="white"/>
        <rect x="12" y="12" width="6" height="6" fill="#000"/>

        <rect x="${size-26}" y="4" width="22" height="22" fill="none" stroke="#000" stroke-width="2"/>
        <rect x="${size-23}" y="7" width="16" height="16" fill="#000"/>
        <rect x="${size-20}" y="10" width="10" height="10" fill="white"/>
        <rect x="${size-18}" y="12" width="6" height="6" fill="#000"/>

        <rect x="4" y="${size-26}" width="22" height="22" fill="none" stroke="#000" stroke-width="2"/>
        <rect x="7" y="${size-23}" width="16" height="16" fill="#000"/>
        <rect x="10" y="${size-20}" width="10" height="10" fill="white"/>
        <rect x="12" y="${size-18}" width="6" height="6" fill="#000"/>

        <!-- Data modules -->
        <rect x="30" y="4" width="4" height="4" fill="#000"/>
        <rect x="36" y="4" width="4" height="4" fill="#000"/>
        <rect x="42" y="4" width="4" height="4" fill="#000"/>
        <rect x="30" y="10" width="4" height="4" fill="#000"/>
        <rect x="38" y="10" width="4" height="4" fill="#000"/>
        <rect x="44" y="10" width="4" height="4" fill="#000"/>
        <rect x="32" y="16" width="4" height="4" fill="#000"/>
        <rect x="40" y="16" width="4" height="4" fill="#000"/>
        <rect x="4" y="30" width="4" height="4" fill="#000"/>
        <rect x="10" y="30" width="4" height="4" fill="#000"/>
        <rect x="18" y="30" width="4" height="4" fill="#000"/>
        <rect x="4" y="36" width="4" height="4" fill="#000"/>
        <rect x="14" y="36" width="4" height="4" fill="#000"/>
        <rect x="20" y="36" width="4" height="4" fill="#000"/>
        <rect x="6" y="42" width="4" height="4" fill="#000"/>
        <rect x="16" y="42" width="4" height="4" fill="#000"/>
        <rect x="30" y="28" width="4" height="4" fill="#000"/>
        <rect x="38" y="28" width="4" height="4" fill="#000"/>
        <rect x="44" y="28" width="4" height="4" fill="#000"/>
        <rect x="32" y="34" width="4" height="4" fill="#000"/>
        <rect x="40" y="34" width="4" height="4" fill="#000"/>
        <rect x="36" y="40" width="4" height="4" fill="#000"/>
        <rect x="42" y="40" width="4" height="4" fill="#000"/>

        <!-- Label code text -->
        <text x="${size/2}" y="${size - 3}" text-anchor="middle" font-size="5" font-family="monospace" fill="#000">${text}</text>
      </svg>
    `;
  };

  const generateLabelHTML = (labels: LabelData[]): string => {
    const labelCards = labels.map((label) => `
      <div class="label-card">
        <div class="label-top">
          <div class="label-info">
            <div class="asset-number">${label.assetNumber}</div>
            <div class="asset-name">${label.assetName}</div>
            <div class="price">${label.price}</div>
          </div>
          <div class="qr-section">
            <div class="label-number-text">${label.labelCode}</div>
            <div class="qr-box">
              ${generateQRSvg(label.labelCode, 76)}
            </div>
          </div>
        </div>
        <div class="label-bottom">
          <span class="brand">${label.brand || 'WMS Solution'}</span>
          <span class="supplier">${label.supplierName || '-'}</span>
        </div>
      </div>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Print Label</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: Arial, sans-serif;
      background: white;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 2.7cm 2cm 3cm 2cm;
      background: white;
    }

    .label-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1cm;
    }

    .label-card {
      border: 1.5px solid #000;
      border-radius: 4px;
      padding: 10px 12px 8px 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 95px;
      page-break-inside: avoid;
    }

    .label-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }

    .label-info {
      flex: 1;
      min-width: 0;
    }

    .asset-number {
      font-size: 8pt;
      color: #333;
      margin-bottom: 2px;
    }

    .asset-name {
      font-size: 11pt;
      font-weight: bold;
      color: #000;
      line-height: 1.3;
      margin-bottom: 6px;
      word-break: break-word;
    }

    .price {
      font-size: 8pt;
      color: #333;
    }

    .qr-section {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      flex-shrink: 0;
    }

    .label-number-text {
      font-size: 6pt;
      color: #333;
      margin-bottom: 2px;
      font-family: monospace;
      text-align: right;
    }

    .qr-box {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
    }

    .qr-box svg {
      width: 100%;
      height: 100%;
    }

    .label-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
      padding-top: 5px;
      border-top: 0.5px solid #ccc;
    }

    .brand {
      font-size: 7pt;
      color: #444;
    }

    .supplier {
      font-size: 7pt;
      color: #444;
      text-align: right;
    }

    @media print {
      body { margin: 0; }
      .page {
        width: 210mm;
        padding: 2.7cm 2cm 3cm 2cm;
      }
      .label-card {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="label-grid">
      ${labelCards}
    </div>
  </div>
  <script>
    window.onload = () => {
      window.print();
      window.onafterprint = () => window.close();
    };
  <\/script>
</body>
</html>
    `;
  };

  const printLabels = (labels: LabelData[]) => {
    if (!labels.length) return;

    const html = generateLabelHTML(labels);
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Pop-up diblokir browser. Izinkan pop-up untuk fitur Print Label.');
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return { printLabels };
}