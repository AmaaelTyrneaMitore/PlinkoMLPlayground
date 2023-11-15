/**
 * Stores each observation in this application
 * Observations include drop position, bounciness, size and bucket label
 */
const observations = [];
// Prediction point
const predictionPoint = 300;
// Number of k-Nearest records
const k = 3;

/**
 * Callback when a ball enters the bucket.
 * Updates observations with new ball drop data.
 */
const onScoreUpdate = (dropPosition, bounciness, size, bucketLabel) => {
  observations.push([dropPosition, bounciness, size, bucketLabel]);
};

/**
 * Analyze function to predict the bucket using k-Nearest Neighbours
 */
const runAnalysis = () => {
  const predictedBucket = knn(observations);
  console.log(`Based on our analysis, your ball is likely to land in Bucket #${predictedBucket}`);
};

/**
 * Fully generalized k-Nearest Neighbours function
 */
const knn = (data) => {
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
 * Helper function to calculate the distance from the drop point to the prediction point
 */
const calculateDistance = (dropPosition) => Math.abs(dropPosition - predictionPoint);
