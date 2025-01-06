import React, {useState,useEffect} from 'react'
import AdsManager from './components/AdsBar'
import PlatformConnector from './components/PlatformConnector'
import AdsCalendarDialog from './components/AdsCalendarDialog'
import MyTabs from './components/TabsScection'

const App = () => {
  const [barData, setBarData] = useState([])
  useEffect(() => {
    console.log('barData', barData)
  }, [barData])
  return (
    <div className=''>
      <div className='w-full pr-5 justify-end items-end flex'>
      <AdsCalendarDialog/>
      </div>
    <div className=' relative my-10 bg-inherit min-w-screen w-full'>
      <MyTabs selectedBarLength={barData.length} SelectedBarState={setBarData}/>
      <div className='absolute top-14 w-full z-50 bg-white'>
      <AdsManager selectedBar={barData} setSelectedBar={setBarData}/>
      </div>
    </div>

    </div>
  )
}

export default App