document.addEventListener('DOMContentLoaded', function() {
    // Function to generate a random password
    function generatePassword(length, specificString) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        if (specificString) {
            // Insert specific string at a random position
            const randomIndex = Math.floor(Math.random() * (password.length + 1));
            password = password.slice(0, randomIndex) + specificString + password.slice(randomIndex);
        }
        return password;
    }

    // Function to display generated password
    function displayPassword(password) {
        const passwordDisplay = document.getElementById('password-display');
        passwordDisplay.textContent = password;
    }

    // Function to handle button click
    document.getElementById('generate-btn').addEventListener('click', function() {
        const length = document.getElementById('length').value;
        const specificString = document.getElementById('specific-string').value;
        const generatedPassword = generatePassword(length, specificString);
        displayPassword(generatedPassword);
    });

    // Function to handle copy button click
document.getElementById('copy-btn').addEventListener('click', function() {
    const passwordDisplay = document.getElementById('password-display');
    const password = passwordDisplay.textContent;
    copyPasswordToClipboard(password);
    alert('Password copied to clipboard!');
});


});


// Function to copy password to clipboard
function copyPasswordToClipboard(password) {
    const textarea = document.createElement('textarea');
    textarea.value = password;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}
