import Head from "next/head";
import { useRouter } from "next/router";
import StockDetail from "../../public/StockDetail.jpeg"

export default function StockDetails({ stockData, symbol }) {
       const router = useRouter();

       if (!stockData || stockData.length === 0) {
              return <div className="p-4">Stock data not found</div>;
       }

       const latestData = stockData[0];

       const renderGraph = () => {
              const prices = stockData.map((item) => parseFloat(item.close));
              const maxPrice = Math.max(...prices);
              const minPrice = Math.min(...prices);
              const priceRange = maxPrice - minPrice || 1;

              return (
                     <div className="mt-8">
                            <h3>Price Chart (Last {prices.length} Data Points)</h3>
                            <svg className="w-[250px] sm:w-[500px] h-[200px] border border-black rounded-xl">
                                   {prices.map((price, index) => {
                                          const x = (index / (prices.length - 1)) * 480 + 10;
                                          const y = 190 - ((price - minPrice) / priceRange) * 180;

                                          return (
                                                 <g key={index}>
                                                        <circle cx={x} cy={y} r="2" fill="#005ca3ff" />
                                                        {index > 0 && (
                                                               <line
                                                                      x1={(index - 1) / (prices.length - 1) * 480 + 10}
                                                                      y1={190 - ((prices[index - 1] - minPrice) / priceRange) * 180}
                                                                      x2={x}
                                                                      y2={y}
                                                                      stroke="#005ca3ff"
                                                                      strokeWidth="2" />)}</g>
                                          );
                                   })}
                            </svg>
                            <div className="text-lg mt-2 sm:flex sm:flex-wrap sm:gap-8">
                                   <p>High: ₹{maxPrice.toFixed(2)}</p> 
                                   <p>Low: ₹{minPrice.toFixed(2)}</p>
                            </div>
                     </div>
              );
       };

       return (
              <div
                     className="max-h-full min-h-screen flex justify-center py-4 sm:py-12" style={{ backgroundImage: "url('/StockDetail.jpeg')", backgroundSize: "cover", backgroundPosition: "center", height: "screen" }}
              >
                     <Head>
                            <title>{symbol} - Stock Details</title>
                            <meta name="description" content={`Stock information for ${symbol}`} />
                            <meta property="og:title" content={`${symbol} Stock Details`} />
                            <meta
                                   property="og:description"
                                   content={`Current price and chart for ${symbol}`}
                            />
                            <meta name="keywords" content={`${symbol}, stock, price, chart`} />
                     </Head>

                     <div className="p-2 sm:p-8 rounded-3xl max-w-[600px] mx-0 my-auto bg-[#005ca3ff]">
                            <button
                                   onClick={() => router.back()}
                                   className="px-2 py-1 mb-5 bg-gray-100 border border-blue-500 rounded-xl cursor-pointer " >
                                   ← Back to Stock
                            </button>

                            <h1 className="text-blue-200 pb-4 text-xl font-bold">{symbol}</h1>

                            <div className="bg-gray-300 p-4 rounded-xl mb-5 text-lg">

                                   <h2 className="text-xl font-semibold border-2 py-1 px-4 mb-2 w-fit rounded-xl">Latest Price Information</h2>
                                   <p>
                                          <strong>Date:</strong> {latestData.date}
                                   </p>
                                   <p>
                                          <strong>Open:</strong> ₹{parseFloat(latestData.open).toFixed(2)}
                                   </p>
                                   <p>
                                          <strong>High:</strong> ₹{parseFloat(latestData.high).toFixed(2)}
                                   </p>
                                   <p>
                                          <strong>Low:</strong> ₹{parseFloat(latestData.low).toFixed(2)}
                                   </p>
                                   <p>
                                          <strong>Close:</strong> ₹{parseFloat(latestData.close).toFixed(2)}
                                   </p>
                                   <p>
                                          <strong>Volume:</strong>{" "}
                                          {parseInt(latestData.volume).toLocaleString()}
                                   </p>
                                   <p>
                                          <strong>Change:</strong> ₹{latestData.change} ({latestData.percent}
                                          %)
                                   </p>
                                   {renderGraph()}
                            </div>
                     </div>
              </div>
       );
}

/**
 * Generate paths for dynamic stock symbols
 */
export async function getStaticPaths() {
       // Example: Pre-render some symbols
       const symbols = ["INFY", "TCS", "RELIANCE"];
       const paths = symbols.map((symbol) => ({
              params: { symbol },
       }));

       return {
              paths,
              fallback: true, // Enable fallback for other symbols
       };
}

/**
 * Fetch stock data for a given symbol at build time
 */
export async function getStaticProps({ params }) {
       const { symbol } = params;

       try {
              const res = await fetch(
                     `https://portal.tradebrains.in/api/assignment/stock/${symbol}/prices?days=30&type=INTRADAY&limit=30`
              );
              const data = await res.json();

              if (!data || !Array.isArray(data)) {
                     return { notFound: true };
              }

              return {
                     props: {
                            stockData: data,
                            symbol,
                     },
                     revalidate: 60, // ISR: revalidate every 60s
              };
       } catch (error) {
              console.error("Error fetching stock data:", error);
              return { notFound: true };
       }
}
