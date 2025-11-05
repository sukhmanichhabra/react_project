// Dashboard.js - Functions for admin dashboard

document.addEventListener("DOMContentLoaded", function () {
  // Initialize dashboard functionality
  initializeDashboard();
  initializeCharts();
  initializeMessagesSection();
  initializeAdminDashboard();

  // Initialize buyer financials if on buyer dashboard
  if (document.querySelector(".enhanced-financial-status")) {
    initializeBuyerFinancials();
  }

  // Initialize all Add Funds buttons
  initializeAllAddFundsButtons();

  // Initialize cancel advertisement buttons
  initializeCancelAdvertisementButtons();

  // Initialize rented properties buttons for buyers
  initializeRentedPropertiesButtons();

  // Check if we need to show success message for profile update
  if (
    window.location.hash === "#profile" &&
    window.location.search.includes("updated=true")
  ) {
    const profileSection = document.getElementById("profile");
    if (profileSection) {
      const successMessage = document.createElement("div");
      successMessage.className = "success-message";
      successMessage.textContent = "Profile updated successfully!";
      profileSection
        .querySelector(".section-header")
        .appendChild(successMessage);

      // Remove the message after 3 seconds
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    }
  }
});

function initializeDashboard() {
  // Only run the loan applications code if we're on the admin dashboard with loan approval section
  const loanApprovalSection = document.getElementById("loan-approval");
  if (loanApprovalSection) {
    // Initialize loan applications
    initializeLoanApplications();
  }

  // Initialize buyer financial overview if we're on the buyer dashboard
  const financeOverview = document.querySelector(".finance-overview");
  if (financeOverview) {
    initializeBuyerFinancials();
  }
}

function initializeLoanApplications() {
  // Set up event listeners for the filter controls
  const statusFilter = document.getElementById("loan-status");
  const typeFilter = document.getElementById("loan-type");

  if (statusFilter) {
    statusFilter.addEventListener("change", function () {
      loadLoanApplications();
    });
  }

  if (typeFilter) {
    typeFilter.addEventListener("change", function () {
      loadLoanApplications();
    });
  }

  // Set up search functionality
  const searchBox = document.querySelector(".search-box input");
  const searchButton = document.querySelector(".search-box button");

  if (searchBox && searchButton) {
    searchButton.addEventListener("click", function () {
      loadLoanApplications();
    });

    searchBox.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        loadLoanApplications();
      }
    });
  }

  // Initial load of loan applications
  loadLoanApplications();
}

function loadLoanApplications() {
  // Get filter values
  const status = document.getElementById("loan-status")?.value || "all";
  const loanType = document.getElementById("loan-type")?.value || "all";
  const searchTerm = document.querySelector(".search-box input")?.value || "";

  // Show loading state
  const applicationsContainer = document.querySelector(".loan-applications");
  if (!applicationsContainer) return;

  applicationsContainer.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading loan applications...</p>
        </div>
    `;

  // Fetch loan applications from the server
  fetch(
    `/loan/admin/applications?status=${status}&type=${loanType}&search=${searchTerm}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (!data.success) {
        applicationsContainer.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>${
                          data.message || "Failed to load loan applications"
                        }</p>
                    </div>
                `;
        return;
      }

      if (data.applications.length === 0) {
        applicationsContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>No loan applications found. Try changing your filters.</p>
                    </div>
                `;
        return;
      }

      // Render the applications
      renderLoanApplications(applicationsContainer, data.applications);

      // Update stats if available
      if (data.stats) {
        updateLoanStats(data.stats);
      }
    })
    .catch((error) => {
      console.error("Error loading loan applications:", error);
      applicationsContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load loan applications. Please try again later.</p>
                </div>
            `;
    });
}

function renderLoanApplications(container, applications) {
  container.innerHTML = "";

  applications.forEach((application) => {
    // Format currency and dates
    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(application.loanDetails.loanAmount);

    const statusClass = application.applicationStatus.toLowerCase();
    const statusText = application.applicationStatus.replace("_", " ");
    const formattedDate = new Date(application.createdAt).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );

    // Create the application element
    const loanItem = document.createElement("div");
    loanItem.className = `loan-item ${statusClass} collapsed`;
    loanItem.dataset.id = application._id;

    loanItem.innerHTML = `
            <div class="loan-header">
                <div class="applicant-info">
                    <h3>${application.applicantName}</h3>
                    <p>Application ID: ${application._id}</p>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="loan-summary">
                    <div class="loan-amount">
                        <span>Loan Amount</span>
                        <p>${formattedAmount}</p>
                    </div>
                    <div class="loan-type">
                        <span>Loan Type</span>
                        <p>${application.loanDetails.loanType}</p>
                    </div>
                    <div class="application-date">
                        <span>Submitted</span>
                        <p>${formattedDate}</p>
                    </div>
                </div>
                <button class="toggle-details"><i class="fas fa-chevron-down"></i></button>
            </div>
            <div class="loan-details" style="display: none;">
                <div class="details-grid">
                    <div class="detail-section">
                        <h4>Applicant Details</h4>
                        <div class="detail-row">
                            <span>Email:</span>
                            <p>${application.email}</p>
                        </div>
                        <div class="detail-row">
                            <span>Phone:</span>
                            <p>${application.phone}</p>
                        </div>
                        <div class="detail-row">
                            <span>Date of Birth:</span>
                            <p>${new Date(
                              application.dateOfBirth
                            ).toLocaleDateString()}</p>
                        </div>
                        <div class="detail-row">
                            <span>Marital Status:</span>
                            <p>${application.maritalStatus}</p>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Employment Details</h4>
                        <div class="detail-row">
                            <span>Employment Type:</span>
                            <p>${
                              application.employmentDetails.employmentType
                            }</p>
                        </div>
                        <div class="detail-row">
                            <span>Monthly Income:</span>
                            <p>${new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            }).format(
                              application.employmentDetails.monthlyIncome
                            )}</p>
                        </div>
                        <div class="detail-row">
                            <span>Work Experience:</span>
                            <p>${
                              application.employmentDetails.workExperience
                            } years</p>
                        </div>
                        <div class="detail-row">
                            <span>Employer:</span>
                            <p>${
                              application.employmentDetails.employerName ||
                              "N/A"
                            }</p>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Loan Details</h4>
                        <div class="detail-row">
                            <span>Loan Amount:</span>
                            <p>${formattedAmount}</p>
                        </div>
                        <div class="detail-row">
                            <span>Loan Tenure:</span>
                            <p>${application.loanDetails.loanTenure} years</p>
                        </div>
                        <div class="detail-row">
                            <span>Interest Rate:</span>
                            <p>${application.loanDetails.interestRate}%</p>
                        </div>
                        <div class="detail-row">
                            <span>Property Type:</span>
                            <p>${application.loanDetails.propertyType}</p>
                        </div>
                        <div class="detail-row">
                            <span>Property Value:</span>
                            <p>${
                              application.loanDetails.propertyValue
                                ? new Intl.NumberFormat("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    maximumFractionDigits: 0,
                                  }).format(
                                    application.loanDetails.propertyValue
                                  )
                                : "N/A"
                            }</p>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Documents</h4>
                        <div class="document-links">
                            ${
                              application.documents.identityProof
                                ? `<a href="${application.documents.identityProof.path}" target="_blank" class="document-link">
                                    <i class="fas fa-id-card"></i> Identity Proof
                                </a>`
                                : '<p class="missing-doc">Identity Proof not uploaded</p>'
                            }
                            
                            ${
                              application.documents.addressProof
                                ? `<a href="${application.documents.addressProof.path}" target="_blank" class="document-link">
                                    <i class="fas fa-home"></i> Address Proof
                                </a>`
                                : '<p class="missing-doc">Address Proof not uploaded</p>'
                            }
                            
                            ${
                              application.documents.incomeProof
                                ? `<a href="${application.documents.incomeProof.path}" target="_blank" class="document-link">
                                    <i class="fas fa-file-invoice-dollar"></i> Income Proof
                                </a>`
                                : '<p class="missing-doc">Income Proof not uploaded</p>'
                            }
                            
                            ${
                              application.documents.bankStatements
                                ? `<a href="${application.documents.bankStatements.path}" target="_blank" class="document-link">
                                    <i class="fas fa-university"></i> Bank Statements
                                </a>`
                                : '<p class="missing-doc">Bank Statements not uploaded</p>'
                            }
                        </div>
                    </div>
                </div>
                
                <div class="admin-section">
                    <div class="admin-remarks">
                        <label for="remarks-${
                          application._id
                        }">Admin Remarks:</label>
                        <textarea id="remarks-${
                          application._id
                        }" placeholder="Add your remarks here..."${
      ["approved", "rejected", "disbursed"].includes(
        application.applicationStatus.toLowerCase()
      )
        ? " readonly"
        : ""
    }>${application.adminRemarks || ""}</textarea>
                    </div>
                    
                    <div class="loan-actions">
                        ${
                          ["approved", "rejected", "disbursed"].includes(
                            application.applicationStatus.toLowerCase()
                          )
                            ? `<div class="status-message">
                                <p><i class="fas fa-info-circle"></i> This application is in ${statusText} status. No further actions can be taken.</p>
                            </div>`
                            : `<div class="action-buttons">
                                <button class="approve-btn" data-id="${application._id}">
                                    <i class="fas fa-check-circle"></i> Approve
                                </button>
                                <button class="reject-btn" data-id="${application._id}">
                                    <i class="fas fa-times-circle"></i> Reject
                                </button>
                                <button class="request-info-btn" data-id="${application._id}">
                                    <i class="fas fa-info-circle"></i> Request Info
                                </button>
                            </div>`
                        }
                    </div>
                </div>
            </div>
        `;

    container.appendChild(loanItem);
  });

  // Add event listeners for toggle details
  const toggleButtons = container.querySelectorAll(".toggle-details");
  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const loanItem = this.closest(".loan-item");
      const details = loanItem.querySelector(".loan-details");

      if (details.style.display === "none") {
        details.style.display = "block";
        this.innerHTML = '<i class="fas fa-chevron-up"></i>';
        loanItem.classList.remove("collapsed");
      } else {
        details.style.display = "none";
        this.innerHTML = '<i class="fas fa-chevron-down"></i>';
        loanItem.classList.add("collapsed");
      }
    });
  });

  // Add event listeners for action buttons
  const approveButtons = container.querySelectorAll(".approve-btn");
  const rejectButtons = container.querySelectorAll(".reject-btn");
  const requestInfoButtons = container.querySelectorAll(".request-info-btn");

  approveButtons.forEach((button) => {
    button.addEventListener("click", function () {
      updateApplicationStatus(this.dataset.id, "approved");
    });
  });

  rejectButtons.forEach((button) => {
    button.addEventListener("click", function () {
      updateApplicationStatus(this.dataset.id, "rejected");
    });
  });

  requestInfoButtons.forEach((button) => {
    button.addEventListener("click", function () {
      updateApplicationStatus(this.dataset.id, "info_requested");
    });
  });
}

function updateApplicationStatus(id, status) {
  // Get the remarks if any
  const remarksTextarea = document.getElementById(`remarks-${id}`);
  const remarks = remarksTextarea ? remarksTextarea.value : "";

  // Confirm action
  const statusText =
    status === "approved"
      ? "approve"
      : status === "rejected"
      ? "reject"
      : "request more information for";

  if (!confirm(`Are you sure you want to ${statusText} this application?`)) {
    return;
  }

  // Get the loan item element
  const loanItem = document.querySelector(`.loan-item[data-id="${id}"]`);

  // Show loading state
  const button = document.querySelector(`button[data-id="${id}"]`);
  const actionButtons = loanItem
    ? loanItem.querySelector(".action-buttons")
    : null;

  if (button) {
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  }

  // Send update to server
  fetch(`/loan/admin/applications/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
      remarks,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showSuccess(`Application ${statusText}d successfully`);

        // Update UI immediately if the loan item exists
        if (
          loanItem &&
          actionButtons &&
          ["approved", "rejected", "disbursed"].includes(status)
        ) {
          // Update the status badge
          const statusBadge = loanItem.querySelector(".status-badge");
          if (statusBadge) {
            statusBadge.textContent =
              status.charAt(0).toUpperCase() +
              status.slice(1).replace("_", " ");
            statusBadge.className = `status-badge ${status.toLowerCase()}`;
          }

          // Make the remarks textarea readonly
          if (remarksTextarea) {
            remarksTextarea.readOnly = true;
          }

          // Replace action buttons with status message
          const adminSection = loanItem.querySelector(".loan-actions");
          if (adminSection) {
            adminSection.innerHTML = `
                        <div class="status-message">
                            <p><i class="fas fa-info-circle"></i> This application is in ${
                              status.charAt(0).toUpperCase() +
                              status.slice(1).replace("_", " ")
                            } status. No further actions can be taken.</p>
                        </div>
                    `;
          }

          // Update loan item class to reflect new status
          const oldStatusClass = loanItem.className
            .split(" ")
            .find((cls) => cls !== "loan-item" && cls !== "collapsed");
          if (oldStatusClass) {
            loanItem.classList.remove(oldStatusClass);
          }
          loanItem.classList.add(status.toLowerCase());
        } else {
          // If we can't update the UI directly, reload all applications
          loadLoanApplications();
        }
      } else {
        showError(data.message || `Failed to ${statusText} application`);

        // Reset button state
        if (button) {
          button.disabled = false;
          button.innerHTML = originalText;
        }
      }
    })
    .catch((error) => {
      console.error(`Error ${statusText}ing application:`, error);
      showError(`Failed to ${statusText} application`);

      // Reset button state
      if (button) {
        button.disabled = false;
        button.innerHTML = originalText;
      }
    });
}

