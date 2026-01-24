import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient, type Exercise } from "../lib/api";

function VideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadExercise();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadExercise = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await apiClient.getExercise(id);
      setExercise(data);
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת התרגיל");
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url: string | undefined): string | null => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (loading) {
    return (
      <div
        className="container mx-auto px-4 py-8"
        style={{ backgroundColor: "#ece8ed" }}
      >
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div
        className="container mx-auto px-4 py-8"
        style={{ backgroundColor: "#ece8ed" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-xl font-semibold mb-2 text-destructive">
              {error || "תרגיל לא נמצא"}
            </p>
            <button
              onClick={() => navigate("/feed")}
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90"
            >
              חזור לרשימת התרגילים
            </button>
          </div>
        </div>
      </div>
    );
  }

  const videoId = extractVideoId(exercise.Video_URL);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{ backgroundColor: "#ece8ed" }}
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          חזור לרשימת התרגילים ←
        </button>

        {/* Video Section - Only show if Video_URL exists */}
        {exercise.Video_URL && embedUrl && (
          <div
            className="aspect-video bg-muted rounded-lg mb-6 overflow-hidden"
            style={{ border: "3px solid #333366" }}
          >
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title={exercise.Name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {/* Image Section - Show if no video but has image */}
        {!exercise.Video_URL && exercise.Image_URL && (
          <div className="aspect-video bg-muted rounded-lg mb-6 overflow-hidden">
            <img
              src={exercise.Image_URL}
              alt={exercise.Name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-2" dir="ltr">
            <span className="w-1 h-6 bg-current rounded-full"></span>
            {exercise.Name}
          </h1>
            <hr className="border-current mb-4" />
          {exercise.Exercise_move && (
            <>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <span className="w-1 h-4 bg-current rounded-full"></span>
                    מהלך התרגיל:
                </h3>
              <p className="text-black">
                {exercise.Exercise_move}
              </p>
              <hr className="border-current mb-4" />
            </>
          )}
          <div className="space-y-4">
            {exercise.Machine_setup && (
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <span className="w-1 h-4 bg-current rounded-full"></span>
                  הגדרת מכונה:
                </h3>
                <p className="text-m  text-black">
                  {exercise.Machine_setup}
                </p>
                <hr className="border-current mb-4" />
              </div>
            )}
            {exercise.Cues && (
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <span className="w-1 h-4 bg-current rounded-full"></span>
                  דגשים:
                </h3>
                <p className="text-m  text-black">{exercise.Cues}</p>
                <hr className="border-current mb-4" />
              </div>
            )}
            {exercise.Modifications && (
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <span className="w-1 h-4 bg-current rounded-full"></span>
                  מודיפיקציות:
                </h3>
                <p className="text-m  text-black">
                  {exercise.Modifications}
                </p>
                <hr className="border-current mb-4" />
              </div>
            )}
            {exercise.Contraindications && (
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <span className="w-1 h-4 bg-current rounded-full"></span>
                  קונטראנידיקציות:
                </h3>
                <p className="text-m  text-black">
                  {exercise.Contraindications}
                </p>
                <hr className="border-current mb-4" />
              </div>
            )}
            {exercise.Peel_backs && (
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <span className="w-1 h-4 bg-current rounded-full"></span>
                  Peel Backs:
                </h3>
                <p className="text-m  text-black">
                  {exercise.Peel_backs}
                </p>
                <hr className="border-current mb-4" />
              </div>
            )}
            {exercise.Strengthen && (
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <span className="w-1 h-4 bg-current rounded-full"></span>
                  חיזוק:
                </h3>
                <p className="text-m  text-black">
                  {exercise.Strengthen}
                </p>
                <hr className="border-current mb-4" />
              </div>
            )}
            {exercise.Stretch && (
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <span className="w-1 h-4 bg-current rounded-full"></span>
                  מתיחה:
                </h3>
                <p className="text-m  text-black">
                  {exercise.Stretch}
                </p>
                <hr className="border-current mb-4" />
              </div>
            )}
            {exercise.Series && (
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <span className="w-1 h-4 bg-current rounded-full"></span>
                  סדרה:
                </h3>
                <p className="text-sm  text-black">
                  {exercise.Series}
                </p>
              </div>
            )}
            <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
              {exercise.Level && <span>• רמה: {exercise.Level}</span>}
              {exercise.Repetitions && (
                <span>• חזרות: {exercise.Repetitions}</span>
              )}
              {exercise.Page && <span>• עמוד: {exercise.Page}</span>}
              {exercise.Machine_type && <span>• {exercise.Machine_type}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
