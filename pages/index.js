import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import R from '../public/R.jpeg'

const Home = ({ initialResults, initialSearchTerm }) => {
  const router = useRouter()
  const [movers, setMovers] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "")

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim().length >= 2) {
      router.push(`/?index_iamdrishtiii=${encodeURIComponent(searchTerm)}`)
    }
  }

  useEffect(() => {
    fetchMovers();
  }, []);

  const fetchMovers = async () => {
    try {
      const response = await fetch('https://portal.tradebrains.in/api/assignment/index/NIFTY/movers/');
      const data = await response.json();
      setMovers(data);
    } catch (error) {
      console.error('Failed to fetch movers:', error);
    }
  };

  return (
    <>
      <div className="max-h-full min-h-screen" style={{ backgroundImage: "url('/R.jpeg')", backgroundSize: "cover", backgroundPosition: "center", height: "screen" }}>
        <Head>
          <title>Stocks</title>
        </Head>
        <main className='max-w-[960px] mx-0 my-auto sm:px-24 py-12'>
          <h1 className='text-5xl font-bold mb-4 flex justify-center border-b-4 shadow-lg py-2 text-green-300'>Stock Ticker Search</h1>

          <form  className='w-[100%] px-4 sm:px-12 py-3 border text-white font-semibold rounded-full shadow-lg mb-8 flex flex-row'>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search using Symbol or Name (e.g.,RELIANCE)'
              className='w-[100%]'
            />
            <button onClick={handleSearch} className='bg-blue-400 px-2 py-1 rounded-xl'>Search</button>
          </form>

          {initialResults.length > 0 && (
            <ul>
              {initialResults.map((result) => (
                <li key={result.symbol}
                  onClick={() =>
                    router.push(`/stock/${encodeURIComponent(result.symbol)}`).then(() => {
                      setSearchTerm("")
                    })
                  }
                  className="hover:bg-gray-300 cursor-pointer px-2 py-1 bg-white m-1"
                >
                  <strong>{result.symbol}</strong>{" "}
                  <span className='text-gray-600'>{result.name}</span>
                </li>
              ))}
            </ul>
          )}

          {movers && (
            <div className='mt-12'>
              <h2 className='text-white text-lg '>NIFTY Market Movers</h2>

              <div className='flex flex-wrap gap-4'>
                <div className='flex-1 min-w-[250px]'>
                  <h3 className='text-green-300 pb-2'>Top Gainers📈</h3>
                  {movers.gainers.slice(0, 5).map((stock, index) => (
                    <div
                      key={index}
                      onClick={() => router.push(`/stock/${stock.symbol}`)}
                      className='p-2 mb-2 cursor-pointer rounded-lg bg-white'
                    >
                      <strong>{stock.symbol}</strong> - ₹{stock.close}
                      <span className='text-green-600 float-right'>+{stock.percent.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>

                <div className="flex-1 min-w-[250px]">
                  <h3 className='text-red-700 pb-2'>Top Losers📉</h3>
                  {movers.losers.slice(0, 5).map((stock, index) => (
                    <div
                      key={index}
                      onClick={() => router.push(`/stock/${stock.symbol}`)}
                      className='p-2 mb-2 cursor-pointer rounded-lg bg-white'
                    >
                      <strong>{stock.symbol}</strong> - ₹{stock.close}
                      <span className='text-red-600 float-right'>{stock.percent.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </>
  )
}

export default Home

export async function getServerSideProps(context) {
  const searchTerm = context.query.index_iamdrishtiii || "";
  let results = [];

  if (searchTerm.trim().length >= 2) {
    try {
      const response = await fetch(
        `https://portal.tradebrains.in/api/assignment/search?keyword=${encodeURIComponent(
          searchTerm
        )}&length=10`,
        { headers: { Accept: "application/json" } }
      )
      const alldata = await response.json();
      console.log(alldata)
      results = Array.isArray(alldata) ? alldata.map((data) => ({
        symbol: data.symbol || data.SYMBOl || data.ticker || "",
        name: data.name || data.NAME || data.company || data.title || ""
      })).filter((data) => data.symbol) : []
      console.log(results)
    } catch (error) {
      console.log("SSR Fetch error :", error)
    }
  }
  return {
    props: {
      initialResults: results,
      initialsearchTerm: searchTerm,
    }
  }
}