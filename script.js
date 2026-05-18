const products = {
  annual: {
    name: "Great Voyager+ Annual",
    status: "Annual cover selected",
    summary: "Annual cover selected for multiple trips across the year."
  },
  short: {
    name: "Great Voyager+ Short Term",
    status: "Short-term cover selected",
    summary: "Short-term cover selected for one planned trip."
  }
};

let selectedProduct = null;
let selectedPlan = "essential";
let paymentComplete = false;

const auditToggle = document.querySelector("#auditToggle");
const auditPanel = document.querySelector("#auditPanel");
const compareToggle = document.querySelector("#compareToggle");
const compareSection = document.querySelector("#compare");
const quoteJourney = document.querySelector("#quoteJourney");
const journeyTitle = document.querySelector("#journey-title");
const journeyIntro = document.querySelector("#journeyIntro");
const statusText = document.querySelector("#statusText");
const selectedProductText = document.querySelector("#selectedProduct");
const formStatus = document.querySelector("#formStatus");
const errorPanel = document.querySelector("#errorPanel");
const errorList = document.querySelector("#errorList");
const quoteForm = document.querySelector("#quoteForm");
const steps = Array.from(document.querySelectorAll(".steps li"));
const journeySteps = Array.from(document.querySelectorAll(".journey-step"));
const flowScreens = Array.from(document.querySelectorAll(".flow-screen"));
const detailsForm = document.querySelector("#detailsForm");
const detailsErrorPanel = document.querySelector("#detailsErrorPanel");
const detailsErrorList = document.querySelector("#detailsErrorList");
const sidePlan = document.querySelector("#sidePlan");
const sidePremium = document.querySelector("#sidePremium");
const planPrices = {
  essential: 272.44,
  supreme: 564.44
};
const planLabels = {
  essential: "Essential",
  supreme: "Supreme with COVID-19"
};
const flowOrder = ["plan", "details", "summary", "payment", "feedback"];

function setStep(index) {
  steps.forEach((step, currentIndex) => {
    step.classList.toggle("active", currentIndex === index);
  });
}

function money(amount) {
  return `MYR ${amount.toFixed(2)}`;
}

function travellerCount() {
  return Math.max(1, Number(document.querySelector("#travellers").value || 1));
}

function currentPremium() {
  return planPrices[selectedPlan] * travellerCount();
}

function updatePremium() {
  sidePlan.textContent = planLabels[selectedPlan];
  sidePremium.textContent = money(currentPremium());
  document.querySelector("#summaryPlan").textContent = planLabels[selectedPlan];
  document.querySelector("#summaryPremium").textContent = money(currentPremium());
  document.querySelector("#payButton").textContent = `Pay ${money(currentPremium())}`;
  document.querySelector("#feedbackPremium").textContent = money(currentPremium());
}

function setFlowStep(stepName) {
  if (stepName === "landing") {
    quoteJourney.hidden = true;
    document.body.classList.remove("journey-open");
    document.querySelector("#quote").scrollIntoView({ behavior: "auto", block: "start" });
    return;
  }

  const activeIndex = flowOrder.indexOf(stepName);
  flowScreens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === stepName);
  });
  journeySteps.forEach((step, index) => {
    const isActive = step.dataset.flowStep === stepName;
    step.classList.toggle("is-active", isActive);
    step.classList.toggle("is-complete", index < activeIndex);
    step.setAttribute("aria-current", isActive ? "step" : "false");
  });

  const intro = {
    plan: "Start by selecting the plan and traveller count that best match this trip.",
    details: "Add applicant and traveller details. Required fields are checked before continuing.",
    summary: "Review the trip, applicant, and cover details before payment.",
    payment: "Choose a payment method and confirm the premium payable.",
    feedback: "Payment is complete. The confirmation status and reference number are shown below."
  };
  journeyIntro.textContent = intro[stepName];
  quoteJourney.hidden = false;
  window.scrollTo({ top: quoteJourney.offsetTop, behavior: "auto" });
}

function openJourney() {
  const product = products[selectedProduct];
  document.body.classList.add("journey-open");
  journeyTitle.textContent = product.name;
  document.querySelector("#summaryProduct").textContent = product.name;
  updatePremium();
  setFlowStep("plan");
}

