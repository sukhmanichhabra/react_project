document.addEventListener("DOMContentLoaded", function () {
  // Initialize Quill editor
  const quill = new Quill("#editor-container", {
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["link", "image"],
        ["clean"],
      ],
    },
    placeholder: "Write your blog content here...",
    theme: "snow",
  });

  // Form validation
  const blogForm = document.getElementById("blogForm");
  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");
  const contentInput = document.getElementById("content");
  const tagCheckboxes = document.querySelectorAll('input[name="tags"]');
  const dateInput = document.getElementById("createdOn");
  const imageInput = document.getElementById("image");
  const imagePreview = document.getElementById("imagePreview");

  // Image preview
  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, JPG, or GIF)");
        this.value = "";
        document.querySelector(".file-text").textContent = "Choose an image";
        return;
      }

      if (file.size > maxSize) {
        alert("Image size must be less than 5MB");
        this.value = "";
        document.querySelector(".file-text").textContent = "Choose an image";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">
                                                <span class="remove-image" title="Remove image">×</span>`;

        // Add event listener to remove button
        document
          .querySelector(".remove-image")
          .addEventListener("click", function (e) {
            e.preventDefault();
            imagePreview.innerHTML = "";
            imageInput.value = "";
            document.querySelector(".file-text").textContent =
              "Choose an image";
          });
      };
      reader.readAsDataURL(file);
      document.querySelector(".file-text").textContent = file.name;
    }
  });

  // Update hidden content field with Quill content before submit
  blogForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate form
    let isValid = true;

    // Title validation
    if (!titleInput.value.trim() || titleInput.value.length < 5) {
      document.getElementById("title-validation").textContent =
        "Title must be at least 5 characters";
      titleInput.classList.add("invalid");
      isValid = false;
    } else if (titleInput.value.length > 100) {
      document.getElementById("title-validation").textContent =
        "Title must not exceed 100 characters";
      titleInput.classList.add("invalid");
      isValid = false;
    } else {
      document.getElementById("title-validation").textContent = "";
      titleInput.classList.remove("invalid");
    }

    // Author validation
    if (!authorInput.value.trim() || authorInput.value.length < 2) {
      document.getElementById("author-validation").textContent =
        "Author name is required (minimum 2 characters)";
      authorInput.classList.add("invalid");
      isValid = false;
    } else if (authorInput.value.length > 50) {
      document.getElementById("author-validation").textContent =
        "Author name must not exceed 50 characters";
      authorInput.classList.add("invalid");
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(authorInput.value.trim())) {
      document.getElementById("author-validation").textContent =
        "Author name can only contain letters and spaces";
      authorInput.classList.add("invalid");
      isValid = false;
    } else {
      document.getElementById("author-validation").textContent = "";
      authorInput.classList.remove("invalid");
    }

    // Tags validation
    let tagsChecked = false;
    const selectedTags = [];
    tagCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        tagsChecked = true;
        selectedTags.push(checkbox.value);
      }
    });

    if (!tagsChecked) {
      document.getElementById("tags-validation").textContent =
        "Select at least one tag";
      isValid = false;
    } else {
      document.getElementById("tags-validation").textContent = "";
    }

    // Date validation
    if (!dateInput.value) {
      document.getElementById("date-validation").textContent =
        "Publication date is required";
      dateInput.classList.add("invalid");
      isValid = false;
    } else {
      const selectedDate = new Date(dateInput.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        document.getElementById("date-validation").textContent =
          "Publication date cannot be in the past";
        dateInput.classList.add("invalid");
        isValid = false;
      } else {
        document.getElementById("date-validation").textContent = "";
        dateInput.classList.remove("invalid");
      }
    }

    // Image validation (optional but with constraints if provided)
    if (imageInput.files.length > 0) {
      const file = imageInput.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, JPG, or GIF)");
        imageInput.value = "";
        imagePreview.innerHTML = "";
        document.querySelector(".file-text").textContent = "Choose an image";
        isValid = false;
      } else if (file.size > maxSize) {
        alert("Image size must be less than 5MB");
        imageInput.value = "";
        imagePreview.innerHTML = "";
        document.querySelector(".file-text").textContent = "Choose an image";
        isValid = false;
      }
    }

    // Content validation
    const quillContent = quill.root.innerHTML;
    if (quill.getText().trim().length < 50) {
      document.getElementById("content-validation").textContent =
        "Content must be at least 50 characters";
      document.querySelector(".ql-editor").classList.add("invalid-editor");
      isValid = false;
    } else {
      document.getElementById("content-validation").textContent = "";
      document.querySelector(".ql-editor").classList.remove("invalid-editor");
      // Set the content value here, but don't rely on the required attribute
      contentInput.value = quillContent;
    }

    // Submit if valid
    if (isValid) {
      // Show loading state
      const submitBtn = document.getElementById("submitBtn");
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Publishing...';
      submitBtn.disabled = true;

      // Use FormData to handle file uploads
      const formData = new FormData(blogForm);

      // Add content from Quill editor
      formData.set("content", quillContent);

      // Submit via XMLHttpRequest
      const xhr = new XMLHttpRequest();

      xhr.open("POST", "/blog/add", true);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.success) {
                // Redirect to blog list page
                window.location.href =
                  "/blog_list?success=Blog post published successfully";
              } else {
                // Show error
                alert("Error: " + (data.error || "Failed to publish blog"));
                submitBtn.innerHTML =
                  '<i class="fas fa-paper-plane"></i> Publish Blog';
                submitBtn.disabled = false;
              }
            } catch (error) {
              console.error("JSON Parse Error:", error);
              alert("Invalid response from server");
              submitBtn.innerHTML =
                '<i class="fas fa-paper-plane"></i> Publish Blog';
              submitBtn.disabled = false;
            }
          } else {
            console.error("HTTP Error:", xhr.status, xhr.statusText);
            alert("Server error: " + xhr.status + " " + xhr.statusText);
            submitBtn.innerHTML =
              '<i class="fas fa-paper-plane"></i> Publish Blog';
            submitBtn.disabled = false;
          }
        }
      };

      xhr.onerror = function () {
        console.error("Network Error");
        alert("Network error occurred while publishing the blog");
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish Blog';
        submitBtn.disabled = false;
      };

      xhr.send(formData);
    } else {
      // Scroll to first error
      const firstError = document.querySelector(
        ".validation-message:not(:empty)"
      );
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });

  // Input validation on change
  titleInput.addEventListener("input", function () {
    const value = this.value.trim();
    if (value.length >= 5 && value.length <= 100) {
      document.getElementById("title-validation").textContent = "";
      this.classList.remove("invalid");
    } else if (value.length > 0 && value.length < 5) {
      document.getElementById("title-validation").textContent =
        "Title must be at least 5 characters";
      this.classList.add("invalid");
    } else if (value.length > 100) {
      document.getElementById("title-validation").textContent =
        "Title must not exceed 100 characters";
      this.classList.add("invalid");
    }
  });

  authorInput.addEventListener("input", function () {
    const value = this.value.trim();
    if (
      value.length >= 2 &&
      value.length <= 50 &&
      /^[a-zA-Z\s]+$/.test(value)
    ) {
      document.getElementById("author-validation").textContent = "";
      this.classList.remove("invalid");
    } else if (value.length > 0 && value.length < 2) {
      document.getElementById("author-validation").textContent =
        "Author name must be at least 2 characters";
      this.classList.add("invalid");
    } else if (value.length > 50) {
      document.getElementById("author-validation").textContent =
        "Author name must not exceed 50 characters";
      this.classList.add("invalid");
    } else if (value.length > 0 && !/^[a-zA-Z\s]+$/.test(value)) {
      document.getElementById("author-validation").textContent =
        "Author name can only contain letters and spaces";
      this.classList.add("invalid");
    }
  });

  dateInput.addEventListener("change", function () {
    if (this.value) {
      const selectedDate = new Date(this.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate >= today) {
        document.getElementById("date-validation").textContent = "";
        this.classList.remove("invalid");
      } else {
        document.getElementById("date-validation").textContent =
          "Publication date cannot be in the past";
        this.classList.add("invalid");
      }
    }
  });

  tagCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      let anyChecked = false;
      tagCheckboxes.forEach((cb) => {
        if (cb.checked) anyChecked = true;
      });

      if (anyChecked) {
        document.getElementById("tags-validation").textContent = "";
      }
    });
  });

  // Tooltip functionality
  const tooltips = document.querySelectorAll(".tooltip");
  tooltips.forEach((tooltip) => {
    tooltip.addEventListener("mouseenter", function () {
      const tooltipText = this.getAttribute("data-tooltip");
      const tooltipEl = document.createElement("div");
      tooltipEl.className = "tooltip-text";
      tooltipEl.textContent = tooltipText;
      this.appendChild(tooltipEl);
    });

    tooltip.addEventListener("mouseleave", function () {
      const tooltipText = this.querySelector(".tooltip-text");
      if (tooltipText) {
        tooltipText.remove();
      }
    });
  });

  // Animation on scroll
  const animateOnScroll = function () {
    const elements = document.querySelectorAll(".form-group, .form-row");
    elements.forEach((element) => {
      const position = element.getBoundingClientRect();
      if (position.top < window.innerHeight && position.bottom >= 0) {
        element.classList.add("animate_animated", "animate_fadeIn");
      }
    });
  };

  window.addEventListener("scroll", animateOnScroll);
});
