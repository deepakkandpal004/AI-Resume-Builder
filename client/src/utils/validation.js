/**
 * Centralized validation utilities for form inputs
 */

// Email validation
export const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return { valid: true, error: null }; // Optional field
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Please enter a valid email address" };
  }
  
  return { valid: true, error: null };
};

// Phone validation (flexible format)
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === "") {
    return { valid: true, error: null }; // Optional field
  }
  
  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, "");
  
  if (digits.length < 10) {
    return { valid: false, error: "Phone number must be at least 10 digits" };
  }
  
  return { valid: true, error: null };
};

// URL validation
export const validateUrl = (url, fieldName = "URL") => {
  if (!url || url.trim() === "") {
    return { valid: true, error: null }; // Optional field
  }
  
  try {
    new URL(url);
    return { valid: true, error: null };
  } catch {
    return { valid: false, error: `Please enter a valid ${fieldName}` };
  }
};

// LinkedIn URL validation
export const validateLinkedIn = (url) => {
  if (!url || url.trim() === "") {
    return { valid: true, error: null };
  }
  
  const linkedInRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/.+$/i;
  if (!linkedInRegex.test(url)) {
    return { valid: false, error: "Please enter a valid LinkedIn URL" };
  }
  
  return { valid: true, error: null };
};

// GitHub URL validation
export const validateGitHub = (url) => {
  if (!url || url.trim() === "") {
    return { valid: true, error: null };
  }
  
  const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/.+$/i;
  if (!githubRegex.test(url)) {
    return { valid: false, error: "Please enter a valid GitHub URL" };
  }
  
  return { valid: true, error: null };
};

// Required field validation
export const validateRequired = (value, fieldName = "This field") => {
  if (!value || value.toString().trim() === "") {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true, error: null };
};

// Min length validation
export const validateMinLength = (value, minLength, fieldName = "This field") => {
  if (!value) {
    return { valid: true, error: null }; // Optional field
  }
  
  if (value.toString().trim().length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  
  return { valid: true, error: null };
};

// Max length validation
export const validateMaxLength = (value, maxLength, fieldName = "This field") => {
  if (!value) {
    return { valid: true, error: null };
  }
  
  if (value.toString().length > maxLength) {
    return { valid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }
  
  return { valid: true, error: null };
};

// Date validation (YYYY-MM format for resume dates)
export const validateDate = (date) => {
  if (!date || date.trim() === "") {
    return { valid: true, error: null };
  }
  
  const dateRegex = /^\d{4}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { valid: false, error: "Please enter date in YYYY-MM format" };
  }
  
  const [year, month] = date.split("-").map(Number);
  const currentYear = new Date().getFullYear();
  
  if (year < 1950 || year > currentYear + 10) {
    return { valid: false, error: "Please enter a valid year" };
  }
  
  if (month < 1 || month > 12) {
    return { valid: false, error: "Please enter a valid month (01-12)" };
  }
  
  return { valid: true, error: null };
};

// GPA validation
export const validateGPA = (gpa) => {
  if (!gpa || gpa.trim() === "") {
    return { valid: true, error: null };
  }
  
  const gpaNum = parseFloat(gpa);
  
  if (isNaN(gpaNum)) {
    return { valid: false, error: "GPA must be a number" };
  }
  
  if (gpaNum < 0 || gpaNum > 4.0) {
    return { valid: false, error: "GPA must be between 0.0 and 4.0" };
  }
  
  return { valid: true, error: null };
};

// Validate entire personal info form
export const validatePersonalInfo = (personalInfo) => {
  const errors = {};
  
  const emailValidation = validateEmail(personalInfo.email);
  if (!emailValidation.valid) errors.email = emailValidation.error;
  
  const phoneValidation = validatePhone(personalInfo.phone);
  if (!phoneValidation.valid) errors.phone = phoneValidation.error;
  
  const linkedInValidation = validateLinkedIn(personalInfo.linkedin);
  if (!linkedInValidation.valid) errors.linkedin = linkedInValidation.error;
  
  const websiteValidation = validateUrl(personalInfo.website, "website");
  if (!websiteValidation.valid) errors.website = websiteValidation.error;
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate experience entry
export const validateExperience = (experience) => {
  const errors = {};
  
  if (!experience.company?.trim()) {
    errors.company = "Company name is required";
  }
  
  if (!experience.position?.trim()) {
    errors.position = "Position is required";
  }
  
  const startDateValidation = validateDate(experience.start_date);
  if (!startDateValidation.valid) errors.start_date = startDateValidation.error;
  
  if (!experience.is_current) {
    const endDateValidation = validateDate(experience.end_date);
    if (!endDateValidation.valid) errors.end_date = endDateValidation.error;
    
    // Check if end date is after start date
    if (experience.start_date && experience.end_date && experience.start_date > experience.end_date) {
      errors.end_date = "End date must be after start date";
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate education entry
export const validateEducation = (education) => {
  const errors = {};
  
  if (!education.institution?.trim()) {
    errors.institution = "Institution name is required";
  }
  
  if (!education.degree?.trim()) {
    errors.degree = "Degree is required";
  }
  
  const dateValidation = validateDate(education.graduation_date);
  if (!dateValidation.valid) errors.graduation_date = dateValidation.error;
  
  if (education.gpa) {
    const gpaValidation = validateGPA(education.gpa);
    if (!gpaValidation.valid) errors.gpa = gpaValidation.error;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate project entry
export const validateProject = (project) => {
  const errors = {};
  
  if (!project.name?.trim()) {
    errors.name = "Project name is required";
  }
  
  if (project.githubUrl) {
    const githubValidation = validateGitHub(project.githubUrl);
    if (!githubValidation.valid) errors.githubUrl = githubValidation.error;
  }
  
  if (project.liveUrl) {
    const urlValidation = validateUrl(project.liveUrl, "live URL");
    if (!urlValidation.valid) errors.liveUrl = urlValidation.error;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePhone,
  validateUrl,
  validateLinkedIn,
  validateGitHub,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateDate,
  validateGPA,
  validatePersonalInfo,
  validateExperience,
  validateEducation,
  validateProject,
};
