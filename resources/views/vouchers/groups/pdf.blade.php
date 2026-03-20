<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Stock {{ $stockNo }} - Vouchers</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 1000px;
            margin: 0 auto;
        }

        .header {
            width: 100%;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-table tr {
            height: 100px;
        }

        .header-table td {
            border: none;
            padding: 0;
            vertical-align: middle;
        }

        .header-thumbnail {
            width: 120px;
            text-align: center;
            vertical-align: middle;
        }

        .header-text {
            text-align: center;
            width: 100%;
            vertical-align: middle;
        }

        .header h1 {
            margin: 0;
            font-size: 22px;
        }

        .header-thumbnail img {
            max-width: 120px;
            max-height: 100px;
            width: auto;
            height: auto;
            display: block;
            margin: 0 auto;
        }

        .info-section {
            margin-bottom: 25px;
        }

        .info-row {
            display: flex;
            font-size: 12px;
            justify-content: space-between;
            margin-bottom: 4px;
            padding: 6px 0;
            border-bottom: 1px solid #eee;            
        }

        .info-label {
            font-weight: bold;
            width: 220px;
        }

        .info-value {
            flex: 1;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            font-size: 12px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 6px 8px;
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

        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0 10px;
        }
    </style>
</head>

<body>
    <div class="header">
        <table class="header-table">
            <tr>
                <td class="header-thumbnail">
                    @if($stock && $stock->thumbnail)
                        <img src="{{ asset('storage/' . $stock->thumbnail) }}" alt="Stock Thumbnail">
                    @else
                        No Image
                    @endif
                </td>
                <td class="header-text">
                    <h1>STOCK OVERVIEW</h1>
                    <p>Stock No: {{ $stockNo }}</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="info-section">

        @if($stock)
        @php
        $metalEntries = [];
        if (!empty($stock->metal)) {
        $decoded = json_decode($stock->metal, true);
        if (is_array($decoded)) {
        foreach ($decoded as $metalType => $value) {
        $grams = null;
        $rate = null;
        if (is_string($value) || is_numeric($value)) {
        $g = (float) $value;
        $grams = is_nan($g) ? null : $g;
        } elseif (is_array($value)) {
        if (isset($value['grams'])) {
        $g = (float) $value['grams'];
        $grams = is_nan($g) ? null : $g;
        }
        if (isset($value['current_rate'])) {
        $r = (float) $value['current_rate'];
        $rate = is_nan($r) ? null : $r;
        }
        }
        $metalEntries[] = [
        'type' => $metalType,
        'grams' => $grams,
        'rate' => $rate,
        ];
        }
        }
        }
        $totalMetalWeight = array_reduce($metalEntries, function ($sum, $entry) {
        return $sum + ($entry['grams'] ?? 0);
        }, 0);
        @endphp

        @if(!empty($metalEntries))
        <div class="info-row">
            <span class="info-label">Metal Usage:</span>
            <span class="info-value">
                @foreach($metalEntries as $entry)
                {{ $entry['type'] }}
                @if(!is_null($entry['grams']))
                {{ number_format($entry['grams'], 3) }}g
                @endif
                @if(!$loop->last), @endif
                @endforeach
            </span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Metal Weight:</span>
            <span class="info-value">{{ number_format($totalMetalWeight, 3) }} g</span>
        </div>
        @endif

        @if(!empty($stock->products_used))
        <div class="info-row">
            <span class="info-label">Stones used:</span>
            <span class="info-value">
                @foreach(explode(',', $stock->products_used) as $idx => $product)
                {{ ucfirst(trim($product)) }}@if($idx < count(explode(',', $stock->products_used)) - 1), @endif
                    @endforeach
            </span>
        </div>
        @endif

        @php
            $voucherNotes = $vouchers->pluck('notes')->filter(function ($n) {
                return $n !== null && trim((string) $n) !== '';
            })->unique()->values();
        @endphp
        @if($voucherNotes->isNotEmpty())
        <div class="info-row">
            <span class="info-label">Product notes:</span>
            <span class="info-value">
                {{ $voucherNotes->map(function ($n) { return trim($n); })->join('; ') }}
            </span>
        </div>
        @endif

        @if(!empty($stock->product_categorization))
        <div class="info-row">
            <span class="info-label">Product Info:</span>
            <span class="info-value">{{ ucfirst($stock->product_categorization) }}</span>
        </div>
        @endif
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Start Date</th>
                <th>Completed Date</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    @php
                        $firstVoucherDate = $vouchers->min('date_given');
                    @endphp
                    @if($firstVoucherDate)
                        {{ \Carbon\Carbon::parse($firstVoucherDate)->format('d-m-Y') }}
                    @else
                        -
                    @endif
                </td>
                <td>
                    @php
                        $lastCompletedVoucher = $vouchers->filter(function($voucher) {
                            return $voucher->status === \App\Models\Voucher::STATUS_COMPLETED;
                        })->sortByDesc('updated_at')->first();
                    @endphp
                    @if($lastCompletedVoucher && $lastCompletedVoucher->updated_at)
                        {{ \Carbon\Carbon::parse($lastCompletedVoucher->updated_at)->format('d-m-Y') }}
                    @else
                        -
                    @endif
                </td>
            </tr>
        </tbody>
    </table>

    <div>
        <div class="section-title">Packets</div>
        <table>
            <thead>
                <tr>
                    <th>Voucher No</th>
                    <th>Date Created</th>
                    <th>Product</th>
                    <th>Shape</th>
                    <th>Pcs Used</th>
                    <th>Weight Used</th>
                    <th>Code</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($items as $item)
                <tr>
                    <td>{{ $item->voucher_no }}</td>
                    <td>{{ $item->date_given }}</td>
                    <td>{{ $item->product_name ?? '-' }}</td>
                    <td>{{ $item->shape }}</td>
                    <td>{{ $item->pcs_used ?? 0 }}</td>
                    <td>{{ is_null($item->weight_used) ? '-' : number_format((float) $item->weight_used, 2) }}</td>
                    <td>{{ $item->code ?? '-' }}</td>
                    <td></td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div>
        <div class="section-title">Metal Used</div>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Weight</th>
                    <th>Rate</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($metalEntries as $entry)
                <tr>
                    <td>{{ $entry['type'] }}</td>
                    <td>{{ is_null($entry['grams']) ? '-' : number_format($entry['grams'], 3) }}</td>
                    <td></td>
                    <td></td>
                </tr>
                @endforeach
                <tr>
                    <td>Labour Charges</td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Add this line Gross Weight: ____ -->
    <div>
        <p>Gross Weight: ____________________ </p>
    </div>

</body>

</html>