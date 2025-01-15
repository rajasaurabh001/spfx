import * as React from 'react';
import styles from './Stockticker.module.scss';
import type { IStocktickerProps } from './IStocktickerProps';
//import { escape } from '@microsoft/sp-lodash-subset';

interface StockData {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Interval': string;
    '5. Output Size': string;
    '6. Time Zone': string;
  };
  'Time Series (5min)': {
    [key: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

export interface StocktickerState {
  data: any;
  stockjson: StockData | null;
}

export default class Stockticker extends React.Component<IStocktickerProps, StocktickerState> {
  constructor(props: IStocktickerProps) {
    super(props);

    // Properly initialize state
    this.state = {
      data: [],
      stockjson: null,
    };
  }

  componentDidMount(): void {
    this.fetchStockPrice();
  }

  private fetchStockPrice = async () => {
    const url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=demo";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      this.setState({ stockjson: json });
      console.log(json);
    } catch (error) {
      console.error(error.message);
    }
  };

  public render(): React.ReactElement<IStocktickerProps> {
    const { hasTeamsContext, //userDisplayName 
  } = this.props;
    const { stockjson } = this.state;

    let firstOpen: string | null = null;
    let lastClose: string | null = null;

    if (stockjson && stockjson['Time Series (5min)']) {
      const timeSeries = stockjson['Time Series (5min)'];
      const timestamps = Object.keys(timeSeries).sort(); // Sort timestamps in ascending order

      if (timestamps.length > 0) {
        const firstTimestamp = timestamps[0]; // First entry
        const lastTimestamp = timestamps[timestamps.length - 1]; // Last entry

        firstOpen = timeSeries[firstTimestamp]['1. open'];
        lastClose = timeSeries[lastTimestamp]['4. close'];
      }
    }

    return (
      <section className={`${styles.stockticker} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          <h2 className={styles.stocktickerHeadr}>
            {stockjson?.['Meta Data']?.['2. Symbol'] || 'Loading...'}
          </h2>
          <div className={styles.flexContainer}>
            <span className={styles.price}><b>Open :</b> $ {firstOpen || 'N/A'}</span>
            <span className={styles.price}><b>Close :</b> $ {lastClose || 'N/A'}</span>
          </div>
          <div className={styles.flexContainer}> 
            <span className={styles.price}><b>Time Zone : </b>{stockjson?.['Meta Data']?.['6. Time Zone']  || 'N/A'}</span>
          </div>
          <div className={styles.flexContainer}>
            <span className={styles.price}><b>Last Refreshed At : </b>{stockjson?.['Meta Data']?.['3. Last Refreshed']  || 'N/A'}</span>
          </div> 
        </div>
      </section>
    );
  }
}
