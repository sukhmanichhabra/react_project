document.addEventListener("DOMContentLoaded", function () {
  // Initialize progress bars for advertising packages
  initializeTimeRemainingBars();

  // Get Started button scrolls to seller properties section if logged in as seller
  const getStartedBtn = document.getElementById("getStartedBtn");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", function () {
      const sellerSection = document.querySelector(".seller-properties");
      if (sellerSection) {
        sellerSection.scrollIntoView({ behavior: "smooth" });
      } else {
        // If not a seller, scroll to services section
        const servicesSection = document.querySelector(".services");
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  }

  // Function to initialize and update time remaining bars
  function initializeTimeRemainingBars() {
    const progressBars = document.querySelectorAll(".time-remaining-progress");
    progressBars.forEach((bar) => {
      // The width is already set in the EJS template
      // This is just for any additional initialization if needed
    });
  }

  // Variables to store selected property and package
  let selectedPropertyId = null;
  let selectedPropertyData = null;
  let selectedPackage = null;

  // Step 1: Property Selection
  const propertyCards = document.querySelectorAll(".property-card");
  const selectPropertyBtns = document.querySelectorAll(".select-property-btn");

  // Add click event to property cards with select buttons
  selectPropertyBtns.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent card click event from firing

      // Get property data
      const propertyCard = this.closest(".property-card");
      selectedPropertyId = this.getAttribute("data-property-id");

      // Store property data for display in step 2
      const propertyTitle = propertyCard.querySelector("h3").textContent;
      const propertyLocation =
        propertyCard.querySelector(".property-location").textContent;

      selectedPropertyData = {
        id: selectedPropertyId,
        title: propertyTitle,
        location: propertyLocation,
      };

      // Update the property preview in step 2
      document.getElementById("selected-property-title").textContent =
        propertyTitle;
      document.getElementById("selected-property-location").textContent =
        propertyLocation;

      // Move to step 2
      document
        .getElementById("property-selection")
        .classList.remove("active-step");
      document.getElementById("package-selection").classList.add("active-step");

      // Scroll to package selection
      document
        .getElementById("package-selection")
        .scrollIntoView({ behavior: "smooth" });
    });
  });

  // Step 2: Package Selection
  const packageOptions = document.querySelectorAll(".package-option");
  const finalizeBtn = document.getElementById("finalize-btn");
  const backToPropertiesBtn = document.getElementById("back-to-properties");

  // Back button functionality
  backToPropertiesBtn.addEventListener("click", function () {
    // Reset package selection
    selectedPackage = null;
    packageOptions.forEach((btn) => btn.classList.remove("selected"));
    document.getElementById("selected-package-info").innerHTML =
      "<p>No package selected</p>";
    finalizeBtn.disabled = true;

    // Go back to step 1
    document
      .getElementById("package-selection")
      .classList.remove("active-step");
    document.getElementById("property-selection").classList.add("active-step");

    // Scroll to property selection
    document
      .getElementById("property-selection")
      .scrollIntoView({ behavior: "smooth" });
  });

  // Package selection
  packageOptions.forEach((button) => {
    button.addEventListener("click", function () {
      const packageType = this.getAttribute("data-package");
      selectedPackage = packageType;

      // Update UI to show selected package
      packageOptions.forEach((btn) => btn.classList.remove("selected"));
      this.classList.add("selected");

      // Update package summary
      let packageDetails = "";
      let packagePrice = "";
      let packageDuration = "";

      switch (packageType) {
        case "basic":
          packageDetails = "Basic visibility and standard search placement";
          packagePrice = "$50";
          packageDuration = "30 days";
          break;
        case "premium":
          packageDetails =
            "Enhanced visibility, priority search placement, and homepage feature";
          packagePrice = "$100";
          packageDuration = "60 days";
          break;
        case "featured":
          packageDetails =
            "Maximum visibility, top search placement, homepage feature, and social promotion";
          packagePrice = "$200";
          packageDuration = "90 days";
          break;
      }

      document.getElementById("selected-package-info").innerHTML = `
                <div class="package-summary-details">
                    <p><strong>Package:</strong> ${
                      packageType.charAt(0).toUpperCase() + packageType.slice(1)
                    }</p>
                    <p><strong>Price:</strong> ${packagePrice}</p>
                    <p><strong>Duration:</strong> ${packageDuration}</p>
                    <p><strong>Features:</strong> ${packageDetails}</p>
                </div>
            `;

      // Enable finalize button
      finalizeBtn.disabled = false;
    });
  });

  // Finalize button - create the advertising package
  finalizeBtn.addEventListener("click", function () {
    if (!selectedPropertyId || !selectedPackage) {
      alert("Please select both a property and a package");
      return;
    }

    // Show processing message
    finalizeBtn.disabled = true;
    finalizeBtn.textContent = "Processing Payment...";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/advertising/create", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 201) {
          try {
            const data = JSON.parse(xhr.responseText);

            if (data.success) {
              // Create a nicer notification
              const notification = document.createElement("div");
              notification.className = "payment-notification";
              notification.innerHTML = `
                        <div class="payment-notification-content">
                            <i class="fas fa-check-circle"></i>
                            <h4>Payment Successful!</h4>
                            <p>Your advertising package has been created and the payment has been processed from your account.</p>
                        </div>
                    `;
              document.body.appendChild(notification);

              // Remove notification after 3 seconds and reload
              setTimeout(() => {
                notification.style.opacity = "0";
                setTimeout(() => {
                  document.body.removeChild(notification);
                  window.location.reload();
                }, 500);
              }, 3000);
            } else {
              finalizeBtn.disabled = false;
              finalizeBtn.textContent = "Finalize Advertising";
              alert("Error: " + data.message);
            }
          } catch (error) {
            console.error("JSON Parse Error:", error);
            finalizeBtn.disabled = false;
            finalizeBtn.textContent = "Finalize Advertising";
            alert("Invalid response from server");
          }
        } else {
          console.error("HTTP Error:", xhr.status, xhr.statusText);
          finalizeBtn.disabled = false;
          finalizeBtn.textContent = "Finalize Advertising";
          alert("Server error: " + xhr.status + " " + xhr.statusText);
        }
      }
    };

    xhr.onerror = function () {
      console.error("Network Error");
      finalizeBtn.disabled = false;
      finalizeBtn.textContent = "Finalize Advertising";
      alert("An error occurred while creating the advertising package.");
    };

    xhr.send(
      JSON.stringify({
        propertyId: selectedPropertyId,
        packageType: selectedPackage,
      })
    );
  });

  // Handle cancelling advertising packages
  const cancelButtons = document.querySelectorAll(".cancel-package-btn");
  cancelButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent card click event from firing

      if (
        !confirm("Are you sure you want to cancel this advertising package?")
      ) {
        return;
      }

      const advertisingId = this.getAttribute("data-advertising-id");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/advertising/cancel/${advertisingId}`, true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);

              if (data.success) {
                alert("Advertising package cancelled successfully!");
                // Reload the page to show updated status
                window.location.reload();
              } else {
                alert("Error: " + data.message);
              }
            } catch (error) {
              console.error("JSON Parse Error:", error);
              alert("Invalid response from server");
            }
          } else {
            console.error("HTTP Error:", xhr.status, xhr.statusText);
            alert("Server error: " + xhr.status + " " + xhr.statusText);
          }
        }
      };

      xhr.onerror = function () {
        console.error("Network Error");
        alert("An error occurred while cancelling the advertising package.");
      };

      xhr.send();
    });
  });

  // Scroll reveal animation
  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right"
  );

  const revealOnScroll = function () {
    for (let i = 0; i < revealElements.length; i++) {
      const windowHeight = window.innerHeight;
      const elementTop = revealElements[i].getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < windowHeight - elementVisible) {
        revealElements[i].classList.add("active");
      }
    }
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll(); // Initial check on page load
});
