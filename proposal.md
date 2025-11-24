# Proposal

## Summary

I'm creating a tool to help analyze congressional stock trades and track the potential correlation between committee membership and investments (particularly stock trades). I'll use real investment data to look for overlaps and conflicts of interest. All of this data is publicly available, but very hard to make sense of, making it a good candidate for visualization.

## Motivation

As a politically active U.S. citizen, I believe it is our duty to scrutinize our representatives to make sure they're acting in the best interests of their constituents, not themselves. This means we need to not only analyze their votes, speeches, and bills, but their financial decisions as well. Money has always played an important role in politics, but has also sat in a legal and ethical gray area. It's been an open secret that some members of Congress outperform professional portfolio managers, but it's difficult to discern exactly what the difference-maker is. Is it privileged knowledge gathered from the congressional committees they belong to? Is it a better sense of how the market is doing? My project aims to find out what information members of congress are using to inform their financial decisions and which legislators are the biggest offenders.

Currently, financial disclosures are released as lengthy, unstandardized PDFs on government websites. It makes investigation of individual trades simple, but makes it very difficult to analyze trades on a larger scale. I want my visualizations to make this large-scale analysis much easier so we can better understand the interaction between Congress and the stock market.

## Contributions

-   Tool will enable better analysis of congressional stock trades
-   Tool can inform personal investment strategy
-   Tool can detect potential unethical activity

# Data

## Sources

Data comes from a variety of sources to paint a full picture of the investments. Some of the data is already stored in a Postgres database I created for a personal project, so I will be cleaning and combining it for easier consumption.

**Financial Data**

-   [Capitol Trades](https://www.capitoltrades.com/)
    -   Data on the trades themselves (asset, amount, member of Congress, date, etc.)
    -   Collected using a basic web scraper
-   [Nasdaq](https://www.nasdaq.com/market-activity/stocks/screener)
    -   Stocks, their symbols, and technical sectors
    -   Available for download in CSV
-   YFinance Python API
    -   Allows for easy download and collection of historical stock data

**Congressional Data**

-   [Official Congress API](https://gpo.congress.gov/)
    -   Used to collect information about each member of congress and committee
    -   Free API key
-   Official Congressional Website
    -   Used for supplemental data like committee information, manually entered

## Dataset Description

The data is scraped from sources described above. All trade data was originally in a Postgres DB I personally created and managed, so to collect the data I performed some joins across several different tables to get all relevant info for each trade. There are 3,634 rows showing trades since Jan. 3, 2023. I performed all cleaning as the data was collected, including dropping trades where members of Congress were buying/selling ETFs or Index Funds.

Columns:

-   trade_id: A unique ID for each trade
-   trade_date: Date trade occurred
-   action: Buy or Sell (b or s)
-   amount: Rough dollar amount of asset bought/sold. Only a range is provided by the reporting documentation, so I take the center of the range to get a number
-   flagged: A trade is described as "flagged" if the sector of the traded stock matches a committee the member is in. For example, a member of the House Armed Services Committee buying Lockheed Martin stock (Defense contractor) would be flagged.
-   price_at_trade: The price per share of the stock when the trade occurred
-   current_price: The current price when the data was collected (Nov. 2nd)
-   member_name: The name of the member of Congress trading the stock
-   member_party: The party of the member of Congress
-   member_state: The state they represent
-   member_chamber: The chamber they serve in
-   stock_ticker: The ticker of the stock
-   stock_name: The name of the company
-   sector_code: The GICS Sector code of the company
-   sector_name: The GICS Sector name of the company
-   committee_names: The committees the member of Congress has membership in
