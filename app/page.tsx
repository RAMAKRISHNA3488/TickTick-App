import { DatePicker } from "@/components/ui/date-picker";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-6 pb-20 gap-16 sm:p-10 font-[family-name:var(--font-geist-sans)]">
      <h1>TickTick app</h1>
      <DatePicker />
    </div>
  );
}
