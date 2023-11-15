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

/*
 * Analyze function to find the accuracy of KNN for each specific feature
 * Calculates accuracy for each feature with the optimal k value
 */
const runAnalysis = () => {
  // Define the size of the test set
  const testSetSize = 100;
  // The optimal value of k that I found by comparing accuracy for each value of k
  const k = 10;

  // Iterate over a every feature to find it's accuracy
  _.range(0, 3).forEach((feature) => {
    // Create a dataset for a specific feature
    const data = _.map(observations, (observation) => [observation[feature], _.last(observation)]);
    // Normalize the data using min-max normalization for only 1 feature
    const normalizedData = minMaxNormalization(data, 1);
    // Split the normalized dataset into training and test sets
    const [testSet, trainingSet] = splitDataset(normalizedData, testSetSize);
    // Calculate accuracy for the given feature with the optimal k value
    const accuracy = calculateAccuracy(testSet, trainingSet, k);
    console.log(`Feature: ${feature}\tAccuracy: ${accuracy}`);
  });
};

// Fully generalized k-Nearest Neighbours function
const knn = (data, predictionPoint, k) => {
  return (
    _.chain(data)
      // Calculate the distance and associate it with the bucket label
      .map((observation) => [
        calculateDistance(_.initial(observation), predictionPoint),
        _.last(observation),
      ])
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

// Helper function to normalize/scale the data using the min-max algorithm
const minMaxNormalization = (data, featureCount) => {
  const clonedData = _.cloneDeep(data);

  // Iterate over each feature column to perform min-max normalization
  for (let featureIndex = 0; featureIndex < featureCount; featureIndex++) {
    // Extract the values of a specific feature column
    const column = clonedData.map((observation) => observation[featureIndex]);

    // Calculate the minimum and maximum values of the feature column
    const min = _.min(column);
    const max = _.max(column);

    // Normalize each value in the feature column using min-max scaling formula
    for (let rowIndex = 0; rowIndex < clonedData.length; rowIndex++) {
      clonedData[rowIndex][featureIndex] = (clonedData[rowIndex][featureIndex] - min) / (max - min);
    }
  }

  return clonedData;
};
