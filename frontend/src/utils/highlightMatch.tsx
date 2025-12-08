import React from 'react';

export const highlightMatch = (
  text: string | number | undefined,
  searchTerm: string,
  activeField?: string,
  sortKey?: string
): React.ReactNode => {
  if (
    !text ||
    !searchTerm ||
    (activeField !== 'all' && activeField !== sortKey)
  ) {
    return text?.toString() || '';
  }

  const textStr = text.toString();
  const searchTermLower = searchTerm.toLowerCase();
  const textLower = textStr.toLowerCase();

  if (!textLower.includes(searchTermLower)) {
    return textStr;
  }

  const startIndex = textLower.indexOf(searchTermLower);
  const endIndex = startIndex + searchTermLower.length;

  return (
    <>
      {textStr.slice(0, startIndex)}
      <span className='bg-metropolia-support-yellow text-metropolia-main-grey font-medium px-1 rounded'>
        {textStr.slice(startIndex, endIndex)}
      </span>
      {textStr.slice(endIndex)}
    </>
  );
};