function updateLoanStats(stats) {
  const statsContainers = {
    pending: document.querySelector(".stat-card.pending .stat-value"),
    approved: document.querySelector(".stat-card.approved .stat-value"),
    rejected: document.querySelector(".stat-card.rejected .stat-value"),
    total: document.querySelector(".stat-card.total .stat-value"),
  };

  if (statsContainers.pending)
    statsContainers.pending.textContent = stats.pending || 0;
  if (statsContainers.approved)
    statsContainers.approved.textContent = stats.approved || 0;
  if (statsContainers.rejected)
    statsContainers.rejected.textContent = stats.rejected || 0;
  if (statsContainers.total)
    statsContainers.total.textContent = stats.total || 0;
}

function showSuccess(message) {
  // Create alert element
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-success";
  alertDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

  // Add to page
  addAlertToPage(alertDiv);
}

function showError(message) {
  // Create alert element
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-error";
  alertDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

  // Add to page
  addAlertToPage(alertDiv);
}

function addAlertToPage(alertDiv) {
  // Find active section or dashboard-main
  const container =
    document.querySelector(".dashboard-section.active") ||
    document.querySelector(".dashboard-main");

  if (container) {
    // Add alert to the top of the container
    container.insertBefore(alertDiv, container.firstChild);

    // Fade out and remove after 5 seconds
    setTimeout(() => {
      alertDiv.style.opacity = "0";
      setTimeout(() => alertDiv.remove(), 500);
    }, 5000);
  }
}

// New function to handle buyer financial overview
function initializeBuyerFinancials() {
  // Fetch the user's current balance first
  fetchUserBalance();

  // Set up a refresh interval (every 30 seconds)
  setInterval(fetchUserBalance, 30000);

  // Add Funds button click handlers are now managed by initializeAllAddFundsButtons()

  // Fetch latest loan application status
  fetchLoanApplicationStatus();
}

// Function to fetch user balance
function fetchUserBalance() {
  fetch("/dashboard/debug-user")
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.user) {
        const balanceAmount = document.querySelector(".balance-amount");
        if (balanceAmount) {
          const balance = data.user.accountBalance || 0;
          balanceAmount.textContent = "$" + balance.toLocaleString();
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching user balance:", error);
    });
}

