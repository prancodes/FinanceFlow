import React from 'react'

const CreateAccForm = () => {
  return (
    <form className="max-w-2xl mx-auto mt-10 p-6">
      <label className="mb-5 block text-2xl font-bold text-gray-900">Create New Account</label>
      <div className="mb-5">
        <label htmlFor="accName" className="block mb-2 text-sm font-medium text-gray-900">Account Name</label>
        <input type="text" id="accName" name="account[name]" className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Eg: College Expenses" required />
      </div>
      <div className="mb-5">
        <label htmlFor="accType" class="block mb-2 text-sm font-medium text-gray-900">Account Type</label>
        <select id="accType" name="account[type]" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required>
          <option selected>Select Account Type</option>
          <option value={'current'}>Current</option>
          <option value={'savings'}>Savings</option>
        </select>
      </div>
      <div className="mb-5">
        <label htmlFor="initBalance" className="block mb-2 text-sm font-medium text-gray-900">Initial Balance</label>
        <input type="number" id="initBalance" name="account[balance]" className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder='0.00' required />
      </div>
      <div className="flex justify-center mb-5">
        <div className="flex items-center h-5">
          <input id="terms" type="checkbox" value="" className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" required />
        </div>
        <label htmlFor="terms" className="ms-2 text-sm font-medium text-gray-900">I agree with the <a href="#" className="text-blue-600 hover:underline dark:text-blue-500">terms and conditions</a></label>
      </div>
      <div className="flex justify-center">
        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add account</button>
      </div>
    </form>
  )
}

export { CreateAccForm }