function selectProduct(productKey) {
  selectedProduct = productKey;
  const product = products[productKey];

  document.querySelectorAll(".product-card").forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.product === productKey);
  });

  statusText.textContent = product.status;
  selectedProductText.textContent = product.summary;
  formStatus.textContent = "Add trip details to review this quote.";
  setStep(1);
  document.querySelector("#quote").scrollIntoView({ behavior: "auto", block: "start" });
}

function resetFlow() {
  selectedProduct = null;
  paymentComplete = false;
  quoteForm.reset();
  if (detailsForm) {
    detailsForm.reset();
  }
  document.querySelector("#travellers").value = "1";
  document.querySelectorAll(".product-card").forEach((card) => card.classList.remove("is-selected"));
  document.querySelectorAll("input, select").forEach((input) => input.removeAttribute("aria-invalid"));
  errorPanel.hidden = true;
  errorList.replaceChildren();
  detailsErrorPanel.hidden = true;
  detailsErrorList.replaceChildren();
  quoteJourney.hidden = true;
  document.body.classList.remove("journey-open");
  selectedProductText.textContent = "No product selected yet.";
  statusText.textContent = "Select a product";
  formStatus.textContent = "Validation will identify missing or conflicting details.";
  setStep(0);
}

function addError(errors, field, message) {
  errors.push({ field, message });
  if (field) {
    field.setAttribute("aria-invalid", "true");
  }
}

function clearErrors() {
  errorList.replaceChildren();
  errorPanel.hidden = true;
  quoteForm.querySelectorAll("input").forEach((input) => input.removeAttribute("aria-invalid"));
}

function clearDetailsErrors() {
  detailsErrorList.replaceChildren();
  detailsErrorPanel.hidden = true;
  detailsForm.querySelectorAll("input, select").forEach((input) => input.removeAttribute("aria-invalid"));
}

function validateQuote(event) {
  event.preventDefault();
  clearErrors();

  const destination = document.querySelector("#destination");
  const travellers = document.querySelector("#travellers");
  const departDate = document.querySelector("#departDate");
  const returnDate = document.querySelector("#returnDate");
  const residentCheck = document.querySelector("#residentCheck");
  const errors = [];

  if (!selectedProduct) {
    errors.push({ field: null, message: "Choose Annual or Short Term before reviewing a quote." });
  }

  if (!destination.value.trim()) {
    addError(errors, destination, "Enter a destination.");
  }

  if (!travellers.value || Number(travellers.value) < 1) {
    addError(errors, travellers, "Enter at least one traveller.");
  }

  if (!departDate.value) {
    addError(errors, departDate, "Choose a departure date.");
  }

  if (!returnDate.value) {
    addError(errors, returnDate, "Choose a return date.");
  }

  if (departDate.value && returnDate.value && returnDate.value < departDate.value) {
    addError(errors, returnDate, "Return date must be after the departure date.");
  }

  if (!residentCheck.checked) {
    addError(errors, residentCheck, "Confirm that traveller details can be reviewed before purchase.");
  }

  if (errors.length) {
    errors.forEach(({ message }) => {
      const item = document.createElement("li");
      item.textContent = message;
      errorList.append(item);
    });
    errorPanel.hidden = false;
    formStatus.textContent = "The quote is paused until the highlighted details are fixed.";
    statusText.textContent = "Action needed";
    setStep(selectedProduct ? 1 : 0);
    const firstField = errors.find((error) => error.field)?.field;
    (firstField || errorPanel).focus();
    return;
  }

  statusText.textContent = "Ready for review";
  formStatus.textContent = `${products[selectedProduct].name} is ready to review for ${destination.value.trim()}.`;
  setStep(2);
  openJourney();
}

function addDetailsError(errors, field, message) {
  errors.push({ field, message });
  field.setAttribute("aria-invalid", "true");
}

function validateDetails() {
  clearDetailsErrors();
  const requiredFields = [
    [document.querySelector("#idType"), "Select an ID type."],
    [document.querySelector("#idNumber"), "Enter an ID number."],
    [document.querySelector("#salutation"), "Select a salutation."],
    [document.querySelector("#fullName"), "Enter the applicant full name."],
    [document.querySelector("#birthDate"), "Choose the applicant date of birth."],
    [document.querySelector("#maritalStatus"), "Select marital status."],
    [document.querySelector("#mobileNumber"), "Enter a mobile number."],
    [document.querySelector("#emailAddress"), "Enter an email address."],
    [document.querySelector("#postcode"), "Enter a postcode."],
    [document.querySelector("#state"), "Select a state."],
    [document.querySelector("#addressLine"), "Enter address line 1."]
  ];
  const errors = [];

  requiredFields.forEach(([field, message]) => {
    if (!field.value.trim()) {
      addDetailsError(errors, field, message);
    }
  });

  const email = document.querySelector("#emailAddress");
  if (email.value.trim() && !email.value.includes("@")) {
    addDetailsError(errors, email, "Enter a valid email address.");
  }

  if (errors.length) {
    errors.forEach(({ message }) => {
      const item = document.createElement("li");
      item.textContent = message;
      detailsErrorList.append(item);
    });
    detailsErrorPanel.hidden = false;
    const firstField = errors[0].field;
    (firstField || detailsErrorPanel).focus();
    return false;
  }

  return true;
}