// Function to fetch loan application status
function fetchLoanApplicationStatus() {
  const loanStatusContainer = document.querySelector(".loan-status-container");
  if (loanStatusContainer) {
    // Only fetch if there's an active loan
    const viewDetailsBtn = loanStatusContainer.querySelector(
      'a[href="/loan/my-applications"]'
    );
    if (viewDetailsBtn) {
      fetch("/loan/my-applications")
        .then((response) => response.json())
        .then((data) => {
          if (
            data.success &&
            data.applications &&
            data.applications.length > 0
          ) {
            // Get the most recent application
            const latestApplication = data.applications[0];
            const loanStatus =
              loanStatusContainer.querySelector(".loan-status");

            // Update status text with appropriate styling
            if (loanStatus) {
              let statusText = "Unknown status";
              let statusClass = "";

              switch (latestApplication.applicationStatus) {
                case "pending":
                  statusText = "Application pending review";
                  statusClass = "pending";
                  break;
                case "under_review":
                  statusText = "Application under review";
                  statusClass = "reviewing";
                  break;
                case "approved":
                  statusText = "Loan approved!";
                  statusClass = "approved";
                  // When a loan is approved, refresh the balance
                  fetchUserBalance();
                  break;
                case "rejected":
                  statusText = "Application rejected";
                  statusClass = "rejected";
                  break;
                case "info_requested":
                  statusText = "Additional information requested";
                  statusClass = "info-requested";
                  break;
                case "disbursed":
                  statusText = "Loan disbursed";
                  statusClass = "disbursed";
                  break;
              }

              loanStatus.textContent = statusText;
              loanStatus.className = "loan-status " + statusClass;
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching loan applications:", error);
        });
    }
  }
}

// Function to initialize cancel advertisement buttons
function initializeCancelAdvertisementButtons() {
  const cancelButtons = document.querySelectorAll(".cancel-package-btn");
  cancelButtons.forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.preventDefault();

      if (
        !confirm("Are you sure you want to cancel this advertising package?")
      ) {
        return;
      }

      const advertisingId = this.getAttribute("data-advertising-id");
      const propertyId = this.getAttribute("data-property-id");

      try {
        const response = await fetch(`/advertising/cancel/${advertisingId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          // Create a success notification
          const notification = document.createElement("div");
          notification.className = "alert alert-success";
          notification.innerHTML = `<i class="fas fa-check-circle"></i> Advertising package cancelled successfully!`;

          // Add to page
          const container = document.querySelector("#advertised-properties");
          if (container) {
            container.insertBefore(notification, container.firstChild);
          }

          // Remove the property card from the UI
          const propertyCard = this.closest(".property-card");
          if (propertyCard) {
            propertyCard.style.opacity = "0";
            setTimeout(() => {
              propertyCard.remove();

              // Check if there are no more advertised properties
              const remainingCards = document.querySelectorAll(
                "#advertised-properties .property-card"
              );
              if (remainingCards.length === 0) {
                // Show empty state
                const propertyGrid = document.querySelector(".property-grid");
                if (propertyGrid) {
                  propertyGrid.innerHTML = `
                                        <div class="empty-state">
                                            <i class="fas fa-ad empty-icon"></i>
                                            <h3>No Advertised Properties</h3>
                                            <p>You don't have any properties with active advertising packages.</p>
                                            <p>Visit the Advertising page to promote your properties and increase their visibility.</p>
                                            <a href="/advertising" class="cta-button">Start Advertising</a>
                                        </div>
                                    `;
                }
              }
            }, 500);
          }

          // Fade out and remove notification after 5 seconds
          setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => notification.remove(), 500);
          }, 5000);
        } else {
          // Show error notification
          const notification = document.createElement("div");
          notification.className = "alert alert-error";
          notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${
            data.message || "Failed to cancel advertising package"
          }`;

          // Add to page
          const container = document.querySelector("#advertised-properties");
          if (container) {
            container.insertBefore(notification, container.firstChild);
          }

          // Fade out and remove notification after 5 seconds
          setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => notification.remove(), 500);
          }, 5000);
        }
      } catch (error) {
        console.error("Error cancelling advertising package:", error);

        // Show error notification
        const notification = document.createElement("div");
        notification.className = "alert alert-error";
        notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> An error occurred while cancelling the advertising package.`;

        // Add to page
        const container = document.querySelector("#advertised-properties");
        if (container) {
          container.insertBefore(notification, container.firstChild);
        }

        // Fade out and remove notification after 5 seconds
        setTimeout(() => {
          notification.style.opacity = "0";
          setTimeout(() => notification.remove(), 500);
        }, 5000);
      }
    });
  });
}

// Function to initialize all Add Funds buttons
function initializeAllAddFundsButtons() {
  const allAddFundsButtons = document.querySelectorAll(
    ".add-funds, .finance-action"
  );

  allAddFundsButtons.forEach((button) => {
    // Only attach event if it's an Add Funds button
    if (
      button.textContent.includes("Add Funds") ||
      button.innerHTML.includes("Add Funds")
    ) {
      button.addEventListener("click", function (e) {
        e.preventDefault();

        // Simple modal to add funds
        const amount = prompt("Enter amount to add to your account:");
        if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
          // Show loading state on all balance amount elements
          const balanceAmounts = document.querySelectorAll(".balance-amount");
          const originalTexts = Array.from(balanceAmounts).map(
            (el) => el.textContent
          );

          balanceAmounts.forEach((el) => {
            el.textContent = "Updating...";
          });

          // Call the API to update balance
          fetch("/dashboard/update-balance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount: parseFloat(amount) }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                // Update all displayed balances with the new value from the server
                balanceAmounts.forEach((el) => {
                  el.textContent =
                    "$" + data.user.accountBalance.toLocaleString();
                });
                alert("Funds added successfully!");
              } else {
                // Restore original text and show error
                balanceAmounts.forEach((el, index) => {
                  el.textContent = originalTexts[index];
                });
                alert("Failed to add funds: " + data.message);
              }
            })
            .catch((error) => {
              console.error("Error adding funds:", error);
              balanceAmounts.forEach((el, index) => {
                el.textContent = originalTexts[index];
              });
              alert("Failed to add funds. Please try again later.");
            });
        }
      });
    }
  });
}

// Function to initialize rented properties buttons for buyers
function initializeRentedPropertiesButtons() {
  // Contact landlord buttons
  const contactLandlordButtons = document.querySelectorAll(
    ".contact-landlord-btn"
  );
  contactLandlordButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const landlordEmail = this.getAttribute("data-landlord-email");
      if (landlordEmail) {
        // Open email client
        window.location.href = `mailto:${landlordEmail}?subject=Regarding%20Your%20Rental%20Property`;
      } else {
        alert(
          "Landlord email is not available. Please contact the site administrator for assistance."
        );
      }
    });
  });

  // Cancel Agreement forms with JavaScript enhancement
  const cancelAgreementForms = document.querySelectorAll(
    ".js-cancel-rental-form"
  );
  cancelAgreementForms.forEach((form) => {
    form.addEventListener("submit", function (event) {
      // Prevent the default form submission
      event.preventDefault();

      // Get the property ID from the form's action URL
      const actionUrl = this.getAttribute("action");
      const submitButton = this.querySelector('button[type="submit"]');

      // Show loading state
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Processing...';
      submitButton.disabled = true;

      // Send cancellation request to server
      fetch(actionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
        .then((response) => {
          // Check if the response is JSON
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
          } else {
            // Handle non-JSON responses (like redirects or HTML)
            if (response.ok) {
              window.location.href =
                "/dashboard?section=my-purchases&success=Rental agreement cancelled successfully";
              return { success: true };
            } else {
              throw new Error("Server returned an error");
            }
          }
        })
        .then((data) => {
          if (data.success) {
            // Show success message
            alert("Rental agreement cancelled successfully.");

            // Redirect to the dashboard
            window.location.href =
              "/dashboard?section=my-purchases&success=Rental agreement cancelled successfully";
          } else {
            // Show error message
            alert(data.message || "Failed to cancel rental agreement");

            // Reset button state
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
          }
        })
        .catch((error) => {
          console.error("Error cancelling rental agreement:", error);
          alert(
            "An error occurred while cancelling the rental agreement. Please try again later."
          );

          // Reset button state
          submitButton.innerHTML = originalText;
          submitButton.disabled = false;
        });
    });
  });

  // Legacy support for the report-issue-btn class button click
  const cancelAgreementButtons = document.querySelectorAll(".report-issue-btn");
  cancelAgreementButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const propertyId = this.getAttribute("data-property-id");

      // Show confirmation dialog
      if (
        confirm(
          "Are you sure you want to cancel this rental agreement? This action cannot be undone."
        )
      ) {
        // Show loading state
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        this.disabled = true;

        // Send cancellation request to server
        fetch(`/property/${propertyId}/cancel-rental`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
          .then((response) => {
            // Check if the response is JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              return response.json();
            } else {
              // Handle non-JSON responses (like redirects or HTML)
              if (response.ok) {
                window.location.href =
                  "/dashboard?section=my-properties&success=Rental agreement cancelled successfully";
                return { success: true };
              } else {
                throw new Error("Server returned an error");
              }
            }
          })
          .then((data) => {
            if (data.success) {
              // Show success message
              alert("Rental agreement cancelled successfully.");

              // Redirect to the dashboard
              window.location.href =
                "/dashboard?section=my-properties&success=Rental agreement cancelled successfully";
            } else {
              // Show error message
              alert(data.message || "Failed to cancel rental agreement");

              // Reset button state
              this.innerHTML = originalText;
              this.disabled = false;
            }
          })
          .catch((error) => {
            console.error("Error cancelling rental agreement:", error);
            alert(
              "An error occurred while cancelling the rental agreement. Please try again later."
            );

            // Reset button state
            this.innerHTML = originalText;
            this.disabled = false;
          });
      }
    });
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  // Initialize time remaining progress bars
  document
    .querySelectorAll(".time-remaining-progress[data-width]")
    .forEach(function (element) {
      element.style.width = element.getAttribute("data-width");
    });

  // Get filter elements
  const statusFilter = document.getElementById("property-status");
  const typeFilter = document.getElementById("property-type");
  const searchBox = document.querySelector(".search-box input");
  const statCards = document.querySelectorAll(".stat-card");

  // Function to filter properties
  function filterProperties() {
    const status = statusFilter.value;
    const type = typeFilter.value;
    const searchTerm = searchBox.value.toLowerCase();

    // Get all property items
    const propertyItems = document.querySelectorAll(".property-approval-item");

    // Counter for visible properties
    let visibleCount = 0;

    propertyItems.forEach((item) => {
      let showItem = true;

      // Filter by status
      if (status !== "all") {
        // Check if the item has exactly the class that matches the status
        if (!item.classList.contains(status)) {
          showItem = false;
        }
      }

      // Filter by type
      if (type !== "all" && showItem) {
        const propertyInfoElement = item.querySelector(".property-info");
        if (propertyInfoElement && propertyInfoElement.dataset.propertyType) {
          const propertyType = propertyInfoElement.dataset.propertyType;
          if (propertyType !== type) {
            showItem = false;
          }
        }
      }

      // Filter by search term
      if (searchTerm && showItem) {
        const title = item.querySelector("h3").textContent.toLowerCase();
        const location = item
          .querySelector(".property-location")
          .textContent.toLowerCase();
        if (!title.includes(searchTerm) && !location.includes(searchTerm)) {
          showItem = false;
        }
      }

      // Show/hide item
      item.style.display = showItem ? "block" : "none";

      // Count visible properties
      if (showItem) {
        visibleCount++;
      }
    });

    // Update active state of stat cards
    statCards.forEach((card) => {
      const filterValue = card.dataset.filter;
      if (filterValue === status) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });

    // Show no properties message if needed
    const noPropertiesMessage = document.getElementById(
      "no-properties-message"
    );
    if (noPropertiesMessage) {
      noPropertiesMessage.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  // Add event listeners
  statusFilter.addEventListener("change", filterProperties);
  typeFilter.addEventListener("change", filterProperties);
  searchBox.addEventListener("input", filterProperties);

  // Add click event listeners to stat cards
  statCards.forEach((card) => {
    card.addEventListener("click", () => {
      const filterValue = card.dataset.filter;
      statusFilter.value = filterValue;
      filterProperties();
    });
  });

  // Initial filter
  filterProperties();
});

// Property Form Validation
document.addEventListener("DOMContentLoaded", function () {
  const propertyForm = document.getElementById("propertyForm");
  const submitBtn = document.getElementById("submitBtn");
  const resetBtn = document.getElementById("resetBtn");
  const formMessage = document.getElementById("formMessage");

  // Form field elements
  const titleInput = document.getElementById("title");
  const typeSelect = document.getElementById("type");
  const tagSelect = document.getElementById("tag");
  const priceInput = document.getElementById("price");
  const locationInput = document.getElementById("location");
  const sqftInput = document.getElementById("sqft");
  const bedsInput = document.getElementById("beds");
  const bathsInput = document.getElementById("baths");
  const kitchenInput = document.getElementById("kitchen");
  const descriptionTextarea = document.getElementById("description");
  const imagesInput = document.getElementById("images");
  const estPaymentInput = document.getElementById("estPayment");

  // Validation functions
  function validateTitle(title) {
    const titlePattern = /^[a-zA-Z0-9\s\-.,]{5,100}$/;
    return titlePattern.test(title.trim());
  }

  function validatePrice(price) {
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice >= 1000 && numPrice <= 100000000;
  }

  function validateLocation(location) {
    return location.trim().length >= 10 && location.trim().length <= 200;
  }

  function validateSqft(sqft) {
    const numSqft = parseInt(sqft);
    return !isNaN(numSqft) && numSqft >= 100 && numSqft <= 50000;
  }

  function validateBeds(beds) {
    const numBeds = parseInt(beds);
    return !isNaN(numBeds) && numBeds >= 0 && numBeds <= 20;
  }

  function validateBaths(baths) {
    const numBaths = parseFloat(baths);
    return !isNaN(numBaths) && numBaths >= 1 && numBaths <= 20;
  }

  function validateKitchen(kitchen) {
    const numKitchen = parseInt(kitchen);
    return !isNaN(numKitchen) && numKitchen >= 1 && numKitchen <= 10;
  }

  function validateDescription(description) {
    const text = description.trim();
    return text.length >= 50 && text.length <= 2000;
  }

  function validateImages(files) {
    if (!files || files.length === 0) return false;
    if (files.length > 5) return false;

    for (let file of files) {
      if (!file.type.startsWith("image/")) return false;
      if (file.size > 10 * 1024 * 1024) return false; // 10MB limit
    }
    return true;
  }

  // Show error message
  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + "Error");
    const successElement = document.getElementById(fieldId + "Success");
    const formGroup = field.closest(".form-group");

    formGroup.classList.add("error");
    formGroup.classList.remove("valid");
    errorElement.innerHTML =
      '<i class="fas fa-exclamation-circle"></i>' + message;
    errorElement.classList.add("show");
    successElement.classList.remove("show");
  }

  // Show success message
  function showSuccess(fieldId, message = "Valid") {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + "Error");
    const successElement = document.getElementById(fieldId + "Success");
    const formGroup = field.closest(".form-group");

    formGroup.classList.add("valid");
    formGroup.classList.remove("error");
    errorElement.classList.remove("show");
    successElement.innerHTML = '<i class="fas fa-check-circle"></i>' + message;
    successElement.classList.add("show");
  }

  // Clear validation state
  function clearValidation(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + "Error");
    const successElement = document.getElementById(fieldId + "Success");
    const formGroup = field.closest(".form-group");

    formGroup.classList.remove("error", "valid");
    errorElement.classList.remove("show");
    successElement.classList.remove("show");
  }

  // Validate individual field
  function validateField(fieldId) {
    switch (fieldId) {
      case "title":
        const title = titleInput.value;
        if (!title.trim()) {
          showError("title", "Property title is required");
          return false;
        } else if (!validateTitle(title)) {
          showError(
            "title",
            "Title must be 5-100 characters long and contain only letters, numbers, spaces, and basic punctuation"
          );
          return false;
        } else {
          showSuccess("title", "Valid title");
          return true;
        }

      case "type":
        const type = typeSelect.value;
        if (!type) {
          showError("type", "Please select a property type");
          return false;
        } else {
          showSuccess("type", "Property type selected");
          return true;
        }

      case "tag":
        const tag = tagSelect.value;
        if (!tag) {
          showError("tag", "Please select listing type (For Sale or For Rent)");
          return false;
        } else {
          showSuccess("tag", "Listing type selected");
          return true;
        }

      case "price":
        const price = priceInput.value;
        if (!price) {
          showError("price", "Price is required");
          return false;
        } else if (!validatePrice(price)) {
          showError("price", "Price must be between $1,000 and $100,000,000");
          return false;
        } else {
          showSuccess("price", "Valid price");
          calculateEstPayment();
          return true;
        }

      case "location":
        const location = locationInput.value;
        if (!location.trim()) {
          showError("location", "Location is required");
          return false;
        } else if (!validateLocation(location)) {
          showError("location", "Location must be 10-200 characters long");
          return false;
        } else {
          showSuccess("location", "Valid location");
          return true;
        }

      case "sqft":
        const sqft = sqftInput.value;
        if (!sqft) {
          showError("sqft", "Square footage is required");
          return false;
        } else if (!validateSqft(sqft)) {
          showError(
            "sqft",
            "Square footage must be between 100 and 50,000 sqft"
          );
          return false;
        } else {
          showSuccess("sqft", "Valid square footage");
          return true;
        }

      case "beds":
        const beds = bedsInput.value;
        if (beds === "") {
          showError("beds", "Number of bedrooms is required");
          return false;
        } else if (!validateBeds(beds)) {
          showError("beds", "Bedrooms must be between 0 and 20");
          return false;
        } else {
          showSuccess("beds", "Valid bedroom count");
          return true;
        }

      case "baths":
        const baths = bathsInput.value;
        if (!baths) {
          showError("baths", "Number of bathrooms is required");
          return false;
        } else if (!validateBaths(baths)) {
          showError("baths", "Bathrooms must be between 1 and 20");
          return false;
        } else {
          showSuccess("baths", "Valid bathroom count");
          return true;
        }

      case "kitchen":
        const kitchen = kitchenInput.value;
        if (!kitchen) {
          showError("kitchen", "Number of kitchens is required");
          return false;
        } else if (!validateKitchen(kitchen)) {
          showError("kitchen", "Kitchens must be between 1 and 10");
          return false;
        } else {
          showSuccess("kitchen", "Valid kitchen count");
          return true;
        }

      case "description":
        const description = descriptionTextarea.value;
        if (!description.trim()) {
          showError("description", "Property description is required");
          return false;
        } else if (!validateDescription(description)) {
          showError(
            "description",
            "Description must be between 50 and 2000 characters"
          );
          return false;
        } else {
          showSuccess("description", "Valid description");
          return true;
        }

      case "images":
        const files = imagesInput.files;
        if (!validateImages(files)) {
          if (!files || files.length === 0) {
            showError("images", "At least one image is required");
          } else if (files.length > 5) {
            showError("images", "Maximum 5 images allowed");
          } else {
            showError(
              "images",
              "Please upload valid image files (max 10MB each)"
            );
          }
          return false;
        } else {
          showSuccess("images", files.length + " image(s) selected");
          return true;
        }

      default:
        return true;
    }
  }

  // Calculate estimated payment
  function calculateEstPayment() {
    const price = parseFloat(priceInput.value);
    const tag = tagSelect.value;

    if (!isNaN(price) && tag) {
      let estimate;
      if (tag === "rent") {
        estimate = "$" + price.toLocaleString();
      } else {
        // For sale: estimate monthly mortgage payment (rough calculation)
        const monthlyPayment = price * 0.005; // Rough 0.5% of price per month
        estimate = "$" + Math.round(monthlyPayment).toLocaleString();
      }
      estPaymentInput.value = estimate;
    }
  }

  // Real-time validation
  titleInput.addEventListener("blur", () => validateField("title"));
  typeSelect.addEventListener("change", () => validateField("type"));
  tagSelect.addEventListener("change", () => {
    validateField("tag");
    calculateEstPayment();
  });
  priceInput.addEventListener("blur", () => validateField("price"));
  priceInput.addEventListener("input", () => {
    if (priceInput.value) calculateEstPayment();
  });
  locationInput.addEventListener("blur", () => validateField("location"));
  sqftInput.addEventListener("blur", () => validateField("sqft"));
  bedsInput.addEventListener("change", () => validateField("beds"));
  bathsInput.addEventListener("change", () => validateField("baths"));
  kitchenInput.addEventListener("change", () => validateField("kitchen"));
  descriptionTextarea.addEventListener("blur", () =>
    validateField("description")
  );
  imagesInput.addEventListener("change", () => validateField("images"));

  // Input event for real-time feedback
  titleInput.addEventListener("input", () => {
    if (titleInput.value.length > 0) validateField("title");
  });

  locationInput.addEventListener("input", () => {
    if (locationInput.value.length > 0) validateField("location");
  });

  descriptionTextarea.addEventListener("input", () => {
    if (descriptionTextarea.value.length > 0) validateField("description");
  });

  // Form submission
  if (propertyForm) {
    propertyForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate all fields
      const validations = [
        validateField("title"),
        validateField("type"),
        validateField("tag"),
        validateField("price"),
        validateField("location"),
        validateField("sqft"),
        validateField("beds"),
        validateField("baths"),
        validateField("kitchen"),
        validateField("description"),
        validateField("images"),
      ];

      const isFormValid = validations.every(
        (validation) => validation === true
      );

      if (!isFormValid) {
        formMessage.innerHTML =
          '<i class="fas fa-exclamation-circle"></i> Please fix all validation errors before submitting.';
        formMessage.className = "form-message error";

        // Scroll to first error
        const firstError = document.querySelector(".form-group.error");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-pulse"></i> Creating Listing...';
      formMessage.innerHTML =
        '<i class="fas fa-spinner fa-pulse"></i> Creating your property listing...';
      formMessage.className = "form-message";
      formMessage.style.display = "block";

      // Submit the form
      this.submit();
    });
  }

  // Reset form
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      // Clear all validation states
      [
        "title",
        "type",
        "tag",
        "price",
        "location",
        "sqft",
        "beds",
        "baths",
        "kitchen",
        "description",
        "images",
      ].forEach((fieldId) => {
        clearValidation(fieldId);
      });

      formMessage.style.display = "none";
      estPaymentInput.value = "";

      // Reset submit button
      submitBtn.disabled = false;
      submitBtn.innerHTML = "List Property";
    });
  }
});

// Add this at the beginning of your script section
function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  document.getElementById("currentDateTime").textContent =
    now.toLocaleDateString("en-US", options);
}

// Update date/time every minute
updateDateTime();
setInterval(updateDateTime, 60000);

// Navigation handling
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const targetSection = item.getAttribute("data-section");

    // Update active nav item
    document
      .querySelectorAll(".nav-item")
      .forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");

    // Show target section
    document.querySelectorAll(".dashboard-section").forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(targetSection).classList.add("active");

    // Scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Update URL hash
    window.location.hash = targetSection;
  });
});

// Initialize all charts
function initializeCharts() {
  // Sales Chart
  const salesCtx = document.getElementById("salesChart").getContext("2d");
  new Chart(salesCtx, {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Sales ($)",
          data: [65000, 89000, 78000, 95000, 110000, 130000],
          borderColor: "#1976d2",
          tension: 0.4,
          fill: true,
          backgroundColor: "rgba(25, 118, 210, 0.1)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });

  // Views Chart
  const viewsCtx = document.getElementById("viewsChart").getContext("2d");
  new Chart(viewsCtx, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Views",
          data: [150, 230, 180, 290, 200, 250, 300],
          backgroundColor: "#388e3c",
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });

  // Property Types Chart (Pie Chart)
  const propertyTypesCtx = document
    .getElementById("propertyTypesChart")
    .getContext("2d");
  new Chart(propertyTypesCtx, {
    type: "pie",
    data: {
      labels: ["Houses", "Apartments", "Villas", "Cottages", "Lofts"],
      datasets: [
        {
          data: [45, 25, 15, 10, 5],
          backgroundColor: [
            "#1976d2", // Blue
            "#388e3c", // Green
            "#f57c00", // Orange
            "#d81b60", // Pink
            "#8e24aa", // Purple
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 11,
            },
          },
        },
      },
    },
  });

  // Monthly Inquiries Chart
  const inquiriesCtx = document
    .getElementById("inquiriesChart")
    .getContext("2d");
  new Chart(inquiriesCtx, {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Inquiries",
          data: [65, 85, 72, 95, 105, 120],
          backgroundColor: "#8e24aa",
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

// Handle URL hash on page load
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.substring(1);
  if (hash) {
    const targetSection = document.getElementById(hash);
    if (targetSection) {
      // Hide all sections
      document.querySelectorAll(".dashboard-section").forEach((section) => {
        section.classList.remove("active");
      });

      // Show target section
      targetSection.classList.add("active");

      // Update active nav item
      document.querySelectorAll(".nav-item").forEach((nav) => {
        nav.classList.remove("active");
        if (nav.getAttribute("data-section") === hash) {
          nav.classList.add("active");
        }
      });

      // Scroll to the top of the page
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });

      // Show temporary success message if coming from profile update
      if (hash === "profile" && !document.referrer.includes("dashboard")) {
        showProfileUpdateSuccess();
      }
    }
  }

  // Initialize charts
  initializeCharts();
});

// Function to show temporary success message
function showProfileUpdateSuccess() {
  // Create success message element
  const successMessage = document.createElement("div");
  successMessage.className = "alert alert-success";
  successMessage.innerHTML =
    '<i class="fas fa-check-circle"></i> Profile updated successfully!';
  successMessage.style.opacity = "1";
  successMessage.style.transition = "opacity 0.5s ease";

  // Insert at the top of the profile container
  const profileHeader = document.querySelector("#profile .section-header");
  profileHeader.appendChild(successMessage);

  // Remove after 3 seconds
  setTimeout(() => {
    successMessage.style.opacity = "0";
    setTimeout(() => {
      successMessage.remove();
    }, 500);
  }, 3000);
}

// Check if we need to show success message after form submission
if (window.location.hash === "#profile" && performance.navigation.type === 1) {
  showProfileUpdateSuccess();
}

// Calculate estimated monthly payment
document.getElementById("price").addEventListener("input", function () {
  const price = parseFloat(this.value) || 0;
  const monthlyPayment = (price * 0.05).toFixed(2);
  document.getElementById("estPayment").value = `$${monthlyPayment}/mo*`;
});

// Image preview functionality
document.getElementById("images").addEventListener("change", function (e) {
  const preview = document.getElementById("image-preview");
  preview.innerHTML = "";

  for (let i = 0; i < Math.min(this.files.length, 5); i++) {
    const file = this.files[i];
    const reader = new FileReader();

    reader.onload = function (e) {
      const div = document.createElement("div");
      div.className = "preview-image";
      div.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <span class="remove-image">&times;</span>
                    `;
      preview.appendChild(div);
    };

    reader.readAsDataURL(file);
  }
});

