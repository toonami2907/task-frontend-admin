import {
    Plus,
  } from "lucide-react";
  import { Button } from "@/components/ui/button";

const NoAds = ({state}) => {
    return (
        <div className='flex flex-col items-center justify-center gap-2 '>
        <div>
          <button className='flex flex-col justify-center border bg-gray-500 rounded-full w-10 items-center h-10'>
            <Plus size={30} color='white'/>
          </button>
        </div>
          <h1 className='font-bold font-bold '>No results found</h1>
          <p>You haven`t created any ads yet.</p>
          <Button
          onClick={() => window.location.reload()}
          className='bg-inherit shadow-none font-sans text-gray-900 hover:bg-gray-400 border border-gray-400 hover:text-gray-50'
          >
            Refresh {state || 'Page'}
          </Button>
      </div>
    )
  }
  
  export default NoAds