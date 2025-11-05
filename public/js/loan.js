let emiChart;
let currentYear = new Date().getFullYear();
let amortizationSchedule = [];

function calculateEMI() {
  const loanAmount = parseFloat(document.getElementById("loanAmount").value);
  const interestRate = parseFloat(
    document.getElementById("interestRate").value
  );
  const loanTenure = parseFloat(document.getElementById("loanTenure").value);

  if (!loanAmount || !interestRate || !loanTenure) {
    alert("Please fill all fields");
    return;
  }

  const monthlyInterest = interestRate / 12 / 100;
  const totalMonths = loanTenure * 12;

  const emi =
    (loanAmount *
      monthlyInterest *
      Math.pow(1 + monthlyInterest, totalMonths)) /
    (Math.pow(1 + monthlyInterest, totalMonths) - 1);

  const totalAmount = emi * totalMonths;
  const totalInterest = totalAmount - loanAmount;

  // Update EMI and amounts
  document.getElementById("emi").textContent =
    Math.round(emi).toLocaleString("en-IN");
  document.getElementById("principalAmount").textContent =
    "₹" + loanAmount.toLocaleString("en-IN");
  document.getElementById("interestAmount").textContent =
    "₹" + Math.round(totalInterest).toLocaleString("en-IN");

  // Update chart
  updateChart(loanAmount, totalInterest);

  // Calculate and update amortization schedule
  calculateAmortizationSchedule(loanAmount, interestRate, loanTenure);
  displayAmortizationTable(currentYear);
}

