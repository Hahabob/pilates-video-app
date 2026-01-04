import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          ברוכים הבאים לאפליקציית פילאטיס
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          גלו את אימון הפילאטיס המושלם עבורכם
        </p>
        <div className="mb-8">
          <Link
            to="/sign-in"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-lg"
          >
            התחבר כדי להתחיל
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">מתחילים</h2>
            <p className="text-muted-foreground">התחילו את מסע הפילאטיס שלכם</p>
          </div>
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">בינוני</h2>
            <p className="text-muted-foreground">שפרו את התרגול שלכם</p>
          </div>
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">מתקדמים</h2>
            <p className="text-muted-foreground">שלטו בטכניקה שלכם</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
