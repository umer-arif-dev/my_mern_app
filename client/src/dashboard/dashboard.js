import React, { useEffect, useState, useCallback } from 'react';
import { logoutUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isEditPopup, setIsEditPopup] = useState(false);
  const [isCreatePopup, setIsCreatePopup] = useState(false); // Added state for create popup
  const [editFormData, setEditFormData] = useState({ title: '', content: '' });
  const [newBlog, setNewBlog] = useState({ title: '', content: '' });
  const [errors, setErrors] = useState({ title: '', content: '' }); 
  const [imageFile, setImageFile] = useState(null); // Add imageFile state
  const [imageError, setImageError] = useState('');


 



  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5); // You can adjust the limit based on your needs

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };


  const fetchBlogs = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/blogs`, {
        params: { page: currentPage, limit: limit }
      });
      setBlogs(response.data.blogs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching blogs:', error.message);
      toast.error('Failed to load blogs.', { position: 'top-right', autoClose: 4000 });
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]); // Include 


  
  const deleteBlog = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You need to login first.', { position: 'top-right', autoClose: 4000 });
        return;
      }

      await axios.delete(`http://localhost:3000/api/blogs/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBlogs(blogs.filter((blog) => blog._id !== id));
      toast.success('Blog deleted successfully!', { position: 'top-right', autoClose: 4000 });
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete the blog.', { position: 'top-right', autoClose: 4000 });
    }
  };

  const handleShow = (blog) => {
    setSelectedBlog(blog);
    setShowPopup(true);
    setIsEditPopup(false);
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setEditFormData({ title: blog.title, content: blog.content });
    setShowPopup(true);
    setIsEditPopup(true);
    setImageFile(null); // Reset the image file state
    setImageError(''); 
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedBlog(null);
    setIsEditPopup(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };


  const handleUpdate = async () => {
    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      toast.error('Fields are invalid. Please fill out all fields.', { position: 'top-right', autoClose: 4000 });
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You need to login first.', { position: 'top-right', autoClose: 4000 });
        return;
      }
  
      const formData = new FormData();
      formData.append('title', editFormData.title);
      formData.append('content', editFormData.content);
      if (imageFile) {
        formData.append('image', imageFile);
      }
  
      const response = await axios.put(
        `http://localhost:3000/api/blogs/update/${selectedBlog._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
  
      setBlogs(
        blogs.map((blog) =>
          blog._id === selectedBlog._id
            ? { ...blog, title: editFormData.title, content: editFormData.content, imageUrl: response.data.imageUrl }
            : blog
        )
      );
  
      toast.success('Blog updated successfully!', { position: 'top-right', autoClose: 4000 });
  
      closePopup();
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Failed to update the blog.', { position: 'top-right', autoClose: 4000 });
    }
  };



  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Check if the file size is greater than 2 MB
      const maxSize = 2 * 1024 * 1024; // 2 MB in bytes
      if (file.size > maxSize) {
        setImageError('Image size exceeds 2 MB. Please choose a smaller file.');
        setImageFile(null); // Clear the image file if size is too large
      } else {
        setImageError(''); // Reset error if file is valid
        setImageFile(file); // Set the image file
      }
    }
  };
  
  
  


  const handleCreateBlog = async () => {



    const newErrors = {
      title: !newBlog.title.trim() ? 'Title is required.' : '',
      content: !newBlog.content.trim() ? 'Content is required.' : '',
      image: !imageFile ? 'Image is required.' : '',
    };
  
    if (newErrors.image) {
      setImageError(newErrors.image); // Set image error if needed
    }
  
    setErrors(newErrors);
  


  // If there are any errors, return early
  if (newErrors.title || newErrors.content || newErrors.image) {
    return;
  }
    // If there are any errors, return early
    if (newErrors.title || newErrors.content || newErrors.image) {
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You need to login first.', { position: 'top-right', autoClose: 4000 });
        return;
      }
  
      const formData = new FormData();
      formData.append('title', newBlog.title);
      formData.append('content', newBlog.content);
      if (imageFile) {
        formData.append('image', imageFile);
      }
  
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/blogs/create`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      toast.success('Blog created successfully!', { position: 'top-right', autoClose: 4000 });
      setNewBlog({ title: '', content: '' });
      setErrors({ title: '', content: '', image: '' });
      setImageFile(null);
      setImageError(''); // Reset error on success
      setIsCreatePopup(false);
      fetchBlogs();
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Failed to create the blog.', { position: 'top-right', autoClose: 4000 });
    }
  };
  
  
  




  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#333' }}>Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            background: '#ff4d4d',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
        <button
          onClick={() => setIsCreatePopup(true)}
          style={{
            background: '#4CAF50',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          Create Blog
        </button>
      </nav>
  
      {isCreatePopup && (
        <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)' }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              width: '400px',
            }}
          >
            <h3>Create Blog</h3>
            <input
              type="text"
              placeholder="Title"
              value={newBlog.title}
              onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
              style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            />
            {errors.title && <p style={{ color: 'red', margin: '0' }}>{errors.title}</p>}
  
            <textarea
              placeholder="Content"
              value={newBlog.content}
              onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
              style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            />
            {errors.content && <p style={{ color: 'red', margin: '0' }}>{errors.content}</p>}
  
            <input
              type="file"
              onChange={handleImageChange}
              style={{ marginBottom: '10px' }}
            />
            {imageFile && <p>Image selected: {imageFile.name}</p>}
            {imageError && <p style={{ color: 'red' }}>{imageError}</p>}
        

  
            <button
              onClick={handleCreateBlog}
              style={{
                background: '#4CAF50',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              Submit
            </button>
            <button
              onClick={() => setIsCreatePopup(false)}
              style={{
                background: '#f44336',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
  
      <section>
        <h2 style={{ marginBottom: '10px' }}>Blog Dashboard</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#f2f2f2', textAlign: 'left' }}>
              <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>ID</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Title</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(blogs) && blogs.length > 0 ? (
              blogs.map((blog) => (
                <tr key={blog._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{blog._id}</td>
                  <td style={{ padding: '10px' }}>{blog.title}</td>
                  <td style={{ padding: '10px' }}>
                    <button
                      onClick={() => handleShow(blog)}
                      style={{
                        background: '#4CAF50',
                        color: '#fff',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        marginRight: '5px',
                        cursor: 'pointer',
                      }}
                    >
                      Show
                    </button>
                    <button
                      onClick={() => handleEdit(blog)}
                      style={{
                        background: '#008CBA',
                        color: '#fff',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        marginRight: '5px',
                        cursor: 'pointer',
                      }}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => deleteBlog(blog._id)}
                      style={{
                        background: '#f44336',
                        color: '#fff',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                  No blogs available
                </td>
              </tr>
            )}
          </tbody>
        </table>
  
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            style={{
              padding: '5px 15px',
              background: '#008CBA',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              marginRight: '10px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Prev
          </button>
          <span style={{ padding: '10px' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: '5px 15px',
              background: '#008CBA',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              marginLeft: '10px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      </section>
  
      {showPopup && (
  <div
    style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <div
      style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '10px',
        width: '500px',
        textAlign: 'center',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      {isEditPopup ? (
        <div>
          <h3>Edit Blog</h3>
          <input
            type="text"
            name="title"
            value={editFormData.title}
            onChange={handleFormChange}
            placeholder="Title"
            style={{
              width: '100%',
              padding: '10px',
              margin: '10px 0',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
          <textarea
            name="content"
            value={editFormData.content}
            onChange={handleFormChange}
            placeholder="Content"
            style={{
              width: '100%',
              padding: '10px',
              margin: '10px 0',
              borderRadius: '5px',
              border: '1px solid #ccc',
              minHeight: '150px',
            }}
          />
          <input
            type="file"
            onChange={handleImageChange}
            style={{ marginBottom: '10px' }}
          />
          {imageFile && <p>Image selected: {imageFile.name}</p>}
          {imageError && <p style={{ color: 'red' }}>{imageError}</p>}
          <button
            onClick={handleUpdate}
            style={{
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Update
          </button>
        </div>
      ) : (
        <div>
          <h3>{selectedBlog?.title}</h3>
          <p
            style={{
              wordWrap: 'break-word',
              maxHeight: '60vh',
              overflowY: 'auto',
              paddingRight: '10px',
            }}
          >
            {selectedBlog?.content}
          </p>
          {selectedBlog?.imageUrl && (
            <img
              src={`${process.env.REACT_APP_BASE_URL}${selectedBlog.imageUrl}`}
              alt="Blog"
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '5px',
                marginBottom: '10px',
              }}
            />
          )}
          <button
            onClick={closePopup}
            style={{
              background: '#f44336',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  </div>
)}




    
            
      <ToastContainer />
    </div>
  );
}
export default Dashboard;  