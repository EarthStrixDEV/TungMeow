interface AmountTextProps {
  amount: number;
  type: "income" | "expense";
}

export default function AmountText({ amount, type }: AmountTextProps) {
  const formatted = Math.abs(amount).toLocaleString("en-US");
  return (
    <span
      className={`font-bold ${type === "income" ? "text-blue-deep" : "text-orange-deep"}`}
    >
      {type === "income" ? `+฿${formatted}` : `−฿${formatted}`}
    </span>
  );
}
