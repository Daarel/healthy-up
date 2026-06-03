import { Check, CheckCircle2, Circle } from "lucide-react";

/**
 * Satu baris tugas di daftar "Tugas Hari Ini".
 *
 * Props:
 *  - title     {string}
 *  - category  {string}
 *  - completed {boolean}
 *  - Icon      {ComponentType}  ikon lucide-react untuk tugas ini
 */
export default function TaskItem({ title, category, completed, Icon, onToggle }) {
  return (
    <div
      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#f8f9ff] transition-colors cursor-pointer"
      onClick={onToggle}
    >
      <button
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          completed ? "bg-[#006e2f] text-white" : "text-[#6d7b6c]"
        }`}
      >
        {completed ? (
          <Check className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1">
        <p
          className={`font-medium font-jakarta ${
            completed ? "text-[#6d7b6c] line-through" : "text-[#191c20]"
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-[#6d7b6c] font-jakarta">{category}</p>
      </div>

      {completed ? (
        <CheckCircle2 className="w-5 h-5 text-[#006e2f]" />
      ) : (
        <Circle className="w-5 h-5 text-[#c1c9bf]" />
      )}
    </div>
  );
}
