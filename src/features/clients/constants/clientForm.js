export const EMPTY_CLIENT_FORM = {
  full_name: '',
  phone: '',
  email: '',
  needle_type: '',
};

export function createClientForm(client) {
  return {
    full_name: client.full_name || '',
    phone: client.phone || '',
    email: client.email || '',
    needle_type: client.needle_type || '',
  };
}
