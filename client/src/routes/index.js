import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../auth/login';
import Signup from '../auth/signup';
import Dashboard from '../dashboard/dashboard';
import ProtectedRoute from '../components/ProtectedRoutes';
import ResetPassword from '../auth/ResetPassword';
import NewPassword from '../auth/NewPassword';
import '../App.css';


const App = () => {
    const isLoggedIn = !!localStorage.getItem('token'); // Check if the user is logged in

    return (
        <Router>
            <div className="app-container">
                <div className="auth-container">
                    <Routes>
                        {/* Redirect logged-in users from login/signup to dashboard */}
                        <Route 
                            path="/login" 
                            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} 
                        />
                        <Route 
                            path="/signup" 
                            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Signup />} 
                        />



                               <Route 
                            path="/forget-password" 
                            element={isLoggedIn ? <Navigate to="/forget-password" /> : <ResetPassword />} 
                        />  
                      
                                 <Route 
                               path="/reset-password/:token" 
                               element={isLoggedIn ? <Navigate to="/dashboard" /> : <NewPassword />} 
                                />


                      
                       
                        {/* Protected Route for Dashboard */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route 
                                 path="*" 
                       element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} 
                          />

                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;