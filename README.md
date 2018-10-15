# Precision, Recall, F1 Score Visual Demo

This webapp lets you visually compare and play with the statistical metrics used in machine learning.

You can move the squares around and resize them to see how they affect the metrics.

[Check it out at the github page](https://ubershmekel.github.io/precision-recall-f1/)

## Things to try out

* Resize the black "All samples" and notice that only `specificity` changes.
* Try to get a perfect F1 score
* Try to get 0.99 specificity with all other metrics nearly zero.
* Try to get 0.99 recall/sensitivity when specificity is nearly zero.
* Try to get 0.99 precision and specificity when recall is nearly zero.
* How would you qualitatively describe the classifier in the above scenarios?

## Screenshot

![Visual stats metrics for machine learning](images/screenshot.png?raw=true "Visual stats metrics like precision, recall, F1 score")


## References

* https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient
* https://en.wikipedia.org/wiki/Precision_and_recall
* https://uberpython.wordpress.com/2012/01/01/precision-recall-sensitivity-and-specificity/
* http://interactjs.io/