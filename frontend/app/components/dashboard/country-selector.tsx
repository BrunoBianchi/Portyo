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
        <div className="w-full">
            {/* Trigger Button */}
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center gap-3 p-4 sm:p-5 rounded-[18px] border-2 border-black transition-all duration-200 bg-white ${
                    selectedCountry 
                        ? "ring-2 ring-[#C6F035]/30" 
                        : "hover:bg-gray-50"
                } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-black/10 ${
                    selectedCountry ? "bg-[#C6F035]/25" : "bg-gray-100"
                }`}>
                    {selectedCountryData ? (
                        <span className="text-2xl">{selectedCountryData.flag}</span>
                    ) : (
                        <Globe className="w-5 h-5 text-gray-500" />
                    )}
                </div>
                <div className="flex-1 text-left">
                    <p className="text-sm text-gray-500">Target Country</p>
                    <p className="font-semibold text-[#1A1A1A] text-base sm:text-lg leading-tight">
                        {selectedCountryData ? selectedCountryData.name : "Global / No specific target"}
                    </p>
                </div>
                <MapPin className={`w-5 h-5 ${selectedCountry ? "text-[#1A1A1A]" : "text-gray-500"}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="mt-3 w-full bg-white rounded-[18px] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    {/* Search */}
                    <div className="p-3 sm:p-4 border-b-2 border-gray-100 bg-white">
                        <input
                            type="text"
                            placeholder="Search country or region..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C6F035]/30 focus:border-[#C6F035]"
                        />
                    </div>
                    
                    {/* Global Option */}
                    <button
                        onClick={() => {
                            onSelectCountry(null);
                            setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 sm:p-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                            !selectedCountry ? "bg-[#C6F035]/15" : ""
                        }`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="flex-1 text-left text-[#1A1A1A] font-medium">Global / No specific target</span>
                        {!selectedCountry && <Check className="w-4 h-4 text-[#84A800]" />}
                    </button>
                    
                    {/* Countries by Region */}
                    <div className="overflow-y-auto max-h-[42vh] sm:max-h-80 bg-white">
                        {Object.entries(groupedByRegion).map(([region, countries]) => (
                            <div key={region}>
                                <div className="px-3 sm:px-4 py-2 bg-gray-50 text-xs font-black text-gray-500 uppercase tracking-wider border-y border-gray-100">
                                    {region}
                                </div>
                                {countries.map((country) => (
                                    <button
                                        key={country.code}
                                        onClick={() => {
                                            onSelectCountry(country.code);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 sm:p-3.5 hover:bg-gray-50 transition-colors ${
                                            selectedCountry === country.code ? "bg-[#C6F035]/15" : ""
                                        }`}
                                    >
                                        <span className="text-2xl">{country.flag}</span>
                                        <span className="flex-1 text-left text-[#1A1A1A] font-medium">{country.name}</span>
                                        {selectedCountry === country.code && (
                                            <Check className="w-4 h-4 text-[#84A800]" />
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