function updateChart(principal, interest) {
  const ctx = document.getElementById("emiChart").getContext("2d");

  if (emiChart) {
    emiChart.destroy();
  }

  emiChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Principal Amount", "Interest Amount"],
      datasets: [
        {
          data: [principal, interest],
          backgroundColor: ["#00A19C", "#FFB800"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      cutout: "70%",
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

function calculateAmortizationSchedule(loanAmount, interestRate, loanTenure) {
  amortizationSchedule = [];
  const monthlyInterest = interestRate / 12 / 100;
  const totalMonths = loanTenure * 12;

  const emi =
    (loanAmount *
      monthlyInterest *
      Math.pow(1 + monthlyInterest, totalMonths)) /
    (Math.pow(1 + monthlyInterest, totalMonths) - 1);

  let balance = loanAmount;
  const startYear = new Date().getFullYear();

  for (let i = 0; i < totalMonths; i++) {
    const interest = balance * monthlyInterest;
    const principal = emi - interest;
    const newBalance = balance - principal;

    amortizationSchedule.push({
      year: startYear + Math.floor(i / 12),
      month: new Date(2024, i % 12).toLocaleString("default", {
        month: "long",
      }),
      beginningBalance: balance,
      emi: emi,
      principal: principal,
      interest: interest,
      endingBalance: newBalance,
    });

    balance = newBalance;
  }
}

function displayAmortizationTable(year) {
  const tbody = document.querySelector("#amortizationTable tbody");
  tbody.innerHTML = "";

  const yearData = amortizationSchedule.filter((row) => row.year === year);

  yearData.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${row.month}</td>
            <td>₹${Math.round(row.beginningBalance).toLocaleString(
              "en-IN"
            )}</td>
            <td>₹${Math.round(row.emi).toLocaleString("en-IN")}</td>
            <td>₹${Math.round(row.principal).toLocaleString("en-IN")}</td>
            <td>₹${Math.round(row.interest).toLocaleString("en-IN")}</td>
            <td>₹${Math.round(row.endingBalance).toLocaleString("en-IN")}</td>
        `;
    tbody.appendChild(tr);
  });

  document.getElementById("currentYear").textContent = year;
}

function changeYear(delta) {
  const newYear = currentYear + delta;
  const hasData = amortizationSchedule.some((row) => row.year === newYear);

  if (hasData) {
    currentYear = newYear;
    displayAmortizationTable(currentYear);
  }
}

// Calculate EMI on page load
document.addEventListener("DOMContentLoaded", calculateEMI);

function submitForm(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formObject = Object.fromEntries(formData.entries());

  // Here you would typically send this data to a server
  console.log("Form submitted:", formObject);

  alert("Loan application submitted successfully!");
  event.target.reset();
}

function updateTenureValue(value) {
  document.getElementById("tenureValue").textContent = value;
}

document.addEventListener("DOMContentLoaded", function () {
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      // Toggle active class on question
      question.classList.toggle("active");

      // Get the answer element
      const answer = question.nextElementSibling;

      // Toggle active class on answer
      answer.classList.toggle("active");

      // Close other open questions
      faqQuestions.forEach((otherQuestion) => {
        if (otherQuestion !== question) {
          otherQuestion.classList.remove("active");
          otherQuestion.nextElementSibling.classList.remove("active");
        }
      });
    });
  });
});

function validateForm(event) {
  event.preventDefault();
  let isValid = true;
  const form = document.getElementById("loanApplicationForm");

  if (!form) {
    console.error("Loan application form not found");
    return false;
  }

  // Reset previous errors
  const errorMessages = form.querySelectorAll(".error-message");
  errorMessages.forEach((error) => error.classList.remove("show"));
  const inputGroups = form.querySelectorAll(".input-group");
  inputGroups.forEach((group) => group.classList.remove("error"));

  // Validate Full Name
  const fullName = document.getElementById("fullName");
  if (!fullName || !fullName.value.trim()) {
    showError(fullName, "Full name is required");
    isValid = false;
  } else if (fullName.value.trim().length < 3) {
    showError(fullName, "Name must be at least 3 characters long");
    isValid = false;
  } else if (!/^[a-zA-Z\s]{3,50}$/.test(fullName.value.trim())) {
    showError(
      fullName,
      "Name should contain only letters and spaces (3-50 characters)"
    );
    isValid = false;
  }

  // Validate Email
  const email = document.getElementById("email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.value.trim()) {
    showError(email, "Email address is required");
    isValid = false;
  } else if (!emailRegex.test(email.value.trim())) {
    showError(email, "Please enter a valid email address");
    isValid = false;
  }

  // Validate Phone
  const phone = document.getElementById("phone");
  const phoneRegex = /^\d{10}$/;
  if (!phone || !phone.value.trim()) {
    showError(phone, "Phone number is required");
    isValid = false;
  } else if (!phoneRegex.test(phone.value.replace(/\D/g, ""))) {
    showError(phone, "Please enter a valid 10-digit phone number");
    isValid = false;
  }

  // Validate Date of Birth
  const dob = document.getElementById("dob");
  if (!dob || !dob.value) {
    showError(dob, "Date of birth is required");
    isValid = false;
  } else {
    const dobDate = new Date(dob.value);
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();

    // Adjust age if birthday hasn't occurred this year
    const actualAge =
      monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())
        ? age - 1
        : age;

    if (actualAge < 21 || actualAge > 65) {
      showError(dob, "Age must be between 21 and 65 years");
      isValid = false;
    }
  }

  // Validate Monthly Income
  const monthlyIncome = document.getElementById("monthlyIncome");
  if (!monthlyIncome || !monthlyIncome.value) {
    showError(monthlyIncome, "Monthly income is required");
    isValid = false;
  } else if (parseFloat(monthlyIncome.value) < 10000) {
    showError(monthlyIncome, "Monthly income must be at least ₹10,000");
    isValid = false;
  } else if (parseFloat(monthlyIncome.value) > 10000000) {
    showError(monthlyIncome, "Monthly income cannot exceed ₹1 Crore");
    isValid = false;
  }

  // Validate Work Experience
  const workExperience = document.getElementById("workExperience");
  if (!workExperience || !workExperience.value) {
    showError(workExperience, "Work experience is required");
    isValid = false;
  } else if (parseFloat(workExperience.value) < 1) {
    showError(workExperience, "Minimum 1 year of work experience required");
    isValid = false;
  } else if (parseFloat(workExperience.value) > 40) {
    showError(workExperience, "Work experience cannot exceed 40 years");
    isValid = false;
  }

  // Validate Loan Amount
  const loanAmount = document.getElementById("loanAmount");
  if (!loanAmount || !loanAmount.value) {
    showError(loanAmount, "Loan amount is required");
    isValid = false;
  } else if (parseFloat(loanAmount.value) < 100000) {
    showError(loanAmount, "Loan amount must be at least ₹1 Lakh");
    isValid = false;
  } else if (parseFloat(loanAmount.value) > 10000000) {
    showError(loanAmount, "Loan amount cannot exceed ₹1 Crore");
    isValid = false;
  }

  // Validate Loan Tenure
  const loanTenure = document.getElementById("loanTenure");
  if (!loanTenure || !loanTenure.value) {
    showError(loanTenure, "Loan tenure is required");
    isValid = false;
  } else if (parseFloat(loanTenure.value) < 1) {
    showError(loanTenure, "Loan tenure must be at least 1 year");
    isValid = false;
  } else if (parseFloat(loanTenure.value) > 30) {
    showError(loanTenure, "Loan tenure cannot exceed 30 years");
    isValid = false;
  }

  // Validate Loan Type
  const loanType = document.getElementById("loanType");
  if (!loanType || !loanType.value) {
    showError(loanType, "Please select a loan type");
    isValid = false;
  }

  // Validate Employment Type
  const employmentType = document.getElementById("employmentType");
  if (!employmentType || !employmentType.value) {
    showError(employmentType, "Please select employment type");
    isValid = false;
  }

  if (isValid) {
    // Form is valid, proceed with submission using XMLHttpRequest
    submitLoanApplicationWithValidation(form);
  } else {
    // Scroll to first error
    const firstError = form.querySelector(".input-group.error");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return isValid;
}

function showError(input, message) {
  if (!input) {
    console.error("Input element not found for error message:", message);
    return;
  }

  const inputGroup = input.closest(".input-group") || input.parentElement;
  const errorMessage = inputGroup.querySelector(".error-message");

  if (!errorMessage) {
    console.error("Error message element not found for input:", input.id);
    return;
  }

  inputGroup.classList.add("error");
  errorMessage.textContent = message;
  errorMessage.classList.add("show");

  // Add visual feedback
  input.style.borderColor = "#dc3545";
  input.style.backgroundColor = "#fff5f5";
}

function clearError(input) {
  if (!input) return;

  const inputGroup = input.closest(".input-group") || input.parentElement;
  const errorMessage = inputGroup.querySelector(".error-message");

  if (errorMessage) {
    inputGroup.classList.remove("error");
    errorMessage.classList.remove("show");
    errorMessage.textContent = "";
  }

  // Reset visual feedback
  input.style.borderColor = "";
  input.style.backgroundColor = "";
}

function submitLoanApplicationWithValidation(form) {
  // Display loading state
  const statusDiv =
    document.getElementById("application-status") || createStatusDiv();
  statusDiv.innerHTML =
    '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Submitting your application...</div>';
  statusDiv.style.display = "block";

  // Disable submit button
  const submitBtn =
    form.querySelector(".submit-btn") ||
    form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
  }

  // Create FormData for XMLHttpRequest
  const formData = new FormData(form);

  // Create XMLHttpRequest
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/loan/apply", true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Application";
      }

      if (xhr.status === 201 || xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            // Show success message
            statusDiv.innerHTML = `
                            <div class="success">
                                <i class="fas fa-check-circle"></i>
                                <h3>Application Submitted Successfully!</h3>
                                <p>Your loan application has been received. Application ID: ${
                                  data.loanApplication.id
                                }</p>
                                <p>Loan Amount: ₹${parseInt(
                                  data.loanApplication.amount
                                ).toLocaleString("en-IN")}</p>
                                <p>EMI: ₹${parseInt(
                                  data.loanApplication.emi
                                ).toLocaleString("en-IN")}</p>
                                <p>Status: ${capitalizeFirstLetter(
                                  data.loanApplication.status
                                )}</p>
                                <p>We will review your application and contact you shortly.</p>
                                <a href="/dashboard" class="status-link">Track Application Status</a>
                            </div>
                        `;

            // Clear the form
            form.reset();

            // Reset file input displays
            const fileInfos = form.querySelectorAll(".file-info");
            fileInfos.forEach((info) => {
              info.textContent = "No file chosen";
            });

            // Reset select elements
            const selects = form.querySelectorAll("select");
            selects.forEach((select) => {
              select.classList.remove("has-value", "filled");
            });
          } else {
            // Show error message
            statusDiv.innerHTML = `
                            <div class="error">
                                <i class="fas fa-exclamation-circle"></i>
                                <h3>Application Submission Failed</h3>
                                <p>${
                                  data.message ||
                                  "There was an error submitting your application. Please try again."
                                }</p>
                            </div>
                        `;
          }
        } catch (error) {
          console.error("Error parsing response:", error);
          statusDiv.innerHTML = `
                        <div class="error">
                            <i class="fas fa-exclamation-circle"></i>
                            <h3>Application Submission Failed</h3>
                            <p>Invalid response from server. Please try again.</p>
                        </div>
                    `;
        }
      } else if (xhr.status === 404) {
        statusDiv.innerHTML = `
                    <div class="error">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Service Not Found</h3>
                        <p>The loan application service is currently unavailable. Please contact support.</p>
                    </div>
                `;
      } else if (xhr.status === 500) {
        statusDiv.innerHTML = `
                    <div class="error">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Server Error</h3>
                        <p>There was a server error. Please try again later.</p>
                    </div>
                `;
      } else {
        statusDiv.innerHTML = `
                    <div class="error">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Network Error</h3>
                        <p>Network error (${xhr.status}). Please check your connection and try again.</p>
                    </div>
                `;
      }

      // Scroll to the status message
      statusDiv.scrollIntoView({ behavior: "smooth" });
    }
  };

  xhr.onerror = function () {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Application";
    }

    statusDiv.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Network Error</h3>
                <p>There was a network error. Please check your connection and try again.</p>
            </div>
        `;

    statusDiv.scrollIntoView({ behavior: "smooth" });
  };

  xhr.ontimeout = function () {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Application";
    }

    statusDiv.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Request Timeout</h3>
                <p>The request timed out. Please try again.</p>
            </div>
        `;

    statusDiv.scrollIntoView({ behavior: "smooth" });
  };

  // Set timeout
  xhr.timeout = 30000; // 30 seconds

  // Send the request
  xhr.send(formData);
}

function createStatusDiv() {
  let statusDiv = document.getElementById("application-status");
  if (!statusDiv) {
    statusDiv = document.createElement("div");
    statusDiv.id = "application-status";
    statusDiv.style.marginTop = "20px";

    const form = document.getElementById("loanApplicationForm");
    if (form && form.parentNode) {
      form.parentNode.insertBefore(statusDiv, form.nextSibling);
    }
  }
  return statusDiv;
}

// Add input event listeners for real-time validation
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loanApplicationForm");

  if (form) {
    // Add form submission event listener
    form.addEventListener("submit", validateForm);

    // Add real-time validation
    const inputs = form.querySelectorAll("input, select");
    inputs.forEach((input) => {
      // Clear errors on input
      input.addEventListener("input", function () {
        clearError(this);
      });

      // Validate on blur
      input.addEventListener("blur", function () {
        if (this.value.trim()) {
          validateSingleField(this);
        }
      });
    });
  }
});

function validateSingleField(input) {
  const fieldId = input.id;

  switch (fieldId) {
    case "fullName":
      if (input.value.trim().length < 3) {
        showError(input, "Name must be at least 3 characters long");
      } else if (!/^[a-zA-Z\s]{3,50}$/.test(input.value.trim())) {
        showError(input, "Name should contain only letters and spaces");
      }
      break;

    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value.trim())) {
        showError(input, "Please enter a valid email address");
      }
      break;

    case "phone":
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(input.value.replace(/\D/g, ""))) {
        showError(input, "Please enter a valid 10-digit phone number");
      }
      break;

    case "monthlyIncome":
      const income = parseFloat(input.value);
      if (income < 10000) {
        showError(input, "Monthly income must be at least ₹10,000");
      } else if (income > 10000000) {
        showError(input, "Monthly income cannot exceed ₹1 Crore");
      }
      break;

    case "loanAmount":
      const amount = parseFloat(input.value);
      if (amount < 100000) {
        showError(input, "Loan amount must be at least ₹1 Lakh");
      } else if (amount > 10000000) {
        showError(input, "Loan amount cannot exceed ₹1 Crore");
      }
      break;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Handle Apply Now buttons scrolling to application form
  const affordableBtn = document.getElementById("affordableApplyBtn");
  const premiumBtn = document.getElementById("premiumApplyBtn");
  const luxuryBtn = document.getElementById("luxuryApplyBtn");
  const loanApplicationSection = document.getElementById(
    "loanApplicationSection"
  );
  const loanTypeSelect = document.getElementById("loanType");

  if (affordableBtn) {
    affordableBtn.addEventListener("click", function () {
      loanApplicationSection.scrollIntoView({ behavior: "smooth" });
      if (loanTypeSelect) {
        loanTypeSelect.value = "affordable";
        handleSelectChange(loanTypeSelect);
      }
    });
  }

  if (premiumBtn) {
    premiumBtn.addEventListener("click", function () {
      loanApplicationSection.scrollIntoView({ behavior: "smooth" });
      if (loanTypeSelect) {
        loanTypeSelect.value = "premium";
        handleSelectChange(loanTypeSelect);
      }
    });
  }

  if (luxuryBtn) {
    luxuryBtn.addEventListener("click", function () {
      loanApplicationSection.scrollIntoView({ behavior: "smooth" });
      if (loanTypeSelect) {
        loanTypeSelect.value = "luxury";
        handleSelectChange(loanTypeSelect);
      }
    });
  }

  // Handle all select elements in the form
  const selectElements = document.querySelectorAll(".input-group select");
  selectElements.forEach((select) => {
    // Check initial state
    handleSelectChange(select);

    // Add event listener for changes
    select.addEventListener("change", function () {
      handleSelectChange(this);
    });
  });

  // Add animation when loan application section comes into view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
        }
      });
    },
    { threshold: 0.1 }
  );

  if (loanApplicationSection) {
    observer.observe(loanApplicationSection);
  }
});

// Function to handle select element changes
function handleSelectChange(selectElement) {
  if (selectElement.value) {
    selectElement.classList.add("has-value");
    selectElement.classList.add("filled");
  } else {
    selectElement.classList.remove("has-value");
    selectElement.classList.remove("filled");
  }
}

// Handle file input changes to show selected file name
document.addEventListener("DOMContentLoaded", function () {
  const fileInputs = document.querySelectorAll('input[type="file"]');

  fileInputs.forEach((input) => {
    input.addEventListener("change", function () {
      const fileInfo = this.nextElementSibling;

      if (this.files.length === 0) {
        fileInfo.textContent = "No file chosen";
        return;
      }

      if (this.multiple) {
        if (this.files.length === 1) {
          fileInfo.textContent = this.files[0].name;
        } else {
          fileInfo.textContent = `${this.files.length} files selected`;
        }
      } else {
        fileInfo.textContent = this.files[0].name;
      }
    });
  });
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
