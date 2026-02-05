import React, { useState, useEffect } from 'react';

const CurrencyInput = ({ value, onChange, name, placeholder, className, required }) => {
    // Format initial value
    const formatValue = (val) => {
        if (val === '' || val === undefined || val === null) return '';
        const number = parseFloat(val);
        if (isNaN(number)) return '';
        return `$ ${number.toLocaleString('en-US')}`;
    };

    const [displayValue, setDisplayValue] = useState(formatValue(value));

    useEffect(() => {
        setDisplayValue(formatValue(value));
    }, [value]);

    const handleChange = (e) => {
        const inputValue = e.target.value;

        // Allow ONLY numbers
        const numbersOnly = inputValue.replace(/[^0-9]/g, '');

        // If empty, reset
        if (numbersOnly === '') {
            setDisplayValue('');
            onChange({ target: { name, value: '' } });
            return;
        }

        const number = parseFloat(numbersOnly);

        // Visual update
        setDisplayValue(`$ ${number.toLocaleString('en-US')}`);

        // Parent update (send raw number)
        onChange({ target: { name, value: number } });
    };

    return (
        <input
            type="text"
            name={name}
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            required={required}
            autoComplete="off"
        />
    );
};

export default CurrencyInput;
