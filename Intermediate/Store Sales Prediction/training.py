import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import io

def perform_sales_analysis():
    """
    Main function to run the complete sales and profit analysis.
    It loads a user-provided dataset, performs analysis, and creates visualizations.
    """
    
    # --- 1. Data Loading ---
    # Ask the user for their data file path
    file_path = input("Please enter the path to your sales data file (e.g., your_sales_data.csv): ")
    
    try:
        # Attempt to load the dataset
        if file_path.endswith('.csv'):
            try:
                # First, try default UTF-8
                df = pd.read_csv(file_path)
            except UnicodeDecodeError:
                # If UTF-8 fails, try 'latin1' (or 'iso-8859-1')
                print("UTF-8 decoding failed, trying 'latin1' encoding...")
                df = pd.read_csv(file_path, encoding='latin1')
        elif file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path)
        else:
            print(f"Error: Unsupported file type for '{file_path}'. Please provide a .csv or .xlsx file.")
            return
        
        print(f"Successfully loaded data from {file_path}.\n")
        
    except FileNotFoundError:
        print(f"Error: The file was not found at '{file_path}'.")
        print("Please check the path and try again.")
        return
    except Exception as e:
        print(f"Error loading data: {e}")
        return

    # --- 2. Data Validation ---
    # Check if all required columns exist
    required_columns = ['OrderDate', 'Sales', 'Profit', 'Category', 'Sub-Category', 'Discount']
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        print(f"Error: Your dataset is missing the following required columns: {missing_columns}")
        print(f"Please ensure your file has the exact column names: {required_columns}")
        print("The script cannot proceed without these columns.")
        return
        
    print("Dataset contains all required columns.\n")


    # --- 3. Data Exploration (EDA) ---
    print("--- Data Exploration ---")
    print("First 5 rows of the data:")
    print(df.head())
    print("\nData Information (Types, Nulls):")
    df.info()
    print("\nSummary Statistics:")
    print(df.describe())
    print("--------------------------\n")

    # --- 4. Data Cleaning & Preparation ---
    # Convert OrderDate to datetime objects for time series analysis
    try:
        # Try to automatically infer the format, which is more flexible
        # This will handle various formats like '4/15/2017', '2017-04-15', etc.
        df['OrderDate'] = pd.to_datetime(df['OrderDate'], format='mixed')
    except Exception as e:
        print(f"Error converting OrderDate: {e}")
        # Add a helpful hint based on the error
        if "doesn't match format" in str(e) or "time data" in str(e):
            print("\nHint: Your 'OrderDate' column may have multiple formats or a format pandas can't guess.")
            print("If this error persists, you may need to manually inspect your file and specify a format,")
            print("e.g., add `format='%m/%d/%Y'` to the pd.to_datetime() call if your dates are all like '4/15/2017'.")
        return

    # --- 5. Core Analysis & Visualization ---
    print("--- Starting Analysis & Visualization ---")

    # Analysis 1: Total Sales and Profit
    total_sales = df['Sales'].sum()
    total_profit = df['Profit'].sum()
    profit_margin = (total_profit / total_sales) * 100

    print(f"\nTotal Sales: ${total_sales:,.2f}")
    print(f"Total Profit: ${total_profit:,.2f}")
    print(f"Overall Profit Margin: {profit_margin:.2f}%")

    # Analysis 2: Sales and Profit Over Time (Monthly)
    print("\nGenerating Sales & Profit Over Time plot...")
    df_time = df.set_index('OrderDate')
    # Resample by month ('M' or 'ME' for month-end)
    monthly_sales = df_time['Sales'].resample('ME').sum()
    monthly_profit = df_time['Profit'].resample('ME').sum()

    plt.figure(figsize=(14, 7))
    plt.plot(monthly_sales.index, monthly_sales, label='Sales', color='blue', marker='o')
    plt.plot(monthly_profit.index, monthly_profit, label='Profit', color='green', marker='x')
    plt.title('Monthly Sales and Profit Over Time')
    plt.xlabel('Month')
    plt.ylabel('Amount ($)')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.tight_layout()
    # In a script, you would use plt.show() or plt.savefig()
    # plt.show()
    print("Time series plot created (plt.show() commented out).")


    # Analysis 3: Performance by Category
    print("\nGenerating Performance by Category plot...")
    # Group by Category and sum up Sales and Profit
    category_performance = df.groupby('Category')[['Sales', 'Profit']].sum().sort_values(by='Sales', ascending=False)
    
    print("\nPerformance by Category:")
    print(category_performance)

    # Capture the axis object returned by the plot command
    ax = category_performance.plot(kind='bar', figsize=(10, 6), secondary_y='Profit', rot=0)
    
    plt.title('Total Sales and Profit by Category')
    plt.xlabel('Category')
    # Set label for the primary y-axis (Sales) using the returned 'ax'
    ax.set_ylabel('Total Sales ($)')
    # Set label for the secondary y-axis (Profit) using 'ax.right_ax'
    ax.right_ax.set_ylabel('Total Profit ($)')
    plt.tight_layout()
    # plt.show()

    # Analysis 4: Performance by Sub-Category (Top 10)
    print("\nGenerating Performance by Sub-Category (Top 10 Sales) plot...")
    subcat_performance = df.groupby('Sub-Category')[['Sales', 'Profit']].sum()
    
    # Top 10 by Sales
    top_10_sales_subcat = subcat_performance.sort_values(by='Sales', ascending=False).head(10)
    print("\nTop 10 Sub-Categories by Sales:")
    print(top_10_sales_subcat)
    
    top_10_sales_subcat.plot(kind='bar', figsize=(12, 7), title='Top 10 Sub-Categories by Sales & Profit')
    plt.ylabel('Amount ($)')
    plt.xlabel('Sub-Category')
    plt.tight_layout()
    # plt.show()

    # Bottom 10 by Profit
    print("\nGenerating Bottom 10 Sub-Categories by Profit plot...")
    bottom_10_profit_subcat = subcat_performance.sort_values(by='Profit', ascending=True).head(10)
    print("\nBottom 10 Sub-Categories by Profit (Potential Loss-makers):")
    print(bottom_10_profit_subcat)

    plt.figure(figsize=(12, 7))
    sns.barplot(x=bottom_10_profit_subcat.index, y=bottom_10_profit_subcat['Profit'], palette='Reds_r')
    plt.title('Bottom 10 Sub-Categories by Profit')
    plt.ylabel('Total Profit ($)')
    plt.xlabel('Sub-Category')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    # plt.show()


    # Analysis 5: Impact of Discount on Profit
    print("\nGenerating Discount vs. Profit scatter plot...")
    plt.figure(figsize=(10, 6))
    # Use a sample to avoid overplotting if the dataset is large
    sample_df = df.sample(min(1000, len(df)))
    
    sns.scatterplot(data=sample_df, x='Discount', y='Profit', hue='Category', alpha=0.7)
    plt.title('Profit vs. Discount')
    plt.xlabel('Discount')
    plt.ylabel('Profit')
    plt.axhline(0, color='red', linestyle='--', label='No Profit')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.4)
    plt.tight_layout()
    # plt.show()
    
    print("\n--- Analysis Complete ---")
    print("Actionable Insights:")
    print("1. Review the 'Monthly Sales and Profit' plot for seasonality or trends.")
    print("2. Check 'Performance by Category' to see which categories drive the most revenue vs. profit.")
    print("3. Examine 'Bottom 10 Sub-Categories by Profit' to identify products that may need repricing, cost reduction, or discontinuation.")
    print("4. Use the 'Profit vs. Discount' plot to see if high discounts are negatively impacting profitability, especially for specific categories.")


