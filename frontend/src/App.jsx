import AppRouter from "./router/AppRouter";
import { ThemeProvider } from "./context/ThemeContext"; 

export default function App() {
  return (
    // Provide one shared theme source so route changes do not reset dark/light mode.
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
        <AppRouter />
      </div>
    </ThemeProvider>
  );
}
