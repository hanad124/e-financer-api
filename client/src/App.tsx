import "./App.css";

import {
  // BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import VerifyEmail from "./components/VerifyEmail";

function App() {
  const location = useLocation();

  const isVerificationPage = /^\/verifyemail\/[^/]+$/.test(location.pathname);

  return (
    <Routes>
      {isVerificationPage ? (
        <Route path="/verifyemail/:id" element={<VerifyEmail />} />
      ) : (
        <Route path="*" element={<Navigate to="/verifyemail/:id" />} />
      )}{" "}
    </Routes>
  );
}

export default App;
