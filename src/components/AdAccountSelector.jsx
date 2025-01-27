import React, { useEffect } from 'react';
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

  useEffect(() => {
    const storedAccount = localStorage.getItem('Adsaccount');
    if (storedAccount) {
      try {
        const parsedAccount = JSON.parse(storedAccount);
        updateSelectedAdAccount(parsedAccount);
      } catch (error) {
        localStorage.removeItem('Adsaccount');
      }
    }
  }, []);

  if (!user?.adAccounts?.length) {
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
    if (selectedAccount) {
      localStorage.setItem('Adsaccount', JSON.stringify(selectedAccount));
      updateSelectedAdAccount(selectedAccount);
    }
  };

  return (
    <Select 
      value={selectedAdAccount?.account_id}
      onValueChange={handleAccountChange}
    >
      <SelectTrigger>
        <SelectValue 
          placeholder={
            selectedAdAccount?.account_id 
              ? `Ad Account: ${selectedAdAccount.account_id}` 
              : "Select Ad Account"
          }
        />
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
