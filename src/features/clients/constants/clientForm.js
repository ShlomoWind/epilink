export const EMPTY_CLIENT_FORM = {
  full_name: '',
  phone: '',
  email: '',
  needle_type: '',
  outstanding_balance: '0',
};

export function createClientForm(client) {
  return {
    full_name: client.full_name || '',
    phone: client.phone || '',
    email: client.email || '',
    needle_type: client.needle_type || '',
    outstanding_balance: String(client.outstanding_balance ?? 0),
  };
}
