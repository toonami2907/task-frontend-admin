export const luhnCheck = (cardNumber) => {
    let sum = 0;
    let isEven = false;
    
    // Step 1: Loop from right to left
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i]);
        
        // Step 2: Double every second digit
        if (isEven) {
            digit *= 2;
            // Step 3: If doubling results in a number > 9, subtract 9
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        // Step 4: Add all digits together
        sum += digit;
        isEven = !isEven;
    }
    
    // Step 5: Check if total sum is divisible by 10
    return sum % 10 === 0;
};

export const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
        return parts.join(' ');
    } else {
        return value;
    }
};

// Expiry date formatter
export const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
        return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
};