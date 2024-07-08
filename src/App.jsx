import { useEffect, useState } from 'react';
import { winter_2023_cosmetic_case, summer_2023_cosmetic_case } from './ItemData';
import './App.css';

export default function App() {
  const KEY = '64c948a269df94991f0fe2ae';
  const [currentItem, setCurrentItem] = useState("");
  const [currentItemPrice, setCurrentItemPrice] = useState(null);
  const [itemUSD, setItemUSD] = useState(0);
  const [textColor, setTextColor] = useState('#000');
  const [currencyType, setCurrencyType] = useState('Refined');
  const [image, setImage] = useState(null);
  const [profit, setProfit] = useState(0);
  const [display, setDisplay] = useState(false);
  const [inventoryDisplay, setInventoryDisplay] = useState(false);
  const [chanceDisplay, setChanceDisplay] = useState(false);
  const [exchangeDisplay, setExchangeDisplay] = useState(false);
  const [infoDisplay, setInfoDisplay] = useState(false);
  const [inv, setInv] = useState([]);
  const [count, setCount] = useState(0);
  const [totalItemPrice, setTotalItemPrice] = useState(0);
  const [quality, setQuality] = useState(0);
  const [crateList, setCrateList] = useState([]);
  const [shouldFetchPrice, setShouldFetchPrice] = useState(false); 

  const gradeColors = ['#000', '#4b69ff', '#8847ff', '#d32ce6', '#eb4b4b', '#8650AC'];
  const KEY_PRICE = 2.49;

  const getLowestIndexWithData = (prices) => {
    const priceKeys = Object.keys(prices).map(Number);
    const randomIndex = Math.floor(Math.random() * priceKeys.length);
    return priceKeys.length > 0 ? priceKeys[randomIndex] : null;
  }

  setCrateList({winter_2023_cosmetic_case, summer_2023_cosmetic_case});

  useEffect(() => {
    async function fetchItemPrice() {
      if (!shouldFetchPrice) return; 
      try {
        const res = await fetch(`https://backpack.tf/api/IGetPrices/v4?key=${KEY}`);
        if (!res.ok) throw new Error("Error fetching item data");
        const data = await res.json();
        //console.log(data);

        let itemIndex = 0;
        if (quality === 5) {
          console.log(data.response.items[currentItem]?.prices[quality]?.Tradable?.Craftable);
          itemIndex = getLowestIndexWithData(data.response.items[currentItem]?.prices[quality]?.Tradable?.Craftable);
          console.log(itemIndex);
          setTextColor(gradeColors[5]);
        }

        const itemPrice = data.response.items[currentItem]?.prices[quality]?.Tradable?.Craftable[itemIndex]?.value || 0;
        const itemCurrency = data.response.items[currentItem]?.prices[quality]?.Tradable?.Craftable[itemIndex]?.currency || 'metal';

        setCurrencyType(itemCurrency);
        setCurrentItemPrice(itemPrice); 
        const calculatedUSD = itemCurrency === 'metal' ? itemPrice * 0.02 : itemPrice * 1.52;
        setItemUSD(calculatedUSD);

        setTotalItemPrice((t) => t + calculatedUSD);
        setProfit((prevProfit) => prevProfit + (calculatedUSD - KEY_PRICE)); 
      } catch (error) {
        console.log(error.message);
      } finally {
        setShouldFetchPrice(false); 
      }
    }
    fetchItemPrice();
  }, [shouldFetchPrice]); 

  const handleOpen = () => {
    const randomVal = Math.random();

    if (randomVal > 0.99 && randomVal < 1) {
      const unusualItems = winter_2023_cosmetic_case.items.filter(item => item.unusual === 1);
      if (unusualItems.length > 0) {
        const randomUnusualIndex = Math.floor(Math.random() * unusualItems.length);
        const unusualItem = unusualItems[randomUnusualIndex];
        setCurrentItem(unusualItem.name);
        setTextColor(gradeColors[unusualItem.grade]);
        setImage(unusualItem.img);
        setQuality(5); // Set quality to 5 for unusual items
        console.log('unusual');
      }
    } else {
      for (const item of winter_2023_cosmetic_case.items) {
        if (item.cumulative_drop_rate >= randomVal) {
          setCurrentItem(item.name);
          setTextColor(gradeColors[item.grade]);
          setImage(item.img);
          break;
        }
      }

      // 6 - Unique
      // 11 - Strange
      // 5 - Unusual
      // 14 - Collectors
      const strangeChance = Math.floor(Math.random() * 10) + 1;
      setQuality(strangeChance < 2 ? 11 : 6);
    }

    setShouldFetchPrice(true);
  };

  const displayCrateOpening = () => {
    handleOpen();
    setDisplay(true);
  }

  const closeDisplay = () => {
    setDisplay(false);
    setCount((c) => c + 1);
    const newInventoryItem = {
      name: quality === 11 ? `Strange ${currentItem}` : (quality === 5 ? `Unusual ${currentItem}` : currentItem),
      priceRef: currentItemPrice,
      priceUSD: itemUSD,
      currencyType: currencyType,
      image: image,
      textColor: textColor
    }
    setInv((prev) => [...prev, newInventoryItem]);
  }

  const openInventory = () => {
    setInventoryDisplay(!inventoryDisplay);
  }

  const openChanceDisplay = () => {
    setChanceDisplay(!chanceDisplay);
  }

  const openExchangeDisplay = () => {
    setExchangeDisplay(!exchangeDisplay);
  }

  const openInfoDisplay = () => {
    setInfoDisplay(!infoDisplay);
  }

  return (
    <>
      <Heading />
      <SelectCrate handleClick={displayCrateOpening} />
      {display && (
        <OpenCrate
          currentItem={currentItem}
          currentItemPrice={currentItemPrice}
          currencyType={currencyType}
          itemUSD={itemUSD}
          image={image}
          textColor={textColor}
          quality={quality}
          handleClose={closeDisplay}
        />
      )}
      <Stats 
        profit={profit} 
        count={count} 
        keyPrice={KEY_PRICE} 
        totalItemPrice={totalItemPrice} 
        openInventory={openInventory} />
      {inventoryDisplay && <Inventory 
        inv={inv} 
        closeInventory={openInventory} />}
      <InfoButtons 
        setChanceDisplay={setChanceDisplay}
        setExchangeDisplay={setExchangeDisplay}  
        setInfoDisplay={setInfoDisplay}
      />
      {chanceDisplay && <ChanceInfo gradeColors={gradeColors} openChanceDisplay={openChanceDisplay}/>}
      {exchangeDisplay && <ExchangeInfo openExchangeDisplay={openExchangeDisplay}/>}
      {infoDisplay && <MainInfo openInfoDisplay={openInfoDisplay}/>}
    </>
  );
}

