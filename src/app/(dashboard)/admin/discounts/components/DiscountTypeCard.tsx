import { ArrowRight, Globe, Landmark, RefreshCw, ScrollText, User, UserCheck } from 'lucide-react';
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
            {option.type === 'GLOBAL' && <Globe className="w-5 h-5" />}
            {option.type === 'USER' && <User className="w-5 h-5" />}
            {option.type === 'AGENT' && <UserCheck className="w-5 h-5" />}
            {option.type === 'AGENCY' && <Landmark className="w-5 h-5" />}
            {option.type === 'PLAN' && <ScrollText className="w-5 h-5" />}
            {option.type === 'REUSABLE' && <RefreshCw className="w-5 h-5" />}
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
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
        </div>
      </div>
    </button>
  );
}
