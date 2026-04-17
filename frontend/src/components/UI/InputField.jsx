import React from 'react';

const InputField = ({
    type = 'text',
    placeholder,
    value,
    onChange,
    label,
    subtitle,
    error,
    required = false,
    className = '',
    ...props
}) => {
    const baseClasses = 'peer w-full px-3 py-0 rounded-lg bg-transparent focus:outline-none transition-colors';
    const classes = `${baseClasses} ${className}`;

    return React.createElement(
        'div',
        { className: "relative" },
        React.createElement('input', {
            type: type,
            placeholder: " ",
            'aria-label': placeholder || label,
            value: value,
            onChange: onChange,
            className: classes,
            ...props
        }),
        label && React.createElement(
            'label',
            { 
                className: `absolute left-3 top-3 pointer-events-none text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-teal-600 ${required ? '' : ''}` 
            },
            label,
            required && React.createElement('span', { className: "text-red-500 ml-1" }, '*')
        ),
        subtitle && React.createElement(
            'p',
            { className: "absolute left-3 top-7 pointer-events-none text-gray-400 text-xs" },
            subtitle
        ),
        error && React.createElement(
            'p',
            { className: "text-sm text-red-600 mt-1" },
            error
        )
    );
};

export default InputField;
