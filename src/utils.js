export const camelCase = spinal => (
  spinal.split('-').map((s, i) =>
    i !== 0
      ? (s[0].toUpperCase() + s.slice(1, s.length))
      : s
  ).join('')
);

export const actionTypeCase = spinal => (
  spinal.replace('-', '_').toUpperCase()
);

export const initialEndpointState = () => ({
  data: null,
  pendingRequests: 0,
});
