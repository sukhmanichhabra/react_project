import React, { useState, useEffect } from 'react';
import './ChatbotAdmin.css';

const ChatbotAdmin = () => {
  const [qas, setQas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQA, setSelectedQA] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    priority: 0,
    keywords: '',
    isActive: true,
  });

  const categoryList = [
    { id: 'general', name: 'General Questions' },
    { id: 'property', name: 'Property' },
    { id: 'buying', name: 'Buying' },
    { id: 'selling', name: 'Selling' },
    { id: 'renting', name: 'Renting' },
    { id: 'loan', name: 'Loans' },
    { id: 'agent', name: 'Agents' },
    { id: 'account', name: 'Account' },
  ];

  useEffect(() => {
    document.title = 'Chatbot Q&A Management';
    fetchQAs();
    setCategories(categoryList);
  }, []);

  const fetchQAs = async (category = null) => {
    try {
      setLoading(true);
      const url = category
        ? `/api/chatbot/admin?category=${category}`
        : '/api/chatbot/admin';
      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();

      if (data.success) {
        setQas(data.data.qas || []);
        setCurrentCategory(category);
      }
    } catch (error) {
      console.error('Error fetching QAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (categoryId) => {
    fetchQAs(categoryId);
  };

  const handleAddQA = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/chatbot/admin/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert('Question added successfully!');
        setShowAddModal(false);
        setFormData({
          question: '',
          answer: '',
          category: '',
          priority: 0,
          keywords: '',
          isActive: true,
        });
        fetchQAs(currentCategory);
      } else {
        alert('Failed to add question');
      }
    } catch (error) {
      console.error('Error adding QA:', error);
      alert('Error adding question');
    }
  };

  const handleEditQA = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/chatbot/admin/update/${selectedQA._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert('Question updated successfully!');
        setShowEditModal(false);
        setSelectedQA(null);
        setFormData({
          question: '',
          answer: '',
          category: '',
          priority: 0,
          keywords: '',
          isActive: true,
        });
        fetchQAs(currentCategory);
      } else {
        alert('Failed to update question');
      }
    } catch (error) {
      console.error('Error updating QA:', error);
      alert('Error updating question');
    }
  };

  const handleDeleteQA = async () => {
    try {
      const response = await fetch(`/api/chatbot/admin/delete/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        alert('Question deleted successfully!');
        setShowDeleteModal(false);
        setDeleteId(null);
        fetchQAs(currentCategory);
      } else {
        alert('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting QA:', error);
      alert('Error deleting question');
    }
  };

  const openEditModal = (qa) => {
    setSelectedQA(qa);
    setFormData({
      question: qa.question,
      answer: qa.answer,
      category: qa.category,
      priority: qa.priority,
      keywords: qa.keywords ? qa.keywords.join(', ') : '',
      isActive: qa.isActive,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (qa) => {
    setDeleteId(qa._id);
    setShowDeleteModal(true);
  };

  const filteredQAs = qas.filter(
    (qa) =>
      qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qa.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryStats = {};
  categoryList.forEach((cat) => {
    categoryStats[cat.id] = qas.filter((qa) => qa.category === cat.id).length;
  });

  if (loading) {
    return (
      <div className="chatbot-admin-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h3>Chatbot Q&A Management</h3>
          <p>Manage questions and answers for the AI chatbot assistant. Organize them by category and set priority to control which answers appear first.</p>
        </div>

        <div className="admin-layout">
          {/* Sidebar */}
          <div className="admin-sidebar">
            <div className="sidebar-card">
              <div className="card-header">
                <h5>Categories</h5>
              </div>
              <div className="list-group">
                <button
                  className={`list-group-item ${!currentCategory ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter(null)}
                >
                  All Categories
                </button>
                {categoryList.map((cat) => (
                  <button
                    key={cat.id}
                    className={`list-group-item ${currentCategory === cat.id ? 'active' : ''}`}
                    onClick={() => handleCategoryFilter(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-card">
              <div className="card-header">
                <h5>Add New Q&A</h5>
              </div>
              <div className="card-body">
                <button className="btn btn-primary w-100" onClick={() => setShowAddModal(true)}>
                  <i className="fas fa-plus-circle"></i> Add New Question
                </button>
              </div>
            </div>

            <div className="sidebar-card">
              <div className="card-header">
                <h5>Statistics</h5>
              </div>
              <div className="card-body">
                <div className="stat-item">
                  <span>Total Q&A Entries:</span>
                  <span className="stat-value">{qas.length}</span>
                </div>
                {categoryList.map((cat) => (
                  <div key={cat.id} className="stat-item">
                    <span>{cat.name}:</span>
                    <span className="stat-value">{categoryStats[cat.id]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="admin-main">
            <div className="content-card">
              <div className="card-header">
                <h5>
                  {currentCategory
                    ? `Questions in ${categoryList.find((c) => c.id === currentCategory)?.name}`
                    : 'All Questions and Answers'}
                </h5>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button>
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="qa-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Question</th>
                      <th style={{ width: '30%' }}>Answer</th>
                      <th style={{ width: '10%' }}>Category</th>
                      <th style={{ width: '10%' }}>Priority</th>
                      <th style={{ width: '10%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQAs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center">
                          <div className="empty-state">
                            <i className="fas fa-info-circle"></i>
                            <p>No Q&A entries found. Add your first question using the button on the left.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredQAs.map((qa) => (
                        <tr key={qa._id} className={!qa.isActive ? 'inactive' : ''}>
                          <td>
                            {qa.question}
                            {!qa.isActive && <span className="badge">Inactive</span>}
                          </td>
                          <td className="truncate">{qa.answer}</td>
                          <td>
                            <span className="category-badge">{qa.category}</span>
                          </td>
                          <td>{qa.priority}</td>
                          <td>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-edit"
                                onClick={() => openEditModal(qa)}
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-delete"
                                onClick={() => openDeleteModal(qa)}
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add QA Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Add New Question & Answer</h5>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddQA}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Question</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Answer</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {categoryList.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    />
                    <small>Higher numbers appear first (0-10)</small>
                  </div>
                </div>
                <div className="form-group">
                  <label>Keywords (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  />
                  <small>Optional: Words that help match this question</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit QA Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Edit Question & Answer</h5>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditQA}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Question</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Answer</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {categoryList.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    />
                    <small>Higher numbers appear first (0-10)</small>
                  </div>
                </div>
                <div className="form-group">
                  <label>Keywords (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  />
                  <small>Optional: Words that help match this question</small>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                  <small>When inactive, this Q&A won't be shown in search results</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Confirm Deletion</h5>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this question and answer?</p>
              <p className="warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteQA}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotAdmin;
