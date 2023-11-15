/**
 * Stores each observation in this application
 * Observations include drop position, bounciness, size and bucket label
 */
const observations = [];

/**
 * Callback when a ball enters the bucket.
 * Updates observations with new ball drop data.
 */
const onScoreUpdate = (dropPosition, bounciness, size, bucketLabel) => {
  observations.push([dropPosition, bounciness, size, bucketLabel]);
};

// Analyze function to find the optimal K value for k-Nearest Neighbours
const runAnalysis = () => {
  // Define the size of the test set
  const testSetSize = 100;

  // Split the dataset into training and test sets
  const [testSet, trainingSet] = splitDataset(observations, testSetSize);

  // Iterate over a range of k values from 1 to 20
  _.range(1, 21).forEach((k) => {
    // Calculate accuracy by comparing predicted buckets with actual buckets in test set for each k value
    const accuracy = calculateAccuracy(testSet, trainingSet, k);
    console.log(`K: ${k}\tAccuracy: ${accuracy}`);
  });
};

// Fully generalized k-Nearest Neighbours function
const knn = (data, predictionPoint, k) => {
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

/**
 * Helper function to calculate the Euclidean distance between two points with an
 * arbitrary number of features using the Pythagorean theorem
 */
const calculateDistance = (pointA, pointB) => {
  return Math.sqrt(
    _.chain(pointA)
      // Zip the arrays to pair up corresponding features
      .zip(pointB)
      // Calculate squared differences for each feature pair
      .map(([a, b]) => (a - b) ** 2)
      // Sum up the squared differences
      .sum()
      .value(),
  );
};

// Helper function to split dataset into training and test sets
const splitDataset = (data, testCount) => {
  // Shuffle the data to ensure randomness
  const shuffled = _.shuffle(data);
  // Split the data into test and training sets
  const testSet = _.slice(shuffled, 0, testCount);
  const trainingSet = _.slice(shuffled, testCount);
  return [testSet, trainingSet];
};

// Helper function to calculate the accuracy of the k-Nearest Neighbours algorithm
const calculateAccuracy = (testSet, trainingSet, k) => {
  return (
    _.chain(testSet)
      // Filter test set records based on the accuracy of the k-Nearest Neighbours prediction
      .filter(
        (testObservation) =>
          knn(trainingSet, _.initial(testObservation), k) === _.last(testObservation),
      )
      // Calculate accuracy as the ratio of correct predictions to the total test set size
      .size()
      .divide(testSet.length)
      .value()
  );
};
