import React, { useState, useEffect } from "react";
import AdsManager from "./components/AdsBar";
import MyTabs from "./components/TabsScection";
import TimestampWithReload from "./components/TimestampWithReload";
import { useGlobalContext } from "@/functions/features/StateProvider";

const App = () => {
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(false)
  const {fetchAds} = useGlobalContext()
  useEffect(() => {

  }, [barData]);





const Reload = ()=>{
  setLoading((prev)=> !prev)
  try{
    fetchAds()
    setLoading((prev)=> !prev)
  }catch{
    setLoading((prev)=> !prev)
    return
  }
}




  return (
    <div className="">
      <div className="w-full pr-5 justify-end items-end my-2 flex">
        <TimestampWithReload
          timestamp={new Date()}
          onReload={Reload}
          isLoading={loading}
        />
      </div>
      <div className="my-5"></div>
      <div className=" relative my-10 bg-inherit min-w-screen w-full">
        <MyTabs
          selectedBarLength={barData.length}
          SelectedBarState={setBarData}
        />
        <div className="absolute top-14 w-full z-20 bg-white">
          <AdsManager selectedBar={barData} setSelectedBar={setBarData} />
        </div>
      </div>
    </div>
  );
};

export default App;
