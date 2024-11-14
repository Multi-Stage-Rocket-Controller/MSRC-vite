import React, { createContext, useState } from 'react'
export const DataContext = createContext()

export const DataProvider = ({ children }) => {
  const [jsonData, setJsonData] = useState(null)

  return (
    <DataContext.Provider value={{ jsonData, setJsonData }}>
      {children}
    </DataContext.Provider>
  )
}