function Heading() {
  return (
    <div className="flex flex-col justify-center text-center mt-10">
      <h1 className='text-white font-bold text-3xl'>TF2 Crate Simulator</h1>
      <p className='text-orange-500'>Try Your Luck!</p>
    </div>
  )
}

function SelectCrate({ handleClick }) {
  return (
    <div className='flex flex-col text-white items-center justify-center mt-5'>
      <h1>Winter 2023 Cosmetic Crate</h1>
      <div className="crate-display flex flex-row items-center">
        <i className="fa-solid fa-arrow-left cursor-pointer text-2xl"></i>
        <img src={'https://wiki.teamfortress.com/w/images/f/f5/Backpack_Winter_2023_Cosmetic_Case.png'} alt="cosmetic crate" className='w-40' />
        <i className="fa-solid fa-arrow-right cursor-pointer text-2xl"></i>
      </div>
      <button className='bg-orange-500 w-1/6 text-white text-xl p-2 rounded-xl' onClick={handleClick}>Open Crate</button>
    </div>
  )
}

function OpenCrate({ currentItem, currentItemPrice, currencyType, itemUSD, image, textColor, quality, handleClose }) {
  const [timer, setTimer] = useState(3);

  useEffect(() => {
    const countdown = setInterval(() => {
      if (timer > 0) {
        setTimer((t) => t - 1);
      } else {
        clearInterval(countdown)
      }
    }, 1000);
    return () => clearInterval(countdown);
  }, [timer]);

  return (
    <div className='open-crate w-screen h-screen flex items-center justify-center m-auto fixed top-0 left-0'>
      {timer > 0 ? (
        <h1 className='text-white text-6xl'>{timer}</h1>
      ) : (
        <div className='flex items-center justify-center flex-col'>
          <img src={image} alt="item image" className='w-60' />
          <p
            className='text-4xl font-bold'
            style={{ color: textColor }}
          >
            {quality === 11 ? `Strange ${currentItem}` : (quality === 5 ? `Unusual ${currentItem}` : currentItem)}
          </p>
          <p className='mt-3 text-white text-2xl'>Value: {currentItemPrice ?? 0} {currencyType === 'metal' ? 'refined' : currencyType}</p>
          <p className='mt-3 text-white text-xl font-semibold'>${itemUSD.toFixed(2)}</p>
          <button className='mt-3 bg-orange-500 w-1/2 text-white text-xl p-2 rounded-xl' onClick={handleClose}>Close</button>
        </div>
      )}
    </div>
  )
}

