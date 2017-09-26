/**
 * @private
 */
export const camelCase = spinal => (
  spinal.split('-').map((s, i) =>
    i !== 0
      ? (s[0].toUpperCase() + s.slice(1, s.length))
      : s
  ).join('')
);

/**
 * @private
 */
export const actionTypeCase = spinal => (
  spinal.replace(new RegExp('-', 'g'), '_').toUpperCase()
);

/**
 * @return {Object} initalEndpointState
 * Initial state for a branch of the state managed by an endpoint.
 */
export const initialEndpointState = () => ({
  data: null,
  error: null,
  pendingRequests: 0,
  successfulRequests: 0,
  totalRequests: 0,
});
