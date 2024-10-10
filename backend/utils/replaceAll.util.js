/**
 * Replaces all occurrences of words in a sentence with new words.
 * @function
 * @param {string} sentence - The sentence to modify.
 * @param {Object} wordsToReplace - An object containing words to be replaced as the keys and their replacements as the values.
 * @returns {string} - The modified sentence.
 */
const replaceAll = (sentence, wordsToReplace) => {
  return Object.keys(wordsToReplace).reduce(
    (f, s, i) => `${f}`.replace(new RegExp(s, "ig"), wordsToReplace[s]),
    sentence
  );
}

export default replaceAll;

