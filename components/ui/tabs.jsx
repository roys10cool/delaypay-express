import { useState } from 'react';

export function Tabs({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={`px-3 py-1 rounded ${
              idx === active ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active]?.content}</div>
    </div>
  );
}