// Remove image preview
document
  .getElementById("image-preview")
  .addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-image")) {
      e.target.parentElement.remove();
    }
  });

// Property form submission
document
  .getElementById("propertyForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    // Add your form submission logic here
    alert("Property listing form submitted!");
  });

// Update property filtering
document
  .getElementById("propertyFilter")
  ?.addEventListener("change", function () {
    const filterType = this.value;
    const cards = document.querySelectorAll(".property-card");
    let visibleCount = 0;

    cards.forEach((card) => {
      if (filterType === "all" || card.dataset.type === filterType) {
        card.style.display = "block";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    // Show no properties message if no cards are visible
    const noProperties = document.querySelector(".no-properties");
    if (noProperties) {
      if (visibleCount === 0) {
        noProperties.style.display = "block";

        // Check if there are sold properties
        const hasSoldProperties =
          noProperties.dataset.hasSoldProperties === "true";

        if (hasSoldProperties) {
          noProperties.querySelector("h3").textContent = "All Properties Sold";
          noProperties.querySelector("p").textContent =
            "Congratulations! All your properties have been sold. Would you like to add a new listing?";
        } else {
          noProperties.querySelector("h3").textContent = `No ${
            filterType === "all"
              ? ""
              : filterType === "rent"
              ? "Rental"
              : "Sale"
          } Properties Found`;
          noProperties.querySelector("p").textContent =
            "You haven't listed any properties yet.";
        }
      } else {
        noProperties.style.display = "none";
      }
    }
  });

// Delete property function
function deleteProperty(propertyId) {
  if (confirm("Are you sure you want to delete this property?")) {
    console.log("Deleting property:", propertyId);
    fetch(`/property/${propertyId}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          // Remove the card from the UI
          const card = document.querySelector(
            `.property-card[data-id="${propertyId}"]`
          );
          console.log("Property card element:", card);
          if (card) {
            card.remove();
          }
          // Show success message
          alert("Property deleted successfully");
          // Refresh the page to update the list
          window.location.reload();
        } else {
          throw new Error("Failed to delete property");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to delete property. Please try again.");
      });
  }
}

// Profile image preview
document
  .getElementById("profileImage")
  .addEventListener("change", function (e) {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("profile-preview").src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

// Profile form submission
document
  .getElementById("profileForm")
  ?.addEventListener("submit", function (e) {
    // Show loading state
    const submitBtn = this.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Saving...";
    submitBtn.disabled = true;

    // Set a flag in sessionStorage to show success message after redirect
    sessionStorage.setItem("profileUpdated", "true");

    // Form will submit normally
    // We're just showing a loading state

    // Log form data for debugging
    const formData = new FormData(this);
    console.log("Submitting profile form with data:");
    for (let [key, value] of formData.entries()) {
      console.log(key + ": " + value);
    }
  });

// Check if we need to show success message after redirect
if (
  window.location.hash === "#profile" &&
  sessionStorage.getItem("profileUpdated") === "true"
) {
  showProfileUpdateSuccess();
  // Clear the flag
  sessionStorage.removeItem("profileUpdated");
}

// Agent: Document Upload Handling
if (document.getElementById("idProof")) {
  // ID Proof
  document.getElementById("idProof").addEventListener("change", function (e) {
    const fileName = this.files[0] ? this.files[0].name : "No file chosen";
    document.getElementById("idProofName").textContent = fileName;
  });

  // License
  document.getElementById("license").addEventListener("change", function (e) {
    const fileName = this.files[0] ? this.files[0].name : "No file chosen";
    document.getElementById("licenseName").textContent = fileName;
  });

  // Address Proof
  document
    .getElementById("addressProof")
    .addEventListener("change", function (e) {
      const fileName = this.files[0] ? this.files[0].name : "No file chosen";
      document.getElementById("addressProofName").textContent = fileName;
    });

  // Certifications
  document
    .getElementById("certifications")
    .addEventListener("change", function (e) {
      const fileName = this.files[0] ? this.files[0].name : "No file chosen";
      document.getElementById("certificationsName").textContent = fileName;
    });

  // Profile Photo
  document
    .getElementById("profilePhoto")
    .addEventListener("change", function (e) {
      const fileName = this.files[0] ? this.files[0].name : "No file chosen";
      document.getElementById("profilePhotoName").textContent = fileName;
    });
}

// Agent: Property Filtering
if (document.getElementById("propertyStatusFilter")) {
  document
    .getElementById("propertyStatusFilter")
    .addEventListener("change", function () {
      const selectedStatus = this.value;
      const propertyCards = document.querySelectorAll(".property-card");

      propertyCards.forEach((card) => {
        if (
          selectedStatus === "all" ||
          card.dataset.status === selectedStatus
        ) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
}

// Initialize all charts when the page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeCharts();

  // Check if we need to show success message for profile update
  if (
    window.location.hash === "#profile" &&
    window.location.search.includes("updated=true")
  ) {
    const profileSection = document.getElementById("profile");
    if (profileSection) {
      const successMessage = document.createElement("div");
      successMessage.className = "success-message";
      successMessage.textContent = "Profile updated successfully!";
      profileSection
        .querySelector(".section-header")
        .appendChild(successMessage);

      // Remove the message after 3 seconds
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    }
  }

  // Messages section functionality
  initializeMessagesSection();
});

function initializeMessagesSection() {
  // Only initialize if the messages section exists
  const messagesSection = document.getElementById("messages");
  if (!messagesSection) return;

  // Message filtering functionality
  const statusFilter = document.getElementById("message-status");
  const propertyFilter = document.getElementById("message-property");
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".search-btn");

  if (statusFilter) {
    statusFilter.addEventListener("change", filterMessages);
  }

  if (propertyFilter) {
    propertyFilter.addEventListener("change", filterMessages);
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      filterMessages();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        filterMessages();
      }
    });
  }

  // Message item click handlers
  const messageItems = document.querySelectorAll(".message-item");
  messageItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      // Don't open detail view if clicking on action buttons
      if (e.target.closest(".message-actions")) {
        return;
      }

      // Show message detail view
      const messagesList = document.querySelector(".messages-list");
      const messageDetail = document.querySelector(".message-detail");
      const filters = document.querySelector(".message-filters");
      const pagination = document.querySelector(
        ".messages-container .pagination"
      );

      if (messagesList && messageDetail && filters && pagination) {
        messagesList.style.display = "none";
        filters.style.display = "none";
        pagination.style.display = "none";
        messageDetail.style.display = "block";

        // If this is an unread message, mark it as read
        if (item.classList.contains("unread")) {
          // In a real app, you would send an API request here
          // For now, just update the UI
          item.classList.remove("unread");
          item.classList.add("read");
        }

        // Update detail view with message data
        updateMessageDetail(item);
      }
    });
  });

  // Action button handlers
  const viewButtons = document.querySelectorAll(".view-btn");
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const messageItem = this.closest(".message-item");
      if (messageItem) {
        // Trigger the same action as clicking the message item
        messageItem.click();
      }
    });
  });

  const replyButtons = document.querySelectorAll(".reply-btn");
  replyButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const messageItem = this.closest(".message-item");
      if (messageItem) {
        // Show detail view and focus on reply textarea
        messageItem.click();
        setTimeout(() => {
          const replyTextarea = document.getElementById("reply-text");
          if (replyTextarea) {
            replyTextarea.focus();
          }
        }, 100);
      }
    });
  });

  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (confirm("Are you sure you want to delete this message?")) {
        const messageItem = this.closest(".message-item");
        if (messageItem) {
          // In a real app, you would send an API request here
          // For now, just remove the item from the UI
          messageItem.style.opacity = "0";
          setTimeout(() => {
            messageItem.remove();
          }, 300);
        }
      }
    });
  });

  // Back to list button
  const backButton = document.querySelector(".back-to-list");
  if (backButton) {
    backButton.addEventListener("click", function () {
      const messagesList = document.querySelector(".messages-list");
      const messageDetail = document.querySelector(".message-detail");
      const filters = document.querySelector(".message-filters");
      const pagination = document.querySelector(
        ".messages-container .pagination"
      );

      if (messagesList && messageDetail && filters && pagination) {
        messagesList.style.display = "flex";
        filters.style.display = "flex";
        pagination.style.display = "flex";
        messageDetail.style.display = "none";
      }
    });
  }

  // Reply form handlers
  const sendReplyBtn = document.querySelector(".send-reply-btn");
  if (sendReplyBtn) {
    sendReplyBtn.addEventListener("click", function () {
      const replyText = document.getElementById("reply-text");
      if (replyText && replyText.value.trim()) {
        // In a real app, you would send an API request here
        alert("Reply sent successfully!");

        // Update the message item to show it's been replied to
        const messageId =
          document.querySelector(".message-detail").dataset.messageId;
        const messageItem = document.querySelector(
          `.message-item[data-id="${messageId}"]`
        );
        if (messageItem) {
          messageItem.classList.remove("unread", "read");
          messageItem.classList.add("replied");
        }

        // Clear the reply text and go back to the list
        replyText.value = "";
        document.querySelector(".back-to-list").click();
      } else {
        alert("Please enter a reply before sending.");
      }
    });
  }

  const saveDraftBtn = document.querySelector(".save-draft-btn");
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", function () {
      const replyText = document.getElementById("reply-text");
      if (replyText && replyText.value.trim()) {
        // In a real app, you would save this to local storage or send to an API
        alert("Draft saved successfully!");
      } else {
        alert("Nothing to save as draft.");
      }
    });
  }

  // Mark as read button
  const markBtn = document.querySelector(".mark-btn");
  if (markBtn) {
    markBtn.addEventListener("click", function () {
      // In a real app, you would send an API request here
      alert("Message marked as read!");

      // Update the message item to show it's been read
      const messageId =
        document.querySelector(".message-detail").dataset.messageId;
      const messageItem = document.querySelector(
        `.message-item[data-id="${messageId}"]`
      );
      if (messageItem && messageItem.classList.contains("unread")) {
        messageItem.classList.remove("unread");
        messageItem.classList.add("read");
      }
    });
  }

  // Detail view delete button
  const detailDeleteBtn = document.querySelector(".detail-actions .delete-btn");
  if (detailDeleteBtn) {
    detailDeleteBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to delete this message?")) {
        // In a real app, you would send an API request here
        const messageId =
          document.querySelector(".message-detail").dataset.messageId;
        const messageItem = document.querySelector(
          `.message-item[data-id="${messageId}"]`
        );

        if (messageItem) {
          messageItem.remove();
        }

        // Go back to the list
        document.querySelector(".back-to-list").click();
      }
    });
  }
}

function filterMessages() {
  const statusFilter = document.getElementById("message-status");
  const propertyFilter = document.getElementById("message-property");
  const searchInput = document.querySelector(".search-input");

  const statusValue = statusFilter ? statusFilter.value : "all";
  const propertyValue = propertyFilter ? propertyFilter.value : "all";
  const searchValue = searchInput ? searchInput.value.toLowerCase() : "";

  const messageItems = document.querySelectorAll(".message-item");

  messageItems.forEach((item) => {
    let showItem = true;

    // Filter by status
    if (statusValue !== "all") {
      if (!item.classList.contains(statusValue)) {
        showItem = false;
      }
    }

    // Filter by property
    if (showItem && propertyValue !== "all") {
      const propertyText = item.querySelector(".message-property").textContent;
      if (!propertyText.includes(propertyValue)) {
        showItem = false;
      }
    }

    // Filter by search text
    if (showItem && searchValue) {
      const senderName = item
        .querySelector(".sender-name")
        .textContent.toLowerCase();
      const messagePreview = item
        .querySelector(".message-preview")
        .textContent.toLowerCase();
      const propertyText = item
        .querySelector(".message-property")
        .textContent.toLowerCase();

      if (
        !senderName.includes(searchValue) &&
        !messagePreview.includes(searchValue) &&
        !propertyText.includes(searchValue)
      ) {
        showItem = false;
      }
    }

    // Show or hide the item
    item.style.display = showItem ? "flex" : "none";
  });
}

function updateMessageDetail(messageItem) {
  const messageDetail = document.querySelector(".message-detail");
  if (!messageDetail) return;

  // Set the message ID on the detail view for reference
  const messageId =
    messageItem.dataset.id ||
    messageItem.querySelector(".message-actions button").dataset.id;
  messageDetail.dataset.messageId = messageId;

  // Update the detail view with message data
  const senderName = messageItem.querySelector(".sender-name").textContent;
  const messageDate = messageItem.querySelector(".message-date").textContent;
  const propertyText = messageItem
    .querySelector(".message-property")
    .textContent.trim();

  document.getElementById("detail-sender").textContent = senderName;
  document.getElementById("detail-date").textContent = messageDate;
  document.getElementById("detail-property").textContent = propertyText;

  // In a real app, you would fetch the full message details from an API
  // For now, we'll use placeholder data
  document.getElementById("detail-email").textContent = `${senderName
    .toLowerCase()
    .replace(" ", ".")}@example.com`;
  document.getElementById("detail-phone").textContent = "(555) 123-4567";

  // Update mark as read button text based on message status
  const markBtn = document.querySelector(".mark-btn");
  if (markBtn) {
    if (messageItem.classList.contains("unread")) {
      markBtn.innerHTML = '<i class="fas fa-check-circle"></i> Mark as Read';
    } else {
      markBtn.innerHTML = '<i class="fas fa-envelope"></i> Mark as Unread';
    }
  }
}

// Admin Dashboard Functionality
function initializeAdminDashboard() {
  // Only initialize if we're on the admin dashboard
  if (
    !document.querySelector(
      'body:has(.sidebar-nav a[href="#agent-verification"])'
    )
  )
    return;
}

function initializePropertyApproval() {
  // Property approval modal functionality
  const propertyModal = document.getElementById("property-detail-modal");
  const viewButtons = document.querySelectorAll(".view-property-btn");
  const closeModal = propertyModal?.querySelector(".close-modal");
  let currentPropertyId = null; // Keep track of currently viewed property

  // Initialize image carousel
  initializePropertyImageCarousel();

  // Handle clicks on stat cards to filter properties
  const statCards = document.querySelectorAll(".approval-stats .stat-card");

  statCards.forEach((card) => {
    card.addEventListener("click", function () {
      const filterValue = this.getAttribute("data-filter");
      const propertyStatusFilter = document.getElementById("property-status");

      // Update the filter dropdown value
      if (propertyStatusFilter) {
        propertyStatusFilter.value = filterValue;
        // Trigger the change event to filter properties
        propertyStatusFilter.dispatchEvent(new Event("change"));
      }

      // Add active class to the clicked card and remove from others
      statCards.forEach((c) => c.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Show property details modal
  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const propertyId = this.getAttribute("data-property-id");
      currentPropertyId = propertyId; // Save current property ID

      // Fetch property details from the server
      fetch(`/property/${propertyId}?format=json`)
        .then((response) => response.json())
        .then((data) => {
          if (data.property) {
            displayPropertyDetails(data.property);
            showModal();
          } else {
            alert("Failed to load property details. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error fetching property details:", error);
          alert("Failed to load property details. Please try again.");
        });
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

    // Set property details
    const detailsEl = document.getElementById("modal-property-details");
    if (detailsEl && property.features) {
      detailsEl.innerHTML = `
                        <div class="detail-row">
                            <span>Property Type:</span>
                            <p>${property.features.type || "Not specified"}</p>
                        </div>
                        <div class="detail-row">
                            <span>Bedrooms:</span>
                            <p>${property.features.beds || "0"}</p>
                        </div>
                        <div class="detail-row">
                            <span>Bathrooms:</span>
                            <p>${property.features.baths || "0"}</p>
                        </div>
                        <div class="detail-row">
                            <span>Area:</span>
                            <p>${property.features.sqft || "0"} sqft</p>
                        </div>
                        <div class="detail-row">
                            <span>Property Status:</span>
                            <p>${
                              property.tag === "sale" ? "For Sale" : "For Rent"
                            }</p>
                        </div>
                    `;
    }

    // Set property amenities
    const amenitiesEl = document.getElementById("modal-property-amenities");
    if (amenitiesEl && property.amenities && property.amenities.length > 0) {
      amenitiesEl.innerHTML = property.amenities
        .map(
          (amenity) =>
            `<span class="amenity-tag"><i class="fas fa-check"></i> ${amenity}</span>`
        )
        .join("");
    } else if (amenitiesEl) {
      amenitiesEl.innerHTML = "<p>No amenities listed</p>";
    }

    // Set seller information
    const sellerInfoEl = document.getElementById("modal-seller-info");
    if (sellerInfoEl && property.seller) {
      sellerInfoEl.innerHTML = `
                        <div class="seller-profile">
                            <img src="${
                              property.seller.profileImage ||
                              "/images/default-avatar.png"
                            }" alt="${
        property.seller.name || "Seller"
      }" class="seller-avatar">
                            <div class="seller-details">
                                <h5>${
                                  property.seller.name || "Unknown Seller"
                                }</h5>
                                <p><i class="fas fa-envelope"></i> ${
                                  property.seller.email || "Email not available"
                                }</p>
                                <p><i class="fas fa-phone"></i> ${
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
          imgElement.setAttribute("data-index", index);

          if (index === 0) {
            imgElement.classList.add("active-slide");
          }

          sliderImagesContainer.appendChild(imgElement);

          // Add thumbnail
          const thumbnail = document.createElement("div");
          thumbnail.className = index === 0 ? "thumbnail active" : "thumbnail";
          thumbnail.setAttribute("data-index", index);

          const thumbImg = document.createElement("img");
          thumbImg.src = image;
          thumbImg.alt = `Thumbnail ${index + 1}`;

          thumbnail.appendChild(thumbImg);
          thumbnailsContainer.appendChild(thumbnail);
        });
      } else {
        // Add a default image if no images are available
        const defaultImg = document.createElement("img");
        defaultImg.src = "/assets/property-1.jpg";
        defaultImg.alt = "Default Property Image";
        defaultImg.classList.add("active-slide");
        defaultImg.setAttribute("data-index", 0);

        sliderImagesContainer.appendChild(defaultImg);

        const defaultThumb = document.createElement("div");
        defaultThumb.className = "thumbnail active";
        defaultThumb.setAttribute("data-index", 0);

        const defaultThumbImg = document.createElement("img");
        defaultThumbImg.src = "/assets/property-1.jpg";
        defaultThumbImg.alt = "Thumbnail";

        defaultThumb.appendChild(defaultThumbImg);
        thumbnailsContainer.appendChild(defaultThumb);
      }

      // Reinitialize image carousel
      initializePropertyImageCarousel();
    }
  }

  // Handle approval button click
  const approveBtn = document.getElementById("approve-btn");
  if (approveBtn) {
    approveBtn.addEventListener("click", function () {
      if (!currentPropertyId) {
        alert("Property ID is missing. Please try again.");
        return;
      }

      const agentSelect = document.getElementById("agent-select");
      if (!agentSelect || !agentSelect.value) {
        alert("Please select an agent before approving the property.");
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append("agentId", agentSelect.value);

      // Submit the form via AJAX
      fetch(`/property/admin/approve/${currentPropertyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Property approved successfully!");
            // Close modal
            propertyModal.style.display = "none";
            // Reload page to reflect changes
            window.location.reload();
          } else {
            alert(
              data.message || "Failed to approve property. Please try again."
            );
          }
        })
        .catch((error) => {
          console.error("Error approving property:", error);
          alert("Failed to approve property. Please try again.");
        });
    });
  }

  // Handle rejection button click
  const rejectBtn = document.getElementById("reject-btn");
  if (rejectBtn) {
    rejectBtn.addEventListener("click", function () {
      if (!currentPropertyId) {
        alert("Property ID is missing. Please try again.");
        return;
      }

      const notesTextarea = document.getElementById("admin-notes");
      if (!notesTextarea || !notesTextarea.value.trim()) {
        alert("Please provide rejection notes before rejecting the property.");
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append("notes", notesTextarea.value.trim());

      // Submit the form via AJAX
      fetch(`/property/admin/reject/${currentPropertyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Property rejected successfully!");
            // Close modal
            propertyModal.style.display = "none";
            // Reload page to reflect changes
            window.location.reload();
          } else {
            alert(
              data.message || "Failed to reject property. Please try again."
            );
          }
        })
        .catch((error) => {
          console.error("Error rejecting property:", error);
          alert("Failed to reject property. Please try again.");
        });
    });
  }

  // Handle direct approve/reject buttons on the property cards
  const approvePropertyBtns = document.querySelectorAll(
    ".approve-property-btn"
  );
  const rejectPropertyBtns = document.querySelectorAll(".reject-property-btn");

  approvePropertyBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const propertyId = this.getAttribute("data-property-id");
      if (!propertyId) {
        alert("Property ID is missing. Please try again.");
        return;
      }

      if (
        confirm(
          "Are you sure you want to approve this property? An agent will be assigned automatically."
        )
      ) {
        // Submit the approval request via AJAX
        fetch(`/property/admin/approve/${propertyId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              alert(
                "Property approved successfully! Agent assigned automatically."
              );
              // Reload page to reflect changes
              window.location.reload();
            } else {
              alert(
                data.message || "Failed to approve property. Please try again."
              );
            }
          })
          .catch((error) => {
            console.error("Error approving property:", error);
            alert("Failed to approve property. Please try again.");
          });
      }
    });
  });

  rejectPropertyBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const propertyId = this.getAttribute("data-property-id");
      if (!propertyId) {
        alert("Property ID is missing. Please try again.");
        return;
      }

      const notes = prompt("Please provide rejection notes:");
      if (notes === null) {
        // User cancelled the prompt
        return;
      }

      if (notes.trim() === "") {
        alert("Please provide rejection notes to continue.");
        return;
      }

      // Submit the rejection request via AJAX
      fetch(`/property/admin/reject/${propertyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ notes: notes }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Property rejected successfully!");
            // Reload page to reflect changes
            window.location.reload();
          } else {
            alert(
              data.message || "Failed to reject property. Please try again."
            );
          }
        })
        .catch((error) => {
          console.error("Error rejecting property:", error);
          alert("Failed to reject property. Please try again.");
        });
    });
  });

  // Show/hide modal
  function showModal() {
    if (propertyModal) {
      propertyModal.style.display = "block";
    }
  }

  if (closeModal) {
    closeModal.addEventListener("click", function () {
      propertyModal.style.display = "none";
    });
  }

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === propertyModal) {
      propertyModal.style.display = "none";
    }
  });

  // Filter properties by status
  const statusFilter = document.getElementById("property-status");
  if (statusFilter) {
    statusFilter.addEventListener("change", function () {
      const selectedStatus = this.value;
      const propertyItems = document.querySelectorAll(
        ".property-approval-item"
      );

      let visibleCount = 0;
      propertyItems.forEach((item) => {
        if (
          selectedStatus === "all" ||
          item.classList.contains(selectedStatus)
        ) {
          item.style.display = "block";
          visibleCount++;
        } else {
          item.style.display = "none";
        }
      });

      // Toggle empty state message
      const noPropertiesMessage = document.getElementById(
        "no-properties-message"
      );
      if (noPropertiesMessage) {
        if (visibleCount === 0) {
          noPropertiesMessage.style.display = "block";
          const messageTitle = noPropertiesMessage.querySelector("h3");
          if (messageTitle) {
            messageTitle.textContent =
              selectedStatus === "all"
                ? "No Properties Found"
                : `No ${
                    selectedStatus.charAt(0).toUpperCase() +
                    selectedStatus.slice(1)
                  } Properties`;
          }
        } else {
          noPropertiesMessage.style.display = "none";
        }
      }
    });

    // Initialize filter to show pending by default
    statusFilter.dispatchEvent(new Event("change"));
  }
}

