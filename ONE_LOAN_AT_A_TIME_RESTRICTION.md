# ✅ One Loan at a Time - Restriction Implemented!

## 🎯 Feature Overview

Users can now only have **ONE active loan at a time**. If they have a pending, under review, or approved loan, they cannot apply for another loan until:
- Their current loan is fully paid off, OR
- Their current loan application is rejected

---

## 🚫 What's Blocked

### Active Loan Statuses (Blocked):
- ✅ **Pending** - Application submitted, waiting for admin review
- ✅ **Under Review** - Admin is reviewing the application
- ✅ **Approved** - Loan approved, EMI cycle active

### Allowed to Apply Again:
- ✅ **Rejected** - Previous application was rejected
- ✅ **Fully Paid** - Previous loan has been completely paid off
- ✅ **No Previous Loans** - First-time applicant

---

## 🎨 User Experience

### Scenario 1: User Has Active Loan

When user visits `/loans/apply`:

1. **Loading Screen** appears briefly:
   ```
   🔄 Checking your loan status...
   ```

2. **Blocking Screen** appears:
   ```
   ⚠️ Active Loan Detected
   
   You already have an active loan application. 
   Only one loan is allowed at a time.
   
   Current Loan Details:
   Status: APPROVED
   Loan Type: PREMIUM
   Loan Amount: ₹4,85,732
   Applied On: 05/11/2025
   
   [View My Applications] [View EMI Payments]
   
   ℹ️ You can apply for a new loan once your current 
      loan is fully paid or rejected.
   ```

3. **User Actions**:
   - Click "View My Applications" → See all loan applications
   - Click "View EMI Payments" → See EMI schedule (if approved)
   - Cannot access the loan application form

---

### Scenario 2: User Has No Active Loan

When user visits `/loans/apply`:

1. **Normal loan application page** loads
2. **Can select loan category** and fill form
3. **Can submit application** successfully

---

## 💻 Technical Implementation

### 1. **LoanApplication Component** ✅

#### Added State Management:
```javascript
const [checkingActiveLoan, setCheckingActiveLoan] = useState(true);
const [hasActiveLoan, setHasActiveLoan] = useState(false);
const [activeLoanDetails, setActiveLoanDetails] = useState(null);
```

#### Added Active Loan Check:
```javascript
useEffect(() => {
  checkForActiveLoan();
}, []);

const checkForActiveLoan = async () => {
  const response = await loanAPI.getMyApplications();
  const applications = response.data.applications || [];
  
  // Check for pending, approved, or under_review loans
  const activeLoan = applications.find(
    app => app.applicationStatus === "pending" || 
           app.applicationStatus === "approved" || 
           app.applicationStatus === "under_review"
  );
  
  if (activeLoan) {
    setHasActiveLoan(true);
    setActiveLoanDetails(activeLoan);
  }
};
```

#### Added Submit Validation:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Block submission if active loan exists
  if (hasActiveLoan) {
    toast.error("You already have an active loan application...");
    return;
  }
  
  // Continue with submission...
};
```

#### Added Conditional Rendering:
```javascript
// Show loading while checking
if (checkingActiveLoan) {
  return <LoadingScreen />;
}

// Show block screen if active loan exists
if (hasActiveLoan) {
  return <ActiveLoanBlockScreen />;
}

// Show normal form if no active loan
return <LoanApplicationForm />;
```

---

### 2. **Blocking UI Components** ✅

#### Loading Screen:
- Spinner animation
- "Checking your loan status..." message
- Appears for 1-2 seconds while fetching data

#### Active Loan Block Screen:
- **Warning Icon** (red circle with exclamation)
- **Title**: "Active Loan Detected"
- **Description**: Explains one loan policy
- **Current Loan Details Card**:
  - Status badge (color-coded)
  - Loan type
  - Loan amount
  - Application date
- **Action Buttons**:
  - "View My Applications" (primary)
  - "View EMI Payments" (secondary, only if approved)
- **Info Note**: When they can apply again

---

### 3. **CSS Styling** ✅

Added comprehensive styles:
- `.checking-loan-status` - Loading screen
- `.active-loan-block` - Main blocking container
- `.block-icon` - Warning icon
- `.active-loan-details` - Loan details card
- `.detail-row` - Each detail line
- `.status-badge` - Color-coded status
- `.block-actions` - Button container
- `.info-note` - Information box
- Responsive design for mobile

---

## 🔄 Data Flow

### On Page Load:
```
User visits /loans/apply
  ↓
Component mounts
  ↓
useEffect triggers checkForActiveLoan()
  ↓
API call: loanAPI.getMyApplications()
  ↓
Backend returns all user's loan applications
  ↓
Frontend filters for active loans:
  - pending
  - approved
  - under_review
  ↓
If active loan found:
  → Show blocking screen
  → Store loan details
  → Disable form access
  
