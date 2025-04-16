import Link from "next/link";

export default function Sidebar() {
  const navItems = [
    
    { href: "/", label: "", icon: "" },
    { href: "/scenario-plan", label: "Scenario Plan", icon: "📊", active: true },
    { href: "/calibrate", label: "Calibrate", icon: "⚙️", active: false },
    { href: "/intervene", label: "Intervene", icon: "📈", active: false },
    { href: "/visualize", label: "Visualize", icon: "📊", active: false },
    { href: "/save-ai", label: "Simulation AI", icon: "💾", active: false },
  ];

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 flex flex-col p-4">
      <div className="flex items-center mb-8">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400"></h1>
      </div>
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 p-2 rounded-lg ${
              item.active
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300 font-medium"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                } transition-colors duration-200`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                item.active ? "bg-blue-200 dark:bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
              }`}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}