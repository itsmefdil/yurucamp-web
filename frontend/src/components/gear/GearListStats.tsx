import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { GearCategory } from '../../types/gear';
import { Scale } from 'lucide-react';

interface GearListStatsProps {
    categories: GearCategory[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function GearListStats({ categories }: GearListStatsProps) {
    const data = categories.map(cat => {
        const weight = cat.items.reduce((sum, item) => sum + (parseFloat(item.weight) * item.quantity), 0);
        const itemCount = cat.items.reduce((sum, item) => sum + item.quantity, 0);
        return {
            name: cat.name,
            value: weight,
            itemCount
        };
    }).filter(d => d.value > 0);

    const totalWeight = data.reduce((sum, d) => sum + d.value, 0);
    const totalItems = data.reduce((sum, d) => sum + d.itemCount, 0);

    if (totalWeight === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden lg:sticky lg:top-24">
            <div className="p-4">
                <h3 className="font-bold text-base mb-4 text-text-primary flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    Rincian Berat
                </h3>

                {/* Kartu Ringkasan */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-3 text-center">
                        <div className="text-xs text-text-secondary font-medium">Total Berat</div>
                        <div className="text-lg font-bold text-primary mt-1">
                            {totalWeight >= 1000 ? `${(totalWeight / 1000).toFixed(2)}kg` : `${totalWeight}g`}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100/80 to-blue-50/50 rounded-xl p-3 text-center">
                        <div className="text-xs text-text-secondary font-medium">Total Item</div>
                        <div className="text-lg font-bold text-blue-600 mt-1">{totalItems}</div>
                    </div>
                </div>

                {/* Pie Chart - Centered */}
                <div className="flex justify-center mb-4">
                    <div className="w-40 h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={3}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => {
                                        const v = typeof value === 'number' ? value : 0;
                                        return [`${v >= 1000 ? (v / 1000).toFixed(2) + 'kg' : v + 'g'}`, 'Berat'];
                                    }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '13px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Legenda - Vertical list */}
                <div className="space-y-1">
                    {data.map((d, i) => {
                        const percentage = ((d.value / totalWeight) * 100).toFixed(0);
                        return (
                            <div key={d.name} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                                <div
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                />
                                <span className="flex-1 text-sm text-text-secondary truncate">{d.name}</span>
                                <span className="text-xs text-text-tertiary tabular-nums">{percentage}%</span>
                                <span className="font-mono text-xs font-semibold text-text-primary whitespace-nowrap tabular-nums">
                                    {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}kg` : `${d.value}g`}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
