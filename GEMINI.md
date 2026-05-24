# Nutrition AI Project

This project is a comprehensive data repository designed to support the development of an AI-powered nutrition and recipe application. It aggregates various datasets covering nutritional values, allergen information, and recipe details to facilitate safe and healthy dietary planning.

## Project Overview

The core of the project lies in cross-referencing food items with their nutritional profiles and allergen risks. The inclusion of flowcharts suggests a planned application that leverages this data to provide personalized food recommendations.

### Main Components

*   **Datasets:** A collection of CSV files categorized into allergens, nutrition, and recipes.
*   **Flowcharts:** Visual representations of the AI logic and application architecture.

## Directory Structure & Key Files

### `/datasets`
*   **`allergen/`**: Contains `FoodData.csv`, mapping specific food items to known allergies (e.g., Nut Allergy, Gluten Allergy).
*   **`nutrition/`**: Detailed nutritional data (Calories, Fat, Carbs, Protein, Fiber) split into five major groups. Includes metadata and analysis summaries.
*   **`recipe/`**: A large database of recipes (`recipes.csv`) with ingredients, cooking directions, and nutritional summaries.
    *   *Note: `housing.csv` appears to be an outlier (Boston Housing dataset) likely used for testing or unrelated to the primary project goal.*
*   **`recipe2/` & `recipe3/`**: Additional recipe sources and mappings, including image name mappings for potential visual features.

### Root Files
*   **`flowchart ai.jpeg`**: Illustrates the AI logic flow.
*   **`flowchart aplikasi.jpeg`**: Outlines the general application structure and user flow.

## Usage

As this is currently a data-centric project without source code, it serves as a foundation for:
1.  **Data Analysis**: Loading CSVs into Python (Pandas) or R for exploratory data analysis (EDA).
2.  **Machine Learning**: Training models for recipe recommendation, nutritional prediction, or allergen detection.
3.  **Application Development**: Serving as the backend database for a nutrition-tracking mobile or web app.

## Development Notes

*   **Data Integrity**: Some metadata files in `datasets/nutrition/` contain absolute file paths (e.g., `/Users/utsavdey/...`) that may not be valid in your local environment.
*   **Expansion**: Future development should include scripts for data cleaning, merging the different recipe sources, and implementing the logic defined in the flowcharts.
