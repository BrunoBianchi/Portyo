import React, { useEffect, useState, memo } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup
} from "react-simple-maps";
import { Link } from "react-router";
import { Lock, Sparkles } from "lucide-react";
import { api } from "~/services/api";

// TopoJSON for world map
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GeoStats {
    totalViews: number;
    uniqueCountries: number;
    countries: {
        code: string;
        views: number;
        coordinates: { lat: number; lng: number } | null;
    }[];
    markers: {
        lat: number;
        lng: number;
        country: string;
        city: string | null;
        timestamp: string;
    }[];
    maxViews: number;
}

interface WorldMapProps {
    bioId: string;
    mini?: boolean;
    blocked?: boolean;
}

// Country name to ISO code mapping for coloring
const countryNameToCode: { [key: string]: string } = {
    "United States of America": "US",
    "Brazil": "BR",
    "United Kingdom": "GB",
    "Germany": "DE",
    "France": "FR",
    "Japan": "JP",
    "China": "CN",
    "India": "IN",
    "Australia": "AU",
    "Canada": "CA",
    "Mexico": "MX",
    "Spain": "ES",
    "Italy": "IT",
    "Portugal": "PT",
    "Netherlands": "NL",
    "Argentina": "AR",
    "Chile": "CL",
    "Colombia": "CO",
    "Russia": "RU",
    "South Korea": "KR",
    "Poland": "PL",
    "Sweden": "SE",
    "Norway": "NO",
    "Denmark": "DK",
    "Finland": "FI",
    // Add more as needed
};

const WorldMap: React.FC<WorldMapProps> = memo(({ bioId, mini = false, blocked = false }) => {
    const [data, setData] = useState<GeoStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (blocked) {
            // When blocked, we stop loading but don't fetch data.
            // Data remains null, so map renders default gray countries.
            setLoading(false);
            return;
        }

        const fetchGeoStats = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/analytics/geo-stats?bioId=${bioId}`);
                setData(response.data);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to load geo data");
            } finally {
                setLoading(false);
            }
        };

        if (bioId) {
            fetchGeoStats();
        }
    }, [bioId, blocked]);

    const getCountryColor = (countryName: string) => {
        if (!data) return "#E5E7EB";

        const code = countryNameToCode[countryName];
        if (!code) return "#E5E7EB";

        const country = data.countries.find(c => c.code === code);
        if (!country) return "#E5E7EB";

        // Calculate color intensity based on views
        const intensity = Math.min(country.views / (data.maxViews || 1), 1);
        const blue = Math.floor(59 + (130 - 59) * (1 - intensity)); // 59 is for #3B82F6 blue
        return `rgb(59, ${blue}, 246)`;
    };

    if (loading) {
        return (
            <div className={`bg-surface-card rounded-2xl border border-border p-6 shadow-sm ${mini ? 'h-full' : ''}`}>
                <div className={`${mini ? 'h-[300px]' : 'h-[400px]'} flex items-center justify-center`}>
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-surface-card rounded-2xl border border-border p-6 shadow-sm">
                <div className={`${mini ? 'h-[300px]' : 'h-[400px]'} flex items-center justify-center text-muted-foreground`}>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-surface-card rounded-2xl border border-border shadow-sm overflow-hidden ${mini ? 'h-full flex flex-col' : ''} relative`}>
            {/* Blocked Overlay */}
            {blocked && (
                <div className="absolute inset-0 z-10 bg-surface-card/60 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        <Lock className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: 'var(--font-display)' }}>Visitor Locations</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-[200px] mx-auto leading-relaxed">
                        Upgrade to Pro to see visitor locations.
                    </p>
                    <Link
                        to="/dashboard/billing"
                        className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        Upgrade to Pro
                    </Link>
                </div>
            )}

            {/* Header */}
            <div className={`p-6 border-b border-border flex-shrink-0 ${blocked ? 'blur-[3px]' : ''}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Visitor Locations</h3>
                        {!mini && <p className="text-sm text-muted-foreground mt-0.5">Geographic distribution of your visitors</p>}
                    </div>
                    {!mini ? (
                        <div className="flex items-center gap-6 text-sm">
                            <div>
                                <span className="text-muted-foreground">Total Views:</span>
                                <span className="font-bold text-foreground ml-2">{data?.totalViews || 0}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Countries:</span>
                                <span className="font-bold text-foreground ml-2">{data?.uniqueCountries || 0}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            {data?.uniqueCountries || 0} Countries
                        </div>
                    )}
                </div>
            </div>

            {/* Map */}
            <div className={`relative flex-1 ${blocked ? 'blur-[3px]' : ''}`} style={{ minHeight: mini ? 300 : 400 }}>
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: mini ? 120 : 140,
                        center: [0, 30]
                    }}
                    style={{ width: "100%", height: "100%" }}
                >
                    <ZoomableGroup>
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={getCountryColor(geo.properties.name)}
                                        stroke="#D1D5DB"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none" },
                                            hover: { fill: "#60A5FA", outline: "none", cursor: "pointer" },
                                            pressed: { outline: "none" }
                                        }}
                                    />
                                ))
                            }
                        </Geographies>

                        {/* Markers for recent visitors */}
                        {data?.markers
                            .filter(m => !isNaN(m.lat) && !isNaN(m.lng) && m.lat !== null && m.lng !== null)
                            .slice(0, 20)
                            .map((marker, index) => (
                                <Marker
                                    key={`marker-${index}`}
                                    coordinates={[marker.lng, marker.lat]}
                                >
                                    <circle
                                        r={4}
                                        fill="#3B82F6"
                                        stroke="#fff"
                                        strokeWidth={1.5}
                                        className="animate-pulse"
                                    />
                                </Marker>
                            ))}
                    </ZoomableGroup>
                </ComposableMap>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-surface-card/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-border">
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-blue-500/100"></div>
                            <span className="text-muted-foreground">High traffic</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                            <span className="text-muted-foreground">Low traffic</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Country List - Hidden in mini mode */}
            {!mini && data && data.countries.length > 0 && (
                <div className="p-6 border-t border-border flex-shrink-0">
                    <h4 className="text-sm font-bold text-foreground mb-4">Top Countries</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {data.countries.slice(0, 8).map((country, index) => (
                            <div
                                key={country.code}
                                className="flex items-center gap-3 p-3 bg-muted rounded-xl"
                            >
                                <span className="text-lg">
                                    {getFlagEmoji(country.code)}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">{country.code}</p>
                                    <p className="text-xs text-muted-foreground">{country.views} views</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {(!data || data.countries.length === 0) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-card/80 backdrop-blur-sm p-6 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: 'var(--font-display)' }}>No visitor data yet</h3>
                    <p className="text-sm text-muted-foreground">Share your bio page to start tracking visitor locations</p>
                </div>
            )}
        </div>
    );
});

// Helper function to convert country code to flag emoji
function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

WorldMap.displayName = "WorldMap";

export default WorldMap;
