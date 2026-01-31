document.addEventListener("DOMContentLoaded", function () {
    const lengthRange = document.getElementById("length");
    const lengthNumber = document.getElementById("length-number");
    const lengthValue = document.getElementById("length-value");
    const specificInput = document.getElementById("specific-string");
    const passwordDisplay = document.getElementById("password-display");
    const copyBtn = document.getElementById("copy-btn");
    const statusMsg = document.getElementById("status-msg");
    const strengthBadge = document.getElementById("strength-badge");

    const optLowercase = document.getElementById("opt-lowercase");
    const optUppercase = document.getElementById("opt-uppercase");
    const optNumbers = document.getElementById("opt-numbers");
    const optSymbols = document.getElementById("opt-symbols");
    const optExcludeSimilar = document.getElementById("opt-exclude-similar");
    const optAvoidAmbiguous = document.getElementById("opt-avoid-ambiguous");

    const charset = {
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        numbers: "0123456789",
        symbols: "!@#$%^&*()-_=+[]{}:;,.?",
    };

    const similarChars = /[0O1lI]/g;
    const ambiguousChars = /[|{}[\]\\/]/g;

    function syncLength(value) {
        lengthRange.value = value;
        lengthNumber.value = value;
        lengthValue.textContent = value;
    }

    function randomInt(max) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
    }

    function shuffleString(str) {
        const arr = str.split("");
        for (let i = arr.length - 1; i > 0; i -= 1) {
            const j = randomInt(i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join("");
    }

    function getSelectedPools() {
        let pools = [];
        if (optLowercase.checked) pools.push(charset.lowercase);
        if (optUppercase.checked) pools.push(charset.uppercase);
        if (optNumbers.checked) pools.push(charset.numbers);
        if (optSymbols.checked) pools.push(charset.symbols);

        if (pools.length === 0) {
            pools = [charset.lowercase, charset.uppercase, charset.numbers];
        }

        let allChars = pools.join("");
        if (optExcludeSimilar.checked) allChars = allChars.replace(similarChars, "");
        if (optAvoidAmbiguous.checked) allChars = allChars.replace(ambiguousChars, "");

        const cleanedPools = pools
            .map((pool) => {
                let next = pool;
                if (optExcludeSimilar.checked) next = next.replace(similarChars, "");
                if (optAvoidAmbiguous.checked) next = next.replace(ambiguousChars, "");
                return next;
            })
            .filter((pool) => pool.length > 0);

        return { pools: cleanedPools, allChars };
    }

    function generatePassword(totalLength, specificString) {
        const { pools, allChars } = getSelectedPools();
        if (!allChars) {
            return { password: "", error: "No characters available with current settings." };
        }

        const baseLength = totalLength - (specificString ? specificString.length : 0);
        const required = pools.map((pool) => pool.charAt(randomInt(pool.length)));
        const remainingLength = baseLength - required.length;
        if (remainingLength < 0) {
            return { password: "", error: "Length too short for selected options." };
        }

        let password = required.join("");
        for (let i = 0; i < remainingLength; i += 1) {
            password += allChars.charAt(randomInt(allChars.length));
        }

        if (specificString) {
            const insertAt = randomInt(password.length + 1);
            password = password.slice(0, insertAt) + specificString + password.slice(insertAt);
        }

        return { password: shuffleString(password), error: "" };
    }

    function estimateStrength(password) {
        const length = password.length;
        if (!length) return { label: "—", className: "" };

        let poolSize = 0;
        if (/[a-z]/.test(password)) poolSize += 26;
        if (/[A-Z]/.test(password)) poolSize += 26;
        if (/[0-9]/.test(password)) poolSize += 10;
        if (/[^a-zA-Z0-9]/.test(password)) poolSize += 20;

        const entropy = Math.log2(Math.pow(poolSize, length));
        if (entropy < 40) return { label: "Weak", className: "weak" };
        if (entropy < 60) return { label: "Good", className: "good" };
        if (entropy < 80) return { label: "Strong", className: "strong" };
        return { label: "Very Strong", className: "very-strong" };
    }

    function updateStrength(password) {
        const strength = estimateStrength(password);
        strengthBadge.textContent = `Strength: ${strength.label}`;
        strengthBadge.className = `badge ${strength.className}`.trim();
    }

    function showStatus(message, isError) {
        statusMsg.textContent = message;
        statusMsg.style.color = isError ? "#dc2626" : "#475569";
    }

    function displayPassword(password) {
        passwordDisplay.textContent = password;
        copyBtn.classList.toggle("d-none", !password);
        updateStrength(password);
    }

    function generateAndDisplay() {
        const length = Number(lengthRange.value || 12);
        const specificString = specificInput.value.trim();
        if (specificString.length > length) {
            displayPassword("");
            showStatus("Specific string is longer than total length.", true);
            return;
        }

        const { password, error } = generatePassword(length, specificString);
        if (error) {
            displayPassword("");
            showStatus(error, true);
            return;
        }

        displayPassword(password);
        showStatus("Password ready.", false);
    }

    function surpriseMe() {
        const length = 12 + randomInt(17);
        syncLength(length);
        optLowercase.checked = true;
        optUppercase.checked = true;
        optNumbers.checked = true;
        optSymbols.checked = randomInt(2) === 1;
        optExcludeSimilar.checked = randomInt(2) === 1;
        optAvoidAmbiguous.checked = randomInt(2) === 1;
        specificInput.value = "";
        generateAndDisplay();
    }

    async function copyPasswordToClipboard(password) {
        try {
            await navigator.clipboard.writeText(password);
            showStatus("Copied to clipboard!", false);
        } catch (error) {
            showStatus("Copy failed. Try again.", true);
        }
    }

    lengthRange.addEventListener("input", (event) => {
        syncLength(event.target.value);
    });

    lengthNumber.addEventListener("input", (event) => {
        const value = Math.min(64, Math.max(6, Number(event.target.value || 12)));
        syncLength(value);
    });

    document.getElementById("generate-btn").addEventListener("click", generateAndDisplay);
    document.getElementById("surprise-btn").addEventListener("click", surpriseMe);

    copyBtn.addEventListener("click", function () {
        const password = passwordDisplay.textContent;
        if (password) {
            copyPasswordToClipboard(password);
        }
    });

    syncLength(lengthRange.value);
    generateAndDisplay();
});
