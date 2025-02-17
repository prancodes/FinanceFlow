import React from 'react'

const Home = () => {
  return (
    <>
        <div>Welcome to FinanceFlow</div>
        <a href="/createAccount"><button className='bg-blue-500 p-2 border-black border-1 rounded-md mb-2'>Create Account</button></a>
        <br />
        <a href="/login"><button className="bg-indigo-500 hover:bg-fuchsia-500 p-2 border-black border-1 rounded-md">Login</button></a>
    </>
  )
}

export default Home