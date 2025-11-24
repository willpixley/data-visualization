import pandas as pd
import yfinance as yf

## Used to generate the price history plot on the "Why" page

df = pd.read_csv("./jul14.csv")
tickers = df["stock_ticker"].unique()  # get all tickers


date_range = pd.date_range(start="2025-07-14", end="2025-11-21")


data = yf.download(list(tickers), start="2025-07-14", end="2025-11-21")["Close"]


data.reset_index(inplace=True)
data.rename(columns={"Date": "Date"}, inplace=True)


for t in tickers:
    if t not in data.columns:
        data[t] = pd.NA

data = data[["Date"] + list(tickers)]


data.to_csv("price_history.csv", index=False)
