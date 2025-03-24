import React, { useState } from 'react';
import { Analytics } from "@vercel/analytics/react"

const SettlementCalculator = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'User 1', amountInvested: 0, amountWon: 0 },
    { id: 2, name: 'User 2', amountInvested: 0, amountWon: 0 }
  ]);
  
  const [newUser, setNewUser] = useState({
    name: '',
    amountInvested: '',
    amountWon: ''
  });

  const handleAddUser = () => {
    if (newUser.name && newUser.amountInvested && newUser.amountWon) {
      setUsers([
        ...users,
        {
          id: users.length + 1,
          name: newUser.name,
          amountInvested: parseFloat(newUser.amountInvested),
          amountWon: parseFloat(newUser.amountWon)
        }
      ]);
      setNewUser({ name: '', amountInvested: '', amountWon: '' });
    }
  };

  const handleRemoveUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
  };

  const handleUserDataChange = (id, field, value) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, [field]: field === 'name' ? value : parseFloat(value) } : user
    ));
  };

  // Calculate total invested and won
  const totalInvested = users.reduce((sum, user) => sum + user.amountInvested, 0);
  const totalWon = users.reduce((sum, user) => sum + user.amountWon, 0);
  
  // Calculate fair share per user
  const fairSharePerUser = totalInvested / users.length;
  
  // Calculate settlements
  const calculateSettlements = () => {
    const settlements = [];
    
    // Calculate net position for each user
    const userPositions = users.map(user => {
      // Actual profit/loss (what they won minus what they invested)
      const actualResult = user.amountWon - user.amountInvested;
      
      // What would be fair (equal investment and equal distribution of winnings)
      const fairInvestment = fairSharePerUser;
      const fairWinnings = totalWon / users.length;
      const fairResult = fairWinnings - fairInvestment;
      
      // The difference between what actually happened and what would be fair
      const netPosition = actualResult - fairResult;
      
      return {
        ...user,
        netPosition: netPosition
      };
    });
    
    // Find all users with positive net positions (they won more than fair)
    const positiveUsers = userPositions.filter(user => user.netPosition > 0);
    
    // Find all users with negative net positions (they won less than fair)
    const negativeUsers = userPositions.filter(user => user.netPosition < 0);
    
    // Create settlements - users with positive positions pay users with negative positions
    for (const positiveUser of positiveUsers) {
      let remainingPositiveAmount = positiveUser.netPosition;
      
      for (const negativeUser of negativeUsers) {
        if (remainingPositiveAmount <= 0 || negativeUser.netPosition >= 0) {
          continue;
        }
        
        // Calculate the amount to transfer
        const transferAmount = Math.min(remainingPositiveAmount, -negativeUser.netPosition);
        
        if (transferAmount > 0) {
          settlements.push({
            from: positiveUser.name,  // User who won more than fair pays
            to: negativeUser.name,    // User who won less than fair receives
            amount: transferAmount.toFixed(2)
          });
          
          remainingPositiveAmount -= transferAmount;
          negativeUser.netPosition += transferAmount;
        }
      }
    }
    
    return settlements;
  };
  
  const settlements = calculateSettlements();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <Analytics />
      <h1 className="text-2xl font-bold mb-6 text-center">IPL Hedging Settlement Calculator</h1>
      
      <div className="mb-8 bg-white p-4 rounded-md shadow">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Amount Invested (₹)</th>
                <th className="p-2 text-left">Amount Won (₹)</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="p-2">
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => handleUserDataChange(user.id, 'name', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={user.amountInvested}
                      onChange={(e) => handleUserDataChange(user.id, 'amountInvested', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={user.amountWon}
                      onChange={(e) => handleUserDataChange(user.id, 'amountWon', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="border-t">
                <td className="p-2">
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    name="amountInvested"
                    value={newUser.amountInvested}
                    onChange={handleInputChange}
                    placeholder="Amount invested"
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    name="amountWon"
                    value={newUser.amountWon}
                    onChange={handleInputChange}
                    placeholder="Amount won"
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="p-2">
                  <button
                    onClick={handleAddUser}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Add User
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Total Invested:</span>
              <span className="font-medium">₹{totalInvested.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>Total Won:</span>
              <span className="font-medium">₹{totalWon.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>Net Profit/Loss:</span>
              <span className={`font-medium ${totalWon > totalInvested ? 'text-green-600' : 'text-red-600'}`}>
                ₹{(totalWon - totalInvested).toFixed(2)}
              </span>
            </li>
            <li className="flex justify-between border-t pt-2 mt-2">
              <span>Fair Investment Per User:</span>
              <span className="font-medium">₹{fairSharePerUser.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>Fair Winnings Per User:</span>
              <span className="font-medium">₹{(totalWon / users.length).toFixed(2)}</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-4">Settlements</h2>
          {settlements.length > 0 ? (
            <ul className="space-y-2">
              {settlements.map((settlement, index) => (
                <li key={index} className="p-2 bg-blue-50 rounded">
                  <span className="font-medium text-red-600">{settlement.from}</span> should pay <span className="font-medium text-green-600">{settlement.to}</span> <span className="font-bold">₹{settlement.amount}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No settlements needed.</p>
          )}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-md shadow">
        <h2 className="text-xl font-semibold mb-4">Individual Analysis</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Invested</th>
                <th className="p-2 text-left">Fair Investment</th>
                <th className="p-2 text-left">Won</th>
                <th className="p-2 text-left">Fair Winnings</th>
                <th className="p-2 text-left">Net Position</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const fairInvestment = fairSharePerUser;
                const fairWinnings = totalWon / users.length;
                const actualResult = user.amountWon - user.amountInvested;
                const fairResult = fairWinnings - fairInvestment;
                const netPosition = actualResult - fairResult;
                
                return (
                  <tr key={user.id} className="border-t">
                    <td className="p-2 font-medium">{user.name}</td>
                    <td className="p-2">₹{user.amountInvested.toFixed(2)}</td>
                    <td className="p-2">₹{fairInvestment.toFixed(2)}</td>
                    <td className="p-2">₹{user.amountWon.toFixed(2)}</td>
                    <td className="p-2">₹{fairWinnings.toFixed(2)}</td>
                    <td className={`p-2 font-medium ${netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{netPosition.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default SettlementCalculator;