function Stats({ profit, count, keyPrice, totalItemPrice, openInventory }) {
  return (
    <div className='flex flex-col items-center mt-10 text-white space-y-5 w-1/4 justify-center ml-auto mr-auto'>
      <div className='bg-neutral-700 rounded-lg p-2 w-full flex justify-between items-center'>
        <p className='text-xl font-semibold'>Items unboxed:</p>
        <p className='text-xl'>{count}</p>
      </div>
      <div className='bg-neutral-700 rounded-lg p-2 w-full flex justify-between items-center'>
        <p className='text-xl font-semibold'>Total money spent:</p>
        <p className='text-xl'>${(count * keyPrice).toFixed(2)}</p>
      </div>
      <div className='bg-neutral-700 rounded-lg p-2 w-full flex justify-between items-center'>
        <p className='text-xl font-semibold'>Price of Inventory:</p>
        <p className='text-xl'>${totalItemPrice.toFixed(2)}</p>
      </div>
      <div className='bg-neutral-700 rounded-lg p-2 w-full flex justify-between items-center'>
        <p className='text-xl font-semibold'>Net profit:</p>
        <p className='text-xl'>{profit < 0 ? `-$` : `$`}{Math.abs(profit.toFixed(2))}</p>
      </div>
      <button 
        className='bg-orange-500 w-1/2 text-white text-xl p-2 rounded-xl flex justify-center text-center' 
        onClick={openInventory}
      >
        Open Inventory
      </button>
    </div>
  )
}

function Inventory({ inv, closeInventory }) {
  return (
    <div className='inventory w-screen h-screen flex flex-col items-center justify-center m-auto fixed top-0 left-0'>
      <div className='inventory-items flex flex-col items-center justify-start w-full h-full overflow-y-scroll'>
        {inv.length === 0 ? (
          <div className='flex items-center justify-center w-full h-full'>
            <p className='text-white text-2xl'>Inventory is empty</p>
          </div>
        ) : (
          inv.map((item, index) => {
            return (
              <InventoryItem key={index} item={item} />
            )
          })
        )}
      </div>
      <button 
        className='mt-3 mb-3 bg-neutral-500 w-1/6 text-white text-xl p-2 rounded-xl flex justify-center text-center m-auto' 
        onClick={closeInventory}
      >
        Close
      </button>
    </div>
  )
}


function InventoryItem({ item }) {
  return (
    <div className='inventory-item flex flex-row text-white text-xl items-center justify-between bg-neutral-800 m-1 w-1/2 rounded-md p-4'>
      <img src={item.image} alt='' className='w-20' />
      <p className='flex-1 text-left pl-4' style={{ color: `${item.textColor}` }}>{item.name}</p>
      <p className='flex-1 text-left pl-4'>{item.priceRef} {item.currencyType === 'metal' ? 'Refined' : 'Keys'}</p>
      <p className='flex-1 text-left pl-4'>${item.priceUSD.toFixed(2)}</p>
    </div>
  )
}