// Initialize admin dashboard when the page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeCharts();
  initializeMessagesSection();
  initializeAdminDashboard();
  initializePropertyApproval();

  // Check if we need to show success message for profile update
  if (
    window.location.hash === "#profile" &&
    window.location.search.includes("updated=true")
  ) {
    const profileSection = document.getElementById("profile");
    if (profileSection) {
      const successMessage = document.createElement("div");
      successMessage.className = "success-message";
      successMessage.textContent = "Profile updated successfully!";
      profileSection
        .querySelector(".section-header")
        .appendChild(successMessage);

      // Remove the message after 3 seconds
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    }
  }
});

// Handle query parameters for section and messages
document.addEventListener("DOMContentLoaded", function () {
  // Get query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get("section");
  const success = urlParams.get("success");
  const error = urlParams.get("error");

  // If section parameter exists, activate that section
  if (section) {
    document.querySelectorAll(".dashboard-section").forEach((section) => {
      section.classList.remove("active");
    });

    const targetSection = document.getElementById(section);
    if (targetSection) {
      targetSection.classList.add("active");

      // Update nav indicators
      document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.remove("active");
      });

      const navItem = document.querySelector(
        `.nav-item[data-section="${section}"]`
      );
      if (navItem) {
        navItem.classList.add("active");
      }
    }
  }

  // Display success or error messages if they exist
  if (success) {
    const alertDiv = document.createElement("div");
    alertDiv.className = "alert alert-success";
    alertDiv.innerHTML = success;

    // Insert at the top of the active section
    const activeSection = document.querySelector(".dashboard-section.active");
    if (activeSection) {
      activeSection.insertBefore(alertDiv, activeSection.firstChild);

      // Remove alert after 5 seconds
      setTimeout(() => {
        alertDiv.style.opacity = "0";
        setTimeout(() => alertDiv.remove(), 500);
      }, 5000);
    }
  }

  if (error) {
    const alertDiv = document.createElement("div");
    alertDiv.className = "alert alert-danger";
    alertDiv.innerHTML = error;

    // Insert at the top of the active section
    const activeSection = document.querySelector(".dashboard-section.active");
    if (activeSection) {
      activeSection.insertBefore(alertDiv, activeSection.firstChild);

      // Remove alert after 5 seconds
      setTimeout(() => {
        alertDiv.style.opacity = "0";
        setTimeout(() => alertDiv.remove(), 500);
      }, 5000);
    }
  }
});

