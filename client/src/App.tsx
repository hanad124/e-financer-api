import "./App.css";

import {
  // BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import VerifyEmail from "./components/VerifyEmail";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <Routes>
      <Route path="/verifyemail/:id" element={<VerifyEmail />} />
      <Route path="/resetpassword/:id" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;

// {isVerificationPage ? (
//   <Route path="/verifyemail/:id" element={<VerifyEmail />} />
// ) : (
//   <Route path="*" element={<Navigate to="/verifyemail/:id" />} />
// )}{" "}
