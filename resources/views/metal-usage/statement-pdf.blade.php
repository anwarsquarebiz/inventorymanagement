<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Metal Statement - {{ $metalName }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 1000px;
            margin: 0 auto;
            color: #111827;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 16px;
            margin-bottom: 22px;
        }

        .header h1 {
            margin: 0;
            font-size: 22px;
        }

        .meta {
            margin-top: 6px;
            font-size: 12px;
            color: #374151;
        }

        .month {
            margin-top: 18px;
            page-break-inside: avoid;
        }

        .month-title {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 10px;
        }

        .month-title .left {
            font-weight: bold;
            font-size: 14px;
        }

        .balances {
            font-size: 12px;
            color: #111827;
            text-align: right;
        }

        .balances div {
            margin-top: 4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
        }

        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }

        .num {
            text-align: right;
            font-variant-numeric: tabular-nums;
        }

        .muted {
            color: #6b7280;
        }

        .footer-summary {
            margin-top: 18px;
            border-top: 1px solid #000;
            padding-top: 12px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>METAL STATEMENT</h1>
        <div class="meta">
            Metal: <strong>{{ $metalName }}</strong> |
            Period: <strong>{{ \Carbon\Carbon::parse($dateFromYmd)->format('d/m/Y') }}</strong>
            to <strong>{{ \Carbon\Carbon::parse($dateToYmd)->format('d/m/Y') }}</strong>
        </div>
    </div>

    @foreach($months as $month)
        <div class="month">
            <div class="month-title">
                <div class="left">
                    Statement {{ \Carbon\Carbon::parse($month['start'])->format('F Y') }}
                    <div class="muted">
                        Range: {{ \Carbon\Carbon::parse($month['start'])->format('d/m/Y') }} - {{ \Carbon\Carbon::parse($month['end'])->format('d/m/Y') }}
                    </div>
                </div>
                <div class="balances">
                    <div>Opening Balance: {{ number_format((float) $month['opening'], 2) }} g</div>
                    <div>Closing Balance: {{ number_format((float) $month['closing'], 2) }} g</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 110px;">Date</th>
                        <th>Particulars</th>
                        <th class="num" style="width: 120px;">Credit (g)</th>
                        <th class="num" style="width: 120px;">Debit (g)</th>
                        <th class="num" style="width: 140px;">Balance (g)</th>
                    </tr>
                </thead>
                <tbody>
                    @if(count($month['entries']) === 0)
                        <tr>
                            <td colspan="5" class="muted" style="text-align: center; padding: 18px 8px;">
                                No transactions in this period.
                            </td>
                        </tr>
                    @else
                        @foreach($month['entries'] as $entry)
                            <tr>
                                <td>{{ \Carbon\Carbon::parse($entry['date'])->format('d/m/Y') }}</td>
                                <td>{{ $entry['particulars'] }}</td>
                                <td class="num">
                                    @if((float) $entry['credit'] != 0)
                                        {{ number_format((float) $entry['credit'], 2) }}
                                    @else
                                        -
                                    @endif
                                </td>
                                <td class="num">
                                    @if((float) $entry['debit'] != 0)
                                        {{ number_format((float) $entry['debit'], 2) }}
                                    @else
                                        -
                                    @endif
                                </td>
                                <td class="num">{{ number_format((float) $entry['balance'], 2) }}</td>
                            </tr>
                        @endforeach
                    @endif
                </tbody>
            </table>
        </div>
    @endforeach

    <div class="footer-summary">
        <div>
            Total Credit: <strong>{{ number_format((float) $totalCredits, 2) }} g</strong><br>
            Total Debit: <strong>{{ number_format((float) $totalDebits, 2) }} g</strong>
        </div>
        <div class="muted">
            Generated for Metal Usage Ledger
        </div>
    </div>
</body>
</html>