// Loan Application Management
const applicationStatus = document.getElementById("application-status");
const applicationSort = document.getElementById("application-sort");
const searchApplications = document.querySelector(".search-applications input");
const applicationsList = document.querySelector(".applications-list");
const applicationModal = document.getElementById("application-modal");
const closeApplicationBtn = document.getElementById("close-application-btn");
const statusUpdate = document.getElementById("status-update");
const adminRemarks = document.getElementById("admin-remarks");
const disbursementDetails = document.querySelector(".disbursement-details");
const updateStatusBtn = document.getElementById("update-status-btn");
const cancelUpdateBtn = document.getElementById("cancel-update-btn");

// Load applications
async function loadApplications(page = 1) {
  try {
    const status = applicationStatus.value;
    const sort = applicationSort.value;
    const search = searchApplications.value;

    const response = await fetch(
      `/admin/loan-applications?page=${page}&status=${status}&sort=${sort}&search=${search}`
    );
    const data = await response.json();

    if (data.success) {
      updateApplicationStats(data.stats);
      renderApplications(data.applications);
      updatePagination(data.pagination);
    } else {
      showError("Failed to load applications");
    }
  } catch (error) {
    console.error("Error loading applications:", error);
    showError("Failed to load applications");
  }
}

// Update application statistics
function updateApplicationStats(stats) {
  document.getElementById("pending-count").textContent = stats.pending;
  document.getElementById("review-count").textContent = stats.under_review;
  document.getElementById("approved-count").textContent = stats.approved;
  document.getElementById("rejected-count").textContent = stats.rejected;
  document.getElementById("disbursed-count").textContent = stats.disbursed;
}

// Render applications list
function renderApplications(applications) {
  if (!applications.length) {
    applicationsList.innerHTML = `
                    <div class="no-applications">
                        <i class="fas fa-file-alt"></i>
                        <p>No applications found</p>
                    </div>
                `;
    return;
  }

  applicationsList.innerHTML = applications
    .map(
      (app) => `
                <div class="application-card" data-id="${app.id}">
                    <div class="application-header">
                        <div class="application-info">
                            <h3>${app.user.name}</h3>
                            <span class="application-date">${new Date(
                              app.created_at
                            ).toLocaleDateString()}</span>
                        </div>
                        <span class="status-badge ${
                          app.status
                        }">${app.status.replace("_", " ")}</span>
                    </div>
                    <div class="application-details">
                        <div class="detail-row">
                            <span class="detail-label">Loan Amount:</span>
                            <span class="detail-value">₹${app.loan_amount.toLocaleString()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Purpose:</span>
                            <span class="detail-value">${app.purpose}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Documents:</span>
                            <span class="detail-value">${
                              app.documents.length
                            } uploaded</span>
                        </div>
                    </div>
                    <div class="application-actions">
                        <button class="btn btn-primary view-application" data-id="${
                          app.id
                        }">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        <button class="btn btn-danger delete-application" data-id="${
                          app.id
                        }">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `
    )
    .join("");

  // Add event listeners
  document.querySelectorAll(".view-application").forEach((btn) => {
    btn.addEventListener("click", () => viewApplication(btn.dataset.id));
  });

  document.querySelectorAll(".delete-application").forEach((btn) => {
    btn.addEventListener("click", () => deleteApplication(btn.dataset.id));
  });
}

// View application details
async function viewApplication(id) {
  try {
    const response = await fetch(`/admin/loan-applications/${id}`);
    const data = await response.json();

    if (data.success) {
      const app = data.application;
      document.querySelector("#application-detail .modal-body").innerHTML = `
                        <div class="application-detail-content">
                            <div class="detail-section">
                                <h3>Applicant Information</h3>
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <label>Name</label>
                                        <p>${app.user.name}</p>
                                    </div>
                                    <div class="detail-item">
                                        <label>Email</label>
                                        <p>${app.user.email}</p>
                                    </div>
                                    <div class="detail-item">
                                        <label>Phone</label>
                                        <p>${app.user.phone}</p>
                                    </div>
                                    <div class="detail-item">
                                        <label>PAN</label>
                                        <p>${app.user.pan_number}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="detail-section">
                                <h3>Loan Details</h3>
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <label>Amount</label>
                                        <p>₹${app.loan_amount.toLocaleString()}</p>
                                    </div>
                                    <div class="detail-item">
                                        <label>Purpose</label>
                                        <p>${app.purpose}</p>
                                    </div>
                                    <div class="detail-item">
                                        <label>Status</label>
                                        <p class="status-badge ${
                                          app.status
                                        }">${app.status.replace("_", " ")}</p>
                                    </div>
                                    <div class="detail-item">
                                        <label>Applied On</label>
                                        <p>${new Date(
                                          app.created_at
                                        ).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="detail-section">
                                <h3>Documents</h3>
                                <div class="document-list">
                                    ${app.documents
                                      .map(
                                        (doc) => `
                                        <div class="document-item">
                                            <i class="fas fa-file-alt"></i>
                                            <span>${doc.type}</span>
                                            <a href="${doc.url}" target="_blank" class="btn btn-link">
                                                <i class="fas fa-download"></i> Download
                                            </a>
                                        </div>
                                    `
                                      )
                                      .join("")}
                                </div>
                            </div>

                            ${
                              app.remarks
                                ? `
                                <div class="detail-section">
                                    <h3>Previous Remarks</h3>
                                    <div class="remarks-list">
                                        ${app.remarks
                                          .map(
                                            (remark) => `
                                            <div class="remark-item">
                                                <div class="remark-header">
                                                    <span class="remark-status ${
                                                      remark.status
                                                    }">${remark.status.replace(
                                              "_",
                                              " "
                                            )}</span>
                                                    <span class="remark-date">${new Date(
                                                      remark.created_at
                                                    ).toLocaleDateString()}</span>
                                                </div>
                                                <p class="remark-text">${
                                                  remark.text
                                                }</p>
                                            </div>
                                        `
                                          )
                                          .join("")}
                                    </div>
                                </div>
                            `
                                : ""
                            }
                        </div>
                    `;

      // Show/hide disbursement details based on status
      disbursementDetails.style.display =
        app.status === "approved" ? "block" : "none";

      // Set current application ID
      updateStatusBtn.dataset.applicationId = id;
      applicationModal.style.display = "block";
    } else {
      showError("Failed to load application details");
    }
  } catch (error) {
    console.error("Error loading application details:", error);
    showError("Failed to load application details");
  }
}

// Update application status
updateStatusBtn.addEventListener("click", async () => {
  const id = updateStatusBtn.dataset.applicationId;
  const status = statusUpdate.value;
  const remarks = adminRemarks.value.trim();

  if (!remarks) {
    showError("Please add remarks before updating status");
    return;
  }

  try {
    const response = await fetch(`/admin/loan-applications/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        remarks,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showSuccess("Application status updated successfully");
      applicationModal.style.display = "none";
      loadApplications();
    } else {
      showError(data.message || "Failed to update application status");
    }
  } catch (error) {
    console.error("Error updating application status:", error);
    showError("Failed to update application status");
  }
});

// Delete application
async function deleteApplication(id) {
  if (!confirm("Are you sure you want to delete this application?")) {
    return;
  }

  try {
    const response = await fetch(`/admin/loan-applications/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      showSuccess("Application deleted successfully");
      loadApplications();
    } else {
      showError(data.message || "Failed to delete application");
    }
  } catch (error) {
    console.error("Error deleting application:", error);
    showError("Failed to delete application");
  }
}

// Event listeners for filters and search
applicationStatus.addEventListener("change", () => loadApplications(1));
applicationSort.addEventListener("change", () => loadApplications(1));
searchApplications.addEventListener(
  "input",
  debounce(() => loadApplications(1), 500)
);

// Close modal
closeApplicationBtn.addEventListener("click", () => {
  applicationModal.style.display = "none";
});

cancelUpdateBtn.addEventListener("click", () => {
  applicationModal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === applicationModal) {
    applicationModal.style.display = "none";
  }
});

// Show/hide disbursement details based on status
statusUpdate.addEventListener("change", () => {
  disbursementDetails.style.display =
    statusUpdate.value === "disbursed" ? "block" : "none";
});

// Load applications on page load
loadApplications();

// Document upload file input handlers
document.addEventListener("DOMContentLoaded", function () {
  // File input event listeners
  const fileInputs = document.querySelectorAll(".file-input");

  fileInputs.forEach((input) => {
    input.addEventListener("change", function (e) {
      const fileNameElement = this.parentElement.querySelector(".file-name");

      if (this.files.length > 0) {
        if (this.multiple) {
          fileNameElement.textContent = `${this.files.length} files selected`;
        } else {
          fileNameElement.textContent = this.files[0].name;
        }
        fileNameElement.classList.add("file-selected");
      } else {
        fileNameElement.textContent = this.multiple
          ? "No files chosen"
          : "No file chosen";
        fileNameElement.classList.remove("file-selected");
      }
    });
  });

  // Individual file input listeners for specific styling or handling
  const idProofInput = document.getElementById("idProof");
  if (idProofInput) {
    idProofInput.addEventListener("change", function (e) {
      updateFileName(this);
    });
  }

  const licenseInput = document.getElementById("license");
  if (licenseInput) {
    licenseInput.addEventListener("change", function (e) {
      updateFileName(this);
    });
  }

  const businessProofInput = document.getElementById("businessProof");
  if (businessProofInput) {
    businessProofInput.addEventListener("change", function (e) {
      updateFileName(this);
    });
  }

  const profilePhotoInput = document.getElementById("profilePhoto");
  if (profilePhotoInput) {
    profilePhotoInput.addEventListener("change", function (e) {
      updateFileName(this);
    });
  }

  const additionalDocsInput = document.getElementById("additionalDocs");
  if (additionalDocsInput) {
    additionalDocsInput.addEventListener("change", function (e) {
      updateFileName(this);
    });
  }

  function updateFileName(inputElement) {
    const fileNameElement =
      inputElement.parentElement.querySelector(".file-name");

    if (inputElement.files.length > 0) {
      if (inputElement.multiple) {
        fileNameElement.textContent = `${inputElement.files.length} files selected`;
      } else {
        fileNameElement.textContent = inputElement.files[0].name;
      }
      fileNameElement.classList.add("file-selected");
    } else {
      fileNameElement.textContent = inputElement.multiple
        ? "No files chosen"
        : "No file chosen";
      fileNameElement.classList.remove("file-selected");
    }
  }
});

// Initialize the property image carousel
function initializePropertyImageCarousel() {
  const prevBtn = document.querySelector(".prev-slide");
  const nextBtn = document.querySelector(".next-slide");
  const slides = document.querySelectorAll(".slider-images img");
  const thumbnails = document.querySelectorAll(".thumbnail");
  let currentIndex = 0;
  const totalSlides = slides.length;

  if (!prevBtn || !nextBtn || !slides.length) return;

  // Function to show slide by index
  const showSlide = (index) => {
    // Hide all slides
    slides.forEach((slide) => {
      slide.classList.remove("active-slide");
    });

    // Update all thumbnails
    thumbnails.forEach((thumb) => {
      thumb.classList.remove("active");
    });

    // Show current slide and set active thumbnail
    slides[index].classList.add("active-slide");
    thumbnails[index].classList.add("active");

    // Update current index
    currentIndex = index;
  };

  // Previous slide button
  prevBtn.addEventListener("click", () => {
    let newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = totalSlides - 1;
    }
    showSlide(newIndex);
  });

  // Next slide button
  nextBtn.addEventListener("click", () => {
    let newIndex = currentIndex + 1;
    if (newIndex >= totalSlides) {
      newIndex = 0;
    }
    showSlide(newIndex);
  });

  // Thumbnail clicks
  thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      showSlide(index);
    });
  });

  // Initialize by showing the first slide
  showSlide(0);

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (
      document.getElementById("property-detail-modal").style.display === "block"
    ) {
      if (e.key === "ArrowLeft") {
        prevBtn.click();
      } else if (e.key === "ArrowRight") {
        nextBtn.click();
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize advertised properties progress bars and counters
  initializeAdvertisedProperties();

  // Rest of the initialization code...
});

