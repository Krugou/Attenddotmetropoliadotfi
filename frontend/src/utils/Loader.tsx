
import React from 'react'

const Loader = () => {
  return (
    <div className="flex-col gap-4 w-full flex items-center justify-center">
      <h1 className='text-2xl'>
      metropolia attendance app loading...
      </h1>
    <div
    className="w-20 h-20 border-4 border-transparent text-orange-600 text-4xl animate-spin flex items-center justify-center border-t-orange-600 rounded-full"
    >
      <div
      className="w-16 h-16 border-4 border-transparent text-blue-600 text-2xl animate-spin flex items-center justify-center border-t-blue-600 rounded-full"
      ></div>
    </div>
  </div>

  )
}

export default Loader
