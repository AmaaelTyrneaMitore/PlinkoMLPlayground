/**
 * Stores each observation in this application
 * Observations include drop position, bounciness, size and bucket label
 */
const observations = [];
// Number of k-Nearest records
const k = 3;

/**
 * Callback when a ball enters the bucket.
 * Updates observations with new ball drop data.
 */
const onScoreUpdate = (dropPosition, bounciness, size, bucketLabel) => {
  observations.push([dropPosition, bounciness, size, bucketLabel]);
};

// Analyze function to predict the bucket using k-Nearest Neighbours
const runAnalysis = () => {
  // Define the size of the test set
  const testSetSize = 100;

  // Split the dataset into training and test sets
  const [testSet, trainingSet] = splitDataset(observations, testSetSize);

  // Calculate accuracy by comparing predicted buckets with actual buckets in test set
  const accuracy = calculateAccuracy(testSet, trainingSet);
  console.log(`Accuracy: ${accuracy}`);
};

// Fully generalized k-Nearest Neighbours function
const knn = (data, predictionPoint) => {
  return (
    _.chain(data)
      // Calculate the distance and associate it with the bucket label
      .map((observation) => [calculateDistance(observation[0], predictionPoint), observation[3]])
      // Sort by distance and take the top k records
      .sortBy((observation) => observation[0])
      .slice(0, k)
      // Count the occurrences of each bucket label in the top k records
      .countBy((observation) => observation[1])
      // Convert to pairs, sort by occurrences, and get the most common bucket label
      .toPairs()
      .sortBy((observation) => observation[1])
      .last()
      .first()
      .parseInt()
      .value()
  );
};

// Helper function to calculate the distance from the drop point to the prediction point
const calculateDistance = (dropPosition, predictionPoint) =>
  Math.abs(dropPosition - predictionPoint);

// Helper function to split dataset into training and test sets
const splitDataset = (data, testCount) => {
  const shuffled = _.shuffle(data);
  const testSet = _.slice(shuffled, 0, testCount);
  const trainingSet = _.slice(shuffled, testCount);
  return [testSet, trainingSet];
};

// Helper function to calculate the accuracy of the k-Nearest Neighbours algorithm
const calculateAccuracy = (testSet, trainingSet) => {
  return _.chain(testSet)
    .filter((testObservation) => knn(trainingSet, testObservation[0]) === testObservation[3])
    .size()
    .divide(testSet.length)
    .value();
};
