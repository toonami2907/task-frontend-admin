import React, {useState,useEffect} from 'react'
import AdsManager from './components/AdsBar'
import PlatformConnector from './components/PlatformConnector'
import AdsCalendarDialog from './components/AdsCalendarDialog'
import MyTabs from './components/TabsScection'
import SearchBar from './components/SearchBar'


const App = () => {
  const [barData, setBarData] = useState([])
  useEffect(() => {

  }, [barData])

  const handleFilterSelect = (filters, filterType) => {
    // Handle filter selection
    console.log('Selected filters:', filters);
    console.log('Filter type:', filterType);
  };

  const handleDataUpdate = (data, filters, searchType) => {
    // Handle data updates based on filters
    console.log('Updating data with:', { data, filters, searchType });
  };
  return (
    <div className=''>
      <div className='w-full pr-5 justify-end items-end flex'>
      </div>
      <div className="my-5">
      {/* <SearchBar 
      onFilterSelect={handleFilterSelect}
      onDataUpdate={handleDataUpdate}
    /> */}
    </div>
    <div className=' relative my-10 bg-inherit min-w-screen w-full'>
      <MyTabs selectedBarLength={barData.length} SelectedBarState={setBarData}/>
      <div className='absolute top-14 w-full z-20 bg-white'>
      <AdsManager selectedBar={barData} setSelectedBar={setBarData}/>
      </div>
    </div>

    </div>
  )
}

export default App