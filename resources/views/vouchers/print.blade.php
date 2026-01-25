<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Voucher {{ $voucher->voucher_no }} - Print</title>
    <style>
        @media print {
            .no-print {
                display: none;
            }
        }
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .info-section {
            margin-bottom: 30px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .info-label {
            font-weight: bold;
            width: 200px;
        }
        .info-value {
            flex: 1;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #000;
        }
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }
        .signature-box {
            width: 200px;
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: center;
        }
    </style>
    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</head>
<body>
    <div class="header">
        <h1>VOUCHER</h1>
        <p>Voucher No: {{ $voucher->voucher_no }} | Stock No: {{ $voucher->stock_no }}</p>
    </div>

    <div class="info-section">
        <div class="info-row">
            <span class="info-label">Date Given:</span>
            <span class="info-value">{{ date('d/m/Y', strtotime($voucher->date_given)) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Date Delivery:</span>
            <span class="info-value">{{ date('d/m/Y', strtotime($voucher->date_delivery)) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value">{{ strtoupper(str_replace('_', ' ', $voucher->status)) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Person in Charge:</span>
            <span class="info-value">{{ $voucher->personInCharge->name }}</span>
        </div>
        @if($voucher->notes)
        <div class="info-row">
            <span class="info-label">Notes:</span>
            <span class="info-value">{{ $voucher->notes }}</span>
        </div>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Shape</th>
                <th>Pieces</th>
                <th>Weight (ct)</th>
                <th>Code</th>
                <th>Remarks</th>
            </tr>
        </thead>
        <tbody>
            @foreach($voucher->items as $item)
            <tr>
                <td>{{ $item->product->name ?? 'N/A' }}</td>
                <td>{{ $item->shape }}</td>
                <td>{{ $item->pcs }}</td>
                <td>{{ number_format($item->weight, 2) }}</td>
                <td>{{ $item->code ?? '-' }}</td>
                <td>{{ $item->remarks ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="2">Total</td>
                <td>{{ $voucher->items->sum('pcs') }}</td>
                <td>{{ number_format($voucher->items->sum('weight'), 2) }}</td>
                <td colspan="2"></td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        <div class="info-row">
            <span class="info-label">Created By:</span>
            <span class="info-value">{{ $voucher->creator->name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Created At:</span>
            <span class="info-value">{{ date('d/m/Y H:i', strtotime($voucher->created_at)) }}</span>
        </div>
        @if($voucher->approver)
        <div class="info-row">
            <span class="info-label">Approved By:</span>
            <span class="info-value">{{ $voucher->approver->name }}</span>
        </div>
        @endif
        @if($voucher->approved_at)
        <div class="info-row">
            <span class="info-label">Approved At:</span>
            <span class="info-value">{{ date('d/m/Y H:i', strtotime($voucher->approved_at)) }}</span>
        </div>
        @endif
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <p>Prepared By</p>
        </div>
        <div class="signature-box">
            <p>Approved By</p>
        </div>
        <div class="signature-box">
            <p>Received By</p>
        </div>
    </div>
</body>
</html>

