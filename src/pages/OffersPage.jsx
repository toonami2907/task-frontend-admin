import { useGlobalContext } from "@/functions/features/StateProvider";
import { useEffect, useState } from "react";
import OfferHeader from "../components/OfferHeader";
import { useNavigate, useParams } from "react-router-dom";
import FlightCard from "@/components/FlightCard";
import { data } from "@/extra/data";


export const OffersPage = () => {
  const navigate = useNavigate();
  const [traveldata, setTravelData] = useState([]); // Initialize as an array
    const { offers } = useGlobalContext();
    const {origin, destination} = useParams()

     useEffect(()=>{
         if(offers === undefined || offers === null || Array.isArray(offers) && offers.length === 0){
             return navigate("/")
         }
     }, [])


  useEffect(() => {
    const processTimeData = () => {
      const updatedData = offers.map((item) => ({
        total_amount: item.total_amount,
        tax_amount: item.tax_amount,
        symbol_url: item.owner.logo_symbol_url,
        offerId: item.id,
        currency: item.total_currency,
        flight_name: item.owner.name,
        slices: item.slices.map((slice) => ({
          segments: slice.segments.map((segment) => ({
            arrival_date: segment.arriving_at,
            departure_date: segment.departing_at,
            cabin_name: segment.passengers.map((passenger) => ({
                cabin: passenger.cabin_class
            }))
          }))
          ,
        })),
      }));
      setTravelData(updatedData); // Update the state with the processed data
    };

    processTimeData();
  }, []); // Runs only once when the component mounts



  return (
    <div className="py-5 md:px-10 px-5 bg-gray-100 min-h-screen">
      <OfferHeader />
      <div className="max-w-[500px]">
        <h1 className="text-3xl md:text-5xl text-gray-500 font-sansSlim">
        Select your departure flight
        from <span className="text-green-400">Lagos</span> to <span className="text-green-400">London</span>
        </h1>
      </div>
      <div className="flex flex-col gap-1 mt-5 md:mt-10 ">
        <p className="font-bold text-black text-lg md:text-2xl">10 results </p>
        <p className="text-md md:text-xl font-sansSlim">Fares displayed are for all passengers.</p>
      </div>
      <div className="flex gap-10 flex-col mt-5">
      {traveldata.map((travelinfo, idx) => (
    travelinfo.slices.map((slice, sliceIdx) => (
      slice.segments.map((segment, segmentIdx) => (
        <FlightCard
          key={`${idx}-${sliceIdx}-${segmentIdx}`} // Unique key combining indexes
          segment={segment} // Pass the entire segment if needed
          arrivalDate={segment.arrival_date} // Pass arrival_date
          departureDate={segment.departure_date} // Pass departure_date
          img={travelinfo.symbol_url} // Pass the image URL
          name={travelinfo.flight_name} // Pass the flight name
          amount={travelinfo.total_amount} // Pass the total amount
          currency={travelinfo.currency} // Pass the currency
          origin={origin} // Pass the origin
          destination={destination} // Pass the destination
        />
      ))
    ))
  ))}
      </div>
    </div>
  );
};
