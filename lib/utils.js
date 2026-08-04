// Convert statement to INITIALS such as He wants me ==> HWM
// ignore 'of' keyword if and only i the length of word is greater than 3
export const getInitials = (str) => {
  // Split into words, ignoring extra spaces
  const words = str.trim().split(/\s+/);

  const filteredWords = words.filter(word => {
    // If statement has > 3 words AND the word is 'of', remove it
    if (words.length > 3 && word.toLowerCase() === 'of') {
      return false;
    }
    return true;
  });

  return filteredWords.map(word => word[0]).join('').toUpperCase();
}
// Convert statement to first word only such as He wants me ==> He
export const getFirstWord = (str) => {
  const words = str.split(' ');
  return words[0];
}

