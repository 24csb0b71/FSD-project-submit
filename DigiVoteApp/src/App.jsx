import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./protectedRoute";
import Login from "./login";       
import Register from "./register";
import HomePage from "./dashboard";
import Candidates from "./candidate";
import Voting from "./voting";
import Admin from "./admin";
import AdminAnalytics from "./adminAnalytics";
import Results from "./results";
import Otp from "./otp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />  
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
              <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/candidate" element={
          <ProtectedRoute>
              <Candidates />
          </ProtectedRoute>
        } />
        <Route path="/voting" element={
          <ProtectedRoute>
              <Voting />
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute>
              <Results />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
              <Admin />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute adminOnly={true}>
              <AdminAnalytics />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
