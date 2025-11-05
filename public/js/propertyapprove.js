document.addEventListener("DOMContentLoaded", function () {
  // Filter properties by status
  const statusFilter = document.getElementById("property-status");
  const statCards = document.querySelectorAll(".stat-card");
  const propertyItems = document.querySelectorAll(".property-approval-item");
  let currentPropertyId = null; // Keep track of currently viewed property

  statusFilter.addEventListener("change", function () {
    filterProperties();
  });

  statCards.forEach((card) => {
    card.addEventListener("click", function () {
      statCards.forEach((c) => c.classList.remove("active"));
      this.classList.add("active");

      const filter = this.getAttribute("data-filter");
      statusFilter.value = filter;
      filterProperties();
    });
  });

  function filterProperties() {
    const status = statusFilter.value;

    propertyItems.forEach((item) => {
      if (status === "all") {
        item.style.display = "";
      } else if (item.classList.contains(status)) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });

    // Show/hide empty message
    const noPropertiesMessage = document.getElementById(
      "no-properties-message"
    );
    if (noPropertiesMessage) {
      const visibleProperties = document.querySelectorAll(
        '.property-approval-item[style=""]'
      );
      noPropertiesMessage.style.display =
        visibleProperties.length === 0 ? "" : "none";
    }
  }

  // Property detail modal functionality
  const modal = document.getElementById("property-detail-modal");
  const viewButtons = document.querySelectorAll(".view-property-btn");
  const closeModal = document.querySelector(".close-modal");

  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const propertyId = this.getAttribute("data-property-id");
      currentPropertyId = propertyId; // Save current property ID

      // Fetch property details from the server
      const xhr = new XMLHttpRequest();
      xhr.open("GET", `/property/${propertyId}?format=json`, true);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 201 || xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.property) {
                displayPropertyDetails(data.property);
                showModal();
              } else {
                alert("Failed to load property details. Please try again.");
              }
            } catch (error) {
              console.error("Error parsing response:", error);
              alert("Failed to load property details. Please try again.");
            }
          } else {
            console.error("HTTP Error:", xhr.status, xhr.statusText);
            alert("Failed to load property details. Please try again.");
          }
        }
      };

      xhr.onerror = function () {
        console.error("Network error occurred");
        alert("Failed to load property details. Please try again.");
      };

      xhr.ontimeout = function () {
        console.error("Request timeout");
        alert("Request timeout. Please try again.");
      };

      xhr.timeout = 10000; // 10 seconds
      xhr.send();
    });
  });

  // Display property details in the modal
  function displayPropertyDetails(property) {
    // Set property title and basic info
    document.getElementById("modal-property-title").textContent =
      property.title || "Untitled Property";
    document.getElementById(
      "modal-property-id"
    ).textContent = `ID: ${property._id}`;
    document.getElementById(
      "modal-property-location"
    ).innerHTML = `<i class="fas fa-map-marker-alt"></i> ${
      property.location || "Location not specified"
    }`;
    document.getElementById("modal-property-price").textContent =
      property.price || "Price not specified";

    // Set property description
    const descriptionEl = document.getElementById("modal-property-description");
    descriptionEl.innerHTML = `<p>${
      property.description || "No description available"
    }</p>`;

    // Add rejection notes if property is rejected
    if (property.approvalStatus === "rejected" && property.adminNotes) {
      // Check if rejection notes section already exists
      let rejectionNotesEl = document.querySelector(".modal-rejection-notes");

      // If not, create it
      if (!rejectionNotesEl) {
        rejectionNotesEl = document.createElement("div");
        rejectionNotesEl.className = "modal-rejection-notes";
        descriptionEl.parentNode.insertBefore(
          rejectionNotesEl,
          descriptionEl.nextSibling
        );
      }

      rejectionNotesEl.innerHTML = `
                    <h4><i class="fas fa-exclamation-circle"></i> Rejection Reason</h4>
                    <p>${property.adminNotes}</p>
                `;
    } else {
      // Remove rejection notes if they exist
      const rejectionNotesEl = document.querySelector(".modal-rejection-notes");
      if (rejectionNotesEl) {
        rejectionNotesEl.remove();
      }
    }

    // Set property details
    const detailsEl = document.getElementById("modal-property-details");
    if (detailsEl && property.features) {
      detailsEl.innerHTML = `
                    <div class="detail-row">
                        <span class="detail-label">Property Type:</span>
                        <span class="detail-value">${
                          property.features.type || "Not specified"
                        }</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Bedrooms:</span>
                        <span class="detail-value">${
                          property.features.beds || "0"
                        }</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Bathrooms:</span>
                        <span class="detail-value">${
                          property.features.baths || "0"
                        }</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Area:</span>
                        <span class="detail-value">${
                          property.features.sqft || "0"
                        } sqft</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Property Status:</span>
                        <span class="detail-value">${
                          property.tag === "sale" ? "For Sale" : "For Rent"
                        }</span>
                    </div>
                `;
    }

    // Set property amenities
    const amenitiesEl = document.getElementById("modal-property-amenities");
    if (amenitiesEl && property.amenities && property.amenities.length > 0) {
      amenitiesEl.innerHTML = property.amenities
        .map(
          (amenity) =>
            `<div class="amenity-item"><i class="fas fa-check"></i> ${amenity}</div>`
        )
        .join("");
    } else if (amenitiesEl) {
      amenitiesEl.innerHTML = "<p>No amenities listed</p>";
    }

    // Set seller information
    const sellerInfoEl = document.getElementById("modal-seller-info");
    if (sellerInfoEl && property.seller) {
      sellerInfoEl.innerHTML = `
                    <div class="seller-info-row">
                        <img src="/assets/agent1.png" alt="${
                          property.seller.name || "Seller"
                        }" class="seller-avatar">
                        <div class="seller-details">
                            <p class="seller-name">${
                              property.seller.name || "Unknown Seller"
                            }</p>
                            <p class="seller-contact"><i class="fas fa-envelope"></i> ${
                              property.seller.email || "Email not available"
                            }</p>
                            <p class="seller-contact"><i class="fas fa-phone"></i> ${
                              property.seller.phone || "Phone not available"
                            }</p>
                        </div>
                    </div>
                `;
    }

    // Set up property images for the carousel
    const sliderImagesContainer = document.querySelector(".slider-images");
    const thumbnailsContainer = document.querySelector(".image-thumbnails");

    if (sliderImagesContainer && thumbnailsContainer) {
      sliderImagesContainer.innerHTML = "";
      thumbnailsContainer.innerHTML = "";

      if (property.images && property.images.length > 0) {
        property.images.forEach((image, index) => {
          // Add main image
          const imgElement = document.createElement("img");
          imgElement.src = image;
          imgElement.alt = `${property.title} - Image ${index + 1}`;
          imgElement.className = index === 0 ? "active" : "";

          sliderImagesContainer.appendChild(imgElement);

          // Add thumbnail
          const thumbImg = document.createElement("img");
          thumbImg.src = image;
          thumbImg.alt = `Thumbnail ${index + 1}`;
          thumbImg.className = index === 0 ? "active" : "";
          thumbImg.dataset.index = index;

          thumbnailsContainer.appendChild(thumbImg);

          // Add click event to thumbnail
          thumbImg.addEventListener("click", function () {
            // Remove active class from all images
            const allImages = sliderImagesContainer.querySelectorAll("img");
            const allThumbs = thumbnailsContainer.querySelectorAll("img");

            allImages.forEach((img) => img.classList.remove("active"));
            allThumbs.forEach((thumb) => thumb.classList.remove("active"));

            // Add active class to selected image
            allImages[index].classList.add("active");
            this.classList.add("active");
          });
        });
      } else {
        // Add a default image if no images are available
        const defaultImg = document.createElement("img");
        defaultImg.src = "/assets/property-1.jpg";
        defaultImg.alt = "Default Property Image";
        defaultImg.classList.add("active");

        sliderImagesContainer.appendChild(defaultImg);

        const defaultThumb = document.createElement("img");
        defaultThumb.src = "/assets/property-1.jpg";
        defaultThumb.alt = "Thumbnail";
        defaultThumb.classList.add("active");

        thumbnailsContainer.appendChild(defaultThumb);
      }

      // Set up image slider controls
      const prevButton = document.querySelector(".prev-slide");
      const nextButton = document.querySelector(".next-slide");

      if (prevButton && nextButton) {
        prevButton.addEventListener("click", function () {
          navigateSlider("prev");
        });

        nextButton.addEventListener("click", function () {
          navigateSlider("next");
        });
      }
    }

    // Set up action buttons based on property status
    const modalActionButtons = document.getElementById("modal-action-buttons");
    if (modalActionButtons) {
      if (property.approvalStatus === "pending") {
        modalActionButtons.innerHTML = `
                        <button class="approve-property-btn" data-property-id="${property._id}">
                            <i class="fas fa-check-circle"></i> Approve Property
                        </button>
                        <button class="reject-property-btn" data-property-id="${property._id}">
                            <i class="fas fa-times-circle"></i> Reject Property
                        </button>
                    `;
      } else {
        modalActionButtons.innerHTML = `
                        <button class="view-property-btn" data-property-id="${property._id}" onclick="window.location.href='/property/${property._id}'">
                            <i class="fas fa-external-link-alt"></i> View Full Listing
                        </button>
                    `;
      }
    }
  }

  // Navigate image slider
  function navigateSlider(direction) {
    const images = document.querySelectorAll(".slider-images img");
    const thumbnails = document.querySelectorAll(".image-thumbnails img");

    if (!images.length) return;

    let activeIndex = 0;
    images.forEach((img, index) => {
      if (img.classList.contains("active")) {
        activeIndex = index;
      }
    });

    // Remove active class from current image and thumbnail
    images[activeIndex].classList.remove("active");
    thumbnails[activeIndex].classList.remove("active");

    // Calculate new index
    if (direction === "next") {
      activeIndex = (activeIndex + 1) % images.length;
    } else {
      activeIndex = (activeIndex - 1 + images.length) % images.length;
    }

    // Add active class to new image and thumbnail
    images[activeIndex].classList.add("active");
    thumbnails[activeIndex].classList.add("active");
  }

  function showModal() {
    if (modal) {
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  }

  if (closeModal) {
    closeModal.addEventListener("click", function () {
      modal.style.display = "none";
      document.body.style.overflow = "";
    });
  }

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  });

  // Approve/Reject buttons functionality
  document.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("approve-property-btn") ||
      e.target.parentElement.classList.contains("approve-property-btn")
    ) {
      const button = e.target.classList.contains("approve-property-btn")
        ? e.target
        : e.target.parentElement;
      const propertyId = button.getAttribute("data-property-id");

      if (confirm("Are you sure you want to approve this property?")) {
        // Submit the approval request via XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `/property/approve/${propertyId}`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 201 || xhr.status === 200) {
              try {
                const data = JSON.parse(xhr.responseText);
                if (data.success) {
                  alert("Property approved successfully!");
                  // Close modal and reload page
                  modal.style.display = "none";
                  document.body.style.overflow = "";
                  window.location.reload();
                } else {
                  alert(
                    data.message ||
                      "Failed to approve property. Please try again."
                  );
                }
              } catch (error) {
                console.error("Error parsing response:", error);
                alert("Failed to approve property. Please try again.");
              }
            } else {
              console.error("HTTP Error:", xhr.status, xhr.statusText);
              alert("Failed to approve property. Please try again.");
            }
          }
        };

        xhr.onerror = function () {
          console.error("Network error occurred");
          alert("Failed to approve property. Please try again.");
        };

        xhr.ontimeout = function () {
          console.error("Request timeout");
          alert("Request timeout. Please try again.");
        };

        xhr.timeout = 10000; // 10 seconds
        xhr.send();
      }
    }

    if (
      e.target.classList.contains("reject-property-btn") ||
      e.target.parentElement.classList.contains("reject-property-btn")
    ) {
      const button = e.target.classList.contains("reject-property-btn")
        ? e.target
        : e.target.parentElement;
      const propertyId = button.getAttribute("data-property-id");

      const notes = prompt("Please provide rejection notes:");
      if (notes === null) {
        // User cancelled the prompt
        return;
      }

      if (notes.trim() === "") {
        alert("Please provide rejection notes to continue.");
        return;
      }

      // Submit the rejection request via XMLHttpRequest
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/property/reject/${propertyId}`, true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 201 || xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.success) {
                alert("Property rejected successfully!");
                // Close modal and reload page
                modal.style.display = "none";
                document.body.style.overflow = "";
                window.location.reload();
              } else {
                alert(
                  data.message || "Failed to reject property. Please try again."
                );
              }
            } catch (error) {
              console.error("Error parsing response:", error);
              alert("Failed to reject property. Please try again.");
            }
          } else {
            console.error("HTTP Error:", xhr.status, xhr.statusText);
            alert("Failed to reject property. Please try again.");
          }
        }
      };

      xhr.onerror = function () {
        console.error("Network error occurred");
        alert("Failed to reject property. Please try again.");
      };

      xhr.ontimeout = function () {
        console.error("Request timeout");
        alert("Request timeout. Please try again.");
      };

      xhr.timeout = 10000; // 10 seconds
      xhr.send(JSON.stringify({ notes: notes }));
    }
  });
});
