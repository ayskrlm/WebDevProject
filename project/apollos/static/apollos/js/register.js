// This function is triggered when the "Send OTP" button is clicked.
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
function sendOTP() {
    var email = document.getElementById('email').value;
    var errorMessageDiv = document.getElementById('error-message');
    var otpMessageDiv = document.getElementById('otp-message');
    errorMessageDiv.style.display = 'none';  // Hide previous error message

    if (email) {
        // AJAX request to send OTP
        fetch(sendOtpUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken  // CSRF token for security
            },
            body: JSON.stringify({ email: email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show the OTP input field and the Register button
                document.getElementById('otp-section').style.display = 'block';
                document.getElementById('register-btn').style.display = 'block';
                otpMessageDiv.style.display = 'block';  // Show the success message
                otpMessageDiv.textContent = "OTP sent to your email. Please check your inbox.";
            } else {
                if (data.error === 'Email is already registered.') {
                    errorMessageDiv.style.display = 'block';  // Show the error message
                    errorMessageDiv.textContent = "This email is already registered. Please use a different email.";
                } else {
                    errorMessageDiv.style.display = 'block';
                    errorMessageDiv.textContent = "Failed to send OTP. Please try again.";
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessageDiv.style.display = 'block';
            errorMessageDiv.textContent = "An error occurred while sending the OTP.";
        });
    } else {
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.textContent = "Please enter a valid email.";
    }
}