// Function to initialize advertised properties section
function initializeAdvertisedProperties() {
  // Exit if not on advertised properties section
  const advertisedPropertiesSection = document.getElementById(
    "advertised-properties"
  );
  if (!advertisedPropertiesSection) return;

  // Update time remaining for each property
  function updateTimeRemaining() {
    const propertyCards = document.querySelectorAll(
      "#advertised-properties .property-card"
    );

    propertyCards.forEach((card) => {
      // Get package info and dates
      const packageInfoEl = card.querySelector(".package-info");
      if (!packageInfoEl) return;

      // Get end date from the package info
      const expiresText = packageInfoEl.textContent.match(
        /Expires: (\d{1,2}\/\d{1,2}\/\d{4})/
      );
      if (!expiresText || !expiresText[1]) return;

      const endDateStr = expiresText[1];
      const endDate = new Date(endDateStr);

      // Skip invalid dates
      if (isNaN(endDate.getTime())) return;

      // Calculate time remaining
      const now = new Date();
      const timeRemaining = endDate - now;
      const daysRemaining = Math.max(
        0,
        Math.ceil(timeRemaining / (1000 * 60 * 60 * 24))
      );

      // Assume a 30-day package as default
      const totalDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

      // Calculate percentage remaining
      const percentRemaining = Math.max(
        0,
        Math.min(100, Math.round((timeRemaining / totalDuration) * 100))
      );

      // Update UI
      const timeRemainingTextEl = card.querySelector(".time-remaining-text");
      const progressBarEl = card.querySelector(".time-remaining-progress");

      if (timeRemainingTextEl) {
        timeRemainingTextEl.textContent = `${daysRemaining} days remaining`;
      }

      if (progressBarEl) {
        // Set width based on percentage
        progressBarEl.style.width = `${percentRemaining}%`;

        // Update color class based on percentage
        progressBarEl.classList.remove(
          "progress-green",
          "progress-yellow",
          "progress-red"
        );

        if (percentRemaining > 66) {
          progressBarEl.classList.add("progress-green");
        } else if (percentRemaining > 33) {
          progressBarEl.classList.add("progress-yellow");
        } else {
          progressBarEl.classList.add("progress-red");
        }
      }

      // If expired, update UI to show expired state
      if (daysRemaining <= 0) {
        card.classList.add("expired");
        if (timeRemainingTextEl) {
          timeRemainingTextEl.textContent = "Expired";
        }
      }
    });
  }

  // Handle cancel package button clicks
  const cancelButtons = document.querySelectorAll(".cancel-package-btn");
  cancelButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      const propertyId = this.getAttribute("data-property-id");
      const advertisingId = this.getAttribute("data-advertising-id");

      if (!propertyId || !advertisingId) {
        alert("Missing information. Cannot cancel package.");
        return;
      }

      if (
        confirm(
          "Are you sure you want to cancel this advertising package? This action cannot be undone."
        )
      ) {
        // Make AJAX request to cancel the package
        fetch("/advertising/cancel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            propertyId: propertyId,
            advertisingId: advertisingId,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              // Remove the card from the grid
              const card = this.closest(".property-card");
              if (card) {
                card.style.opacity = "0";
                setTimeout(() => {
                  card.remove();

                  // Check if there are no more advertised properties
                  const remainingCards = document.querySelectorAll(
                    "#advertised-properties .property-card"
                  );
                  if (remainingCards.length === 0) {
                    // Create empty state message
                    const emptyState = document.createElement("div");
                    emptyState.className = "empty-state";
                    emptyState.innerHTML = `
                                                <i class="fas fa-ad empty-icon"></i>
                                                <h3>No Advertised Properties</h3>
                                                <p>You don't have any properties with active advertising packages.</p>
                                                <p>Visit the Advertising page to promote your properties and increase their visibility.</p>
                                                <a href="/advertising" class="cta-button">Start Advertising</a>
                                            `;

                    // Get property grid and replace with empty state
                    const container = document.querySelector(
                      "#advertised-properties .property-grid"
                    );
                    if (container) {
                      container.innerHTML = "";
                      container.appendChild(emptyState);
                    }
                  }
                }, 300);
              }
            } else {
              alert(
                data.message || "Failed to cancel package. Please try again."
              );
            }
          })
          .catch((error) => {
            console.error("Error cancelling package:", error);
            alert("An error occurred. Please try again later.");
          });
      }
    });
  });

  // Update time remaining immediately and then every minute
  updateTimeRemaining();
  setInterval(updateTimeRemaining, 60000);
}

// Message handling
document.addEventListener("DOMContentLoaded", function () {
  // Initialize rented properties functionality
  initializeRentedProperties();

  // Message filtering
  const statusFilter = document.getElementById("message-status");
  const propertyFilter = document.getElementById("message-property");
  const searchInput = document.querySelector(".search-input");
  const messagesList = document.querySelector(".messages-list");

  // Function to initialize rented properties functionality
  function initializeRentedProperties() {
    // Handle click on "Contact Tenant" buttons
    const contactTenantButtons = document.querySelectorAll(
      ".contact-tenant-btn"
    );

    contactTenantButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const tenantEmail = this.getAttribute("data-tenant-email");

        if (!tenantEmail) {
          alert("Tenant email is not available.");
          return;
        }

        // Create a modal for the contact form
        const modalHTML = `
                            <div id="contact-tenant-modal" class="modal">
                                <div class="modal-content">
                                    <span class="close-modal">&times;</span>
                                    <div class="modal-header">
                                        <h2>Contact Tenant</h2>
                                    </div>
                                    <div class="modal-body">
                                        <form id="contact-tenant-form">
                                            <div class="form-group">
                                                <label for="email-subject">Subject</label>
                                                <input type="text" id="email-subject" name="subject" placeholder="Enter email subject" required>
                                            </div>
                                            <div class="form-group">
                                                <label for="email-message">Message</label>
                                                <textarea id="email-message" name="message" rows="6" placeholder="Enter your message" required></textarea>
                                            </div>
                                            <div class="form-actions">
                                                <button type="submit" class="submit-btn">Send Message</button>
                                                <button type="button" class="cancel-btn">Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        `;

        // Add modal to the page
        const modalContainer = document.createElement("div");
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstChild);

        const modal = document.getElementById("contact-tenant-modal");
        const closeBtn = modal.querySelector(".close-modal");
        const cancelBtn = modal.querySelector(".cancel-btn");
        const contactForm = document.getElementById("contact-tenant-form");

        // Show modal
        modal.style.display = "block";

        // Close modal functions
        const closeModal = () => {
          modal.style.display = "none";
          setTimeout(() => {
            modal.remove();
          }, 300);
        };

        closeBtn.addEventListener("click", closeModal);
        cancelBtn.addEventListener("click", closeModal);

        // Close when clicking outside
        window.addEventListener("click", function (event) {
          if (event.target === modal) {
            closeModal();
          }
        });

        // Handle form submission
        contactForm.addEventListener("submit", function (e) {
          e.preventDefault();

          const subject = document.getElementById("email-subject").value;
          const message = document.getElementById("email-message").value;

          // In a real application, you would send this to the server
          // For now, we'll simulate with a success message
          alert(
            `Message sent to tenant successfully!\n\nSubject: ${subject}\nRecipient: ${tenantEmail}`
          );

          // Close the modal
          closeModal();
        });
      });
    });
  }

  if (statusFilter && propertyFilter && searchInput && messagesList) {
    // Filter messages by status
    statusFilter.addEventListener("change", filterMessages);

    // Filter messages by property
    propertyFilter.addEventListener("change", filterMessages);

    // Search messages
    searchInput.addEventListener("input", filterMessages);

    // Filter messages function
    function filterMessages() {
      const status = statusFilter.value;
      const property = propertyFilter.value;
      const searchTerm = searchInput.value.toLowerCase();

      const messages = messagesList.querySelectorAll(".message-item");

      messages.forEach((message) => {
        let showMessage = true;

        // Filter by status
        if (status !== "all" && !message.classList.contains(status)) {
          showMessage = false;
        }

        // Filter by property
        if (property !== "all" && message.dataset.property !== property) {
          showMessage = false;
        }

        // Filter by search term
        if (searchTerm) {
          const senderName = message
            .querySelector(".sender-name")
            .textContent.toLowerCase();
          const propertyName = message
            .querySelector(".message-property")
            .textContent.toLowerCase();
          const messageText = message
            .querySelector(".message-preview")
            .textContent.toLowerCase();

          if (
            !senderName.includes(searchTerm) &&
            !propertyName.includes(searchTerm) &&
            !messageText.includes(searchTerm)
          ) {
            showMessage = false;
          }
        }

        message.style.display = showMessage ? "flex" : "none";
      });

      // Check if any messages are visible
      const visibleMessages = Array.from(messages).filter(
        (message) => message.style.display !== "none"
      );

      if (visibleMessages.length === 0 && messages.length > 0) {
        // Show no results message
        let noResults = messagesList.querySelector(".no-results");

        if (!noResults) {
          noResults = document.createElement("div");
          noResults.className = "no-results";
          noResults.innerHTML = `
                                <div class="empty-state">
                                    <i class="fas fa-search"></i>
                                    <p>No messages match your search</p>
                                    <p class="small">Try different filters or search terms</p>
                        </div>
                    `;
          messagesList.appendChild(noResults);
        } else {
          noResults.style.display = "block";
        }
      } else {
        // Hide no results message if exists
        const noResults = messagesList.querySelector(".no-results");
        if (noResults) {
          noResults.style.display = "none";
        }
      }
    }

    // Message actions
    const viewButtons = document.querySelectorAll(".view-btn");
    const messageModal = document.getElementById("message-modal");
    const closeModal = document.querySelector(".close-modal");
    const messageDetail = document.getElementById("message-detail");
    const closeMessageBtn = document.getElementById("close-message-btn");
    const deleteButtons = document.querySelectorAll(".delete-btn");

    // View message
    viewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const messageId = this.getAttribute("data-id");
        const messageItem = document.querySelector(
          `.message-item[data-id="${messageId}"]`
        );

        // Mark message as read
        fetch(`/dashboard/messages/${messageId}/read`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              // Update UI to show message as read
              messageItem.classList.remove("unread");
              messageItem.classList.add("read");

              // Display the message in modal
              const senderName =
                messageItem.querySelector(".sender-name").textContent;
              const propertyName =
                messageItem.querySelector(".message-property").textContent;
              const messageDate =
                messageItem.querySelector(".message-date").textContent;
              const messageText =
                messageItem.querySelector(".message-preview").textContent;
              const contactInfo =
                messageItem.querySelector(".message-contact").innerHTML;

              const modalBody = messageDetail.querySelector(".modal-body");
              modalBody.innerHTML = `
                                    <div class="message-modal-header">
                                        <h3>From: ${senderName}</h3>
                                        <p class="message-date">${messageDate}</p>
                                    </div>
                                    <div class="message-modal-property">
                                        <p>${propertyName}</p>
                                    </div>
                                    <div class="message-modal-contact">
                                        <p>${contactInfo}</p>
                                    </div>
                                    <div class="message-modal-content">
                                        <p>${data.message.message}</p>
                                    </div>
                                `;

              // Show the modal
              messageDetail.style.display = "block";
              messageModal.style.display = "block";
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });
    });

    // Delete message
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this message?")) {
          const messageId = this.getAttribute("data-id");

          fetch(`/dashboard/messages/${messageId}`, {
            method: "DELETE",
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                // Remove the message from UI
                const messageItem = document.querySelector(
                  `.message-item[data-id="${messageId}"]`
                );
                messageItem.remove();

                // Check if there are any messages left
                const remainingMessages =
                  document.querySelectorAll(".message-item");
                if (remainingMessages.length === 0) {
                  // Show no messages message
                  const noMessages = document.createElement("div");
                  noMessages.className = "no-messages";
                  noMessages.innerHTML = `
                                            <div class="empty-state">
                                                <i class="fas fa-inbox"></i>
                                                <p>You don't have any messages yet</p>
                                                <p class="small">When clients contact you about your properties, messages will appear here</p>
                                            </div>
                                        `;
                  messagesList.appendChild(noMessages);
                }
              } else {
                alert("Failed to delete message: " + data.message);
              }
            })
            .catch((error) => {
              console.error("Error:", error);
              alert("Failed to delete message. Please try again later.");
            });
        }
      });
    });

    // Close modal
    closeModal.addEventListener("click", function () {
      messageModal.style.display = "none";
    });

    closeMessageBtn.addEventListener("click", function () {
      messageModal.style.display = "none";
    });

    // Close modal when clicking outside
    window.addEventListener("click", function (event) {
      if (event.target === messageModal) {
        messageModal.style.display = "none";
      }
    });
  }
});
// Message handling
document.addEventListener("DOMContentLoaded", function () {
  // Message filtering
  const statusFilter = document.getElementById("message-status");
  const propertyFilter = document.getElementById("message-property");
  const searchInput = document.querySelector(".search-input");
  const messagesList = document.querySelector(".messages-list");

  if (statusFilter && propertyFilter && searchInput && messagesList) {
    // Filter messages by status
    statusFilter.addEventListener("change", filterMessages);

    // Filter messages by property
    propertyFilter.addEventListener("change", filterMessages);

    // Search messages
    searchInput.addEventListener("input", filterMessages);

    // Filter messages function
    function filterMessages() {
      const status = statusFilter.value;
      const property = propertyFilter.value;
      const searchTerm = searchInput.value.toLowerCase();

      const messages = messagesList.querySelectorAll(".message-item");

      messages.forEach((message) => {
        let showMessage = true;

        // Filter by status
        if (status !== "all" && !message.classList.contains(status)) {
          showMessage = false;
        }

        // Filter by property
        if (property !== "all" && message.dataset.property !== property) {
          showMessage = false;
        }

        // Filter by search term
        if (searchTerm) {
          const senderName = message
            .querySelector(".sender-name")
            .textContent.toLowerCase();
          const propertyName = message
            .querySelector(".message-property")
            .textContent.toLowerCase();
          const messageText = message
            .querySelector(".message-preview")
            .textContent.toLowerCase();

          if (
            !senderName.includes(searchTerm) &&
            !propertyName.includes(searchTerm) &&
            !messageText.includes(searchTerm)
          ) {
            showMessage = false;
          }
        }

        message.style.display = showMessage ? "flex" : "none";
      });

      // Check if any messages are visible
      const visibleMessages = Array.from(messages).filter(
        (message) => message.style.display !== "none"
      );

      if (visibleMessages.length === 0 && messages.length > 0) {
        // Show no results message
        let noResults = messagesList.querySelector(".no-results");

        if (!noResults) {
          noResults = document.createElement("div");
          noResults.className = "no-results";
          noResults.innerHTML = `
                                    <div class="empty-state">
                                        <i class="fas fa-search"></i>
                                        <p>No messages match your search</p>
                                        <p class="small">Try different filters or search terms</p>
                                    </div>
                                `;
          messagesList.appendChild(noResults);
        } else {
          noResults.style.display = "block";
        }
      } else {
        // Hide no results message if exists
        const noResults = messagesList.querySelector(".no-results");
        if (noResults) {
          noResults.style.display = "none";
        }
      }
    }

    // Message actions
    const viewButtons = document.querySelectorAll(".view-btn");
    const messageModal = document.getElementById("message-modal");
    const closeModal = document.querySelector(".close-modal");
    const messageDetail = document.getElementById("message-detail");
    const closeMessageBtn = document.getElementById("close-message-btn");
    const deleteButtons = document.querySelectorAll(".delete-btn");

    // View message
    viewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const messageId = this.getAttribute("data-id");
        const messageItem = document.querySelector(
          `.message-item[data-id="${messageId}"]`
        );

        // Mark message as read
        fetch(`/dashboard/messages/${messageId}/read`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              // Update UI to show message as read
              messageItem.classList.remove("unread");
              messageItem.classList.add("read");

              // Display the message in modal
              const senderName =
                messageItem.querySelector(".sender-name").textContent;
              const propertyName =
                messageItem.querySelector(".message-property").textContent;
              const messageDate =
                messageItem.querySelector(".message-date").textContent;
              const messageText =
                messageItem.querySelector(".message-preview").textContent;
              const contactInfo =
                messageItem.querySelector(".message-contact").innerHTML;

              const modalBody = messageDetail.querySelector(".modal-body");
              modalBody.innerHTML = `
                                        <div class="message-modal-header">
                                            <h3>From: ${senderName}</h3>
                                            <p class="message-date">${messageDate}</p>
                                        </div>
                                        <div class="message-modal-property">
                                            <p>${propertyName}</p>
                                        </div>
                                        <div class="message-modal-contact">
                                            <p>${contactInfo}</p>
                                        </div>
                                        <div class="message-modal-content">
                                            <p>${data.message.message}</p>
                                        </div>
                                    `;

              // Show the modal
              messageDetail.style.display = "block";
              messageModal.style.display = "block";
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });
    });

    // Delete message
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this message?")) {
          const messageId = this.getAttribute("data-id");

          fetch(`/dashboard/messages/${messageId}`, {
            method: "DELETE",
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                // Remove the message from UI
                const messageItem = document.querySelector(
                  `.message-item[data-id="${messageId}"]`
                );
                messageItem.remove();

                // Check if there are any messages left
                const remainingMessages =
                  document.querySelectorAll(".message-item");
                if (remainingMessages.length === 0) {
                  // Show no messages message
                  const noMessages = document.createElement("div");
                  noMessages.className = "no-messages";
                  noMessages.innerHTML = `
                                                <div class="empty-state">
                                                    <i class="fas fa-inbox"></i>
                                                    <p>You don't have any messages yet</p>
                                                    <p class="small">When clients contact you about your properties, messages will appear here</p>
                                                </div>
                                            `;
                  messagesList.appendChild(noMessages);
                }
              } else {
                alert("Failed to delete message: " + data.message);
              }
            })
            .catch((error) => {
              console.error("Error:", error);
              alert("Failed to delete message. Please try again later.");
            });
        }
      });
    });

    // Close modal
    closeModal.addEventListener("click", function () {
      messageModal.style.display = "none";
    });

    closeMessageBtn.addEventListener("click", function () {
      messageModal.style.display = "none";
    });

    // Close modal when clicking outside
    window.addEventListener("click", function (event) {
      if (event.target === messageModal) {
        messageModal.style.display = "none";
      }
    });
  }
});

