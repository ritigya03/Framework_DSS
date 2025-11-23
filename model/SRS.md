# SRS - Student Score Prediction

## Functional Requirements

FR1: System shall train a Linear Regression model on student_scores.csv
FR2: System shall evaluate model accuracy using MSE
FR3: System shall generate a confusion matrix by converting scores to Pass/Fail
FR4: System shall log predictions to predictions_log.txt
FR5: System shall generate a validation report comparing actual vs predicted.

## Non-Functional Requirements

NFR1: Python 3.10+
NFR2: Model training < 5 seconds
