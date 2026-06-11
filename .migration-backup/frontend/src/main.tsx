import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App'; // Assuming App.tsx is your main component
import { AuthProvider } from './context/AuthContext'; // Assuming you have an AuthContext

function Root() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/*" element={<App />} />
          {/* Add other routes here, e.g., login, register, etc. */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default Root;