function loadAgentApplications(status = "pending") {
  const container = document.getElementById("agent-applications-container");
  container.innerHTML =
    '<div class="loading-indicator"><i class="fas fa-spinner fa-pulse"></i><p>Loading agent applications...</p></div>';

  fetch(`/agent/pending-verification?status=${status}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        container.innerHTML = `<div class="error-message"><p>${
          data.error || "Failed to load applications"
        }</p></div>`;
        return;
      }

      if (data.agents.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>No ${status} applications found</p></div>`;
        return;
      }

      container.innerHTML = "";

      data.agents.forEach((agent) => {
        const userInfo = agent.userId || {};
        const statusClass = agent.verificationStatus;
        const statusText =
          agent.verificationStatus === "verified"
            ? "Verified"
            : agent.verificationStatus === "rejected"
            ? "Rejected"
            : "Pending Review";

        const documentsHtml = generateDocumentsHtml(agent.documents);

        const html = `
                                        <div class="application-item ${statusClass}" data-agent-id="${
          agent._id
        }">
                            <div class="application-header">
                                <div class="agent-info">
                                                    <img src="${
                                                      agent.documents
                                                        ?.profilePhoto?.path ||
                                                      "/assets/agent1.png"
                                                    }" alt="Agent" class="agent-avatar">
                                    <div>
                                                        <h3>${
                                                          userInfo.name ||
                                                          "Unknown"
                                                        }</h3>
                                                        <p>${
                                                          userInfo.email ||
                                                          "No email provided"
                                                        }</p>
                                                        <span class="status-badge ${statusClass}">${statusText}</span>
                                    </div>
                                </div>
                                <div class="application-date">
                                                    <p>Submitted: ${new Date(
                                                      agent.createdAt ||
                                                        Date.now()
                                                    ).toLocaleDateString()}</p>
                                                    ${
                                                      agent.verificationStatus !==
                                                      "pending"
                                                        ? `<button class="toggle-details"><i class="fas fa-chevron-down"></i></button>`
                                                        : ""
                                                    }
                                </div>
                            </div>
                                            <div class="application-details" ${
                                              agent.verificationStatus !==
                                              "pending"
                                                ? 'style="display:none;"'
                                                : ""
                                            }>
                                <div class="detail-row">
                                    <div class="detail-group">
                                        <label>Phone Number</label>
                                                        <p>${
                                                          userInfo.phone ||
                                                          "Not provided"
                                                        }</p>
                                    </div>
                                    <div class="detail-group">
                                        <label>Location</label>
                                                        <p>${
                                                          userInfo.location ||
                                                          "Not provided"
                                                        }</p>
                                    </div>
                                    <div class="detail-group">
                                        <label>Experience</label>
                                                        <p>${
                                                          agent.experience ||
                                                          "Not specified"
                                                        }</p>
                                    </div>
                                </div>
                                <div class="documents-section">
                                    <h4>Submitted Documents</h4>
                                    <div class="document-list">
                                                        ${documentsHtml}
                                        </div>
                                        </div>
                                                ${
                                                  agent.verificationStatus ===
                                                  "pending"
                                                    ? `
                                <div class="application-actions">
                                                    <button class="approve-btn" data-agent-id="${agent._id}"><i class="fas fa-check"></i> Approve</button>
                                                    <button class="reject-btn" data-agent-id="${agent._id}"><i class="fas fa-times"></i> Reject</button>
                                                    <button class="more-info-btn" data-agent-id="${agent._id}"><i class="fas fa-info-circle"></i> Request More Info</button>
                                                </div>`
                                                    : ""
                                                }
                                </div>
                            </div>
                                    `;

        container.innerHTML += html;
      });

      // Initialize event listeners
      initAgentVerificationListeners();
    })
    .catch((error) => {
      console.error("Error loading agent applications:", error);
      container.innerHTML = `<div class="error-message"><p>Failed to load applications. Please try again later.</p></div>`;
    });
}

function generateDocumentsHtml(documents = {}) {
  if (!documents || Object.keys(documents).length === 0) {
    return "<p>No documents submitted</p>";
  }

  let html = "";

  if (documents.idProof) {
    html += generateDocumentItemHtml("ID Proof", documents.idProof);
  }

  if (documents.license) {
    html += generateDocumentItemHtml("Real Estate License", documents.license);
  }

  if (documents.businessProof) {
    html += generateDocumentItemHtml(
      "Business Verification",
      documents.businessProof
    );
  }

  if (documents.profilePhoto) {
    html += generateDocumentItemHtml(
      "Professional Photo",
      documents.profilePhoto
    );
  }

  if (documents.additionalDocs && documents.additionalDocs.length > 0) {
    documents.additionalDocs.forEach((doc, index) => {
      html += generateDocumentItemHtml(`Additional Document ${index + 1}`, doc);
    });
  }

  return html || "<p>No documents submitted</p>";
}

function generateDocumentItemHtml(title, document) {
  const icon =
    document.mimeType && document.mimeType.includes("pdf")
      ? "fa-file-pdf"
      : document.mimeType && document.mimeType.includes("image")
      ? "fa-file-image"
      : "fa-file";

  return `
                            <div class="document-item">
                                <i class="fas ${icon}"></i>
                                <span>${title}</span>
                                <a href="#" class="view-doc" data-path="${
                                  document.path
                                }" data-mime="${
    document.mimeType || ""
  }" data-title="${title}">View</a>
                    </div>
                        `;
}

function initAgentVerificationListeners() {
  // Document view buttons
  document.querySelectorAll(".view-doc").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const path = this.getAttribute("data-path");
      const mimeType = this.getAttribute("data-mime");
      const title = this.getAttribute("data-title");
      showDocumentPreview(path, mimeType, title);
    });
  });

  // Approval buttons
  document.querySelectorAll(".approve-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const agentId = this.getAttribute("data-agent-id");
      showFeedbackModal(agentId, "approve");
    });
  });

  // Rejection buttons
  document.querySelectorAll(".reject-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const agentId = this.getAttribute("data-agent-id");
      showFeedbackModal(agentId, "reject");
    });
  });

  // More info buttons
  document.querySelectorAll(".more-info-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const agentId = this.getAttribute("data-agent-id");
      showFeedbackModal(agentId, "more-info");
    });
  });

  // Toggle detail buttons for collapsed items
  document.querySelectorAll(".toggle-details").forEach((button) => {
    button.addEventListener("click", function () {
      const applicationItem = this.closest(".application-item");
      const detailsSection = applicationItem.querySelector(
        ".application-details"
      );

      if (detailsSection.style.display === "none") {
        detailsSection.style.display = "block";
        this.querySelector("i").classList.remove("fa-chevron-down");
        this.querySelector("i").classList.add("fa-chevron-up");
        applicationItem.classList.remove("collapsed");
      } else {
        detailsSection.style.display = "none";
        this.querySelector("i").classList.remove("fa-chevron-up");
        this.querySelector("i").classList.add("fa-chevron-down");
        applicationItem.classList.add("collapsed");
      }
    });
  });
}

function showDocumentPreview(path, mimeType, title) {
  const modal = document.getElementById("document-modal");
  const modalTitle = document.getElementById("modal-title");
  const imagePreview = document.getElementById("document-preview-image");
  const pdfPreview = document.getElementById("document-preview-pdf");
  const errorMessage = document.getElementById("document-preview-error");
  const downloadLink = document.getElementById("document-download-link");

  modalTitle.textContent = title || "Document Preview";

  // Reset all preview elements
  imagePreview.style.display = "none";
  pdfPreview.style.display = "none";
  errorMessage.style.display = "none";

  // Full path to the document
  const fullPath = path.startsWith("/") ? path : "/" + path;
  downloadLink.href = fullPath;

  // Display appropriate preview based on mime type
  if (mimeType && mimeType.startsWith("image/")) {
    imagePreview.src = fullPath;
    imagePreview.style.display = "block";
  } else if (mimeType === "application/pdf") {
    pdfPreview.src = fullPath;
    pdfPreview.style.display = "block";
  } else {
    errorMessage.style.display = "block";
  }

  modal.style.display = "block";
}

function showFeedbackModal(agentId, action) {
  const modal = document.getElementById("feedback-modal");
  const title = document.getElementById("feedback-title");
  const form = document.getElementById("feedback-form");
  const agentIdInput = document.getElementById("agent-id");
  const actionTypeInput = document.getElementById("action-type");
  const messageInput = document.getElementById("feedback-message");

  // Set modal title based on action
  if (action === "approve") {
    title.textContent = "Approve Agent";
    messageInput.placeholder =
      "Optional: Add a welcome message for the agent...";
  } else if (action === "reject") {
    title.textContent = "Reject Agent";
    messageInput.placeholder = "Please provide a reason for rejection...";
  } else {
    title.textContent = "Request More Information";
    messageInput.placeholder =
      "Specify what additional information you need from the agent...";
  }

  // Set form values
  agentIdInput.value = agentId;
  actionTypeInput.value = action;
  messageInput.value = "";

  // Show modal
  modal.style.display = "block";
}

// Handle form submission
document
  .getElementById("feedback-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const agentId = document.getElementById("agent-id").value;
    const action = document.getElementById("action-type").value;
    const message = document.getElementById("feedback-message").value;

    let status;
    if (action === "approve") {
      status = "verified";
    } else if (action === "reject") {
      status = "rejected";
    } else {
      status = "pending";
    }

    // Submit the verification update
    fetch(`/agent/update-verification/${agentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: status,
        message: message,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Close modal
          document.getElementById("feedback-modal").style.display = "none";

          // Reload applications
          loadAgentApplications(
            document.getElementById("verification-status").value
          );

          // Show success message
          const alertDiv = document.createElement("div");
          alertDiv.className = "alert alert-success";
          alertDiv.innerHTML = `Agent ${
            status === "verified"
              ? "approved"
              : status === "rejected"
              ? "rejected"
              : "updated"
          } successfully`;

          const container = document.getElementById(
            "agent-applications-container"
          );
          container.insertBefore(alertDiv, container.firstChild);

          // Remove alert after 5 seconds
          setTimeout(() => {
            alertDiv.style.opacity = "0";
            setTimeout(() => alertDiv.remove(), 500);
          }, 5000);
        } else {
          alert("Error: " + (data.error || "Failed to update agent status"));
        }
      })
      .catch((error) => {
        console.error("Error updating agent status:", error);
        alert("An error occurred. Please try again later.");
      });
  });

// Close modals when clicking the X or outside the modal
document.querySelectorAll(".close-modal, .cancel-btn").forEach((element) => {
  element.addEventListener("click", function () {
    document.getElementById("document-modal").style.display = "none";
    document.getElementById("feedback-modal").style.display = "none";
  });
});

window.addEventListener("click", function (event) {
  if (event.target === document.getElementById("document-modal")) {
    document.getElementById("document-modal").style.display = "none";
  }
  if (event.target === document.getElementById("feedback-modal")) {
    document.getElementById("feedback-modal").style.display = "none";
  }
});

// Filter applications by status
document
  .getElementById("verification-status")
  .addEventListener("change", function () {
    loadAgentApplications(this.value);
  });

// Initialize agent applications on page load
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("agent-applications-container")) {
    loadAgentApplications("pending");
  }
});
