import { useState } from "react";
import { Globe, MapPin, Check } from "lucide-react";

export interface Country {
    code: string;
    name: string;
    flag: string;
    region: string;
    language: string;
    languageCode: string;
}

export const COUNTRIES: Country[] = [
    // Américas
    { code: "US", name: "United States", flag: "🇺🇸", region: "Americas", language: "English", languageCode: "en" },
    { code: "CA", name: "Canada", flag: "🇨🇦", region: "Americas", language: "English", languageCode: "en" },
    { code: "BR", name: "Brazil", flag: "🇧🇷", region: "Americas", language: "Portuguese", languageCode: "pt" },
    { code: "MX", name: "Mexico", flag: "🇲🇽", region: "Americas", language: "Spanish", languageCode: "es" },
    { code: "AR", name: "Argentina", flag: "🇦🇷", region: "Americas", language: "Spanish", languageCode: "es" },
    { code: "CL", name: "Chile", flag: "🇨🇱", region: "Americas", language: "Spanish", languageCode: "es" },
    { code: "CO", name: "Colombia", flag: "🇨🇴", region: "Americas", language: "Spanish", languageCode: "es" },
    { code: "PE", name: "Peru", flag: "🇵🇪", region: "Americas", language: "Spanish", languageCode: "es" },
    
    // Europa
    { code: "GB", name: "United Kingdom", flag: "🇬🇧", region: "Europe", language: "English", languageCode: "en" },
    { code: "DE", name: "Germany", flag: "🇩🇪", region: "Europe", language: "German", languageCode: "de" },
    { code: "FR", name: "France", flag: "🇫🇷", region: "Europe", language: "French", languageCode: "fr" },
    { code: "IT", name: "Italy", flag: "🇮🇹", region: "Europe", language: "Italian", languageCode: "it" },
    { code: "ES", name: "Spain", flag: "🇪🇸", region: "Europe", language: "Spanish", languageCode: "es" },
    { code: "PT", name: "Portugal", flag: "🇵🇹", region: "Europe", language: "Portuguese", languageCode: "pt" },
    { code: "NL", name: "Netherlands", flag: "🇳🇱", region: "Europe", language: "Dutch", languageCode: "nl" },
    { code: "BE", name: "Belgium", flag: "🇧🇪", region: "Europe", language: "Dutch", languageCode: "nl" },
    { code: "CH", name: "Switzerland", flag: "🇨🇭", region: "Europe", language: "German", languageCode: "de" },
    { code: "AT", name: "Austria", flag: "🇦🇹", region: "Europe", language: "German", languageCode: "de" },
    { code: "SE", name: "Sweden", flag: "🇸🇪", region: "Europe", language: "Swedish", languageCode: "sv" },
    { code: "NO", name: "Norway", flag: "🇳🇴", region: "Europe", language: "Norwegian", languageCode: "no" },
    { code: "DK", name: "Denmark", flag: "🇩🇰", region: "Europe", language: "Danish", languageCode: "da" },
    { code: "FI", name: "Finland", flag: "🇫🇮", region: "Europe", language: "Finnish", languageCode: "fi" },
    { code: "PL", name: "Poland", flag: "🇵🇱", region: "Europe", language: "Polish", languageCode: "pl" },
    { code: "RU", name: "Russia", flag: "🇷🇺", region: "Europe", language: "Russian", languageCode: "ru" },
    
    // Ásia
    { code: "CN", name: "China", flag: "🇨🇳", region: "Asia", language: "Chinese", languageCode: "zh" },
    { code: "JP", name: "Japan", flag: "🇯🇵", region: "Asia", language: "Japanese", languageCode: "ja" },
    { code: "KR", name: "South Korea", flag: "🇰🇷", region: "Asia", language: "Korean", languageCode: "ko" },
    { code: "IN", name: "India", flag: "🇮🇳", region: "Asia", language: "English", languageCode: "en" },
    { code: "SG", name: "Singapore", flag: "🇸🇬", region: "Asia", language: "English", languageCode: "en" },
    { code: "TH", name: "Thailand", flag: "🇹🇭", region: "Asia", language: "Thai", languageCode: "th" },
    { code: "VN", name: "Vietnam", flag: "🇻🇳", region: "Asia", language: "Vietnamese", languageCode: "vi" },
    { code: "MY", name: "Malaysia", flag: "🇲🇾", region: "Asia", language: "Malay", languageCode: "ms" },
    { code: "ID", name: "Indonesia", flag: "🇮🇩", region: "Asia", language: "Indonesian", languageCode: "id" },
    { code: "PH", name: "Philippines", flag: "🇵🇭", region: "Asia", language: "English", languageCode: "en" },
    { code: "AE", name: "UAE", flag: "🇦🇪", region: "Asia", language: "Arabic", languageCode: "ar" },
    { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", region: "Asia", language: "Arabic", languageCode: "ar" },
    { code: "IL", name: "Israel", flag: "🇮🇱", region: "Asia", language: "Hebrew", languageCode: "he" },
    { code: "TR", name: "Turkey", flag: "🇹🇷", region: "Asia", language: "Turkish", languageCode: "tr" },
    
    // Oceania
    { code: "AU", name: "Australia", flag: "🇦🇺", region: "Oceania", language: "English", languageCode: "en" },
    { code: "NZ", name: "New Zealand", flag: "🇳🇿", region: "Oceania", language: "English", languageCode: "en" },
    
    // África
    { code: "ZA", name: "South Africa", flag: "🇿🇦", region: "Africa", language: "English", languageCode: "en" },
    { code: "EG", name: "Egypt", flag: "🇪🇬", region: "Africa", language: "Arabic", languageCode: "ar" },
    { code: "NG", name: "Nigeria", flag: "🇳🇬", region: "Africa", language: "English", languageCode: "en" },
    { code: "KE", name: "Kenya", flag: "🇰🇪", region: "Africa", language: "English", languageCode: "en" },
    { code: "MA", name: "Morocco", flag: "🇲🇦", region: "Africa", language: "Arabic", languageCode: "ar" },
];

// Helper function to get language info from country code
export const getLanguageByCountry = (countryCode: string | null): { language: string; languageCode: string } | null => {
    if (!countryCode) return null;
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (!country) return null;
    return { language: country.language, languageCode: country.languageCode };
};

interface CountrySelectorProps {
    selectedCountry: string | null;
    onSelectCountry: (countryCode: string | null) => void;
    disabled?: boolean;
}

export const CountrySelector = ({ selectedCountry, onSelectCountry, disabled = false }: CountrySelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    const selectedCountryData = COUNTRIES.find(c => c.code === selectedCountry);
    
    const filteredCountries = searchTerm 
        ? COUNTRIES.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.region.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : COUNTRIES;
    
    const groupedByRegion = filteredCountries.reduce((acc, country) => {
        if (!acc[country.region]) acc[country.region] = [];
        acc[country.region].push(country);
        return acc;
    }, {} as Record<string, Country[]>);

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedCountry 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-border hover:border-primary/30"
                } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedCountry ? "bg-primary/20" : "bg-muted"
                }`}>
                    {selectedCountryData ? (
                        <span className="text-2xl">{selectedCountryData.flag}</span>
                    ) : (
                        <Globe className="w-5 h-5 text-text-muted" />
                    )}
                </div>
                <div className="flex-1 text-left">
                    <p className="text-sm text-text-muted">Target Country</p>
                    <p className="font-medium text-text-main">
                        {selectedCountryData ? selectedCountryData.name : "Global / No specific target"}
                    </p>
                </div>
                <MapPin className={`w-5 h-5 ${selectedCountry ? "text-primary" : "text-text-muted"}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface-card rounded-xl border border-border shadow-xl max-h-96 overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b border-border">
                        <input
                            type="text"
                            placeholder="Search country or region..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-muted rounded-lg text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                    </div>
                    
                    {/* Global Option */}
                    <button
                        onClick={() => {
                            onSelectCountry(null);
                            setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors ${
                            !selectedCountry ? "bg-primary/10" : ""
                        }`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <Globe className="w-4 h-4 text-text-muted" />
                        </div>
                        <span className="flex-1 text-left text-text-main">Global / No specific target</span>
                        {!selectedCountry && <Check className="w-4 h-4 text-primary" />}
                    </button>
                    
                    {/* Countries by Region */}
                    <div className="overflow-y-auto max-h-64">
                        {Object.entries(groupedByRegion).map(([region, countries]) => (
                            <div key={region}>
                                <div className="px-3 py-2 bg-muted/50 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                    {region}
                                </div>
                                {countries.map((country) => (
                                    <button
                                        key={country.code}
                                        onClick={() => {
                                            onSelectCountry(country.code);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors ${
                                            selectedCountry === country.code ? "bg-primary/10" : ""
                                        }`}
                                    >
                                        <span className="text-2xl">{country.flag}</span>
                                        <span className="flex-1 text-left text-text-main">{country.name}</span>
                                        {selectedCountry === country.code && (
                                            <Check className="w-4 h-4 text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CountrySelector;
