import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // To get the token from the URL
import { resetPassword } from '../services/authService'; // Import the reset password service
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const NewPassword = () => {
    const { token } = useParams(); // Get the token from the URL
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await resetPassword(token, password); // API call to reset password
            
            if (response.error) {
                // Display error toast if token is invalid
                toast.error('Invalid token. Please try again.', {
                    position: 'top-right',
                    autoClose: 4000,
                    style: { backgroundColor: 'white', color: 'red' },
                });
            } else {
                // Display success toast for successful password reset
                toast.success('Password reset successfully!', {
                    position: 'top-right',
                    autoClose: 4000,
                    style: { backgroundColor: 'white', color: 'green' },
                });
            }
        } catch (error) {
            console.error('Error resetting password:', error.message);

            // Display error toast for unexpected errors
            toast.error('Invalid token . Please request another reset link.', {
                position: 'top-right',
                autoClose: 4000,
                style: { backgroundColor: 'white', color: 'red' },
            });
        }
    };

    return (
        <div className="form-container">
            <h2>Set New Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Reset Password</button>
            </form>

            {/* ToastContainer to render the toast notifications */}
            <ToastContainer />
        </div>
    );
};

export default NewPassword;

