import { formatUSD } from '../../utils/currency';

interface Props {
  value: number;
  onChange: (value: number) => void;
  exchangeRate?: number;
  label?: string;
  className?: string;
}

export default function CurrencyInput({ value, onChange, exchangeRate = 17.5, label, className = '' }: Props) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      {exchangeRate > 0 && value > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          ≈ {formatUSD(value / exchangeRate)}
        </p>
      )}
    </div>
  );
}
