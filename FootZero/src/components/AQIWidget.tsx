import { useState, useEffect } from "react";
import { Wind, Search, MapPin, Loader2, AlertTriangle, RotateCcw, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AQIData {
  aqi: number;
  station: string;
  dominentpol?: string;
  iaqi?: Record<string, { v: number }>;
  time?: { s: string };
}

const AQI_LEVELS = [
  { max: 50, label: "Good", color: "bg-green-500", textColor: "text-green-400", description: "Air quality is satisfactory." },
  { max: 100, label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-400", description: "Acceptable air quality." },
  { max: 150, label: "Unhealthy (Sensitive)", color: "bg-orange-500", textColor: "text-orange-400", description: "Sensitive groups may be affected." },
  { max: 200, label: "Unhealthy", color: "bg-red-500", textColor: "text-red-400", description: "Everyone may experience effects." },
  { max: 300, label: "Very Unhealthy", color: "bg-purple-500", textColor: "text-purple-400", description: "Health alert: serious effects." },
  { max: Infinity, label: "Hazardous", color: "bg-rose-900", textColor: "text-rose-400", description: "Emergency conditions." },
];

const getAQILevel = (aqi: number) => AQI_LEVELS.find((l) => aqi <= l.max) || AQI_LEVELS[5];

const WAQI_TOKEN = "demo";

export const AQIWidget = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCity, setSearchCity] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [isSearched, setIsSearched] = useState(false);
  const [settingLocation, setSettingLocation] = useState(false);

  const homeCity = profile?.city || "Kathmandu";

  const fetchAQI = async (city: string) => {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${WAQI_TOKEN}`);
      const json = await res.json();
      if (json.status === "ok" && json.data) {
        setAqiData({
          aqi: json.data.aqi,
          station: json.data.city?.name || city,
          dominentpol: json.data.dominentpol,
          iaqi: json.data.iaqi,
          time: json.data.time,
        });
        setCurrentCity(city);
      } else {
        setError("City not found. Try another name.");
        setAqiData(null);
      }
    } catch {
      setError("Failed to fetch AQI data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAQI(homeCity);
  }, [profile?.city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchAQI(searchCity.trim());
      setIsSearched(true);
    }
  };

  const handleBackToHome = () => {
    fetchAQI(homeCity);
    setSearchCity("");
    setIsSearched(false);
  };

  const handleSetAsMyLocation = async () => {
    if (!user || !currentCity.trim()) return;
    setSettingLocation(true);
    const { error } = await supabase
      .from("profiles")
      .update({ city: currentCity })
      .eq("id", user.id);
    if (error) {
      toast({ title: "Error", description: "Failed to update location.", variant: "destructive" });
    } else {
      toast({ title: "Location updated!", description: `Your city is now set to ${currentCity}.` });
      setIsSearched(false);
      refreshProfile?.();
    }
    setSettingLocation(false);
  };

  const level = aqiData ? getAQILevel(aqiData.aqi) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 border border-border col-span-1 md:col-span-2 lg:col-span-3"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wind className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-foreground font-semibold text-sm">Live Air Quality Index</h3>
            {aqiData && (
              <p className="text-muted-foreground text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {aqiData.station}
                {isSearched && (
                  <span className="text-primary/60 ml-1">· Searching</span>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {isSearched && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl h-9 px-3 gap-1.5 text-xs"
              onClick={handleBackToHome}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              My City
            </Button>
          )}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 sm:flex-initial">
            <Input
              placeholder="Search city..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="bg-background border-border text-foreground h-9 rounded-xl text-sm w-full sm:w-48"
            />
            <Button type="submit" size="sm" variant="outline" className="rounded-xl h-9 px-3" disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            </Button>
          </form>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading && !aqiData ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 py-6 justify-center text-muted-foreground text-sm">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </motion.div>
        ) : aqiData && level ? (
          <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* AQI Score */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-background/50 border border-border">
                <span className={`text-4xl font-bold ${level.textColor}`}>{aqiData.aqi}</span>
                <span className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full ${level.color} text-white`}>
                  {level.label}
                </span>
                <p className="text-muted-foreground text-[11px] mt-2 text-center">{level.description}</p>
              </div>

              {/* Pollutant details */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-background/50 border border-border">
                <span className="text-muted-foreground text-xs font-medium mb-1">Key Pollutants</span>
                {aqiData.iaqi && Object.entries(aqiData.iaqi).slice(0, 4).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-muted-foreground uppercase">{key}</span>
                    <span className="text-foreground font-medium">{val.v}</span>
                  </div>
                ))}
                {aqiData.dominentpol && (
                  <p className="text-[11px] text-muted-foreground mt-auto">
                    Dominant: <span className="text-foreground">{aqiData.dominentpol.toUpperCase()}</span>
                  </p>
                )}
              </div>

              {/* Health Tips */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-background/50 border border-border sm:col-span-2">
                <span className="text-muted-foreground text-xs font-medium">Health Recommendation</span>
                {aqiData.aqi <= 50 ? (
                  <p className="text-sm text-foreground">Great day to be outdoors! Air quality is excellent. 🌿</p>
                ) : aqiData.aqi <= 100 ? (
                  <p className="text-sm text-foreground">Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion. 😊</p>
                ) : aqiData.aqi <= 150 ? (
                  <p className="text-sm text-foreground">Sensitive groups should reduce outdoor activity. Consider wearing a mask. 😷</p>
                ) : (
                  <p className="text-sm text-foreground">Avoid outdoor activity. Keep windows closed and use air purifiers if possible. ⚠️</p>
                )}
                {aqiData.time?.s && (
                  <p className="text-[11px] text-muted-foreground mt-auto">
                    Last updated: {new Date(aqiData.time.s).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Set as my location button when viewing a different city */}
            {isSearched && currentCity.toLowerCase() !== homeCity.toLowerCase() && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex justify-center"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-8 px-4 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
                  onClick={handleSetAsMyLocation}
                  disabled={settingLocation}
                >
                  {settingLocation ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Navigation className="h-3.5 w-3.5" />
                  )}
                  Set as my location
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};