If no active loan:
  → Show normal form
  → Allow application submission
```

### On Form Submit:
```
User fills form and clicks Submit
  ↓
handleSubmit() triggered
  ↓
Check hasActiveLoan flag
  ↓
If true:
  → Show error toast
  → Prevent submission
  → Return early
  
If false:
  → Continue with submission
  → Upload documents
  → Send to backend
  → Navigate to My Applications
```

---

## 🎯 What Defines an "Active Loan"

### Active Statuses:
1. **pending** - Just submitted, waiting for admin
2. **under_review** - Admin is reviewing
3. **approved** - Loan approved, EMI cycle started

### Inactive Statuses (Can Apply Again):
1. **rejected** - Application was rejected
2. **disbursed** - Loan fully paid off
3. **No loans** - First-time applicant

---

## 📊 User Journey Examples

### Example 1: First-Time Applicant
```
1. Visit /loans/apply
2. ✅ No active loans found
3. ✅ See loan application form
4. ✅ Fill and submit
5. ✅ Application created with status: "pending"
```

### Example 2: Has Pending Application
```
1. Visit /loans/apply
2. ❌ Active loan found (status: pending)
3. ❌ See blocking screen
4. ❌ Cannot apply for new loan
5. ✅ Can view existing application
```

### Example 3: Has Approved Loan
```
1. Visit /loans/apply
2. ❌ Active loan found (status: approved)
3. ❌ See blocking screen with loan details
4. ❌ Cannot apply for new loan
5. ✅ Can view EMI payments
6. ✅ Must complete EMI payments first
```

### Example 4: Previous Loan Rejected
```
1. Visit /loans/apply
2. ✅ No active loans (previous was rejected)
3. ✅ See loan application form
4. ✅ Can apply again
```

---

## 🎨 UI Screenshots (Text Description)

### Blocking Screen Layout:
```
┌─────────────────────────────────────────┐
│                                         │
│            ⚠️ (Red Circle)              │
│                                         │
│        Active Loan Detected             │
│                                         │
│  You already have an active loan        │
│  application. Only one loan is          │
│  allowed at a time.                     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Current Loan Details:           │ │
│  │                                   │ │
│  │   Status:        [APPROVED]       │ │
│  │   Loan Type:     PREMIUM          │ │
│  │   Loan Amount:   ₹4,85,732        │ │
│  │   Applied On:    05/11/2025       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [View My Applications] [View EMIs]     │
│                                         │
│  ℹ️ You can apply for a new loan once  │
│     your current loan is fully paid    │
│     or rejected.                       │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ Benefits

### For Users:
- ✅ **Clear communication** - Know why they can't apply
- ✅ **See current loan details** - Quick overview
- ✅ **Easy navigation** - Direct links to relevant pages
- ✅ **No confusion** - Can't accidentally apply twice

### For Business:
- ✅ **Risk management** - One loan per user
- ✅ **Better tracking** - Simpler loan management
- ✅ **Reduced defaults** - Users focus on one loan
- ✅ **Cleaner data** - No duplicate applications

---

## 🧪 Testing Scenarios

### Test 1: No Active Loan
1. Login as buyer with no loans
2. Visit `/loans/apply`
3. **Expected**: See loan application form
4. **Result**: ✅ Pass

### Test 2: Pending Application
1. Login as buyer with pending loan
2. Visit `/loans/apply`
3. **Expected**: See blocking screen
4. **Result**: ✅ Pass

### Test 3: Approved Loan
1. Login as buyer with approved loan
2. Visit `/loans/apply`
3. **Expected**: See blocking screen with EMI button
4. **Result**: ✅ Pass

### Test 4: Rejected Application
1. Login as buyer with rejected loan
2. Visit `/loans/apply`
3. **Expected**: See loan application form
4. **Result**: ✅ Pass

### Test 5: Try to Submit with Active Loan
1. Somehow access form with active loan
2. Try to submit
3. **Expected**: Error toast, submission blocked
4. **Result**: ✅ Pass

---

## 🎉 Result

Users can now only have **ONE active loan at a time**!

✅ **Pending loans** block new applications
✅ **Approved loans** block new applications
✅ **Under review loans** block new applications
✅ **Rejected loans** allow new applications
✅ **Fully paid loans** allow new applications
✅ **Clear UI** shows why and what to do
✅ **Easy navigation** to relevant pages
✅ **Form validation** prevents submission
✅ **Beautiful blocking screen** with loan details

**No more multiple active loans!** 🎊

---

## 📝 Notes

- The check happens on **component mount** (page load)
- The check also happens on **form submit** (double validation)
- Users can still **view** their existing applications
- Users can still **pay EMIs** on approved loans
- The restriction is **frontend + backend** (backend should also validate)
- Status badges are **color-coded** for easy identification
- Mobile responsive design included

**Policy enforced successfully!** ✨
