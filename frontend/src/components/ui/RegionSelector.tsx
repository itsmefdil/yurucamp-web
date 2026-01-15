import React, { useEffect, useState } from 'react';
import api from '../../lib/api';

interface Region {
    id: string;
    name: string;
    slug: string;
}

interface RegionSelectorProps {
    value?: string | null;
    onChange: (regionId: string | null) => void;
    label?: string;
    className?: string;
    showLabel?: boolean;
    variant?: 'default' | 'ghost'; // New prop
    placeholder?: string; // New prop
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
    value,
    onChange,
    label = "Pilih Region",
    className = "",
    showLabel = true,
    variant = 'default',
    placeholder = "Semua Region"
}) => {
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await api.get('/regions');
                setRegions(response.data);
            } catch (error) {
                console.error("Failed to fetch regions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRegions();
    }, []);

    if (loading) return <div className="text-sm text-gray-400">Loading regions...</div>;

    const selectClassName = variant === 'ghost'
        ? "w-full px-4 py-2.5 bg-transparent border-none rounded-2xl focus:outline-none focus:bg-orange-50/50 text-gray-800 font-medium appearance-none cursor-pointer"
        : "w-full px-4 py-2 bg-white/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-amber-900 appearance-none cursor-pointer";

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {showLabel && <label className="text-sm font-medium text-amber-900/70">{label}</label>}
            <select
                value={value || ""}
                onChange={(e) => onChange(e.target.value || null)}
                className={selectClassName}
            >
                <option value="">{placeholder}</option>
                {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                        {region.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default RegionSelector;
