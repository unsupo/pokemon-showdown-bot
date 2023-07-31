export const getRandomWeightedMove = (damageMap, nonDamagingProb=.2) => randomChoiceByWeight(adjustProbabilities(damageMap, -1,.2));
export function randomChoiceByWeight(probabilitiesMap) {
    const keys = Object.keys(probabilitiesMap);
    const values = Object.values(probabilitiesMap);

    // Calculate cumulative probabilities to turn it into a range
    const cumulativeProbabilities = [];
    let cumulativeProbability = 0;
    for (const value of values) {
        cumulativeProbability += value;
        cumulativeProbabilities.push(cumulativeProbability);
    }

    // Generate a random number between 0 and 1
    const randomValue = Math.random();

    // Find the index corresponding to the randomValue in the range
    const chosenIndex = cumulativeProbabilities.findIndex((cp) => randomValue <= cp);

    // Return the key associated with the chosenIndex
    return keys[chosenIndex];
}
export function adjustProbabilities(valuesMap, changeValue=-1, targetProbability=.2) {
    // Calculate the sum of values excluding the changeValue
    const sumWithoutChangeValue = Object.keys(valuesMap).reduce((acc, key) => {
        if (changeValue !== valuesMap[key]) {
            return acc + valuesMap[key];
        }
        return acc;
    }, 0);

    // Calculate the modified sum excluding the changeValue
    const modifiedSumWithoutChangeValue = 1 - targetProbability;

    // Calculate the adjustment factor
    const adjustmentFactor = modifiedSumWithoutChangeValue / sumWithoutChangeValue;

    // Initialize an empty object to store adjusted probabilities
    const adjustedProbabilities = {};

    // Adjust the probabilities for each value in the map
    for (const [key, value] of Object.entries(valuesMap)) {
        if (value === changeValue) {
            adjustedProbabilities[key] = targetProbability;
        } else {
            adjustedProbabilities[key] = value * adjustmentFactor;
        }
    }

    return adjustedProbabilities;
}
export function getRandomValueFromArray(arr) {
    if (arr.length === 0) {
        return undefined; // Return undefined if the array is empty
    }

    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}
