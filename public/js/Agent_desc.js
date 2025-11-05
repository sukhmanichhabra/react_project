// Filtering functionality
document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const propertyCards = document.querySelectorAll(".property-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      // Add active class to clicked button
      button.classList.add("active");

      const filterValue = button.getAttribute("data-filter");

      propertyCards.forEach((card) => {
        if (filterValue === "all") {
          card.style.display = "block";
        } else {
          if (card.getAttribute("data-type") === filterValue) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        }
      });
    });
  });
});

// Add this to your existing JavaScript
document.querySelector(".review-sort").addEventListener("change", function (e) {
  const sortValue = e.target.value;
  // Add sorting logic here if needed
  console.log("Sorting by:", sortValue);
});

// Form Validation Functions
document.addEventListener("DOMContentLoaded", function () {
  // Leave a Reply Form Validation
  const reviewForm = document.querySelector(".review-form");
  if (reviewForm) {
    // Real-time validation
    const reviewInputs = reviewForm.querySelectorAll("input, select, textarea");
    reviewInputs.forEach((input) => {
      input.addEventListener("blur", function () {
        validateInput(this, reviewForm);
      });

      // For select elements
      if (input.tagName === "SELECT") {
        input.addEventListener("change", function () {
          validateInput(this, reviewForm);
        });
      }
    });

    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault();

      let isValid = true;
      const title = reviewForm.querySelector('input[type="text"]');
      const rating = reviewForm.querySelector(".rating-select");
      const email = reviewForm.querySelector('input[type="email"]');
      const review = reviewForm.querySelector("textarea");
      const feedbackContainer = reviewForm.querySelector(".form-feedback");

      // Clear previous error messages
      clearErrors(reviewForm);

      // Validate all inputs
      reviewInputs.forEach((input) => {
        if (!validateInput(input, reviewForm)) {
          isValid = false;
        }
      });

      if (isValid) {
        // Show success message
        feedbackContainer.className = "form-feedback success";
        feedbackContainer.textContent = "Review submitted successfully!";

        // Reset form after a delay
        setTimeout(() => {
          reviewForm.reset();
          feedbackContainer.style.display = "none";
          // Remove success classes
          reviewInputs.forEach((input) => {
            const formGroup = input.closest(".form-group");
            if (formGroup) formGroup.classList.remove("success");
          });
        }, 3000);
      } else {
        // Show error message
        feedbackContainer.className = "form-feedback error";
        feedbackContainer.textContent = "Please fix the errors in the form.";
      }
    });
  }

  // Contact Form Validation
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    // Real-time validation
    const contactInputs = contactForm.querySelectorAll("input, textarea");
    contactInputs.forEach((input) => {
      input.addEventListener("blur", function () {
        validateInput(this, contactForm);
      });
    });

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      let isValid = true;
      const feedbackContainer = contactForm.querySelector(".form-feedback");

      // Clear previous error messages
      clearErrors(contactForm);

      // Validate all inputs
      contactInputs.forEach((input) => {
        if (!validateInput(input, contactForm)) {
          isValid = false;
        }
      });

      if (isValid) {
        // Show success message
        feedbackContainer.className = "form-feedback success";
        feedbackContainer.textContent = "Inquiry sent successfully!";

        // Reset form after a delay
        setTimeout(() => {
          contactForm.reset();
          feedbackContainer.style.display = "none";
          // Remove success classes
          contactInputs.forEach((input) => {
            const formGroup = input.closest(".form-group");
            if (formGroup) formGroup.classList.remove("success");
          });
        }, 3000);
      } else {
        // Show error message
        feedbackContainer.className = "form-feedback error";
        feedbackContainer.textContent = "Please fix the errors in the form.";
      }
    });
  }

  // Search Agency Form Validation
  const searchAgencyForm = document.querySelector(".search-agency");
  if (searchAgencyForm && searchAgencyForm.querySelector(".btn-primary")) {
    // Real-time validation
    const searchInputs = searchAgencyForm.querySelectorAll("input, select");
    searchInputs.forEach((input) => {
      input.addEventListener("blur", function () {
        validateInput(this, searchAgencyForm);
      });

      // For select elements
      if (input.tagName === "SELECT") {
        input.addEventListener("change", function () {
          validateInput(this, searchAgencyForm);
        });
      }
    });

    searchAgencyForm
      .querySelector(".btn-primary")
      .addEventListener("click", function (e) {
        e.preventDefault();

        let isValid = true;
        const feedbackContainer =
          searchAgencyForm.querySelector(".form-feedback");

        // Clear previous error messages
        clearErrors(searchAgencyForm);

        // Validate all required inputs
        searchInputs.forEach((input) => {
          if (
            input.hasAttribute("required") &&
            !validateInput(input, searchAgencyForm)
          ) {
            isValid = false;
          }
        });

        if (isValid) {
          // Show success message
          feedbackContainer.className = "form-feedback success";
          feedbackContainer.textContent = "Search initiated!";

          // Reset form after a delay
          setTimeout(() => {
            searchAgencyForm.reset();
            feedbackContainer.style.display = "none";
            // Remove success classes
            searchInputs.forEach((input) => {
              const formGroup = input.closest(".form-group");
              if (formGroup) formGroup.classList.remove("success");
            });
          }, 3000);
        } else {
          // Show error message
          feedbackContainer.className = "form-feedback error";
          feedbackContainer.textContent = "Please fix the errors in the form.";
        }
      });
  }

  // Helper Functions
  function validateInput(input, form) {
    const formGroup = input.closest(".form-group");

    // Remove previous error
    const existingError = formGroup.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    // Remove error class
    input.classList.remove("error");

    // Check if input is empty but required
    if (input.hasAttribute("required") && !input.value.trim()) {
      const fieldName = formGroup.querySelector("label").textContent;
      showError(input, `${fieldName} is required`);
      return false;
    }

    // Validate email
    if (input.type === "email" && input.value.trim() !== "") {
      if (!validateEmail(input.value)) {
        showError(input, "Please enter a valid email address");
        return false;
      }
    }

    // Validate phone
    if (input.type === "tel" && input.value.trim() !== "") {
      if (!validatePhone(input.value)) {
        showError(input, "Please enter a valid phone number");
        return false;
      }
    }

    // If select element, check if a valid option is selected
    if (input.tagName === "SELECT" && input.hasAttribute("required")) {
      if (input.value === "" || input.selectedIndex === 0) {
        const fieldName = formGroup.querySelector("label").textContent;
        showError(input, `Please select a ${fieldName.toLowerCase()}`);
        return false;
      }
    }

    // Add success class to form group
    formGroup.classList.add("success");
    return true;
  }

  function validateEmail(email) {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePhone(phone) {
    // Basic phone validation - can be customized based on requirements
    const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phone.trim() !== "" && (re.test(phone) || phone.length >= 10);
  }

  function showError(input, message) {
    const formGroup = input.closest(".form-group");
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;

    // Add error class to input
    input.classList.add("error");
    formGroup.classList.remove("success");

    // Add the error message after the input
    formGroup.appendChild(errorElement);
  }

  function clearErrors(form) {
    // Remove all error messages
    const errorMessages = form.querySelectorAll(".error-message");
    errorMessages.forEach((error) => error.remove());

    // Reset input error classes
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.classList.remove("error");
    });

    // Hide feedback container
    const feedbackContainer = form.querySelector(".form-feedback");
    if (feedbackContainer) {
      feedbackContainer.style.display = "none";
      feedbackContainer.className = "form-feedback";
      feedbackContainer.textContent = "";
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    // Add live star rating preview
    const ratingSelect = reviewForm.querySelector(".rating-select");
    const formFeedback = reviewForm.querySelector(".form-feedback");

    // Create star rating preview container
    const starPreview = document.createElement("div");
    starPreview.className = "star-preview";
    starPreview.innerHTML = `
                <div class="stars">
                    ${Array(5)
                      .fill()
                      .map(
                        (_, i) => `
                        <i class="fas fa-star-o" data-rating="${i + 1}"></i>
                    `
                      )
                      .join("")}
                </div>
            `;
    ratingSelect.parentNode.appendChild(starPreview);

    // Update stars when rating is selected
    ratingSelect.addEventListener("change", function () {
      const rating = parseInt(this.value);
      const stars = starPreview.querySelectorAll(".fas");
      stars.forEach((star, index) => {
        star.className = `fas ${index < rating ? "fa-star" : "fa-star-o"}`;
      });
    });

    reviewForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const reviewData = {
        name: formData.get("title"),
        rating: parseFloat(formData.get("rating")),
        text: formData.get("text"),
        date: new Date().toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        }),
        image: "/assets/reviewer.jpg", // Default reviewer image
      };

      try {
        const response = await fetch(`/agent/<%= agent._id %>/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reviewData),
        });

        const data = await response.json();

        if (response.ok) {
          // Show success message with stars
          formFeedback.innerHTML = `
                            Review posted successfully!<br>
                            <div class="stars">
                                ${Array(5)
                                  .fill()
                                  .map(
                                    (_, i) => `
                                    <i class="fas ${
                                      i < reviewData.rating
                                        ? "fa-star"
                                        : "fa-star-o"
                                    }"></i>
                                `
                                  )
                                  .join("")}
                            </div>
                        `;
          formFeedback.style.color = "green";

          // Clear form
          reviewForm.reset();

          // Reset star preview
          const previewStars = starPreview.querySelectorAll(".fas");
          previewStars.forEach((star) => (star.className = "fas fa-star-o"));

          // Reload page after a short delay to show the new review
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          throw new Error(data.error || "Failed to post review");
        }
      } catch (error) {
        formFeedback.textContent = error.message;
        formFeedback.style.color = "red";
      }
    });
  }
});

// Back to Top Button
const backToTopButton = document.getElementById("backToTop");

backToTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

window.addEventListener("scroll", () => {
  if (window.pageYOffset > 300) {
    backToTopButton.style.display = "flex";
  } else {
    backToTopButton.style.display = "none";
  }
});

// Ensure page starts at the top when loaded or refreshed
window.onload = function () {
  window.scrollTo(0, 0);

  // Force scroll to top after a slight delay to override any browser behavior
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 50);

  // Initialize back to top button
  backToTopButton.style.display = "none";
};
