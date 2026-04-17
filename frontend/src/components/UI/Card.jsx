import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'medium',
  shadow = 'medium',
  rounded = 'medium',
  ...props
}) => {
  const baseClasses = 'bg-white border border-gray-200';

  const paddingClasses = {
    none: '',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6',
  };

  const shadowClasses = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
  };

  const roundedClasses = {
    none: '',
    small: 'rounded-sm',
    medium: 'rounded-lg',
    large: 'rounded-xl',
  };

  const classes = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${roundedClasses[rounded]} ${className}`;

  return React.createElement(
    'div',
    { className: classes, ...props },
    children
  );
};

export default Card;
