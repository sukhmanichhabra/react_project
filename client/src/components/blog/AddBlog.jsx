import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "./partials/BlogForm.css";

const AddBlog = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    tags: [],
    createdOn: new Date().toISOString().split("T")[0],
    image: null,
    content: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [validation, setValidation] = useState({});
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Initialize Quill editor
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ color: [] }, { background: [] }],
            ["link", "image"],
            ["clean"],
          ],
        },
        placeholder: "Write your blog content here...",
      });

      quillRef.current.on("text-change", () => {
        const content = quillRef.current.root.innerHTML;
        setFormData((prev) => ({ ...prev, content }));
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation message for this field
    if (validation[name]) {
      setValidation((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTagChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      tags: checked
        ? [...prev.tags, value]
        : prev.tags.filter((tag) => tag !== value),
    }));

    if (validation.tags) {
      setValidation((prev) => ({ ...prev, tags: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setValidation((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidation((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setValidation((prev) => ({ ...prev, image: "" }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    document.getElementById("image").value = "";
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title || formData.title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters long";
    }

    if (!formData.author || formData.author.trim().length < 2) {
      errors.author = "Author name must be at least 2 characters long";
    }

    if (formData.tags.length === 0) {
      errors.tags = "Please select at least one tag";
    }

    if (!formData.createdOn) {
      errors.createdOn = "Please select a publication date";
    }

    const textContent = quillRef.current?.getText().trim();
    if (!textContent || textContent.length < 50) {
      errors.content = "Content must be at least 50 characters long";
    }

    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({
        type: "error",
        message: "Please fix the errors before submitting",
      });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("author", formData.author);
      formData.tags.forEach((tag) => submitData.append("tags", tag));
      submitData.append("createdOn", formData.createdOn);
      submitData.append("content", formData.content);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const response = await axios.post("/api/blog/add", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setAlert({
          type: "success",
          message: "Blog post created successfully!",
        });
        setTimeout(() => {
          navigate("/blogs");
        }, 2000);
      } else {
        setAlert({
          type: "error",
          message: response.data.error || "Failed to create blog post",
        });
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      setAlert({
        type: "error",
        message:
          error.response?.data?.error ||
          "An error occurred while creating the blog post",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="blg-form-page">
      <div className="blg-form-wrapper">
        <div className="blg-form-page-header animate__animated animate__fadeIn">
          <h1>
            <i className="fas fa-edit"></i> Add New Blog Post
          </h1>
          <p>Create engaging content for your audience</p>
        </div>

        <div className="blg-form-container animate__animated animate__fadeInUp animate__delay-1s">
          <form onSubmit={handleSubmit} className="blg-form">
            {alert && (
              <div className={`blg-form-alert blg-form-alert-${alert.type}`}>
                <i
                  className={`fas ${
                    alert.type === "success"
                      ? "fa-check-circle"
                      : "fa-exclamation-circle"
                  }`}
                ></i>
                {alert.message}
              </div>
            )}

            <div className="blg-form-group animate__animated animate__fadeInLeft animate__delay-1s">
              <label htmlFor="title">
                Title <span className="blg-form-required">*</span>
                <span
                  className="blg-form-tooltip"
                  data-tooltip="Enter a descriptive title for your blog post"
                >
                  <i className="fas fa-question-circle"></i>
                </span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                minLength="5"
                maxLength="100"
                placeholder="Enter blog title"
                className={`blg-form-input-field ${
                  validation.title ? "blg-form-invalid" : ""
                }`}
              />
              {validation.title && (
                <div className="blg-form-validation-message">
                  {validation.title}
                </div>
              )}
            </div>

            <div className="blg-form-group animate__animated animate__fadeInRight animate__delay-1s">
              <label htmlFor="author">
                Author <span className="blg-form-required">*</span>
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                minLength="2"
                maxLength="50"
                placeholder="Enter author name"
                className={`blg-form-input-field ${
                  validation.author ? "blg-form-invalid" : ""
                }`}
              />
              {validation.author && (
                <div className="blg-form-validation-message">
                  {validation.author}
                </div>
              )}
            </div>

            <div className="blg-form-row animate__animated animate__fadeInLeft animate__delay-2s">
              <div className="blg-form-group">
                <label>
                  Tags <span className="blg-form-required">*</span>
                  <span
                    className="blg-form-tooltip"
                    data-tooltip="Select at least one category for your blog"
                  >
                    <i className="fas fa-question-circle"></i>
                  </span>
                </label>
                <div className="blg-form-tag-container">
                  <div className="blg-form-tag-option">
                    <input
                      type="checkbox"
                      id="residential"
                      name="tags"
                      value="residential"
                      checked={formData.tags.includes("residential")}
                      onChange={handleTagChange}
                    />
                    <label htmlFor="residential" className="blg-form-tag-label">
                      <i className="fas fa-home"></i> Residential
                    </label>
                  </div>
                  <div className="blg-form-tag-option">
                    <input
                      type="checkbox"
                      id="commercial"
                      name="tags"
                      value="commercial"
                      checked={formData.tags.includes("commercial")}
                      onChange={handleTagChange}
                    />
                    <label htmlFor="commercial" className="blg-form-tag-label">
                      <i className="fas fa-building"></i> Commercial
                    </label>
                  </div>
                  <div className="blg-form-tag-option">
                    <input
                      type="checkbox"
                      id="investment"
                      name="tags"
                      value="investment"
                      checked={formData.tags.includes("investment")}
                      onChange={handleTagChange}
                    />
                    <label htmlFor="investment" className="blg-form-tag-label">
                      <i className="fas fa-chart-line"></i> Investment
                    </label>
                  </div>
                  <div className="blg-form-tag-option">
                    <input
                      type="checkbox"
                      id="market-trends"
                      name="tags"
                      value="market-trends"
                      checked={formData.tags.includes("market-trends")}
                      onChange={handleTagChange}
                    />
                    <label
                      htmlFor="market-trends"
                      className="blg-form-tag-label"
                    >
                      <i className="fas fa-chart-bar"></i> Market Trends
                    </label>
                  </div>
                </div>
                {validation.tags && (
                  <div className="blg-form-validation-message">
                    {validation.tags}
                  </div>
                )}
              </div>

              <div className="blg-form-group">
                <label htmlFor="createdOn">
                  Publication Date <span className="blg-form-required">*</span>
                </label>
                <input
                  type="date"
                  id="createdOn"
                  name="createdOn"
                  value={formData.createdOn}
                  onChange={handleInputChange}
                  required
                  className={`blg-form-input-field ${
                    validation.createdOn ? "blg-form-invalid" : ""
                  }`}
                />
                {validation.createdOn && (
                  <div className="blg-form-validation-message">
                    {validation.createdOn}
                  </div>
                )}
              </div>
            </div>

            <div className="blg-form-group animate__animated animate__fadeInUp animate__delay-2s">
              <label htmlFor="image">
                Featured Image
                <span
                  className="blg-form-tooltip"
                  data-tooltip="Upload a high-quality image for your blog post"
                >
                  <i className="fas fa-question-circle"></i>
                </span>
              </label>
              <div className="blg-form-file-upload">
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="blg-form-file-input"
                />
                <label htmlFor="image" className="blg-form-file-label">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span className="file-text">Choose an image</span>
                </label>
                {imagePreview && (
                  <div className="blg-form-file-preview" id="imagePreview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="blg-form-remove-image"
                      onClick={removeImage}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              {validation.image && (
                <div className="blg-form-validation-message">
                  {validation.image}
                </div>
              )}
            </div>

            <div className="blg-form-group animate__animated animate__fadeInUp animate__delay-3s">
              <label htmlFor="content">
                Content <span className="blg-form-required">*</span>
                <span
                  className="blg-form-tooltip"
                  data-tooltip="Write your blog content here. Rich text formatting is supported."
                >
                  <i className="fas fa-question-circle"></i>
                </span>
              </label>
              <div ref={editorRef} id="blg-form-editor-container"></div>
              {validation.content && (
                <div className="blg-form-validation-message">
                  {validation.content}
                </div>
              )}
            </div>

            <div className="blg-form-actions animate__animated animate__fadeInUp animate__delay-3s">
              <button
                type="button"
                className="blg-form-btn blg-form-btn-secondary"
                onClick={() => navigate("/")}
              >
                <i className="fas fa-arrow-left"></i> Cancel
              </button>
              <button
                type="submit"
                className="blg-form-btn blg-form-btn-primary"
                disabled={isSubmitting}
              >
                <i className="fas fa-paper-plane"></i>{" "}
                {isSubmitting ? "Publishing..." : "Publish Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBlog;