function InfoButtons({ setChanceDisplay, setExchangeDisplay, setInfoDisplay}) {
  return (
    <div className="flex flex-row justify-center mt-5 text-3xl text-white mb-5">
      <i className="fa-solid fa-percent mr-10 cursor-pointer" onClick={setChanceDisplay}></i>
      <i className="fa-solid fa-circle-info mx-10 cursor-pointer" onClick={setInfoDisplay}></i>
      <i className="fa-solid fa-money-bill ml-10 cursor-pointer" onClick={setExchangeDisplay}></i>
    </div>
  )
}

function ChanceInfo({ gradeColors, openChanceDisplay }) {
  return (
    <div className='chanceInfo w-screen h-screen flex flex-col items-center justify-center m-auto fixed top-0 left-0'>
      <h1 className='text-white text-3xl mb-5'>Drop Rates (Appx.)</h1>
      <p style={{color: gradeColors[1]}} className='bg-neutral-800 rounded-lg p-1 w-1/6 flex justify-center items-center text-center m-1 font-bold'>Mercenary Grade: 80%</p>
      <p style={{color: gradeColors[2]}} className='bg-neutral-800 rounded-lg p-1 w-1/6 flex justify-center items-center text-center m-1 font-bold'>Commando Grade: 16%</p>
      <p style={{color: gradeColors[3]}} className='bg-neutral-800 rounded-lg p-1 w-1/6 flex justify-center items-center text-center m-1 font-bold'>Assassin Grade: 3.2%</p>
      <p style={{color: gradeColors[4]}} className='bg-neutral-800 rounded-lg p-1 w-1/6 flex justify-center items-center text-center m-1 font-bold'>Elite: 0.8%</p>
      <p style={{color: gradeColors[5]}} className='bg-neutral-800 rounded-lg p-1 w-1/6 flex justify-center items-center text-center m-1 font-bold'>Unusual: less than 1% </p>
      <button className='mt-5 mb-3 bg-neutral-500 w-1/6 text-white text-xl p-2 rounded-xl flex justify-center text-center m-auto' onClick={openChanceDisplay}>Close</button>
    </div>
  )
}

function ExchangeInfo({ openExchangeDisplay }) {
  return (
    <div className='chanceInfo w-screen h-screen flex flex-col items-center justify-center m-auto fixed top-0 left-0'>
      <h1 className='text-white text-3xl mb-5'>TF2 Currency Conversions</h1>
      <p className='bg-neutral-800 rounded-lg p-1 w-1/6 flex justify-center items-center text-center m-1 font-bold text-white'>1 ref = ~$0.02 USD</p>
      <p className='bg-neutral-800 rounded-lg p-1 w-1/6 flex justify-center items-center text-center m-1 font-bold text-white'>1 key = ~$1.52 USD</p>
      <button className='mt-5 mb-3 bg-neutral-500 w-1/6 text-white text-xl p-2 rounded-xl flex justify-center text-center m-auto' onClick={openExchangeDisplay}>Close</button>
    </div>
  )
}

function MainInfo({ openInfoDisplay }) {
  return (
    <div className='chanceInfo w-screen h-screen flex flex-col items-center justify-center m-auto fixed top-0 left-0'>
      <h1 className='text-white text-3xl mb-5'>About</h1>
      <p className='p-1 w-1/3 flex justify-center items-center text-center m-1 text-white'>Welcome to the TF2 Crate Simulator! Select your desired crate and hit the 'open crate' button to try your luck at getting the best item possible. All prices are based off the most recent backpack.tf item prices. Good Luck!</p>
      <button className='mt-5 mb-3 bg-neutral-500 w-1/6 text-white text-xl p-2 rounded-xl flex justify-center text-center m-auto' onClick={openInfoDisplay}>Close</button>
    </div>
  )
}