def create_mock_data(num_rows=1000):
    """
    Generates a mock DataFrame simulating superstore sales data.
    """
    np.random.seed(42)
    
    # Define categories and sub-categories
    categories = {
        'Technology': ['Phones', 'Accessories', 'Machines', 'Copiers'],
        'Furniture': ['Chairs', 'Tables', 'Bookcases', 'Furnishings'],
        'Office Supplies': ['Storage', 'Binders', 'Appliances', 'Paper', 'Envelopes', 'Art', 'Labels', 'Fasteners', 'Supplies']
    }
    
    # Create the DataFrame structure
    data = {
        'OrderID': [f'CA-2023-{10000 + i}' for i in range(num_rows)],
        'OrderDate': pd.to_datetime(np.random.choice(pd.date_range('2022-01-01', '2023-12-31'), num_rows)),
        'Category': np.random.choice(['Technology', 'Furniture', 'Office Supplies'], num_rows, p=[0.2, 0.3, 0.5]),
        'Quantity': np.random.randint(1, 10, num_rows),
        'Discount': np.random.choice([0.0, 0.1, 0.15, 0.2, 0.3, 0.5], num_rows, p=[0.4, 0.1, 0.1, 0.2, 0.1, 0.1]),
    }
    
    df = pd.DataFrame(data)
    
    # Add Sub-Category based on Category
    df['Sub-Category'] = df['Category'].apply(lambda x: np.random.choice(categories[x]))
    
    # Generate realistic Sales and Profit
    # Base price per item
    base_price = np.random.gamma(30, 25, num_rows)
    
    # Calculate Sales
    df['Sales'] = (base_price * df['Quantity']) * (1 - df['Discount'])
    
    # Calculate Profit (Profit margin varies, and high discounts can lead to losses)
    # Base cost is some percentage of base price
    cost_percentage = np.random.normal(0.6, 0.1, num_rows) # Avg 60% cost
    total_cost = (base_price * cost_percentage) * df['Quantity']
    
    df['Profit'] = df['Sales'] - total_cost
    
    # Clean up negatives to be more realistic (e.g., round to 2 decimal places)
    df['Sales'] = df['Sales'].round(2)
    df['Profit'] = df['Profit'].round(2)
    
    return df

# --- Main execution ---
if __name__ == "__main__":
    # Set plot style
    sns.set_style("whitegrid")
    plt.rcParams['figure.dpi'] = 100
    
    perform_sales_analysis()
    
    print("\nTo run this script, save it as a .py file (e.g., analysis.py) and run 'python analysis.py' in your terminal.")
    print("Make sure you have pandas, numpy, matplotlib, seaborn, and openpyxl installed: pip install pandas numpy matplotlib seaborn openpyxl")
    
    # This final plt.show() will display all plots created if running interactively.
    # In a script, you might save them to files instead using plt.savefig('filename.png')
    print("\nDisplaying plots (if in an interactive environment)...")
    plt.show()




