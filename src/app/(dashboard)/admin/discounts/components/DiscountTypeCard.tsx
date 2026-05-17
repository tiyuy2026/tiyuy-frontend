'use client';

interface DiscountOption {
  type: string;
  label: string;
  description: string;
  gradient: string;
  bullets: string[];
}

interface DiscountTypeCardProps {
  option: DiscountOption;
  onClick: () => void;
}

export default function DiscountTypeCard({ option, onClick }: DiscountTypeCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 text-left w-full flex flex-col"
      style={{ minHeight: '200px' }}
    >
      {/* Hover gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-[0.03] rounded-2xl transition-opacity duration-300`} />
      
      {/* Top accent line */}
      <div className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r ${option.gradient} opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300`} />
      
      <div className="flex items-start gap-4 flex-1">
        {/* Left: Icon */}
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center text-white shadow-sm flex-shrink-0 group-hover:shadow-md transition-shadow duration-300`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {option.type === 'GLOBAL' && (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </>
            )}
            {option.type === 'USER' && (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            )}
            {option.type === 'AGENT' && (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            )}
            {option.type === 'AGENCY' && (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            )}
            {option.type === 'PLAN' && (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
            )}
            {option.type === 'REUSABLE' && (
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
            )}
          </svg>
        </div>

        {/* Center: Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-base group-hover:text-gray-800 transition-colors">
            {option.label}
          </h4>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            {option.description}
          </p>
          <ul className="mt-3 space-y-1">
            {option.bullets.map((bullet, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${option.gradient} flex-shrink-0`} />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Arrow */}
        <div className="flex-shrink-0 self-center">
          <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors duration-200">
            <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}
