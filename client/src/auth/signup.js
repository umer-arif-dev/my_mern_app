import { useFormik } from 'formik';
import * as Yup from 'yup';
import { signupUser } from '../services/authService'; // Import the signup API call
import { Link, useNavigate } from 'react-router-dom'; // Import Link for navigation and useNavigate for redirection
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for Toastify

const Signup = () => {
  //const [successPopup, setSuccessPopup] = useState(false); // Success popup state
  const navigate = useNavigate(); // Hook for programmatic navigation

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().matches('(com|net)$',"invalid email format").email('Invalid email format').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    }),
    onSubmit: async (values) => {
      try {
        // Call the signup API
        const response = await signupUser(values.name, values.email, values.password);

        // Store JWT token in localStorage on successful signup
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Display the success toast notification with green background and bright yellow text
        toast.success("User registered successfully!", {
          position: "top-right",
          autoClose: 4000,
          style: { backgroundColor: 'white', color: 'green' } // White text
// OR
          

        });

        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (err) {
        console.error("Error response:", err.message); // Log error message for debugging
        formik.setFieldError('email', 'email already exists'); // Display error under email field
        
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="form-container">
      <h2>Sign Up</h2>
      
      <input
        type="text"
        name="name"
        placeholder="Name"
        onChange={formik.handleChange}
        value={formik.values.name}
        onBlur={formik.handleBlur}
      />
      {formik.touched.name && formik.errors.name && <div className="error-message">{formik.errors.name}</div>}
      
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={formik.handleChange}
        value={formik.values.email}
        onBlur={formik.handleBlur}
      />
      {formik.touched.email && formik.errors.email && <div className="error-message">{formik.errors.email}</div>}
      {formik.touched.email && formik.errors.email === 'User already exists' && (
        <div className="error-message">{formik.errors.email}</div>
      )}

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={formik.handleChange}
        value={formik.values.password}
        onBlur={formik.handleBlur}
      />
      {formik.touched.password && formik.errors.password && <div className="error-message">{formik.errors.password}</div>}

      <button type="submit">Sign Up</button>

      <p>Already have an account? <Link to="/login">Login</Link></p>

      {/* ToastContainer to render the toast notifications */}
      <ToastContainer />
    </form>
  );
};

export default Signup;