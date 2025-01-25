import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useGlobalContext } from '@/functions/features/StateProvider';

const AdAccountSelector = () => {
  const { 
    userInfo: user, 
    selectedAdAccount, 
    updateSelectedAdAccount 
  } = useGlobalContext();

  // No accounts scenario
  if (!user || !user.adAccounts || user.adAccounts.length === 0) {
    return (
      <div className="text-sm text-red-700">
        No ad accounts connected
      </div>
    );
  }

  const handleAccountChange = (accountId) => {
    const selectedAccount = user.adAccounts.find(
      account => account.account_id === accountId
    );
    updateSelectedAdAccount(selectedAccount);
  };

  return (
    <Select 
      value={selectedAdAccount?.account_id}
      onValueChange={handleAccountChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select Ad Account">
          {selectedAdAccount 
            ? `Ad Account: ${selectedAdAccount.account_id}` 
            : 'Select Ad Account'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {user.adAccounts.map(account => (
          <SelectItem 
            key={account.account_id} 
            value={account.account_id}
          >
            Ad Account: {account.account_id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AdAccountSelector;