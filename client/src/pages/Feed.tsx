import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { apiClient, type Exercise } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Filter, X, Search } from "lucide-react";

const MACHINE_TYPES = [
  { value: "mat", label: "מזרן" },
  { value: "reformer", label: "רפורמר" },
  { value: "wunda chair", label: "כיסא וונדה" },
  { value: "cadillac", label: "קדילאק" },
  { value: "spring board", label: "ספרינג בורד" },
  { value: "ladder barrel", label: "חבית וסולם" },
];

const LEVELS = [
  { value: "beginner", label: "מתחיל" },
  { value: "intermediate", label: "בינוני" },
  { value: "advanced", label: "מתקדם" },
  { value: "super advanced", label: "מתקדם מאוד" },
];

function Feed() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAdmin, user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [selectedMachineType, setSelectedMachineType] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getExercises();
      setExercises(data);
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת התרגילים");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await apiClient.syncExercises();
      alert(result.message);
      await loadExercises();
    } catch (err: any) {
      alert(err.message || "שגיאה בסנכרון");
    } finally {
      setSyncing(false);
    }
  };

  const extractVideoId = (url: string | undefined): string | null => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Get unique machine types from exercises
  const availableMachineTypes = useMemo(() => {
    const types = new Set<string>();
    exercises.forEach((ex) => {
      if (ex.Machine_type) {
        types.add(ex.Machine_type.toLowerCase());
      }
    });
    return Array.from(types);
  }, [exercises]);

  // Filter exercises by machine type, search query, and levels
  const filteredExercises = useMemo(() => {
    let filtered = exercises;

    // Filter by machine type
    if (selectedMachineType) {
      filtered = filtered.filter(
        (ex) =>
          ex.Machine_type?.toLowerCase() === selectedMachineType.toLowerCase()
      );
    }

    // Filter by search query (case-insensitive, partial match)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((ex) => ex.Name.toLowerCase().includes(query));
    }

    // Filter by selected levels
    if (selectedLevels.length > 0) {
      filtered = filtered.filter(
        (ex) => ex.Level && selectedLevels.includes(ex.Level.toLowerCase())
      );
    }

    return filtered;
  }, [exercises, selectedMachineType, searchQuery, selectedLevels]);

  const handleLevelToggle = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const getMachineTypeLabel = (type: string | null) => {
    if (!type) return "הכל";
    const machine = MACHINE_TYPES.find(
      (m) => m.value.toLowerCase() === type.toLowerCase()
    );
    return machine ? machine.label : type;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">טוען תרגילים...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">סרטונים</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Filter size={18} />
            מסנן
          </button>
          {isAdmin() && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {syncing ? "מסנכרן..." : "סנכרן מגיליון"}
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <input
            type="text"
            placeholder="חפש לפי שם התרגיל..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground"
            style={{ borderColor: "#cadbcb" } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Machine Type Selector - Hidden for mat users */}
      {user?.role !== "mat" && (
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => setSelectedMachineType(null)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedMachineType === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:opacity-90"
              }`}
            >
              הכל
            </button>
            {MACHINE_TYPES.filter((type) =>
              availableMachineTypes.includes(type.value.toLowerCase())
            ).map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedMachineType(type.value)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedMachineType === type.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:opacity-90"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Machine Type Title */}
      {user?.role === "mat" ? (
        <h2 className="text-2xl font-semibold mb-4">מזרן</h2>
      ) : selectedMachineType ? (
        <h2 className="text-2xl font-semibold mb-4">
          {getMachineTypeLabel(selectedMachineType)}
        </h2>
      ) : null}

      {/* Exercises Grid */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {exercises.length === 0
              ? "אין תרגילים זמינים"
              : "לא נמצאו תרגילים המתאימים לסינון"}
          </p>
          {isAdmin() && exercises.length === 0 && (
            <p className="text-sm text-muted-foreground">
              לחץ על "סנכרן מגיליון" כדי לטעון תרגילים מ-Google Sheets
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => {
            const videoId = extractVideoId(exercise.Video_URL);
            const thumbnailUrl = videoId
              ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
              : null;

            return (
              <Link
                key={exercise._id}
                to={`/video-player/${exercise._id}`}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                style={{
                  borderColor: "#cadbcb",
                  backgroundColor: "hsl(290, 20%, 98.2%)",
                }}
              >
                <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={exercise.Name}
                      className="w-full h-full object-cover"
                    />
                  ) : exercise.Image_URL ? (
                    <img
                      src={exercise.Image_URL}
                      alt={exercise.Name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground">סרטון לא קיים</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{exercise.Name}</h3>
                  {/* {exercise.Exercise_move && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {exercise.Exercise_move}
                    </p>
                  )} */}
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {exercise.Level && <span>level: {exercise.Level}</span>}
                    {exercise.Repetitions && (
                      <span>• סדרה: {exercise.Series}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Filter Sidebar */}
      {isFilterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsFilterOpen(false)}
          />
          {/* Sidebar */}
          <div
            className="fixed top-0 right-0 h-full w-80 bg-white border-l z-50 shadow-xl transition-transform duration-300 ease-in-out"
            style={{ borderColor: "#cadbcb" }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">סינון לפי רמה</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                {LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(level.value)}
                      onChange={() => handleLevelToggle(level.value)}
                      className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                    />
                    <span>{level.label}</span>
                  </label>
                ))}
              </div>
              {selectedLevels.length > 0 && (
                <button
                  onClick={() => setSelectedLevels([])}
                  className="mt-6 w-full px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  נקה סינון
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Feed;
