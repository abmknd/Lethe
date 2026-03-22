import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./context/ThemeContext";
import { ThemeAwareWrapper } from "./components/ThemeAwareWrapper";
import { Toaster } from "sonner";

// Main application component
export default function App() {
  return (
    <ThemeProvider>
      <ThemeAwareWrapper>
        <RouterProvider router={router} />
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#181e18',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '8px 18px',
              fontSize: '12px',
              letterSpacing: '.1em',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </ThemeAwareWrapper>
    </ThemeProvider>
  );
}