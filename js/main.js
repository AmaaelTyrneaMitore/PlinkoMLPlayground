/**
 * Callback when a ball enters the bucket.
 * Updates observations with new ball drop data.
 * @param dropPosition {number} Position from where the ball dropped
 * @param bounciness {number} Bounciness factor of the ball
 * @param size {number} Size of the ball
 * @param bucketLabel {number} Bucket in which the ball fell into
 */
const onScoreUpdate = (dropPosition, bounciness, size, bucketLabel) => {
  console.log(dropPosition, bounciness, size, bucketLabel);
};

/**
 * Analyze function that will run whenever the "Run Analysis!" button is clicked
 */
const runAnalysis = () => {
  console.log('Hello');
};
