import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose && onClose(), 2000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  const bg = type === "error" ? "bg-red-500" : type === "warning" ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className={`fixed top-6 right-6 z-50 ${bg} text-white px-4 py-2 rounded shadow-lg`}>
      {message}
    </div>
  );
}
