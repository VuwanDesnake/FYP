import { useState, useEffect } from "react";
import { Wind, Search, MapPin, Loader2, AlertTriangle, RotateCcw, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const OWM_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

interface WeatherAQIData {
  aqi: number;
  aqiLabel: string;
  city: string;
  temp: number;
  description: string;
  humidity: number;
  windSpeed: number;
  pm25?: number;
  pm10?: number;
  no2?: number;
  o3?: number;
}

const AQI_LEVELS = [
  { max: 1, label: "Good",      color: "bg-green-500",  textColor: "text-green-400",  description: "Air quality is satisfactory." },
  { max: 2, label: "Fair",      color: "bg-yellow-500", textColor: "text-yellow-400", description: "Acceptable air quality." },
  { max: 3, label: "Moderate",  color: "bg-orange-500", textColor: "text-orange-400", description: "Sensitive groups may be affected." },
  { max: 4, label: "Poor",      color: "bg-red-500",    textColor: "text-red-400",    description: "Everyone may experience effects." },
  { max: 5, label: "Very Poor", color: "bg-purple-500", textColor: "text-purple-400", description: "Health alert: serious effects." },
];

const getAQILevel = (aqi: number) =>
  AQI_LEVELS.find((l) => aqi <= l.max) || AQI_LEVELS[4];

export const AQIWidget = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [data, setData] = useState<WeatherAQIData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCity, setSearchCity] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [isSearched, setIsSearched] = useState(false);
  const [settingLocation, setSettingLocation] = useState(false);

  const homeCity = profile?.city || "Kathmandu";

  const fetchWeatherAndAQI = async (city: string) => {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Step 1 — Get weather + coordinates
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OWM_KEY}&units=metric`
      );
      const weatherJson = await weatherRes.json();

      if (weatherJson.cod !== 200) {
        setError("City not found. Try another name.");
        setData(null);
        setLoading(false);
        return;
      }

      const lat = weatherJson.coord.lat;
      const lon = weatherJson.coord.lon;

      // Step 2 — Get AQI using coordinates
      const aqiRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`
      );
      const aqiJson = await aqiRes.json();

      const aqiValue = aqiJson?.list?.[0]?.main?.aqi || 1;
      const components = aqiJson?.list?.[0]?.components || {};

      setData({
        aqi: aqiValue,
        aqiLabel: getAQILevel(aqiValue).label,
        city: weatherJson.name + ", " + weatherJson.sys.country,
        temp: Math.round(weatherJson.main.temp),
        description: weatherJson.weather[0].description,
        humidity: weatherJson.main.humidity,
        windSpeed: weatherJson.wind.speed,
        pm25: components.pm2_5,
        pm10: components.pm10,
        no2: components.no2,
        o3: components.o3,
      });

      setCurrentCity(weatherJson.name);
    } catch {
      setError("Failed to fetch weather data. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherAndAQI(homeCity);
  }, [profile?.city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeatherAndAQI(searchCity.trim());
      setIsSearched(true);
    }
  };

  const handleBackToHome = () => {
    fetchWeatherAndAQI(homeCity);
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

  const level = data ? getAQILevel(data.aqi) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 border border-border col-span-1 md:col-span-2 lg:col-span-3"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wind className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-foreground font-semibold text-sm">Live Weather & Air Quality</h3>
            {data && (
              <p className="text-muted-foreground text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {data.city}
                {isSearched && <span className="text-primary/60 ml-1">· Searching</span>}
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

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading && !data ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 py-6 justify-center text-muted-foreground text-sm">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </motion.div>
        ) : data && level ? (
          <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

              {/* AQI Score */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-background/50 border border-border">
                <span className={`text-4xl font-bold ${level.textColor}`}>{data.aqi}</span>
                <span className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full ${level.color} text-white`}>
                  {level.label}
                </span>
                <p className="text-muted-foreground text-[11px] mt-2 text-center">{level.description}</p>
              </div>

              {/* Weather Info */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-background/50 border border-border">
                <span className="text-muted-foreground text-xs font-medium mb-1">Weather</span>
                <p className="text-foreground text-2xl font-bold">{data.temp}°C</p>
                <p className="text-muted-foreground text-xs capitalize">{data.description}</p>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Humidity</span>
                  <span className="text-foreground font-medium">{data.humidity}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Wind</span>
                  <span className="text-foreground font-medium">{data.windSpeed} m/s</span>
                </div>
              </div>

              {/* Pollutants */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-background/50 border border-border">
                <span className="text-muted-foreground text-xs font-medium mb-1">Key Pollutants (μg/m³)</span>
                {data.pm25 !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">PM2.5</span>
                    <span className="text-foreground font-medium">{data.pm25.toFixed(1)}</span>
                  </div>
                )}
                {data.pm10 !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">PM10</span>
                    <span className="text-foreground font-medium">{data.pm10.toFixed(1)}</span>
                  </div>
                )}
                {data.no2 !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">NO₂</span>
                    <span className="text-foreground font-medium">{data.no2.toFixed(1)}</span>
                  </div>
                )}
                {data.o3 !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">O₃</span>
                    <span className="text-foreground font-medium">{data.o3.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Health Recommendation */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-background/50 border border-border">
                <span className="text-muted-foreground text-xs font-medium">Health Tip</span>
                {data.aqi === 1 ? (
                  <p className="text-sm text-foreground">Great day to be outdoors! Air quality is excellent. 🌿</p>
                ) : data.aqi === 2 ? (
                  <p className="text-sm text-foreground">Air quality is fair. Sensitive individuals should take care. 😊</p>
                ) : data.aqi === 3 ? (
                  <p className="text-sm text-foreground">Moderate air quality. Reduce prolonged outdoor activity. 😷</p>
                ) : data.aqi === 4 ? (
                  <p className="text-sm text-foreground">Poor air quality. Avoid outdoor exertion if possible. ⚠️</p>
                ) : (
                  <p className="text-sm text-foreground">Very poor air. Stay indoors and keep windows closed. 🚨</p>
                )}
              </div>
            </div>

            {/* Set as my location */}
            {isSearched && currentCity.toLowerCase() !== homeCity.toLowerCase() && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-8 px-4 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
                  onClick={handleSetAsMyLocation}
                  disabled={settingLocation}
                >
                  {settingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
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
