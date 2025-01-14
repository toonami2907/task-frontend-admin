import React, { useState, useEffect } from "react";
import AdsManager from "./components/AdsBar";
import MyTabs from "./components/TabsScection";
import TimestampWithReload from "./components/TimestampWithReload";
import { useGlobalContext } from "@/functions/features/StateProvider";

const App = () => {
  const [barData, setBarData] = useState([]);
  const [campaignSelect, setCampaignSelect] = useState([]);
  const [loading, setLoading] = useState(false)
  const {fetchAds} = useGlobalContext()
  
  useEffect(() => {

  }, [barData, campaignSelect]);





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
      
      {/* <div className="my-5"></div> */}
      <div className=" relative my-10 bg-inherit min-w-screen w-full">
      {/* <div className="w-full pr-5 justify-end absolute top-0 items-end flex"> */}
        <TimestampWithReload
          timestamp={new Date()}
          onReload={Reload}
          isLoading={loading}
        />

        <MyTabs
          selectedBarLength={barData.length}
          SelectedBarState={setBarData}
          SelectedCamapiagn={setCampaignSelect}
          SelectedCamapiagnLength={campaignSelect.length}
        />
        <div className="absolute top-14 w-full z-20 bg-white">
          <AdsManager selectedBar={barData} setSelectedBar={setBarData}   SetCamapiagn={setCampaignSelect}  SelectedCamapiagn={campaignSelect} />
        </div>
      </div>
    </div>
  );
};

export default App;
