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
            // This 'data' object contains the raw form inputs
            const data = Object.fromEntries(formData.entries());

            // --- CRITICAL STEP: COMBINE NAMES TO MATCH Mongoose Model ---
            const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();

            const finalPayload = {
                // 1. Map 'firstName' and 'lastName' to the required 'name' field
                name: fullName,

                // 2. Pass other required fields directly
                email: data.email,
                password: data.password,

                // 3. Include optional fields
                phone: data.phone || "",
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
                // 4. Use fetch API to send the request asynchronously (converted from Axios)
                const response = await fetch(API_URL + "/register", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalPayload),
                });
                
                const responseData = await response.json(); // Get the JSON response body

                if (response.ok) {
                    // 5. Handle success response
                    messageContainer.textContent =
                        responseData.message ||
                        "Registration successful! Proceeding to OTP verification...";
                    messageContainer.className = "feedback-message success-message";

                    // Redirect after a short delay (Prepare for the OTP verification page)
                    setTimeout(() => {
                        // --- CORRECT REDIRECT: Use the email from the API response to redirect to /verify ---
                        // The server response includes the email necessary for the verification page
                        const emailToVerify = responseData.email; 
                        window.location.href = `/verify?email=${emailToVerify}`;
                    }, 2000);
                    
                } else {
                    // 6. Handle errors (e.g., 400 Bad Request, User already exists)
                    // The errorMiddleware returns JSON with a 'message' field
                    const errorMessage = responseData.message || "A server error occurred.";

                    messageContainer.textContent = errorMessage;
                    messageContainer.className = "feedback-message error-message";
                }
                
            } catch (error) {
                // 7. Handle network errors
                console.error("Fetch error:", error);
                messageContainer.textContent = "A network error occurred. Please check your connection.";
                messageContainer.className = "feedback-message error-message";
            }
        });
    }
});
