// public/signup.js

// Define the base API URL (must match the route prefix in your Express app)
const API_URL = "/api/auth";

document.addEventListener("DOMContentLoaded", () => {
    // Select the form using its class
    const form = document.querySelector(".auth-form");
    // Select the message container for dynamic feedback
    const messageContainer = document.querySelector(".feedback-message");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // <--- CRUCIAL: STOP the default full-page reload

            // 1. Gather form data from the HTML form fields
            const formData = new FormData(form);
            // This 'data' object contains the raw form inputs (firstName, lastName, email, etc.)
            const data = Object.fromEntries(formData.entries());

            // --- CRITICAL STEP: COMBINE NAMES TO MATCH Mongoose Model ---
            // Your Mongoose model requires a single 'name' field.
            const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();

            const finalPayload = {
                // 1. Map 'firstName' and 'lastName' to the required 'name' field
                name: fullName,

                // 2. Pass other required fields directly
                email: data.email,
                password: data.password,

                // 3. Include optional fields if they exist in your form
                phone: data.phone || "",
                
                // We do NOT send confirmPassword to the backend.
            };
            // -----------------------------------------------------------

            // 2. Simple client-side validation for password matching
            if (data.password !== data.confirmPassword) {
                messageContainer.textContent = "Passwords do not match.";
                messageContainer.className = "feedback-message error-message";
                return;
            }

            // 3. Display processing message
            messageContainer.textContent = "Processing registration...";
            messageContainer.className = "feedback-message success-message";

            try {
                // 4. Use Axios to send the request asynchronously.
                // NOTE: We send the CLEANED finalPayload, NOT the original data.
                const response = await axios.post(API_URL + "/register", finalPayload);

                // 5. Handle success response
                messageContainer.textContent =
                    response.data.message ||
                    "Registration successful! Proceeding to OTP verification...";
                messageContainer.className = "feedback-message success-message";

                // Redirect after a short delay (Prepare for the OTP verification page)
                setTimeout(() => {
                    // For now, redirect to login, but this will become /verify-otp later
                    window.location.href = "/login";
                }, 2000);
                
            } catch (error) {
                // 6. Handle errors (e.g., 400 Bad Request, User already exists)
                const errorMessage =
                    error.response?.data?.message || "A network error occurred.";

                messageContainer.textContent = errorMessage;
                messageContainer.className = "feedback-message error-message";
            }
        });
    }
});