function populateSummary() {
  const destination = document.querySelector("#destination").value.trim();
  const depart = document.querySelector("#departDate").value;
  const returned = document.querySelector("#returnDate").value;
  document.querySelector("#summaryDestination").textContent = destination || "-";
  document.querySelector("#summaryDates").textContent = depart && returned ? `${depart} to ${returned}` : "-";
  document.querySelector("#summaryTravellers").textContent = String(travellerCount());
  document.querySelector("#summaryName").textContent = document.querySelector("#fullName").value.trim() || "-";
  document.querySelector("#summaryEmail").textContent = document.querySelector("#emailAddress").value.trim() || "-";
  document.querySelector("#summaryMobile").textContent = document.querySelector("#mobileNumber").value.trim() || "-";
  updatePremium();
}

auditToggle.addEventListener("click", () => {
  const isExpanded = auditToggle.getAttribute("aria-expanded") === "true";
  auditToggle.setAttribute("aria-expanded", String(!isExpanded));
  auditPanel.hidden = isExpanded;
  auditToggle.textContent = isExpanded ? "View audit" : "Hide audit";
});

compareToggle.addEventListener("click", () => {
  const isPressed = compareToggle.getAttribute("aria-pressed") === "true";
  compareToggle.setAttribute("aria-pressed", String(!isPressed));
  compareSection.hidden = isPressed;
  if (isPressed) {
    return;
  }
  compareSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll("[data-select]").forEach((button) => {
  button.addEventListener("click", () => selectProduct(button.dataset.select));
});

document.querySelector("#chooseAnnual").addEventListener("click", () => selectProduct("annual"));
document.querySelector("#chooseShort").addEventListener("click", () => selectProduct("short"));
document.querySelector("#resetFlow").addEventListener("click", resetFlow);
quoteForm.addEventListener("submit", validateQuote);

document.querySelectorAll("[data-flow-step]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.flowStep === "summary") {
      populateSummary();
    }
    setFlowStep(button.dataset.flowStep);
  });
});

document.querySelectorAll("[data-flow-next]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.flowNext;
    if (target === "summary") {
      populateSummary();
    }
    setFlowStep(target);
  });
});

document.querySelector("[data-flow-back='landing']").addEventListener("click", () => {
  setFlowStep("landing");
});

document.querySelectorAll(".plan-option").forEach((button) => {
  button.addEventListener("click", () => {
    selectedPlan = button.dataset.plan;
    document.querySelectorAll(".plan-option").forEach((option) => {
      const isSelected = option === button;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-checked", String(isSelected));
    });
    updatePremium();
  });
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segmented button").forEach((option) => {
      const isSelected = option === button;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-pressed", String(isSelected));
    });
  });
});

document.querySelectorAll(".payment-option").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".payment-option").forEach((option) => {
      const isSelected = option === button;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-checked", String(isSelected));
    });
  });
});

document.querySelector("#continueDetails").addEventListener("click", () => {
  if (!validateDetails()) {
    return;
  }
  populateSummary();
  setFlowStep("summary");
});

document.querySelector("#goPayment").addEventListener("click", () => {
  const consent = document.querySelector("#summaryConsent");
  if (!consent.checked) {
    consent.setAttribute("aria-invalid", "true");
    consent.focus();
    return;
  }
  consent.removeAttribute("aria-invalid");
  setFlowStep("payment");
});

document.querySelector("#payButton").addEventListener("click", () => {
  paymentComplete = true;
  statusText.textContent = "Payment authorized";
  setFlowStep("feedback");
});

document.querySelector("#finishFlow").addEventListener("click", () => {
  statusText.textContent = "Policy confirmed";
  setFlowStep("landing");
});

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(button.dataset.scroll).scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
