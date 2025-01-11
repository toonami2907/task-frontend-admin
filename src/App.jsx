import React, {useState,useEffect} from 'react'
import AdsManager from './components/AdsBar'
import MyTabs from './components/TabsScection'



const App = () => {
  const [barData, setBarData] = useState([])
  useEffect(() => {
console.log('bardata', barData)
  }, [barData])

 
  return (
    <div className=''>
      <div className='w-full pr-5 justify-end items-end flex'>
      </div>
      <div className="my-5">
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